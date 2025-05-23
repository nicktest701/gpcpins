const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { randomBytes } = require("crypto");
const _ = require("lodash");
const moment = require("moment");
const generateId = require("../config/generateId");
const multer = require("multer");
const pLimit = require("p-limit");
const cors = require("cors");
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
const verifyAdminORAgent = require("../middlewares/verifyAdminORAgent");
const { verifyToken } = require("../middlewares/verifyToken");
const { rateLimit } = require("express-rate-limit");

const { isValidUUID2 } = require("../config/validation");

const knex = require("../db/knex");
const { moneyStatus, sendMoneyToCustomer } = require("../config/sendMoney");
const verifyAgent = require("../middlewares/verifyAgent");
const { uploadAttachment, uploadFiles } = require("../config/uploadFile");
const { generateHTMLTemplate } = require("../config/generateVoucherTemplate");
const { generateTransactionReport } = require("../config/generatePDF");
const { sendReportMail } = require("../config/mail");
const { mailTextShell } = require("../config/mailText");
const {
  getInternationalMobileFormat,
  getPhoneNumberInfo,
} = require("../config/PhoneCode");
const { sendSMS } = require("../config/sms");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

const plimit = pLimit(3);

const corsOptions = {
  methods: "POST",
  origin: process.env.CLIENT_URL,
};

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/attachments/");
  },
  filename: function (req, file, cb) {
    const ext = file?.mimetype?.split("/")[1];

    cb(null, `${generateId()}.${ext}`);
  },
});

