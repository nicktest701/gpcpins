const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const moment = require("moment");
const { randomUUID } = require("crypto");
const multer = require("multer");
const pLimit = require("p-limit");
//model

const currencyFormatter = require("../config/currencyFormatter");
const {
  getTodayTransaction,
  getYesterdayTransaction,
  getLastSevenDaysTransactions,
  getThisMonthTransaction,
  getTransactionsByMonth,
  getRecentTransaction,
  getTopCustomers,
  getTopSellingProducts,
  getTodayTransactionArray,
  getYesterdayTransactionArray,
  getLastSevenDaysTransactionsArray,
  getThisMonthTransactionArray,
  getLastMonthTransactionArray,
  getTransactionsArrayByMonth,
  getThisYearTransactionArray,
  getLastYearTransactionArray,
  getRangeTransactions,
} = require("../config/transactionSummary");

const verifyAdmin = require("../middlewares/verifyAdmin");
const { verifyToken } = require("../middlewares/verifyToken");
const { rateLimit } = require("express-rate-limit");

const { isValidUUID2 } = require("../config/validation");

const knex = require("../db/knex");
const { moneyStatus } = require("../config/sendMoney");
const verifyAgent = require("../middlewares/verifyAgent");
const { uploadAttachment, uploadFiles } = require("../config/uploadFile");
const { generateHTMLTemplate } = require("../config/generateVoucherTemplate");
const { generateTransactionReport } = require("../config/generatePDF");
const { sendReportMail } = require("../config/mail");
const { mailTextShell } = require("../config/mailText");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

const plimit = pLimit(3);

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/attachments/");
  },
  filename: function (req, file, cb) {
    const ext = file?.mimetype?.split("/")[1];

    cb(null, `${randomUUID()}.${ext}`);
  },
});

const Upload = multer({ storage: Storage });

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { sort, startDate, endDate } = req.query;

    let modifiedTransaction = [];
    let modifiedECGTransaction = [];
    let modifiedAirtimeTransaction = [];
    let modifiedBundleTransaction = [];

    const bundle_transactions = await knex("bundle_transactions")
      .select(
        "_id",
        "bundle_name as kind",
        "bundle_volume as volume",
        "reference",
        "recipient",
        "phonenumber",
        "info",
        "mode",
        "amount",
        "domain",
        "domain as type",
        "isProcessed",
        "status",
        "createdAt",
        knex.raw("DATE_FORMAT(createdAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where({
        status: "completed",
      });

    const bundleTransactions = bundle_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });
    const airtime_transactions = await knex("airtime_transactions")
      .select(
        "_id",
        "type as kind",
        "reference",
        "recipient",
        "phonenumber",
        "info",
        "amount",
        "mode",
        "domain",
        "domain as type",
        "isProcessed",
        "status",
        "createdAt",
        knex.raw("DATE_FORMAT(createdAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where({
        status: "completed",
      });

    const airtimeTransactions = airtime_transactions.map(
      ({ info, ...rest }) => {
        return {
          ...rest,
          info: JSON.parse(info),
        };
      }
    );

    const voucher_transactions = await knex("voucher_transactions")
      .select(
        "_id",
        "info",
        "mode",
        "reference",
        "createdAt",
        knex.raw("DATE_FORMAT(createdAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where({
        status: "completed",
      });

    //
    const transactions = voucher_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    // return res.status(200).json(transactions);

    const prepaid_transactions = await knex("prepaid_transactions")
      .join("meters", "prepaid_transactions.meter", "=", "meters._id")
      .select(
        "prepaid_transactions._id as _id",
        "prepaid_transactions.reference as reference",
        "prepaid_transactions.info as info",
        "prepaid_transactions.mode as mode",
        "prepaid_transactions.status as status",
        "prepaid_transactions.createdAt as createdAt",
        knex.raw(
          "DATE_FORMAT(prepaid_transactions.createdAt,'%D %M,%Y %r') as modifiedAt"
        ),
        "meters._id as meterId",
        "meters.number as number"
      )
      .where({
        status: "completed",
      });

    const ecgTransaction = prepaid_transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        reference: transaction?.reference,
        info: JSON.parse(transaction?.info),
        mode: transaction?.mode,
        status: transaction?.status,
        modifiedAt: transaction?.modifiedAt,
        createdAt: transaction?.createdAt,
        meter: {
          _id: transaction?.meterId,
          number: transaction?.number,
        },
      };
    });

    const modifiedTransactionWithRange = getRangeTransactions(
      startDate,
      endDate,
      transactions
    );

    const modifiedECGTransactionWithRange = getRangeTransactions(
      startDate,
      endDate,
      ecgTransaction
    );

    const modifiedAirtimeTransactionWithRange = getRangeTransactions(
      startDate,
      endDate,
      airtimeTransactions
    );

    const modifiedBundleTransactionWithRange = getRangeTransactions(
      startDate,
      endDate,
      bundleTransactions
    );

    switch (sort) {
      case "today":
        modifiedTransaction = getTodayTransactionArray(
          modifiedTransactionWithRange
        );
        modifiedECGTransaction = getTodayTransactionArray(
          modifiedECGTransactionWithRange
        );
        modifiedAirtimeTransaction = getTodayTransactionArray(
          modifiedAirtimeTransactionWithRange
        );
        modifiedBundleTransaction = getTodayTransactionArray(
          modifiedBundleTransactionWithRange
        );

        break;
      case "yesterday":
        modifiedTransaction = getYesterdayTransactionArray(
          modifiedTransactionWithRange
        );
        modifiedECGTransaction = getYesterdayTransactionArray(
          modifiedECGTransactionWithRange
        );
        modifiedAirtimeTransaction = getYesterdayTransactionArray(
          modifiedAirtimeTransactionWithRange
        );
        modifiedBundleTransaction = getYesterdayTransactionArray(
          modifiedBundleTransactionWithRange
        );
        break;

      case "week":
        modifiedTransaction = getLastSevenDaysTransactionsArray(
          modifiedTransactionWithRange
        );
        modifiedECGTransaction = getLastSevenDaysTransactionsArray(
          modifiedECGTransactionWithRange
        );
        modifiedAirtimeTransaction = getLastSevenDaysTransactionsArray(
          modifiedAirtimeTransactionWithRange
        );
        modifiedBundleTransaction = getLastSevenDaysTransactionsArray(
          modifiedBundleTransactionWithRange
        );

        break;
      case "month":
        modifiedTransaction = getThisMonthTransactionArray(
          modifiedTransactionWithRange
        );
        modifiedECGTransaction = getThisMonthTransactionArray(
          modifiedECGTransactionWithRange
        );
        modifiedAirtimeTransaction = getThisMonthTransactionArray(
          modifiedAirtimeTransactionWithRange
        );
        modifiedBundleTransaction = getThisMonthTransactionArray(
          modifiedBundleTransactionWithRange
        );
        break;
      case "lmonth":
        modifiedTransaction = getLastMonthTransactionArray(
          modifiedTransactionWithRange
        );
        modifiedECGTransaction = getLastMonthTransactionArray(
          modifiedECGTransactionWithRange
        );
        modifiedAirtimeTransaction = getLastMonthTransactionArray(
          modifiedAirtimeTransactionWithRange
        );
        modifiedBundleTransaction = getLastMonthTransactionArray(
          modifiedBundleTransactionWithRange
        );

        break;
      case "year":
        modifiedTransaction = getThisYearTransactionArray(
          modifiedTransactionWithRange
        );
        modifiedECGTransaction = getThisYearTransactionArray(
          modifiedECGTransactionWithRange
        );
        modifiedAirtimeTransaction = getThisYearTransactionArray(
          modifiedAirtimeTransactionWithRange
        );
        modifiedBundleTransaction = getThisYearTransactionArray(
          modifiedBundleTransactionWithRange
        );
        break;
      case "lyear":
        modifiedTransaction = getLastYearTransactionArray(
          modifiedTransactionWithRange
        );
        modifiedECGTransaction = getLastYearTransactionArray(
          modifiedECGTransactionWithRange
        );
        modifiedAirtimeTransaction = getLastYearTransactionArray(
          modifiedAirtimeTransactionWithRange
        );
        modifiedBundleTransaction = getLastYearTransactionArray(
          modifiedBundleTransactionWithRange
        );
        break;

      default:
        modifiedTransaction = [...modifiedTransactionWithRange];
        modifiedECGTransaction = [...modifiedECGTransactionWithRange];
        modifiedAirtimeTransaction = [...modifiedAirtimeTransactionWithRange];
        modifiedBundleTransaction = [...modifiedBundleTransactionWithRange];
    }

    const VoucherTransactions = modifiedTransaction.map(async (transaction) => {
      const category = await knex("categories")
        .where("_id", transaction?.info?.categoryId)
        .select("voucherType")
        .limit(1);

      return {
        _id: transaction?._id,
        reference: transaction?.reference,
        voucherType: category[0].voucherType,
        domain: transaction?.info?.domain,
        downloadLink: transaction?.info?.downloadLink,
        phonenumber: transaction?.info?.agentPhoneNumber,
        email: transaction?.info?.agentEmail,
        type: _.upperCase(
          `${category[0].voucherType} ${transaction?.info?.domain}`
        ),
        quantity:
          transaction?.info?.quantity ||
          transaction?.info?.paymentDetails?.quantity,
        amount:
          transaction?.info?.amount ||
          transaction?.info?.paymentDetails?.totalAmount,
        createdAt: transaction?.createdAt,
        modifiedAt: transaction?.modifiedAt,
        mode: transaction?.mode,
        status: "completed",
      };
    });
    const vouchers = await Promise.all(VoucherTransactions);

    const prepaids = modifiedECGTransaction.map((transaction) => {
      return {
        _id: transaction?._id,
        reference: transaction?.reference,
        meter: transaction?.meter?.number,
        type: `${transaction?.info?.domain} Units`,
        domain: transaction?.info?.domain,
        phonenumber: transaction?.info?.mobileNo,
        email: transaction?.info?.email,
        downloadLink: transaction?.info?.downloadLink,
        amount: transaction?.info?.amount,
        createdAt: transaction?.createdAt,
        modifiedAt: transaction?.modifiedAt,
        mode: transaction?.mode,
        status: transaction?.status,
      };
    });

    res
      .status(200)
      .json([
        ...vouchers,
        ...prepaids,
        ...modifiedAirtimeTransaction,
        ...modifiedBundleTransaction,
      ]);
  })
);