const Upload = multer({ storage: Storage });

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { sort, startDate, endDate } = req.query;

    const transx = await knex.transaction();
    let modifiedTransaction = [];
    let modifiedECGTransaction = [];
    let modifiedAirtimeTransaction = [];
    let modifiedBundleTransaction = [];

    const bundle_transactions = await knex("bundle_transactions")
      .select(
        "_id",
        "externalTransactionId",
        "bundle_name as kind",
        "bundle_volume as volume",
        "reference",
        "recipient",
        "phonenumber",
        "info",
        "mode",
        "partner",
        "amount",
        "domain",
        "domain as type",
        "isProcessed",
        "status",
        "createdAt",
        "updatedAt",
        knex.raw("DATE_FORMAT(updatedAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where("status", "IN", ["completed", "pending"]);

    const bundleTransactions = bundle_transactions.map(
      ({ info, partner, ...rest }) => {
        return {
          ...rest,
          partner: JSON.parse(partner),
          info: JSON.parse(info),
        };
      }
    );
    const airtime_transactions = await transx("airtime_transactions")
      .select(
        "_id",
        "externalTransactionId",
        "type as kind",
        "reference",
        "recipient",
        "phonenumber",
        "info",
        "partner",
        "amount",
        "mode",
        "domain",
        "domain as type",
        "isProcessed",
        "issuer",
        "issuerName",
        "status",
        "createdAt",
        "updatedAt",
        knex.raw("DATE_FORMAT(updatedAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where("status", "IN", ["completed", "pending"]);

    const airtimeTransactions = airtime_transactions.map(
      ({ info, partner, ...rest }) => {
        return {
          ...rest,
          createdAt: rest?.updatedAt,
          partner: JSON.parse(partner),
          info: JSON.parse(info),
        };
      }
    );

    const voucher_transactions = await transx("voucher_transactions")
      .select(
        "_id",
        "externalTransactionId",
        "info",
        "partner",
        "mode",
        "status",
        "reference",
        "createdAt",
        "updatedAt",
        knex.raw("DATE_FORMAT(updatedAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where("status", "IN", ["completed", "pending"]);

    const transactions = voucher_transactions.map(
      ({ info, partner, ...rest }) => {
        return {
          ...rest,
          partner: JSON.parse(partner),
          info: JSON.parse(info),
        };
      }
    );

    // return res.status(200).json(transactions);

    const prepaid_transactions = await transx("prepaid_transactions")
      .leftJoin("meters", "prepaid_transactions.meter", "=", "meters._id")
      .select(
        "prepaid_transactions._id as _id",
        "prepaid_transactions.externalTransactionId as externalTransactionId",
        "prepaid_transactions.reference as reference",
        "prepaid_transactions.info as info",
        "prepaid_transactions.partner as partner",
        "prepaid_transactions.mode as mode",
        "prepaid_transactions.status as status",
        "prepaid_transactions.processed as isProcessed",
        "prepaid_transactions.issuer as issuer",
        "prepaid_transactions.issuerName as issuerName",
        "prepaid_transactions.createdAt as createdAt",
        "prepaid_transactions.updatedAt as updatedAt",
        knex.raw(
          "DATE_FORMAT(prepaid_transactions.updatedAt,'%D %M,%Y %r') as modifiedAt"
        ),
        "meters._id as meterId",
        "meters.number as number"
      )
      .where("status", "IN", ["completed", "pending"]);

    const ecgTransaction = prepaid_transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        externalTransactionId: transaction?.externalTransactionId,
        reference: transaction?.reference,
        info: JSON.parse(transaction?.info),
        partner: JSON.parse(transaction?.partner),
        mode: transaction?.mode,
        isProcessed: transaction?.isProcessed,
        status: Boolean(transaction?.isProcessed) ? "completed" : "pending",
        modifiedAt: transaction?.modifiedAt,
        createdAt: transaction?.updatedAt,
        issuer: transaction?.issuer,
        issuerName: transaction?.issuerName,
        updatedAt: transaction?.updatedAt,
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
    // console.log(modifiedTransactionWithRange)

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
      const category = await transx("categories")
        .where("_id", transaction?.info?.categoryId)
        .select("voucherType")
        .first();

      return {
        _id: transaction?._id,
        externalTransactionId: transaction?.externalTransactionId,
        reference: transaction?.reference,
        voucherType: category?.voucherType,
        domain: transaction?.info?.domain,
        downloadLink: transaction?.info?.downloadLink,
        phonenumber: transaction?.info?.agentPhoneNumber,
        email: transaction?.info?.agentEmail,
        type: _.upperCase(
          `${category?.voucherType} ${transaction?.info?.domain}`
        ),
        quantity:
          transaction?.info?.quantity ||
          transaction?.info?.paymentDetails?.quantity,
        amount:
          transaction?.info?.amount ||
          transaction?.info?.paymentDetails?.totalAmount,
        createdAt: transaction?.updatedAt,
        updatedAt: transaction?.updatedAt,
        modifiedAt: transaction?.modifiedAt,
        partner: transaction?.partner,
        mode: transaction?.mode,
        status: transaction?.status,
      };
    });
    const vouchers = await Promise.all(VoucherTransactions);

    const prepaids = modifiedECGTransaction.map((transaction) => {
      return {
        _id: transaction?._id,
        externalTransactionId: transaction?.externalTransactionId,
        reference: transaction?.reference,
        meter: transaction?.meter?.number,
        type: `${transaction?.info?.domain} Units`,
        domain: transaction?.info?.domain,
        phonenumber: transaction?.info?.mobileNo,
        email: transaction?.info?.email,
        downloadLink: transaction?.info?.downloadLink,
        amount: transaction?.info?.amount,
        issuer: transaction?.issuer,
        issuerName: transaction?.issuerName,
        createdAt: transaction?.updatedAt,
        updatedAt: transaction?.updatedAt,
        modifiedAt: transaction?.modifiedAt,
        partner: transaction?.partner,
        mode: transaction?.mode,
        status: transaction?.status,
      };
    });
    // console.log({
    //   1: vouchers[0],
    //   2: prepaids[0],
    //   3: modifiedAirtimeTransaction[0],
    //   4: modifiedBundleTransaction[0],
    // })

    await transx.commit();

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
  "/refund",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { sort, startDate, endDate } = req.query;

    let modifiedTransaction = [];
    let modifiedECGTransaction = [];
    let modifiedAirtimeTransaction = [];
    let modifiedBundleTransaction = [];

    const transx = await knex.transaction();
    const agent_transactions = await transx("agent_transactions")
      .select(
        "_id",
        "reference",
        "recipient",
        "recipient as phonenumber",
        "info",
        knex.raw(`'Wallet' as mode`),
        knex.raw(`true as isAgent`),
        knex.raw(`true as isProcessed`),
        "totalAmount as amount",
        "type",
        "type as domain",
        "refunder",
        "agent_id as issuer",
        "status",
        "createdAt",
        "updatedAt",
        knex.raw("DATE_FORMAT(updatedAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where({
        status: "refunded",
      });

    const groupedTransactions = _.groupBy(agent_transactions, "type");
    const agentBundleTransaction = groupedTransactions?.bundle || [];

    const bundle_transactions = await transx("bundle_transactions")
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
        "refunder",
        "status",
        "createdAt",
        "updatedAt",
        knex.raw("DATE_FORMAT(updatedAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where({
        status: "refunded",
      });

    const bundleTransactions = [
      ...bundle_transactions,
      ...agentBundleTransaction,
    ].map(({ info, ...rest }) => {
      const infoDetails = JSON.parse(info);
      const details = rest.isAgent
        ? {
            ...rest,
            kind: infoDetails?.plan_name,
            volume: infoDetails?.volume,
            domain: _.capitalize(rest.type),
          }
        : {
            ...rest,
            info: infoDetails,
          };
      return details;
    });
    // console.log(bundleTransactions);

    const agentAirtimeTransaction = groupedTransactions?.airtime || [];
    const airtime_transactions = await transx("airtime_transactions")
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
        "issuer",
        "refunder",
        "issuerName",
        "status",
        "createdAt",
        "updatedAt",
        knex.raw("DATE_FORMAT(updatedAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where({
        status: "refunded",
      });

    const airtimeTransactions = [
      ...airtime_transactions,
      ...agentAirtimeTransaction,
    ].map(({ info, ...rest }) => {
      const infoDetails = JSON.parse(info);
      const details = rest.isAgent
        ? {
            ...rest,
            issuerName: "Agent",
            kind: "single",
            domain: _.capitalize(rest.type),
          }
        : {
            ...rest,
            info: infoDetails,
          };
      return details;
    });

    const voucher_transactions = await transx("voucher_transactions")
      .select(
        "_id",
        "info",
        "mode",
        "refunder",
        "reference",
        "createdAt",
        "updatedAt",
        knex.raw("DATE_FORMAT(updatedAt,'%D %M,%Y %r') as modifiedAt")
      )
      .where({
        status: "refunded",
      });

    //
    const transactions = voucher_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    // return res.status(200).json(transactions);

    const prepaid_transactions = await transx("prepaid_transactions")
      .join("meters", "prepaid_transactions.meter", "=", "meters._id")
      .select(
        "prepaid_transactions._id as _id",
        "prepaid_transactions.reference as reference",
        "prepaid_transactions.info as info",
        "prepaid_transactions.mode as mode",
        "prepaid_transactions.processed as isProcessed",
        "prepaid_transactions.status as status",
        "prepaid_transactions.issuer as issuer",
        "prepaid_transactions.refunder as refunder",
        "prepaid_transactions.issuerName as issuerName",
        "prepaid_transactions.createdAt as createdAt",
        "prepaid_transactions.updatedAt as updatedAt",
        knex.raw(
          "DATE_FORMAT(prepaid_transactions.updatedAt,'%D %M,%Y %r') as modifiedAt"
        ),
        "meters._id as meterId",
        "meters.number as number"
      )
      .where({
        status: "refunded",
      });

    const ecgTransaction = prepaid_transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        reference: transaction?.reference,
        info: JSON.parse(transaction?.info),
        mode: transaction?.mode,
        isProcessed: transaction?.isProcessed,
        status: transaction?.status,
        modifiedAt: transaction?.modifiedAt,
        createdAt: transaction?.updatedAt,
        issuer: transaction?.issuer,
        refunder: transaction?.refunder,
        issuerName: transaction?.issuerName,
        updatedAt: transaction?.updatedAt,
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
    // console.log(modifiedTransactionWithRange)

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
      const category = await transx("categories")
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
        createdAt: transaction?.updatedAt,
        updatedAt: transaction?.updatedAt,
        modifiedAt: transaction?.modifiedAt,
        refunder: transaction?.refunder,
        mode: transaction?.mode,
        isProcessed: 1,
        status: "refunded",
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
        isProcessed: transaction?.isProcessed,
        issuer: transaction?.issuer,
        refunder: transaction?.refunder,
        issuerName: transaction?.issuerName,
        createdAt: transaction?.updatedAt,
        updatedAt: transaction?.updatedAt,
        modifiedAt: transaction?.modifiedAt,
        mode: transaction?.mode,
        status: transaction?.status,
      };
    });
    await transx.commit();
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

    const transx = await knex.transaction();

    //Bundle
    const bundle_transactions = await transx("bundle_transactions")
      .select("_id", "info", "amount", "createdAt", "updatedAt", "year")
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
    const airtime_transactions = await transx("airtime_transactions")
      .select("_id", "info", "amount", "createdAt", "updatedAt", "year")
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
    const voucher_transactions = await transx("voucher_transactions")
      .select("_id", "info", "createdAt", "updatedAt", "year")
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

    const prepaid_transactions = await transx("prepaid_transactions")
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
        "prepaid_transactions.updatedAt as updatedAt",
        "meters._id as meterId",
        "meters.number as number"
      );

    await transx.commit();

    const modifiedECGTransaction = prepaid_transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        status: transaction?.status,
        createdAt: transaction?.createdAt,
        updatedAt: transaction?.updatedAt,
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