router.get(
  "/report",
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const { year, type } = req.query;

    //Bundle
    const bundle_transactions = await knex("bundle_transactions")
      .select("_id", "info", "amount", "createdAt", "year")
      .where({
        year: year,
        status: "completed",
      });

    const modifiedBundleTransaction = bundle_transactions.map(
      ({ info, ...rest }) => {
        return {
          ...rest,
          info: JSON.parse(info),
        };
      }
    );
    //Airtime
    const airtime_transactions = await knex("airtime_transactions")
      .select("_id", "info", "amount", "createdAt", "year")
      .where({
        year: year,
        status: "completed",
      });

    const modifiedAirtimeTransaction = airtime_transactions.map(
      ({ info, ...rest }) => {
        return {
          ...rest,
          info: JSON.parse(info),
        };
      }
    );

    //Voucher
    const voucher_transactions = await knex("voucher_transactions")
      .select("_id", "info", "createdAt", "year")
      .where({
        year: year,
        status: "completed",
      });

    const modifiedVoucherTransaction = voucher_transactions.map(
      ({ info, ...rest }) => {
        return {
          ...rest,
          info: JSON.parse(info),
        };
      }
    );

    const prepaid_transactions = await knex("prepaid_transactions")
      .join("meters", "prepaid_transactions.meter", "=", "meters._id")
      .where({
        "prepaid_transactions.year": year,
        status: "completed",
      })
      .select(
        "prepaid_transactions._id as _id",
        "prepaid_transactions.info as info",
        "prepaid_transactions.status as status",
        "prepaid_transactions.year as year",
        "prepaid_transactions.createdAt as createdAt",
        "meters._id as meterId",
        "meters.number as number"
      );

    const modifiedECGTransaction = prepaid_transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        status: transaction?.status,
        createdAt: transaction?.createdAt,
        info: JSON.parse(transaction?.info),
        meter: {
          _id: transaction?.meterId,
          number: transaction?.number,
        },
      };
    });

    const groupedVoucherTransactions = _.groupBy(
      modifiedVoucherTransaction,
      "info.domain"
    );

    if (type === "All") {
      const prepaidByMonth = getTransactionsArrayByMonth(
        modifiedECGTransaction
      );
      const airtimeByMonth = getTransactionsArrayByMonth(
        modifiedAirtimeTransaction
      );
      const bundleByMonth = getTransactionsArrayByMonth(
        modifiedBundleTransaction
      );

      const voucherByMonth = getTransactionsArrayByMonth(
        groupedVoucherTransactions?.Voucher
      );
      const ticketByMonth = getTransactionsArrayByMonth(
        groupedVoucherTransactions?.Ticket
      );
      return res.status(200).json({
        prepaid: prepaidByMonth,
        voucher: voucherByMonth,
        ticket: ticketByMonth,
        airtime: airtimeByMonth,
        bundle: bundleByMonth,
      });
    }

    if (type === "Voucher") {
      const voucherByMonth = getTransactionsArrayByMonth(
        groupedVoucherTransactions?.Voucher
      );

      return res.status(200).json({
        report: voucherByMonth,
      });
    }
    if (type === "Ticket") {
      const ticketByMonth = getTransactionsArrayByMonth(
        groupedVoucherTransactions?.Ticket
      );
      return res.status(200).json({
        report: ticketByMonth,
      });
    }

    if (type === "Prepaid") {
      const prepaidByMonth = getTransactionsArrayByMonth(
        modifiedECGTransaction
      );
      return res.status(200).json({
        report: prepaidByMonth,
      });
    }
    if (type === "Airtime") {
      const airtimeByMonth = getTransactionsArrayByMonth(
        modifiedAirtimeTransaction
      );
      return res.status(200).json({
        report: airtimeByMonth,
      });
    }
    if (type === "Bundle") {
      const bundleByMonth = getTransactionsArrayByMonth(
        modifiedBundleTransaction
      );
      return res.status(200).json({
        report: bundleByMonth,
      });
    }
  })
);
router.post(
  "/report/history",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { startDate, endDate, transactions, type } = req.body;

    let template = "";
    switch (type) {
      case "All":
        template = await generateHTMLTemplate(transactions, "transactions.ejs");
        break;
      case "Voucher":
        template = await generateHTMLTemplate(
          transactions,
          "voucher_transactions.ejs"
        );
        break;
      case "Ticket":
        template = await generateHTMLTemplate(
          transactions,
          "voucher_transactions.ejs"
        );
        break;
      case "Prepaid":
        template = await generateHTMLTemplate(
          transactions,
          "prepaid_transactions.ejs"
        );
        break;
      case "Airtime":
        template = await generateHTMLTemplate(
          transactions,
          "airtime_transactions.ejs"
        );
        break;
      case "Bundle":
        template = await generateHTMLTemplate(
          transactions,
          "bundle_transactions.ejs"
        );
        break;
      default:
        template = await generateHTMLTemplate(transactions, "transactions.ejs");
    }

    const id = randomUUID();

    const result = await generateTransactionReport(
      template,
      id,
      `${type}-report`
    );
    if (result) {
      const body = ` <div class="container">
  <h1>Transactional Report</h1>
  <p>Dear Customer,</p>
  <p>Attached is your wallet transactional report from the period ${sDate} to ${endDate}. Please review the details below:</p>
  <p>If you have any questions or concerns regarding this report, please feel free to contact us.</p>
  <p>Thank you for your business!</p>
  <p>Sincerely,<br>Gab Powerful Consults</p>
  </div>`;

      const downloadLink = await uploadFiles(result, "reports");

      await sendReportMail(
        process.env.MAIL_CLIENT_USER,
        mailTextShell(body),
        result,
        "Transaction Report"
      );

      return res.status(200).json(downloadLink);
    }
  })
);

// router.get(
//   '/verify',
//   limit,
//   verifyToken,
//   verifyAdmin,

//   asyncHandler(async (req, res) => {
//     const { id, ticket, token } = req.query;

//     //Check if ticket exists
//     if (!ticket || !id) {
//       return res.status(400).json('Error! Ticket not available.');
//     }

//     const splittedTicket = ticket.split('_');
//     const voucherId = splittedTicket[0];

//     ///Check if voucher id is a valid mongo db id
//     if (!isValidUUID2(id)) {
//       return res.status(400).json('Error! Ticket not available.');
//     }

//     //find tranasction with specific payment id
//     const transaction = await knex('transactions')
//       .select('*')
//       .where('_id', id)
//       .limit(1);

//     if (_.isEmpty(transaction)) {
//       return res.status(400).json('Couldnt Verify your ticket');
//     }

//     //find voucher with its id
//     const vouchers = JSON.parse(transaction.vouchers);
//     const voucher = vouchers.find((voucher) => voucher === _id);

//     if (_.isEmpty(voucher)) {
//       return res.status(400).json('Couldnt find your ticket!');
//     }

//     const modifiedVoucher = {
//       ...voucher,
//       mobileNo: transaction.phonenumber,
//       email: transaction.email,
//     };

//     if (token) {
//       await Voucher.findByIdAndUpdate(voucherId, {
//         $set: {
//           status: 'used',
//         },
//       });

//       const modifiedVouchers = transaction.vouchers.map((voucher) => {
//         if (voucher?._id.toString() === voucherId) {
//           voucher.status = 'used';

//           return voucher;
//         } else {
//           return voucher;
//         }
//       });

//       await Transaction.findOneAndUpdate(
//         {
//           paymentId: id,
//         },
//         {
//           $set: {
//             vouchers: modifiedVouchers,
//           },
//         }
//       );

//       modifiedVoucher.status = 'used';

//       return res.status(200).json(modifiedVoucher);
//     }

//     res.status(200).json(modifiedVoucher);
//   })
// );

router.get(
  "/total-sales",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const year = moment().year();
    //Bundle
    const bundle_transactions = await knex("bundle_transactions")
      .select(
        "_id",
        "info",
        "phonenumber",
        "domain",
        "amount",
        "createdAt",
        "year"
      )
      .where({ year: year, status: "completed" })
      .orderBy("createdAt", "desc");

    const bundleTransaction = bundle_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    //Airtime
    const airtime_transactions = await knex("airtime_transactions")
      .select(
        "_id",
        "info",
        "phonenumber",
        "domain",
        "amount",
        "createdAt",
        "year"
      )
      .where({ year: year, status: "completed" })
      .orderBy("createdAt", "desc");

    const airtimeTransaction = airtime_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    //Vouchers
    const voucher_transactions = await knex("voucher_transactions")
      .select("_id", "info", "createdAt", "year")
      .where({ year: year, status: "completed" })
      .orderBy("createdAt", "desc");

    const transaction = voucher_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    const prepaid_transactions = await knex("prepaid_transactions")
      .where({ year: year, status: "completed" })
      .select("_id", "info", "status", "year", "createdAt")
      .orderBy("createdAt", "desc");

    const ecgTransaction = prepaid_transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        status: transaction?.status,
        createdAt: transaction?.createdAt,
        info: JSON.parse(transaction?.info),
        meter: {
          _id: transaction?.meterId,
          number: transaction?.number,
        },
      };
    });

    //GET Total numbers of transactions
    const voucherCount = transaction?.length;
    const ecgCount = ecgTransaction?.length;
    const airtimeCount = airtimeTransaction?.length;
    const bundleCount = bundleTransaction?.length;

    const count = {
      labels: [
        "Vouchers & Tickets",
        "Prepaid Units",
        "Airtime Transfer",
        "Data Bundle",
      ],
      data: [voucherCount, ecgCount, airtimeCount, bundleCount],
    };

    const recents = _.orderBy(
      [
        ...getRecentTransaction(transaction, 3),
        ...getRecentTransaction(ecgTransaction, 3),
        ...getRecentTransaction(airtimeTransaction, 3),
        ...getRecentTransaction(bundleTransaction, 3),
      ],
      "createdAt",
      "desc"
    );

    //Get ECG Total Amount
    const ecgTotal = _.sum(
      _.map(ecgTransaction, (item) => Number(item?.info?.amount))
    );

    //Get Voucher & Ticket Total Amount
    const voucherTotal = _.sum(
      _.map(transaction, (item) => Number(item?.info?.amount))
    );

    //Get Airtime Total Amount
    const airtimeTotal = _.sum(
      _.map(airtimeTransaction, (item) => Number(item?.amount))
    );
    //Get Bundlet Total Amount
    const bundleTotal = _.sum(
      _.map(bundleTransaction, (item) => Number(item?.amount))
    );

    const grandTotal = {
      ecg: ecgTotal,
      voucher: voucherTotal,
      airtime: airtimeTotal,
      bundle: bundleTotal,
      total: Number(ecgTotal + voucherTotal + airtimeTotal + bundleTotal),
    };

    //GET Total Sales today

    const today = {
      voucher: getTodayTransaction(transaction),
      ecg: getTodayTransaction(ecgTransaction),
      airtime: getTodayTransaction(airtimeTransaction),
      bundle: getTodayTransaction(bundleTransaction),
    };

    //GROUP transactions by Week
    const sevenDays = getLastSevenDaysTransactions(transaction, ecgTransaction);
    const airtimeSevenDays = getLastSevenDaysTransactions(
      bundleTransaction,
      airtimeTransaction
    );
    sevenDays.bundle = airtimeSevenDays.voucher;
    sevenDays.airtime = airtimeSevenDays.ecg;

    //GROUP transactions by month
    const transactionByMonth = getTransactionsByMonth(
      transaction,
      ecgTransaction
    );
    const airtimeByMonth = getTransactionsByMonth(
      bundleTransaction,
      airtimeTransaction
    );
    transactionByMonth.bundle = airtimeByMonth.voucher;
    transactionByMonth.airtime = airtimeByMonth.ecg;

    res.status(200).json({
      totalSales: grandTotal,
      totalCount: count,
      recents,
      today,
      sevenDays,
      transactionByMonth,
    });
  })
);