router.get(
  "/verify",
  limit,
  asyncHandler(async (req, res) => {
    const { id, ticket } = req.query;

    //Check if ticket exists
    if (!ticket || !id) {
      return res.status(400).json("Error! Ticket not available.");
    }

    const transx = await knex.transaction();

    try {
      //find tranasction with specific payment id
      const transaction = await transx("voucher_transactions")
        .select("*")
        .where("_id", id)
        .limit(1)
        .first();

      if (_.isEmpty(transaction)) {
        return res.status(400).json("Couldnt find your ticket!");
      }

      // console.log(transaction)

      //selectedVoucher
      const selectedVoucher = await transx("voucher_view")
        .where("_id", ticket)
        .first();

      if (_.isEmpty(selectedVoucher)) {
        return res.status(400).json("Couldnt Verify your ticket! Try again");
      }

      const info = JSON.parse(transaction?.info);
      const details = JSON.parse(selectedVoucher?.details);
      const modifiedVoucher = {
        id: transaction?._id,
        voucherType: selectedVoucher?.voucher,
        category: selectedVoucher?.category,
        serial: selectedVoucher.serial,
        pin: selectedVoucher.pin,
        type: details?.type,
        seatNo: details?.seatNo,
        mode: transaction?.mode,
        amount: info?.amount,
        email: transaction.email,
        phonenumber: transaction.phonenumber,
        status: _.upperCase(selectedVoucher?.status),
        createdAt: transaction?.createdAt,
      };

      await transx.commit();

      res.status(200).json(modifiedVoucher);
    } catch (error) {
      await transx.rollback();

      return res.status(400).json("Couldnt Verify your ticket");
    }
  })
);

router.get(
  "/total-sales",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id, isAdmin } = req.user;
    const year = moment().year();
    let logs = [];

    const transx = await knex.transaction();

    try {
      const agent_transactions = await transx("agent_transactions")
        .select(
          "_id",
          "type",
          "recipient as phonenumber",
          "type as domain",
          "totalAmount as amount",
          "createdAt",
          "updatedAt",
          "year"
        )
        .where({ year: year })
        .andWhere("status", "IN", ["completed", "refunded"])
        .orderBy("createdAt", "desc");

      const groupedTransactions = _.groupBy(agent_transactions, "type");
      const agentAirtimeTransaction = groupedTransactions?.airtime;
      const agentBundleTransaction = groupedTransactions?.bundle;

      //Bundle
      const bundle_transactions = await transx("bundle_transactions")
        .select(
          "_id",
          "info",
          "phonenumber",
          "domain",
          "amount",
          "createdAt",
          "updatedAt",
          "year",
          "status"
        )
        .where({ year: year })
        .andWhere("status", "IN", ["completed", "refunded"])

        .orderBy("updatedAt", "desc");

      const bundleTransaction = [
        ...bundle_transactions,
        ...agentBundleTransaction,
      ].map(({ info, ...rest }) => {
        return {
          ...rest,
          domain: _.capitalize(rest.domain),
          info: _.isUndefined(info) ? {} : JSON.parse(info),
        };
      });

      //Airtime
      const airtime_transactions = await transx("airtime_transactions")
        .select(
          "_id",
          "info",
          "phonenumber",
          "domain",
          "amount",
          "createdAt",
          "updatedAt",
          "year",
          "status"
        )
        .where({ year: year })
        .andWhere("status", "IN", ["completed", "refunded"])
        .orderBy("updatedAt", "desc");

      const airtimeTransaction = [
        ...airtime_transactions,
        ...agentAirtimeTransaction,
      ].map(({ info, ...rest }) => {
        return {
          ...rest,
          domain: _.capitalize(rest.domain),
          info: _.isUndefined(info) ? {} : JSON.parse(info),
        };
      });

      //Vouchers
      const voucher_transactions = await transx("voucher_transactions")
        .select("_id", "info", "createdAt", "updatedAt", "year")
        .where({ year: year })
        .andWhere("status", "IN", ["completed", "refunded"])
        .orderBy("updatedAt", "desc");

      const transaction = voucher_transactions.map(({ info, ...rest }) => {
        const d = info ? JSON.parse(info) : {};
        return {
          ...rest,
          info: d,
          amount: d?.amount,
        };
      });

      const prepaid_transactions = await transx("prepaid_transactions")
        .where({ year: year })
        .andWhere("status", "IN", ["completed", "refunded"])
        .select("_id", "info", "status", "year", "createdAt", "updatedAt")
        .orderBy("updatedAt", "desc");

      const ecgTransaction = prepaid_transactions.map((transaction) => {
        return {
          _id: transaction?._id,
          status: transaction?.status,
          createdAt: transaction?.createdAt,
          updatedAt: transaction?.updatedAt,
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
        "updatedAt",
        "desc"
      );

      //Get ECG Total Amount
      const ecgTotal = _.sum(
        _.map(ecgTransaction, (item) => Number(item?.info?.amount))
      );

      //Get Voucher & Ticket Total Amount
      const voucherTotal = _.sum(
        _.map(transaction, (item) => Number(item?.amount))
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
      const sevenDays = getLastSevenDaysTransactions(
        transaction,
        ecgTransaction
      );
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

      if (isAdmin) {
        logs = await transx("activity_logs_view")
          .select("*")
          .limit(3)
          .orderBy("createdAt", "desc");
      } else {
        logs = await transx("activity_logs_view")
          .where({ employeeId: id })
          .select("title", "createdAt", "updatedAt")
          .limit(3)
          .orderBy("createdAt", "desc");
      }

      await transx.commit();

      const data = {
        totalSales: grandTotal,
        totalCount: count,
        recents,
        today,
        sevenDays,
        transactionByMonth,
        logs,
      };

      res.status(200).json(data);
    } catch (error) {
      await transx.rollback();
    }
  })
);

router.get(
  "/products",
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const transx = await knex.transaction();
    try {
      const categories = await transx("categories")
        .select("*")
        .where("active", 1);
      const vouchers = await transx("vouchers").select("category", "status");

      const voucher_transactions = await transx("voucher_transactions")
        .select("*")
        .where("status", "IN", ["completed", "refunded"])
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

      const ticketPins = vouchers.filter((tic) =>
        ticket.includes(tic?.category)
      );

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

      await transx.commit();
      const data = {
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
          total: currencyFormatter(
            voucherYesterday ?? 0 + ticketYesterday ?? 0
          ),
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
      };

      res.status(200).json(data);
    } catch (error) {
      await transx.rollback();
      return res
        .status(500)
        .json("An unknown error has occurred.Try again later.");
    }
  })
);

//ELECTRICTY
router.get(
  "/electricity",
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const transx = await knex.transaction();

    try {
      const meters = await transx("meters").select("*").count({ count: "*" });

      const prepaid_transactions = await transx("prepaid_transactions")
        .where({ year: moment().year() })
        .andWhere("status", "IN", ["completed", "refunded"])
        .select(
          "_id",
          "info",
          "status",
          "processed",
          "year",
          "createdAt",
          "updatedAt"
        )
        .orderBy("updatedAt", "desc");

      const transaction = prepaid_transactions.map((transaction) => {
        return {
          _id: transaction?._id,
          status: transaction?.status,
          isProcessed: transaction?.processed,
          createdAt: transaction?.updatedAt,
          updatedAt: transaction?.updatedAt,
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

      await transx.commit();

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
          groupedTransactions["1"]?.length ?? 0,
        ],
        topCustomers,
        meters: meters[0].count,
      });
    } catch (error) {
      await transx.rollback();
      return res
        .status(500)
        .json("An unknown error has occurred.Try again later.");
    }
  })
);

router.get(
  "/airtime",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const agent_airtime_transactions = await knex("agent_transactions")
      .where({ year: moment().year(), type: "airtime" })
      .andWhere("status", "IN", ["completed", "refunded"])
      .select(
        "_id",
        "totalAmount as amount",
        "recipient as phonenumber",
        knex.raw("'Airtime' as domain"),
        knex.raw("'Agent' as issuer"),
        "status",
        "year",
        "createdAt",
        "updatedAt"
      )
      .orderBy("createdAt", "desc");

    const airtime_transactions = await knex("airtime_transactions")
      .where({ year: moment().year() })
      .andWhere("status", "IN", ["completed", "refunded"])
      .select(
        "_id",
        "amount",
        "phonenumber",
        "domain",
        "info",
        "status",
        "issuer",
        "year",
        "createdAt",
        "updatedAt"
      )
      .orderBy("createdAt", "desc");

    const transaction = [
      ...airtime_transactions,
      ...agent_airtime_transactions,
    ].map(({ info, ...rest }) => {
      return {
        ...rest,
        info: _.isUndefined(info) ? {} : JSON.parse(info),
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
    const transx = await knex.transaction();

    const agent_bundle_transactions = await transx("agent_transactions")
      .where({ year: moment().year(), type: "bundle" })
      .andWhere("status", "IN", ["completed", "refunded"])
      .select(
        "_id",
        "totalAmount as amount",
        "recipient as phonenumber",
        knex.raw("'Bundle' as domain"),
        knex.raw("'Agent' as issuer"),
        "status",
        "year",
        "createdAt",
        "updatedAt"
      )
      .orderBy("createdAt", "desc");

    const bundle_transactions = await transx("bundle_transactions")
      .where({ year: moment().year() })
      .andWhere("status", "IN", ["completed", "refunded"])
      .select(
        "_id",
        "amount",
        "phonenumber",
        "domain",
        "info",
        "status",
        "year",
        "createdAt",
        "updatedAt"
      )
      .orderBy("createdAt", "desc");

    const transaction = [
      ...bundle_transactions,
      ...agent_bundle_transactions,
    ].map(({ info, ...rest }) => {
      return {
        ...rest,
        info: _.isUndefined(info) ? {} : JSON.parse(info),
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

    await transx.commit();

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
    const { startDate, endDate } = req.query;

    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    const voucher_transactions = await knex.raw(
      `SELECT *
      FROM (
          SELECT _id,user,email,phonenumber,info,createdAt,year,active,status,DATE(createdAt) AS purchaseDate
          FROM voucher_transactions
      ) AS voucher_transactions_ 
      WHERE user=? AND active=1 and (status IN ('completed','pending','refunded')) AND purchaseDate BETWEEN ? AND ?;`,
      [id, sDate, eDate]
    );
    // console.log(voucher_transactions)

    const transactions = voucher_transactions[0]?.map(({ info, ...rest }) => {
      const d = info ? JSON.parse(info) : { amount: 0 };
      return {
        ...rest,
        info: d,
        amount: d?.amount,
      };
    });

    const modifiedTransaction = transactions.map(async (transaction) => {
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
          transaction?.amount ||
          transaction?.info?.paymentDetails?.totalAmount,
        createdAt: transaction?.createdAt,
        updatedAt: transaction?.updatedAt,
        status: transaction?.status,
      };
    });

    const vouchers = await Promise.all(modifiedTransaction);

    const prepaid_transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT *,DATE(createdAt) AS purchaseDate
            FROM meter_prepaid_transaction_view
        ) AS meter_prepaid_transaction_view_ 
        WHERE user=? AND active=1 AND (status IN ('completed','pending','refunded')) AND purchaseDate BETWEEN ? AND ?;`,
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
          topup: transaction?.topup,
          charges: transaction?.charges,
          amount: transaction?.amount,
          createdAt: transaction?.createdAt,
          updatedAt: transaction?.updatedAt,
          status: Boolean(transaction?.processed)
            ? transaction?.status
            : "pending",
        };
      }
    );

    //Airtime

    const airtime_transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,user,type as kind,recipient,amount,domain,domain as type,email,phonenumber,status,isProcessed,createdAt,active,DATE(createdAt) AS purchaseDate
            FROM airtime_transactions
        ) AS airtime_transactions_ 
        WHERE user=? AND active=1 and (status IN ('completed','pending','refunded')) AND purchaseDate BETWEEN ? AND ?;`,
      [id, sDate, eDate]
    );

    //Bundle

    const bundle_transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,user,bundle_name as kind,bundle_volume as volume,recipient,amount,domain,domain as type,email,phonenumber,status,isProcessed,createdAt,active,DATE(createdAt) AS purchaseDate
            FROM bundle_transactions
        ) AS bundle_transactions_ 
        WHERE user=? AND active=1 and (status IN ('completed','pending','refunded')) AND purchaseDate BETWEEN ? AND ?;`,
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
          "updatedAt",
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

    let transaction = {};

    const transx = await knex.transaction();

    try {
      if (type === "Voucher" || type === "Ticket") {
        transaction = await transx("voucher_transactions")
          .select("reference")
          .where("reference", clientReference)
          .limit(1)
          .first();
      }

      if (type === "Prepaid") {
        transaction = await transx("prepaid_transactions")
          .select("reference")
          .where("reference", clientReference)
          .limit(1)
          .first();
      }

      await transx.commit();

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
    } catch (error) {
      await transx.rollback();
      return res
        .status(500)
        .json("An unknown error has occurred.Try again later.");
    }
  })
);

// GET All Logs
router.get(
  "/logs",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id, isAdmin } = req.user;
    const { startDate, endDate } = req.query;

    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    let logs = [];

    if (isAdmin) {
      logs = await knex.raw(
        `SELECT *
          FROM (
              SELECT *,DATE(createdAt) AS created_date
              FROM activity_logs_view
          ) AS activity_logs_view_ WHERE created_date BETWEEN ? AND ? ORDER BY createdAt DESC;`,
        [sDate, eDate]
      );
    } else {
      logs = await knex.raw(
        `SELECT *
          FROM (
              SELECT *,DATE(createdAt) AS created_date
              FROM activity_logs_view
          ) AS activity_logs_view_  WHERE employeeId=? AND isActive=1 AND created_date BETWEEN ? AND ? ORDER BY createdAt DESC;`,
        [id, sDate, eDate]
      );
    }

    return res.status(200).json(logs[0]);
  })
);

router.get(
  "/general",
  limit,
  asyncHandler(async (req, res) => {
    const { mobileNo, id } = req.query;

    if (!isValidUUID2(id) || !mobileNo) {
      return res.status(400).json("No results match your search");
    }

    const intMobileNo = getInternationalMobileFormat(mobileNo);

    const transx = await knex.transaction();

    try {
      const voucherTransaction = await transx("voucher_transactions")
        .select(
          "_id",
          "externalTransactionId",
          "phonenumber",
          "mode",
          "info",
          "createdAt",
          "status"
        )
        .where({ _id: id })
        .orWhere({ externalTransactionId: id })
        .whereIn("phonenumber", [mobileNo, intMobileNo])
        .limit(1);

      const prepaidTransaction = await transx("prepaid_transactions")
        .select(
          "_id",
          "externalTransactionId",
          "mobileNo as phonenumber",
          "mode",
          "info",
          "amount",
          "createdAt",
          "status"
        )
        .where({ _id: id })
        .orWhere({ externalTransactionId: id })
        .whereIn("mobileNo", [mobileNo, intMobileNo])
        .limit(1);

      const airtimeTransaction = await transx("airtime_transactions")
        .select(
          "_id",
          "externalTransactionId",
          "phonenumber",
          "mode",
          "info",
          "amount",
          "createdAt",
          "status"
        )
        .where({ _id: id })
        .orWhere({ externalTransactionId: id })
        .whereIn("phonenumber", [mobileNo, intMobileNo])
        .limit(1);

      const transaction = [
        ...voucherTransaction,
        ...airtimeTransaction,
        ...prepaidTransaction,
      ];

      if (_.isEmpty(transaction)) {
        return res.status(400).json("No results match your search!");
      }
      const { info, ...rest } = transaction[0];
      const details = JSON.parse(info);

      await transx.commit();
      res.status(200).json({
        ...rest,
        amount: rest?.amount || details?.amount,
        downloadLink: details?.downloadLink,
        domain: details?.domain,
      });
    } catch (error) {
      await transx.rollback();
      return res
        .status(500)
        .json("An unknown error has occurred.Try again later.");
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
      .where({ _id: transactionId })
      .orWhere({ externalTransactionId: transactionId })
      .andWhere("status", "IN", ["completed", "refunded"])
      .limit(1);

    if (
      _.isEmpty(transaction) ||
      transaction[0]?.status !== "completed" ||
      mobileNo !== transaction[0]?.phonenumber
    ) {
      return res.status(400).json("No results match your search!");
    }
    const { reference, partner, user, info, ...rest } = transaction[0];

    res.status(200).json({
      ...rest,
      info: JSON.parse(info),
      vouchers: "",
    });
  })
);

router.get(
  "/refund/:id",
  limit,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { category } = req.query;

    const transx = await knex.transaction();
    if (!isValidUUID2(id) || !category) {
      return res.status(400).json("No results match your search");
    }
    let transaction = {};
    switch (category) {
      case "voucher":
      case "ticket":
        const voucher_transaction = await transx("voucher_transactions")
          .select(
            "_id",
            "info",
            "mode",
            "email",
            "phonenumber",
            "reference",
            "createdAt",
            "updatedAt",
            "status",
            "user",
            knex.raw("DATE_FORMAT(updatedAt,'%D %M,%Y %r') as modifiedAt")
          )
          .where({ _id: id })
          .limit(1)
          .first();

        if (_.isEmpty(voucher_transaction))
          return res.status(400).json("No results match your search!");

        const info = JSON?.parse(voucher_transaction?.info);
        transaction = {
          ...voucher_transaction,
          amount: info?.amount,
        };
        break;

      case "airtime":
        agent_airtime_transaction = await transx("agent_transactions")
          .select(
            "_id",
            "info",
            knex.raw(`'Wallet' as mode`),
            knex.raw(`true as isAgent`),
            "reference",
            "totalAmount as amount",
            "createdAt",
            "updatedAt",
            "status",
            "agent_id as user"
          )
          .where({ _id: id, type: "airtime" })

          .limit(1)
          .first();

        airtime_transaction = await transx("airtime_transactions")
          .select(
            "_id",
            "info",
            "mode",
            "email",
            "phonenumber",
            "reference",
            "amount",
            "createdAt",
            "updatedAt",
            "status",
            "user"
          )
          .where({ _id: id })
          .limit(1)
          .first();

        if (
          _.isEmpty(_.compact([airtime_transaction, agent_airtime_transaction]))
        )
          return res.status(400).json("No results match your search!");

        if (!_.isEmpty(agent_airtime_transaction)) {
          const agentDetails = await knex("agents")
            .select("email", "phonenumber")
            .where({ _id: agent_airtime_transaction?.user })
            .first();

          transaction = {
            ...agent_airtime_transaction,
            email: agentDetails?.email,
            phonenumber: agentDetails?.phonenumber,
          };
        } else {
          transaction = {
            ...airtime_transaction,
            info: _.isUndefined(airtime_transaction?.info)
              ? {}
              : JSON.parse(airtime_transaction?.info),
          };
        }

        break;

      case "bundle":
        agent_bundle_transaction = await transx("agent_transactions")
          .select(
            "_id",
            "info",
            knex.raw(`'Wallet' as mode`),
            knex.raw(`true as isAgent`),
            "reference",
            "totalAmount as amount",
            "createdAt",
            "updatedAt",
            "status",
            "agent_id as user"
          )
          .where({ _id: id, type: "bundle" })

          .limit(1)
          .first();
        bundle_transaction = await transx("bundle_transactions")
          .select(
            "_id",
            "reference",
            "email",
            "phonenumber",
            "info",
            "mode",
            "amount",
            "status",
            "user",
            "createdAt",
            "updatedAt"
          )
          .where({ _id: id })
          .limit(1)
          .first();

        if (
          _.isEmpty(_.compact([bundle_transaction, agent_bundle_transaction]))
        )
          return res.status(400).json("No results match your search!");

        if (!_.isEmpty(agent_bundle_transaction)) {
          const agentDetails = await knex("agents")
            .select("email", "phonenumber")
            .where({ _id: agent_bundle_transaction?.user })
            .first();

          transaction = {
            ...agent_bundle_transaction,
            email: agentDetails?.email,
            phonenumber: agentDetails?.phonenumber,
          };
        } else {
          transaction = {
            ...bundle_transaction,
            info: _.isUndefined(bundle_transaction?.info)
              ? {}
              : JSON.parse(bundle_transaction?.info),
          };
        }
        break;
      case "prepaid":
        const prepaid_transaction = await transx("prepaid_transactions")
          .join("meters", "prepaid_transactions.meter", "=", "meters._id")
          .select(
            "prepaid_transactions._id as _id",
            "prepaid_transactions.reference as reference",
            "prepaid_transactions.info as info",
            "prepaid_transactions.email as email",
            "prepaid_transactions.mobileNo as phonenumber",
            "prepaid_transactions.mode as mode",
            "prepaid_transactions.amount as amount",
            "prepaid_transactions.status as status",
            "prepaid_transactions.user as user",
            "prepaid_transactions.createdAt as createdAt",
            "prepaid_transactions.updatedAt as updatedAt"
          )
          .where({ "prepaid_transactions._id": id })
          .limit(1)
          .first();

        if (_.isEmpty(prepaid_transaction))
          return res.status(400).json("No results match your search!");

        transaction = prepaid_transaction;

        break;

      default:
        transaction = {};
    }

    await transx.commit();
    if (_.isEmpty(transaction)) {
      return res.status(400).json("No results match your search!");
    }
    res.status(200).json({
      ...transaction,
    });
  })
);

router.post(
  "/refund",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: ISSUER_ID, name } = req.user;
    const { id, category, amount, mode, phonenumber, email, user, isAgent } =
      req.body;

    const phoneInfo = getPhoneNumberInfo(phonenumber);
    const transaction_reference = randomBytes(24).toString("hex");

    if (mode === "Wallet") {
      const tranx = await knex.transaction();

      try {
        let user_balance = {};
        let user_credit = {};

        if (Boolean(isAgent)) {
          user_balance = await tranx("agent_wallets")
            .where("agent_id", user)
            .select("amount")
            .limit(1)
            .first();

          user_credit = await tranx("agent_wallets")
            .where("agent_id", user)
            .increment({
              amount: amount,
            });
        } else {
          user_balance = await tranx("user_wallets")
            .where("user_id", user)
            .select("amount")
            .limit(1)
            .first();

          user_credit = await tranx("user_wallets")
            .where("user_id", user)
            .increment({
              amount: amount,
            });
        }

        const status = user_credit === 1 ? "refunded" : "completed";

        if (category === "prepaid") {
          await tranx("prepaid_transactions").where("_id", id).update({
            status,
            refunder: name,
          });
        }

        if (category === "voucher" || category === "ticket") {
          await tranx("voucher_transactions").where("_id", id).update({
            status,
            refunder: name,
          });
        }

        if (category === "airtime") {
          if (Boolean(isAgent)) {
            await tranx("agent_transactions").where("_id", id).update({
              status,
              refunder: name,
            });
          } else {
            await tranx("airtime_transactions").where("_id", id).update({
              status,
              refunder: name,
            });
          }
        }

        if (category === "bundle") {
          if (Boolean(isAgent)) {
            await tranx("agent_transactions").where("_id", id).update({
              status,
              refunder: name,
            });
          } else {
            await tranx("bundle_transactions").where("_id", id).update({
              status,
              refunder: name,
            });
          }
        }

        if (status === "refunded") {
          await sendSMS(
            `Dear Customer,An amount of ${currencyFormatter(
              amount
            )} has been refunded into to your wallet account for failed ${category} transaction.`,
            phoneInfo.phoneNumber
          );

          if (Boolean(isAgent)) {
            await tranx("agent_notifications").insert({
              _id: generateId(),
              agent_id: user,
              type: "general",
              title: `Failed ${category} Transaction Refund`,
              message: `An amount of ${currencyFormatter(
                amount
              )} has been refunded to your wallet account for failed ${category} transaction.`,
            });
          } else {
            await tranx("user_notifications").insert({
              _id: generateId(),
              user_id: user,
              type: "general",
              title: `Failed ${category} Transaction Refund`,
              message: `An amount of ${currencyFormatter(
                amount
              )} has been refunded to your wallet account for failed ${category} transaction.`,
            });
          }
        }

        if (Boolean(isAgent)) {
          await tranx("agent_wallet_transactions").insert({
            _id: generateId(),
            agent_id: user,
            issuer: ISSUER_ID,
            type: "refund",
            wallet: Number(user_balance?.amount),
            amount,
            comment: `Wallet money refund for failed ${category} transaction`,
            attachment: null,
            status: "completed",
          });
        } else {
          await tranx("user_wallet_transactions").insert({
            _id: generateId(),
            user_id: user,
            issuer: ISSUER_ID,
            type: "refund",
            wallet: Number(user_balance?.amount),
            amount,
            comment: `Wallet money refund for failed ${category} transaction`,
            attachment: null,
            status: "completed",
          });
        }

        await tranx.commit();
        return res.status(200).json("Money has been refunded successfully");
      } catch (error) {
        await tranx.rollback();
        console.log(error);
        return res
          .status(500)
          .json("An error has occurred.Could not refund money!");
      }
    }

    const tranx = await knex.transaction();
    try {
      const payment = {
        transactionId: id,
        category,
        phonenumber: phoneInfo.phoneNumber,
        email,
        amount: Number(amount).toFixed(2),
        provider:
          phoneInfo.providerName === "MTN"
            ? "mtn-gh"
            : phoneInfo.providerName === "Vodafone"
            ? "vodafone-gh"
            : phoneInfo.providerName === "AirtelTigo"
            ? "tigo-gh"
            : "",
        transaction_reference,
        refunder: ISSUER_ID,
      };

      const { ResponseCode, Data } = await sendMoneyToCustomer(payment);

      const status =
        ResponseCode === "0000"
          ? "completed"
          : ResponseCode === "0001"
          ? "pending"
          : "failed";
      if (["0000", "0001"].includes(ResponseCode)) {
        if (category === "prepaid") {
          await tranx("prepaid_transactions")
            .where("_id", id)
            .update({
              partner: JSON.stringify(Data),
              status,
            });
        }

        if (category === "voucher" || category === "ticket") {
          await tranx("voucher_transactions")
            .where("_id", id)
            .update({
              partner: JSON.stringify(Data),
              status,
            });
        }

        if (category === "airtime") {
          await tranx("airtime_transactions")
            .where("_id", id)
            .update({
              partner: JSON.stringify(Data),
              status,
            });
        }

        if (category === "bundle") {
          await tranx("bundle_transactions")
            .where("_id", id)
            .update({
              partner: JSON.stringify(Data),
              status,
            });
        }
        await tranx.commit();
        return res.status(200).json(Data?.Description);
      } else {
        await tranx.commit();
        return res.status(400).json(Data?.Description);
      }
    } catch (error) {
      console.log(error);
      await tranx.rollback();
      return res
        .status(400)
        .json("An unkonown error has occurred !Try again later.");
    }
  })
);
//@ Payment callback
router.post(
  "/feedback/callback/:category/:id",
  cors(corsOptions),
  limit,
  asyncHandler(async (req, res) => {
    const { uid } = req.query;
    const { id, category } = req.params;

    if (!id || !category) {
      return res.sendStatus(204);
    }
    const { ResponseCode, Data } = req.body;

    const status =
      ResponseCode === "0000"
        ? "refunded"
        : ResponseCode === "0001"
        ? "pending"
        : "completed";

    const tranx = await knex.transaction();
    const employee = await knex("employees")
      .where("_id", uid)
      .select("_id", knex.raw("CONCAT(firstname,' ',lastname) as name"))
      .first();
    let tx = { user: "", phonenumber: "" };
    try {
      if (category === "prepaid") {
        await tranx("prepaid_transactions")
          .where("_id", id)
          .update({
            partner: JSON.stringify(Data),
            status,
            refunder: employee?.name,
          });

        tx = await tranx("prepaid_transactions")
          .where("_id", id)
          .select("mobileNo as phonenumber", "user")
          .limit(1)
          .first();
      }

      if (category === "voucher" || category === "ticket") {
        await tranx("voucher_transactions")
          .where("_id", id)
          .update({
            partner: JSON.stringify(Data),
            status,
            refunder: employee?.name,
          });

        tx = await tranx("voucher_transactions")
          .where("_id", id)
          .select("phonenumber", "user")
          .limit(1)
          .first();
      }

      if (category === "airtime") {
        await tranx("airtime_transactions")
          .where("_id", id)
          .update({
            partner: JSON.stringify(Data),
            status,
            refunder: employee?.name,
          });

        tx = await tranx("airtime_transactions")
          .where("_id", id)
          .select("phonenumber", "user")
          .limit(1)
          .first();
      }

      if (category === "bundle") {
        await tranx("bundle_transactions")
          .where("_id", id)
          .update({
            partner: JSON.stringify(Data),
            status,
            refunder: employee?.name,
          });
        tx = await tranx("bundle_transactions")
          .where("_id", id)
          .select("phonenumber", "user")
          .limit(1)
          .first();
      }

      if (status === "refunded") {
        await tranx("notifications").insert({
          _id: generateId(),
          title: "Money Refund Completed",
          message: Data?.Description,
        });

        await tranx("user_notifications").insert({
          _id: generateId(),
          user_id: tx?.user,
          type: "general",
          title: "Money Refund",
          message: `An amount of ${currencyFormatter(
            Data?.Amount
          )} has been refunded into your mobile money wallet .`,
        });

        await sendSMS(
          `Dear Customer,An amount of ${currencyFormatter(
            Data?.Amount
          )} has been refunded into to your mobile money wallet.`,
          getInternationalMobileFormat(tx?.phonenumber)
        );
      }

      if (status === "pending") {
        await tranx("notifications").insert({
          _id: generateId(),
          title: "Money Refund Pending",
          message: Data?.Description,
        });
      }

      if (status === "completed") {
        await tranx("notifications").insert({
          _id: generateId(),
          title: "Money Refund Failed",
          message: Data?.Description,
        });
      }
      await tranx.commit();
    } catch (error) {
      console.log(error);
      await tranx.rollback();
      return res.sendStatus(204);
    }

    res.sendStatus(204);
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

    const id = generateId();

    const result = await generateTransactionReport(
      template,
      id,
      `${type}-report`
    );
    if (result) {
      const body = ` <div class="container">
  <h1>Transactional Report</h1>
  <p>Dear Customer,</p>
  <p>Attached is your wallet transactional report from the period ${moment(
    startDate
  ).format("lll")} to ${moment(endDate).format(
        "lll"
      )}. Please review the details below:</p>
  <p>If you have any questions or concerns regarding this report, please feel free to contact us.</p>
  <p>Thank you for your business!</p>
  <p>Sincerely,<br>Gab Powerful Consults</p>
  </div>`;

      const downloadLink = await uploadFiles(result, "reports");

      await sendReportMail(
        // 'nicktest701@gmail.com',
        process.env.MAIL_CLIENT_USER,
        mailTextShell(body),
        result,
        "Transaction Report"
      );

      return res.status(200).json(downloadLink);
    }
  })
);

// PUT Remove All Selected Logs
router.put(
  "/logs",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { isAdmin } = req.user;
    const { logs } = req.body;

    if (isAdmin) {
      await knex("activity_logs").where("_id", "IN", logs).del();
    } else {
      await knex("activity_logs").where("_id", "IN", logs).update({
        isActive: false,
      });
    }

    return res.sendStatus(204);
  })
);

router.put(
  "/delete",
  verifyToken,
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

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: "Removed multiple transactions!",
      severity: "error",
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
      .where({
        agentID: id,
        type: "deposit",
      })
      .select(
        "_id",
        "createdAt",
        "type",
        "wallet",
        "amount",
        "status",
        "issuerName"
      )
      .orderBy("createdAt", "desc");

    res.status(200).json(transactions);
  })
);

router.get(
  "/agent/transaction",
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id, isAdmin } = req.user;
    const { sort, startDate, endDate } = req.query;

    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    let modifiedAirtimeTransaction = [];
    let modifiedBundleTransaction = [];

    let transactions = [];
    if (isAdmin) {
      transactions = await knex.raw(
        `SELECT *
        FROM (
            SELECT _id,
agent_id,
reference,
type,
recipient,
provider,
info,
commission,
amount as amt,
totalAmount as amount,
year,
active,
status,
createdAt,
updatedAt ,DATE(createdAt) AS purchaseDate
            FROM agent_transactions
        ) AS agent_transactions_ 
        WHERE purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
        [sDate, eDate]
      );
    } else {
      transactions = await knex.raw(
        `SELECT *
        FROM (
            SELECT _id,
agent_id,
reference,
type,
recipient,
provider,
info,
commission,
amount as amt,
totalAmount as amount,
year,
active,
status,
createdAt,
updatedAt ,DATE(createdAt) AS purchaseDate
            FROM agent_transactions
      ) AS agent_transactions_ 
      WHERE agent_id=? AND purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
        [id, sDate, eDate]
      );
    }
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
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { email, isAdmin } = req.user;
    const { startDate, endDate, transactions, type } = req.body;
    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    const id = generateId();
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
  <p>Hello,</p>
  <p>Attached is your transactional report from the period ${sDate} to ${eDate}. Please review the details below:</p>
  <p>If you have any questions or concerns regarding this report, please feel free to contact us.</p>
  <p>Thank you for your business!</p>
  <p>Sincerely,<br>Gab Powerful Consults</p>
  </div>`;

      const downloadLink = await uploadFiles(result, "reports");
      const selectedEmail = isAdmin ? process.env.MAIL_CLIENT_USER : email;
      await sendReportMail(
        selectedEmail,
        mailTextShell(body),
        result,
        " Transaction Report"
      );

      return res.status(200).json(downloadLink);
    }
  })
);