router.get(
  "/products",
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const categories = await knex("categories").select("*").where("active", 1);
    const vouchers = await knex("vouchers").select("category", "status");

    const voucher_transactions = await knex("voucher_transactions")
      .select("*")
      .where("status", "completed")
      .orderBy("createdAt", "desc");

    const transactions = voucher_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    //Get Total Categories
    const totalCategories = categories.length;
    //Get Total Vouchers
    const totalVouchers = vouchers.length;

    let voucher = [];
    let ticket = [];

    categories.map((category) => {
      if (["bus", "cinema", "stadium"].includes(category.category)) {
        ticket.push(category?._id);
      } else {
        voucher.push(category?._id);
      }
      return;
    });

    //total vouchers
    const voucherCount = voucher?.length;
    //total tickets
    const ticketCount = ticket?.length;

    const voucherPins = vouchers.filter((vou) => {
      return voucher.includes(vou?.category);
    });

    const ticketPins = vouchers.filter((tic) => ticket.includes(tic?.category));

    //count pins and serials
    const voucherPinsCount = voucherPins.length;
    const ticketPinsCount = ticketPins.length;

    //Group tickets into status
    const groupedVouchers = _.groupBy(voucherPins, "status");
    const groupedTickets = _.groupBy(ticketPins, "status");

    const voucherTransactions = _.filter(
      transactions,
      (transaction) => transaction?.info?.domain === "Voucher"
    );
    const ticketTransactions = _.filter(
      transactions,
      (transaction) => transaction?.info?.domain === "Ticket"
    );

    //Top Sold
    const topSoldVouchers = await getTopSellingProducts(voucherTransactions);
    const topSoldTickets = await getTopSellingProducts(ticketTransactions);

    //Get Recent Transactions
    const recentVoucher = getRecentTransaction(voucherTransactions, 3);
    const recentTicket = getRecentTransaction(ticketTransactions, 3);

    //Get Today Transactions
    const voucherToday = getTodayTransaction(voucherTransactions);

    const ticketToday = getTodayTransaction(ticketTransactions);

    //Get Yesterday Transactions
    const voucherYesterday = getYesterdayTransaction(voucherTransactions);

    const ticketYesterday = getYesterdayTransaction(ticketTransactions);

    //Last Seven Days
    const lastSevenDaysData = getLastSevenDaysTransactions(
      voucherTransactions,
      ticketTransactions
    );

    const voucherLastSevenDaysTotal = currencyFormatter(
      _.sum(lastSevenDaysData?.voucher?.data)
    );

    const ticketLastSevenDaysTotal = currencyFormatter(
      _.sum(lastSevenDaysData?.ecg?.data)
    );

    const thisYear = getTransactionsByMonth(
      voucherTransactions,
      ticketTransactions
    );

    res.status(200).json({
      category: {
        total: totalCategories,
        voucher: voucherCount,
        ticket: ticketCount,
      },
      pin: {
        total: totalVouchers,
        voucher: voucherPinsCount,
        ticket: ticketPinsCount,
      },
      topSold: {
        voucher: topSoldVouchers,
        ticket: topSoldTickets,
      },
      grouped: {
        voucher: [
          groupedVouchers["new"]?.length ?? 0,
          groupedVouchers["sold"]?.length ?? 0,
        ],
        ticket: [
          groupedTickets["new"]?.length ?? 0,
          groupedTickets["sold"]?.length ?? 0,
          groupedTickets["used"]?.length ?? 0,
        ],
      },
      recent: {
        voucher: recentVoucher,
        recent: recentTicket,
      },
      today: {
        total: currencyFormatter(voucherToday + ticketToday),
        voucher: currencyFormatter(voucherToday),
        ticket: currencyFormatter(ticketToday),
      },
      yesterday: {
        total: currencyFormatter(voucherYesterday ?? 0 + ticketYesterday ?? 0),
        voucher: currencyFormatter(voucherYesterday),
        ticket: currencyFormatter(ticketYesterday),
      },
      lastSevenDaysTotal: {
        voucherLastSevenDaysTotal,
        ticketLastSevenDaysTotal,
      },
      lastSevenDays: {
        labels: lastSevenDaysData.labels,
        voucher: lastSevenDaysData.voucher?.data,
        ticket: lastSevenDaysData.ecg?.data,
      },
      thisYear: {
        labels: thisYear?.labels,
        voucher: thisYear?.voucher?.data,
        ticket: thisYear?.ecg?.data,
      },
    });
  })
);

//ELECTRICTY
router.get(
  "/electricity",
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const prepaid_transactions = await knex("prepaid_transactions")
      .where({ year: moment().year(), status: "completed" })
      .select("_id", "info", "status", "processed", "year", "createdAt")
      .orderBy("createdAt", "desc");

    const transaction = prepaid_transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        status: transaction?.status,
        isProcessed: transaction?.processed,
        createdAt: transaction?.createdAt,
        info: JSON.parse(transaction?.info),
        meter: {
          _id: transaction?.meterId,
          number: transaction?.number,
        },
      };
    });

    //Get Recent Transactions
    const recent = getRecentTransaction(transaction, 3);
    //Get Today Transactions
    const today = currencyFormatter(getTodayTransaction(transaction));
    const yesterday = currencyFormatter(getYesterdayTransaction(transaction));
    const lastSevenDaysData = getLastSevenDaysTransactions([], transaction);

    const lastSevenDaysTotal = currencyFormatter(
      _.sum(lastSevenDaysData?.ecg?.data)
    );
    const thisMonth = currencyFormatter(getThisMonthTransaction(transaction));
    const thisYear = getTransactionsByMonth([], transaction);

    const groupedTransactions = _.groupBy(transaction, "isProcessed");

    const topCustomers = getTopCustomers(transaction);

    res.status(200).json({
      recent,
      today,
      yesterday,
      lastSevenDaysTotal,
      lastSevenDays: {
        labels: lastSevenDaysData.labels,
        data: lastSevenDaysData.ecg?.data,
      },
      thisMonth,
      thisYear: {
        labels: thisYear?.labels,
        data: thisYear?.ecg?.data,
      },
      status: [
        groupedTransactions["0"]?.length ?? 0,
        groupedTransactions["1"]?.length ?? 0,
      ],
      topCustomers,
    });
  })
);

router.get(
  "/airtime",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const airtime_transactions = await knex("airtime_transactions")
      .where({ year: moment().year(), status: "completed" })
      .select(
        "_id",
        "amount",
        "phonenumber",
        "domain",
        "info",
        "status",
        "year",
        "createdAt"
      )
      .orderBy("createdAt", "desc");

    const transaction = airtime_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    //Get Recent Transactions
    const recent = getRecentTransaction(transaction, 3);
    //Get Today Transactions
    const today = currencyFormatter(getTodayTransaction(transaction));
    const yesterday = currencyFormatter(getYesterdayTransaction(transaction));
    const lastSevenDaysData = getLastSevenDaysTransactions([], transaction);

    const lastSevenDaysTotal = currencyFormatter(
      _.sum(lastSevenDaysData?.ecg?.data)
    );
    const thisMonth = currencyFormatter(getThisMonthTransaction(transaction));
    const thisYear = getTransactionsByMonth([], transaction);

    const topCustomers = getTopCustomers(transaction);

    res.status(200).json({
      recent,
      today,
      yesterday,
      lastSevenDaysTotal,
      lastSevenDays: {
        labels: lastSevenDaysData.labels,
        data: lastSevenDaysData.ecg?.data,
      },
      thisMonth,
      thisYear: {
        labels: thisYear?.labels,
        data: thisYear?.ecg?.data,
      },
      topCustomers,
    });
  })
);

router.get(
  "/bundle",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const bundle_transactions = await knex("bundle_transactions")
      .where({ year: moment().year(), status: "completed" })
      .select(
        "_id",
        "amount",
        "phonenumber",
        "domain",
        "info",
        "status",
        "year",
        "createdAt"
      )
      .orderBy("createdAt", "desc");

    const transaction = bundle_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    //Get Recent Transactions
    const recent = getRecentTransaction(transaction, 3);
    //Get Today Transactions
    const today = currencyFormatter(getTodayTransaction(transaction));
    const yesterday = currencyFormatter(getYesterdayTransaction(transaction));
    const lastSevenDaysData = getLastSevenDaysTransactions([], transaction);

    const lastSevenDaysTotal = currencyFormatter(
      _.sum(lastSevenDaysData?.ecg?.data)
    );
    const thisMonth = currencyFormatter(getThisMonthTransaction(transaction));
    const thisYear = getTransactionsByMonth([], transaction);

    const topCustomers = getTopCustomers(transaction);

    res.status(200).json({
      recent,
      today,
      yesterday,
      lastSevenDaysTotal,
      lastSevenDays: {
        labels: lastSevenDaysData.labels,
        data: lastSevenDaysData.ecg?.data,
      },
      thisMonth,
      thisYear: {
        labels: thisYear?.labels,
        data: thisYear?.ecg?.data,
      },
      topCustomers,
    });
  })
);