// @route GET api/agent airtime
router.get(
  "/agent/airtime",
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id, isAdmin } = req.user;
    const { type } = req.query;
    let transactions = [];

    if (isAdmin) {
      transactions = await knex("agent_transactions")
        .select(
          "_id",
          "info",
          "type",
          "recipient as phonenumber",
          "type as domain",
          "commission",
          "totalAmount as amount",
          "createdAt",
          "updatedAt",
          "year"
        )
        .where({ type, status: "completed" })
        .orderBy("createdAt", "desc");
    } else {
      transactions = await knex("agent_transactions")
        .select(
          "_id",
          "info",
          "type",
          "recipient as phonenumber",
          "type as domain",
          "commission",
          "totalAmount as amount",
          "createdAt",
          "updatedAt",
          "year"
        )
        .where({ agent_id: id, type, status: "completed" })
        .orderBy("createdAt", "desc");
    }

    // const transaction = transactions.map(({ info, ...rest }) => {
    //   return {
    //     ...rest,
    //     // info: JSON.parse(info),
    //   };
    // });

    //Get Recent Transactions
    const recent = getRecentTransaction(transactions, 3);
    //Get Today Transactions
    const today = getTodayTransaction(transactions);
    const yesterday = getYesterdayTransaction(transactions);
    const lastSevenDaysData = getLastSevenDaysTransactions([], transactions);

    const lastSevenDaysTotal = _.sum(lastSevenDaysData?.ecg?.data);

    const thisMonth = getThisMonthTransaction(transactions);
    const thisYear = getTransactionsByMonth([], transactions);

    const topCustomers = getTopCustomers(transactions);
    const totalCommission = _.sumBy(transactions, (item) =>
      Number(item?.commission)
    );

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
      commission: totalCommission,
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
        "totalAmount as amount",
        "createdAt",
        "updatedAt",
        "year"
      )
      .where({ agent_id: id, year: year })
      .andWhere("status", "IN", ["completed", "refunded"])
      .orderBy("createdAt", "desc");

    const modifiedTransactions = transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        // info: JSON.parse(info),
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
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id, isAdmin } = req.user;
    const { year, type } = req.query;

    let transactions = [];
    if (isAdmin) {
      transactions = await knex("agent_transactions")
        .select(
          "_id",
          "info",
          "totalAmount AS amount",
          "type",
          "provider",
          "year",
          "status",
          "agent_id",
          "createdAt",
          "updatedAt"
        )
        .where({
          year,
          status: "completed",
        });
    } else {
      transactions = await knex("agent_transactions")
        .select(
          "_id",
          "info",
          "totalAmount AS amount",
          "type",
          "provider",
          "year",
          "status",
          "agent_id",
          "createdAt",
          "updatedAt"
        )
        .where({
          year,
          status: "completed",
          agent_id: id,
        });
    }

    // const modifiedTransactions = transactions.map(({ info, ...rest }) => {
    //   return {
    //     ...rest,
    //     // info: JSON.parse(info),
    //   };
    // });
    const groupedTransactions = _.groupBy(transactions, "type");
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
  "/agents/transactions",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const id = req.query.id;
    const agentsWallets = await knex("agent_transactions")
      .select("*")
      .where("agent_id", id)
      .orderBy("createdAt", "desc");

    return res.status(200).json(agentsWallets);
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
          "DATE_FORMAT(agent_wallets.updatedAt,'%D %M %Y . %r' ) as updatedAt"
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

      const agent_balance = await transaction("agent_wallets")
        .where("agent_id", agent_id)
        .select("amount")
        .limit(1);

      await transaction("agent_wallets").where("agent_id", agent_id).increment({
        amount,
      });

      await transaction("agent_wallet_transactions").insert({
        _id: generateId(),
        agent_id,
        issuer: id,
        type: "deposit",
        wallet: Number(agent_balance[0]?.amount),
        amount,
        comment: comment || "Top Up",
        attachment: url,
        status: "completed",
      });

      await transaction("agent_notifications").insert({
        _id: generateId(),
        agent_id,
        type: "wallet",
        title: "Wallet",
        message: `Your wallet account has been credited with an amount of ${currencyFormatter(
          amount
        )}.`,
      });

      await transaction.commit();

      //logs
      await knex("activity_logs").insert({
        employee_id: id,
        title: "Topped up agent wallet.",
        severity: "info",
      });

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

    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    const transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT *,DATE(createdAt) AS purchaseDate
            FROM agent_wallet_transactions_view
        ) AS agent_wallet_transactions_view_  WHERE purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
      [sDate, eDate]
    );

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
      const id = generateId();

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
  "/users/transactions",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.query;

    const sDate = moment().format("YYYY-MM-DD");
    const eDate = moment(new Date()).format("YYYY-MM-DD");

    const voucher_transactions = await knex.raw(
      `SELECT *
      FROM (
          SELECT _id,user,email,phonenumber,info,createdAt,year,active,status,DATE(createdAt) AS purchaseDate
          FROM voucher_transactions
      ) AS voucher_transactions_ 
      WHERE user=? AND active=1 and (status IN ('completed','pending','refunded')) AND purchaseDate BETWEEN ? AND ?;`,
      [id, sDate, eDate]
    );
    // console.log(voucher_transactions)

    const transactions = voucher_transactions[0]?.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: info ? JSON.parse(info) : {},
      };
    });

    const modifiedTransaction = transactions.map(async (transaction) => {
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
        updatedAt: transaction?.updatedAt,
        status: transaction?.status,
      };
    });

    const vouchers = await Promise.all(modifiedTransaction);

    const prepaid_transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT *,DATE(createdAt) AS purchaseDate
            FROM meter_prepaid_transaction_view
        ) AS meter_prepaid_transaction_view_ 
        WHERE user=? AND active=1 AND (status IN ('completed','pending','refunded')) AND purchaseDate BETWEEN ? AND ?;`,
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
          topup: transaction?.topup,
          charges: transaction?.charges,
          amount: transaction?.amount,
          createdAt: transaction?.createdAt,
          updatedAt: transaction?.updatedAt,
          status: Boolean(transaction?.processed)
            ? transaction?.status
            : "pending",
        };
      }
    );

    //Airtime

    const airtime_transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,user,type as kind,recipient,amount,domain,domain as type,email,phonenumber,status,isProcessed,createdAt,active,DATE(createdAt) AS purchaseDate
            FROM airtime_transactions
        ) AS airtime_transactions_ 
        WHERE user=? AND active=1 and (status IN ('completed','pending','refunded')) AND purchaseDate BETWEEN ? AND ?;`,
      [id, sDate, eDate]
    );

    //Bundle

    const bundle_transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,user,bundle_name as kind,bundle_volume as volume,recipient,amount,domain,domain as type,email,phonenumber,status,isProcessed,createdAt,active,DATE(createdAt) AS purchaseDate
            FROM bundle_transactions
        ) AS bundle_transactions_ 
        WHERE user=? AND active=1 and (status IN ('completed','pending','refunded')) AND purchaseDate BETWEEN ? AND ?;`,
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
          "updatedAt",
          "desc"
        )
      );
  })
);

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
          "DATE_FORMAT(user_wallets.updatedAt,'%D %M %Y . %r' ) as updatedAt"
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
        const user_balance = await transaction("user_wallets")
          .where("user_id", user_id)
          .select("amount")
          .limit(1);

        await transaction("user_wallets").where("user_id", user_id).increment({
          amount,
        });

        await transaction("user_wallet_transactions").insert({
          _id: generateId(),
          user_id,
          issuer: id,
          type: "deposit",
          wallet: Number(user_balance[0]?.amount),
          amount,
          comment: comment || "Top Up",
          attachment: url,
          status: "completed",
        });
      }
      if (type === "agent") {
        const agent_balance = await transaction("agent_wallets")
          .where("agent_id", user_id)
          .select("amount")
          .limit(1);

        await transaction("agent_wallets")
          .where("agent_id", user_id)
          .increment({
            amount,
          });

        await transaction("agent_wallet_transactions").insert({
          _id: generateId(),
          agent_id: user_id,
          issuer: id,
          type: "deposit",
          wallet: Number(agent_balance[0]?.amount),
          amount,
          comment: comment || "Top Up",
          attachment: url,
          status: "completed",
        });
      }

      if (type === "user") {
        await transaction("user_notifications").insert({
          _id: generateId(),
          user_id: user_id,
          type: "wallet",
          title: "Wallet",
          message: `Your wallet account has been credited with an amount of ${currencyFormatter(
            amount
          )}.`,
        });
      }
      if (type === "agent") {
        await transaction("agent_notifications").insert({
          _id: generateId(),
          agent_id: user_id,
          type: "wallet",
          title: "Wallet",
          message: `Your wallet account has been credited with an amount of ${currencyFormatter(
            amount
          )}.`,
        });
      }
      await transaction.commit();

      //logs
      await knex("activity_logs").insert({
        employee_id: id,
        title: `Topped up ${type} wallet.`,
        severity: "info",
      });

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

    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    const transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT *,DATE(createdAt) AS purchaseDate
            FROM user_wallet_transactions_view
        ) AS user_wallet_transactions_view_  WHERE purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
      [sDate, eDate]
    );

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
      const id = generateId();

      const result = await generateTransactionReport(
        walletTemplate,
        id,
        "wallet-report"
      );

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
      .where({
        userID: id,
        type: "deposit",
      })
      .select(
        "_id",
        "createdAt",
        "type",
        "wallet",
        "amount",
        "status",
        "issuerName"
      )
      .orderBy("createdAt", "desc");

    res.status(200).json(transactions);
  })
);

module.exports = router;