router.get(
  "/email",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { email, mobileNo, startDate, endDate } = req.query;

    if (!email || !mobileNo) {
      return res.status(401).json("Invalid Request!");
    }

    const sDate = moment(startDate).format("MMMM DD YYYY");
    const eDate = moment(endDate).format("MMMM DD YYYY");

    const voucher_transactions = await knex.raw(
      `SELECT *
      FROM (
          SELECT _id,user,email,phonenumber,info,createdAt,year,active,status,DATE_FORMAT(createdAt,'%M %d %Y') AS purchaseDate
          FROM voucher_transactions
      ) AS voucher_transactions_ 
      WHERE user=? AND active=1 and status='completed' AND purchaseDate BETWEEN ? AND ?;`,
      [id, sDate, eDate]
    );

    const transactions = voucher_transactions[0]?.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: info ? JSON.parse(info) : {},
      };
    });

    const modifiedTransaction = transactions.map(async (transaction) => {
      // if (_.isEmpty(transaction?.info)) {
      //   return null;
      // }
      const category = await knex("categories")
        .select("voucherType")
        .where("_id", transaction?.info?.categoryId)
        .limit(1);

      return {
        _id: transaction?._id,
        voucherType: category[0].voucherType,
        domain: transaction?.info?.domain,
        downloadLink: transaction?.info?.downloadLink,
        phonenumber: transaction?.info?.agentPhoneNumber,
        email: transaction?.info?.agentEmail,
        type: _.upperCase(
          `${category[0].voucherType} ${transaction?.info?.domain}`
        ),
        quantity:
          transaction?.info?.quantity ||
          transaction?.info?.paymentDetails?.quantity,
        amount:
          transaction?.info?.amount ||
          transaction?.info?.paymentDetails?.totalAmount,
        createdAt: transaction?.createdAt,
        status: "completed",
      };
    });

    const vouchers = await Promise.all(modifiedTransaction);

    const prepaid_transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,user,email,mobileNo,info,createdAt,year,active,processed,meterId,number,status,DATE_FORMAT(createdAt,'%M %d %Y') AS purchaseDate
            FROM meter_prepaid_transaction_view
        ) AS meter_prepaid_transaction_view_ 
        WHERE user=? AND active=1 and status='completed' AND purchaseDate BETWEEN ? AND ?;`,
      [id, sDate, eDate]
    );

    const modifiedECGTransaction = prepaid_transactions[0].map(
      (transaction) => {
        const transInfo = JSON.parse(transaction?.info);
        return {
          _id: transaction?._id,
          meter: transaction?.number,
          type: `${transInfo?.domain} Units`,
          domain: transInfo?.domain,
          phonenumber: transInfo?.mobileNo,
          email: transInfo?.email,
          downloadLink: transInfo?.downloadLink,
          amount: transInfo?.amount,
          createdAt: transaction?.createdAt,
          status: Boolean(transaction?.processed) ? "compeleted" : "pending",
        };
      }
    );

    //Airtime

    const airtime_transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,user,type as kind,recipient,amount,domain,domain as type,email,phonenumber,status,isProcessed,createdAt,active,DATE_FORMAT(createdAt,'%M %d %Y') AS purchaseDate
            FROM airtime_transactions
        ) AS airtime_transactions_ 
        WHERE user=? AND active=1 and status='completed' AND purchaseDate BETWEEN ? AND ?;`,
      [id, sDate, eDate]
    );

    //Bundle

    const bundle_transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,user,bundle_name as kind,bundle_volume as volume,recipient,amount,domain,domain as type,email,phonenumber,status,isProcessed,createdAt,active,DATE_FORMAT(createdAt,'%M %d %Y') AS purchaseDate
            FROM bundle_transactions
        ) AS bundle_transactions_ 
        WHERE user=? AND active=1 and status='completed' AND purchaseDate BETWEEN ? AND ?;`,
      [id, sDate, eDate]
    );

    res
      .status(200)
      .json(
        _.orderBy(
          [
            ...vouchers,
            ...modifiedECGTransaction,
            ...airtime_transactions[0],
            ...bundle_transactions[0],
          ],
          "createdAt",
          "desc"
        )
      );
  })
);

router.get(
  "/status",
  // limit,
  // verifyToken,
  // verifyAdmin,
  asyncHandler(async (req, res) => {
    const { clientReference, type } = req.query;

    if (!clientReference || !type) {
      return res.status(400).json("Invalid Reference ID");
    }

    let transaction = [];

    if (type === "Voucher" || type === "Ticket") {
      transaction = await knex("voucher_transactions")
        .select("reference")
        .where("reference", clientReference)
        .limit(1);
    }

    if (type === "Prepaid") {
      transaction = await knex("prepaid_transactions")
        .select("reference")
        .where("reference", clientReference)
        .limit(1);
    }

    //if creating new transaction fails
    if (_.isEmpty(transaction)) {
      return res
        .status(403)
        .json("We could not find a transaction which match your ID!");
    }
    try {
      const response = await moneyStatus(clientReference);
      return res.status(200).json(response.data);
    } catch (error) {
      return res
        .status(500)
        .json("Could not check transaction status.Try again later");
    }
  })
);
router.get(
  "/:transactionId",
  limit,
  asyncHandler(async (req, res) => {
    const transactionId = req.params.transactionId;
    const { mobileNo } = req.query;

    if (!isValidUUID2(transactionId) || !mobileNo) {
      return res.status(400).json("No results match your search");
    }

    const transaction = await knex("voucher_transactions")
      .select("*")
      .where({ _id: transactionId, status: "completed" })
      .limit(1);

    if (
      _.isEmpty(transaction) ||
      transaction[0]?.status !== "completed" ||
      mobileNo !== transaction[0]?.phonenumber
    ) {
      return res.status(400).json("No results match your search!");
    }

    res.status(200).json({
      ...transaction[0],
      info: JSON.parse(transaction[0].info),
      vouchers: "",
    });
  })
);

router.put(
  "/delete",
  // verifyToken,
  asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (_.isEmpty(ids)) {
      return res.status(400).json("Invalid Request");
    }

    await knex("voucher_transactions").where("_id", "IN", ids).update({
      active: 0,
    });
    await knex("prepaid_transactions").where("_id", "IN", ids).update({
      active: 0,
    });
    await knex("airtime_transactions").where("_id", "IN", ids).update({
      active: 0,
    });
    await knex("bundle_transactions").where("_id", "IN", ids).update({
      active: 0,
    });

    res.sendStatus(204);
  })
);

/////////////.......................Agent transaction summary.............//////////////////
router.get(
  "/agents/wallet/transactions",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.query;
    const transactions = await knex("agent_wallet_transactions_view")
      .where("agentID", id)
      .select("_id", "createdAt", "amount", "status", "issuerName")
      .orderBy("createdAt", "desc");

    res.status(200).json(transactions);
  })
);

router.get(
  "/agent/transaction",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { sort, startDate, endDate } = req.query;

    const sDate = moment(startDate).format("MMMM DD YYYY");
    const eDate = moment(endDate).format("MMMM DD YYYY");

    let modifiedAirtimeTransaction = [];
    let modifiedBundleTransaction = [];

    const transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT *,DATE_FORMAT(createdAt,'%M %d %Y') AS purchaseDate
            FROM agent_transactions
        ) AS agent_transactions_ 
        WHERE agent_id=? and status='completed' AND purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
      [id, sDate, eDate]
    );

    const modifiedTransactions = transactions[0].map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });
    const groupedTransactions = _.groupBy(modifiedTransactions, "type");
    const airtimeTransactions = groupedTransactions?.airtime ?? [];
    const bundleTransactions = groupedTransactions?.bundle ?? [];

    switch (sort) {
      case "today":
        modifiedAirtimeTransaction =
          getTodayTransactionArray(airtimeTransactions);
        modifiedBundleTransaction =
          getTodayTransactionArray(bundleTransactions);

        break;
      case "yesterday":
        modifiedAirtimeTransaction =
          getYesterdayTransactionArray(airtimeTransactions);
        modifiedBundleTransaction =
          getYesterdayTransactionArray(bundleTransactions);
        break;

      case "week":
        modifiedAirtimeTransaction =
          getLastSevenDaysTransactionsArray(airtimeTransactions);
        modifiedBundleTransaction =
          getLastSevenDaysTransactionsArray(bundleTransactions);

        break;
      case "month":
        modifiedAirtimeTransaction =
          getThisMonthTransactionArray(airtimeTransactions);
        modifiedBundleTransaction =
          getThisMonthTransactionArray(bundleTransactions);
        break;
      case "lmonth":
        modifiedAirtimeTransaction =
          getLastMonthTransactionArray(airtimeTransactions);
        modifiedBundleTransaction =
          getLastMonthTransactionArray(bundleTransactions);

        break;
      case "year":
        modifiedAirtimeTransaction =
          getThisYearTransactionArray(airtimeTransactions);
        modifiedBundleTransaction =
          getThisYearTransactionArray(bundleTransactions);
        break;
      case "lyear":
        modifiedAirtimeTransaction =
          getLastYearTransactionArray(airtimeTransactions);
        modifiedBundleTransaction =
          getLastYearTransactionArray(bundleTransactions);
        break;
      default:
        modifiedAirtimeTransaction = [...airtimeTransactions];
        modifiedBundleTransaction = [...bundleTransactions];
    }

    res
      .status(200)
      .json([...modifiedAirtimeTransaction, ...modifiedBundleTransaction]);
  })
);

// Generate transactional report
router.post(
  "/agent/transactions/report",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { email } = req.user;
    const { startDate, endDate, transactions, type } = req.body;
    const sDate = moment(startDate).format("MMMM DD YYYY");
    const eDate = moment(endDate).format("MMMM DD YYYY");

    const id = randomUUID();
    const template = await generateHTMLTemplate(
      transactions,
      "agent_transactions.ejs"
    );

    const result = await generateTransactionReport(
      template,
      id,
      `${type}-report`
    );
    if (result) {
      const body = ` <div class="container">
  <h1>Transactional Report</h1>
  <p>Dear Customer,</p>
  <p>Attached is your transactional report from the period ${sDate} to ${eDate}. Please review the details below:</p>
  <p>If you have any questions or concerns regarding this report, please feel free to contact us.</p>
  <p>Thank you for your business!</p>
  <p>Sincerely,<br>Gab Powerful Consults</p>
  </div>`;
      // console.log(result);
      const downloadLink = await uploadFiles(result, "reports");

      await sendReportMail(
        email,
        mailTextShell(body),
        result,
        " Transaction Report"
      );

      return res.status(200).json(downloadLink);
    }
  })
);
router.get(
  "/agent/airtime",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { type } = req.query;

    const transactions = await knex("agent_transactions")
      .select(
        "_id",
        "info",
        "type",
        "recipient as phonenumber",
        "type as domain",
        "amount",
        "createdAt",
        "year"
      )
      .where({ agent_id: id, type, status: "completed" })
      .orderBy("createdAt", "desc");

    const transaction = transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    //Get Recent Transactions
    const recent = getRecentTransaction(transaction, 3);
    //Get Today Transactions
    const today = currencyFormatter(getTodayTransaction(transaction));
    const yesterday = currencyFormatter(getYesterdayTransaction(transaction));
    const lastSevenDaysData = getLastSevenDaysTransactions([], transaction);

    const lastSevenDaysTotal = currencyFormatter(
      _.sum(lastSevenDaysData?.ecg?.data)
    );
    const thisMonth = currencyFormatter(getThisMonthTransaction(transaction));
    const thisYear = getTransactionsByMonth([], transaction);

    const topCustomers = getTopCustomers(transaction);

    res.status(200).json({
      recent,
      today,
      yesterday,
      lastSevenDaysTotal,
      lastSevenDays: {
        labels: lastSevenDaysData.labels,
        data: lastSevenDaysData.ecg?.data,
      },
      thisMonth,
      thisYear: {
        labels: thisYear?.labels,
        data: thisYear?.ecg?.data,
      },
      topCustomers,
    });
  })
);

router.get(
  "/agent/total-sales",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const year = moment().year();
    const transactions = await knex("agent_transactions")
      .select(
        "_id",
        "info",
        "type",
        "recipient as phonenumber",
        "type as domain",
        "amount",
        "createdAt",
        "year"
      )
      .where({ agent_id: id, year: year, status: "completed" })
      .orderBy("createdAt", "desc");

    const modifiedTransactions = transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });
    const groupedTransactions = _.groupBy(modifiedTransactions, "type");
    const airtimeTransaction = groupedTransactions?.airtime;
    const bundleTransaction = groupedTransactions?.bundle;

    //GET Total numbers of transactions
    const airtimeCount = airtimeTransaction?.length;
    const bundleCount = bundleTransaction?.length;

    const count = {
      labels: ["Airtime Transfer", "Data Bundle"],
      data: [airtimeCount, bundleCount],
    };

    const recents = _.orderBy(
      [
        ...getRecentTransaction(airtimeTransaction, 3),
        ...getRecentTransaction(bundleTransaction, 3),
      ],
      "createdAt",
      "desc"
    );

    //Get Airtime Total Amount
    const airtimeTotal = _.sum(
      _.map(airtimeTransaction, (item) => Number(item?.amount))
    );
    //Get Bundlet Total Amount
    const bundleTotal = _.sum(
      _.map(bundleTransaction, (item) => Number(item?.amount))
    );

    const grandTotal = {
      airtime: airtimeTotal,
      bundle: bundleTotal,
      total: Number(airtimeTotal + bundleTotal),
    };

    //GET Total Sales today

    const today = {
      airtime: getTodayTransaction(airtimeTransaction),
      bundle: getTodayTransaction(bundleTransaction),
    };

    //GROUP transactions by Week
    const airtimeSevenDays = getLastSevenDaysTransactions(
      bundleTransaction,
      airtimeTransaction
    );
    airtimeSevenDays.bundle = airtimeSevenDays.voucher;
    airtimeSevenDays.airtime = airtimeSevenDays.ecg;

    //GROUP transactions by month
    const airtimeByMonth = getTransactionsByMonth(
      bundleTransaction,
      airtimeTransaction
    );
    airtimeByMonth.bundle = airtimeByMonth.voucher;
    airtimeByMonth.airtime = airtimeByMonth.ecg;

    res.status(200).json({
      totalSales: grandTotal,
      totalCount: count,
      recents,
      today,
      sevenDays: airtimeSevenDays,
      transactionByMonth: airtimeByMonth,
    });
  })
);

router.get(
  "/agent/report",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { year, type } = req.query;

    const transactions = await knex("agent_transactions")
      .select(
        "_id",
        "info",
        "amount",
        "type",
        "provider",
        "year",
        "status",
        "agent_id",
        "createdAt"
      )
      .where({
        year,
        status: "completed",
        agent_id: id,
      });

    const modifiedTransactions = transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });
    const groupedTransactions = _.groupBy(modifiedTransactions, "type");
    const modifiedAirtimeTransaction = groupedTransactions?.airtime ?? [];
    const modifiedBundleTransaction = groupedTransactions?.bundle ?? [];

    if (type === "All") {
      const airtimeByMonth = getTransactionsArrayByMonth(
        modifiedAirtimeTransaction
      );
      const bundleByMonth = getTransactionsArrayByMonth(
        modifiedBundleTransaction
      );
      return res.status(200).json({
        airtime: airtimeByMonth,
        bundle: bundleByMonth,
      });
    }

    if (type === "Airtime") {
      const airtimeByMonth = getTransactionsArrayByMonth(
        modifiedAirtimeTransaction
      );
      return res.status(200).json({
        report: airtimeByMonth,
      });
    }
    if (type === "Bundle") {
      const bundleByMonth = getTransactionsArrayByMonth(
        modifiedBundleTransaction
      );
      return res.status(200).json({
        report: bundleByMonth,
      });
    }
  })
);
router.get(
  "/agents/wallet",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const agentsWallets = await knex("agent_wallets")
      .join("agents", "agent_wallets.agent_id", "=", "agents._id")
      .select(
        "agents._id as _id",
        "agent_wallets.amount as amount",
        "agent_wallets.agent_key as clientID",
        "agents.email as email",
        "agents.phonenumber as phonenumber",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        knex.raw(
          "DATE_FORMAT(agent_wallets.updatedAt,'%D %M %Y ,%r' ) as updatedAt"
        )
      );

    return res.status(200).json(agentsWallets);
  })
);

router.post(
  "/agents/wallet",
  verifyToken,
  verifyAdmin,
  Upload.single("attachment"),
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { id: agent_id, comment, amount } = req.body;

    const transaction = await knex.transaction();
    let url = req.file?.filename;

    try {
      if (req.file) {
        url = await uploadAttachment(req.file);
      }

      await transaction("agent_wallet_transactions").insert({
        _id: randomUUID(),
        agent_id,
        issuer: id,
        amount,
        comment,
        attachment: url,
      });

      await transaction("agent_wallets").where("agent_id", agent_id).increment({
        amount,
      });

      await transaction.commit();

      return res.status(200).json("Wallet top up successful");
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json("Top up failed");
    }
  })
);
router.get(
  "/agents/wallet/transaction",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { startDate, endDate, report } = req.query;

    const sDate = moment(startDate).format("MMMM DD YYYY");
    const eDate = moment(endDate).format("MMMM DD YYYY");

    const transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT *,DATE_FORMAT(createdAt,'%M %d %Y') AS purchaseDate
            FROM agent_wallet_transactions_view
        ) AS agent_wallet_transactions_view_  WHERE purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
      [sDate, eDate]
    );
    // console.log(_transactions[0]);
    if (report && report === "true") {
      if (transactions[0].length === 0) {
        return res.status(200).json("No data found");
      }

      const data = {
        person: {
          name: transactions[0][0]?.userName,
          startDate: sDate,
          endDate: eDate,
        },
        transactions: transactions[0],
      };

      const walletTemplate = await generateHTMLTemplate(
        data,
        "wallet_report.ejs"
      );
      const id = randomUUID();

      const result = await generateTransactionReport(
        walletTemplate,
        id,
        "wallet-report"
      );

      // const result = plimit(() =>
      //   generateTransactionReport(walletTemplate, id, "wallet-report")
      // );

      if (result) {
        const body = ` <div class="container">
    <h1>Transactional Report</h1>
    <p>Dear Customer,</p>
    <p>Attached is your wallet transactional report from ${sDate} to ${eDate}. Please review the details below:</p>
    <p>If you have any questions or concerns regarding this report, please feel free to contact us.</p>
    <p>Thank you for your business!</p>
    <p>Sincerely,<br>Gab Powerful Consults</p>
    </div>`;
        const downloadLink = await uploadFiles(result, "reports");

        await sendReportMail(
          process.env.MAIL_CLIENT_USER,
          mailTextShell(body),
          result,
          "Wallet Transaction Report"
        );

        return res.status(200).json(downloadLink);
      }
    }

    res.status(200).json(transactions[0]);
  })
);
//....................users..................//

router.get(
  "/users/wallet",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const usersWallets = await knex("user_wallets")
      .join("users", "user_wallets.user_id", "=", "users._id")
      .select(
        "users._id as _id",
        "user_wallets.amount as amount",
        "user_wallets.user_key as clientID",
        "users.email as email",
        "users.phonenumber as phonenumber",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        knex.raw(
          "DATE_FORMAT(user_wallets.updatedAt,'%D %M %Y ,%r' ) as updatedAt"
        )
      );

    return res.status(200).json(usersWallets);
  })
);

router.post(
  "/users/wallet",
  verifyToken,
  verifyAdmin,
  Upload.single("attachment"),
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { id: user_id, type, amount, comment } = req.body;

    const transaction = await knex.transaction();
    let url = req.file?.filename;

    try {
      if (req.file) {
        url = await uploadAttachment(req.file);
      
      }
      if (type === "user") {
        await transaction("user_wallet_transactions").insert({
          _id: randomUUID(),
          user_id,
          issuer: id,
          amount,
          comment,
          attachment: url,
        });

        await transaction("user_wallets").where("user_id", user_id).increment({
          amount,
        });
      }
      if (type === "agent") {
        await transaction("agent_wallet_transactions").insert({
          _id: randomUUID(),
          agent_id: user_id,
          issuer: id,
          amount,
          comment,
          attachment: url,
        });

        await transaction("agent_wallets")
          .where("agent_id", user_id)
          .increment({
            amount,
          });
      }

      if (type === "user") {
        await transaction("user_notifications").insert({
          _id: randomUUID(),
          user_id: user_id,
          type: "wallet",
          title: "Wallet",
          message: `Your wallet account has been credited with an amount of GHS ${amount}.`,
        });
      }
      if (type === "agent") {
        await transaction("agent_notifications").insert({
          _id: randomUUID(),
          agent_id: user_id,
          type: "wallet",
          title: "Wallet",
          message: `Your wallet account has been created with GHS ${amount}.`,
        });
      }
      await transaction.commit();
      return res.status(200).json("Wallet top up successful");
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json("Top up failed");
    }
  })
);

router.get(
  "/users/wallet/transactions",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { startDate, endDate, report } = req.query;

    const sDate = moment(startDate).format("MMMM DD YYYY");
    const eDate = moment(endDate).format("MMMM DD YYYY");

    const transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT *,DATE_FORMAT(createdAt,'%M %d %Y') AS purchaseDate
            FROM user_wallet_transactions_view
        ) AS user_wallet_transactions_view_  WHERE purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
      [sDate, eDate]
    );
    // console.log(_transactions[0]);
    if (report && report === "true") {
      if (transactions[0].length === 0) {
        return res.status(200).json("No data found");
      }

      const data = {
        person: {
          name: transactions[0][0]?.userName,
          startDate: sDate,
          endDate: eDate,
        },
        transactions: transactions[0],
      };

      const walletTemplate = await generateHTMLTemplate(
        data,
        "wallet_report.ejs"
      );
      const id = randomUUID();

      const result = await generateTransactionReport(
        walletTemplate,
        id,
        "wallet-report"
      );

      // const result = plimit(() =>
      //   generateTransactionReport(walletTemplate, id, "wallet-report")
      // );

      if (result) {
        const body = ` <div class="container">
    <h1>Transactional Report</h1>
    <p>Dear [Customer Name],</p>
    <p>Attached is your wallet transactional report for the period [Period]. Please review the details below:</p>
    <p>If you have any questions or concerns regarding this report, please feel free to contact us.</p>
    <p>Thank you for your business!</p>
    <p>Sincerely,<br>Gab Powerful Consults</p>
    </div>`;

        const downloadLink = await uploadFiles(result, "reports");

        await sendReportMail(
          process.env.MAIL_CLIENT_USER,
          mailTextShell(body),
          result,
          "Wallet Transaction Report"
        );

        return res.status(200).json(downloadLink);
      }
    }

    res.status(200).json(transactions[0]);
  })
);
router.get(
  "/users/wallet/transactions/:id",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transactions = await knex("user_wallet_transactions_view")
      .where("userID", id)
      .select("_id", "createdAt", "amount", "status", "issuerName")
      .orderBy("createdAt", "desc");

    res.status(200).json(transactions);
  })
);

module.exports = router;
