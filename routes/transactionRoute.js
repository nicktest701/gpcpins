const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const _ = require('lodash');
const moment = require('moment');

//model

const currencyFormatter = require('../config/currencyFormatter');
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
} = require('../config/transactionSummary');

const verifyAdmin = require('../middlewares/verifyAdmin');
const { verifyToken } = require('../middlewares/verifyToken');
const { rateLimit } = require('express-rate-limit');

const { isValidUUID2 } = require('../config/validation');

const knex = require('../db/knex');
const { moneyStatus } = require('../config/sendMoney');

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many requests!. please try again later.',
});

router.get(
  '/',
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { sort } = req.query;
    let modifiedTransaction = [];
    let modifiedECGTransaction = [];
    let modifiedAirtimeTransaction = [];

    const airtime_transactions = await knex('airtime_transactions')
      .select(
        '_id',
        'reference',
        'recipient',
        'phonenumber',
        'info',
        'amount',
        'domain',
        'domain as type',
        'status',
        'createdAt'
      )
      .where({
        status: 'completed',
      });

    const airtimeTransactions = airtime_transactions.map(
      ({ info, ...rest }) => {
        return {
          ...rest,
          info: JSON.parse(info),
        };
      }
    );

    const voucher_transactions = await knex('voucher_transactions')
      .select('_id', 'info', 'reference', 'createdAt')
      .where({
        status: 'completed',
      });

    //
    const transactions = voucher_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    // return res.status(200).json(transactions);

    const prepaid_transactions = await knex('prepaid_transactions')
      .join('meters', 'prepaid_transactions.meter', '=', 'meters._id')
      .select(
        'prepaid_transactions._id as _id',
        'prepaid_transactions.reference as reference',
        'prepaid_transactions.info as info',
        'prepaid_transactions.status as status',
        'prepaid_transactions.createdAt as createdAt',
        'meters._id as meterId',
        'meters.number as number'
      )
      .where({
        status: 'completed',
      });

    const ecgTransaction = prepaid_transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        reference: transaction?.reference,
        info: JSON.parse(transaction?.info),
        status: transaction?.status,
        createdAt: transaction?.createdAt,
        meter: {
          _id: transaction?.meterId,
          number: transaction?.number,
        },
      };
    });

    switch (sort) {
      case 'today':
        modifiedTransaction = getTodayTransactionArray(transactions);
        modifiedECGTransaction = getTodayTransactionArray(ecgTransaction);
        modifiedAirtimeTransaction =
          getTodayTransactionArray(airtimeTransactions);

        break;
      case 'yesterday':
        modifiedTransaction = getYesterdayTransactionArray(transactions);
        modifiedECGTransaction = getYesterdayTransactionArray(ecgTransaction);
        modifiedAirtimeTransaction =
          getYesterdayTransactionArray(airtimeTransactions);
        break;

      case 'week':
        modifiedTransaction = getLastSevenDaysTransactionsArray(transactions);
        modifiedECGTransaction =
          getLastSevenDaysTransactionsArray(ecgTransaction);
        modifiedAirtimeTransaction =
          getLastSevenDaysTransactionsArray(airtimeTransactions);

        break;
      case 'month':
        modifiedTransaction = getThisMonthTransactionArray(transactions);
        modifiedECGTransaction = getThisMonthTransactionArray(ecgTransaction);
        modifiedAirtimeTransaction =
          getThisMonthTransactionArray(airtimeTransactions);
        break;
      case 'lmonth':
        modifiedTransaction = getLastMonthTransactionArray(transactions);
        modifiedECGTransaction = getLastMonthTransactionArray(ecgTransaction);
        modifiedAirtimeTransaction =
          getLastMonthTransactionArray(airtimeTransactions);

        break;
      case 'year':
        modifiedTransaction = getThisYearTransactionArray(transactions);
        modifiedECGTransaction = getThisYearTransactionArray(ecgTransaction);
        modifiedAirtimeTransaction =
          getThisYearTransactionArray(airtimeTransactions);
        break;
      case 'lyear':
        modifiedTransaction = getLastYearTransactionArray(transactions);
        modifiedECGTransaction = getLastYearTransactionArray(ecgTransaction);
        modifiedAirtimeTransaction =
          getLastYearTransactionArray(airtimeTransactions);
        break;
      default:
        modifiedTransaction = [...transactions];
        modifiedECGTransaction = [...ecgTransaction];
        modifiedAirtimeTransaction = [...airtimeTransactions];
    }

    const VoucherTransactions = modifiedTransaction.map(async (transaction) => {
      const category = await knex('categories')
        .where('_id', transaction?.info?.categoryId)
        .select('voucherType')
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
        status: 'completed',
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
        status: transaction?.status,
      };
    });

    res
      .status(200)
      .json([...vouchers, ...prepaids, ...modifiedAirtimeTransaction]);
  })
);

router.get(
  '/report',
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const { year, type } = req.query;

    //Airtime
    const airtime_transactions = await knex('airtime_transactions')
      .select('_id', 'info', 'amount', 'createdAt', 'year')
      .where({
        year: year,
        status: 'completed',
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
    const voucher_transactions = await knex('voucher_transactions')
      .select('_id', 'info', 'createdAt', 'year')
      .where({
        year: year,
        status: 'completed',
      });

    const modifiedVoucherTransaction = voucher_transactions.map(
      ({ info, ...rest }) => {
        return {
          ...rest,
          info: JSON.parse(info),
        };
      }
    );

    const prepaid_transactions = await knex('prepaid_transactions')
      .join('meters', 'prepaid_transactions.meter', '=', 'meters._id')
      .where({
        'prepaid_transactions.year': year,
        status: 'completed',
      })
      .select(
        'prepaid_transactions._id as _id',
        'prepaid_transactions.info as info',
        'prepaid_transactions.status as status',
        'prepaid_transactions.year as year',
        'prepaid_transactions.createdAt as createdAt',
        'meters._id as meterId',
        'meters.number as number'
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
      'info.domain'
    );

    if (type === 'All') {
      const prepaidByMonth = getTransactionsArrayByMonth(
        modifiedECGTransaction
      );
      const airtimeByMonth = getTransactionsArrayByMonth(
        modifiedAirtimeTransaction
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
      });
    }

    if (type === 'Voucher') {
      const voucherByMonth = getTransactionsArrayByMonth(
        groupedVoucherTransactions?.Voucher
      );

      return res.status(200).json({
        report: voucherByMonth,
      });
    }
    if (type === 'Ticket') {
      const ticketByMonth = getTransactionsArrayByMonth(
        groupedVoucherTransactions?.Ticket
      );
      return res.status(200).json({
        report: ticketByMonth,
      });
    }

    if (type === 'Prepaid') {
      const prepaidByMonth = getTransactionsArrayByMonth(
        modifiedECGTransaction
      );
      return res.status(200).json({
        report: prepaidByMonth,
      });
    }
    if (type === 'Airtime') {
      const airtimeByMonth = getTransactionsArrayByMonth(
        modifiedAirtimeTransaction
      );
      return res.status(200).json({
        report: airtimeByMonth,
      });
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
  '/total-sales',
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const year = moment().year();
    //Airtime
    const airtime_transactions = await knex('airtime_transactions')
      .select(
        '_id',
        'info',
        'phonenumber',
        'domain',
        'amount',
        'createdAt',
        'year'
      )
      .where({ year: year, status: 'completed' })
      .orderBy('createdAt', 'desc');

    const airtimeTransaction = airtime_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    //Vouchers
    const voucher_transactions = await knex('voucher_transactions')
      .select('_id', 'info', 'createdAt', 'year')
      .where({ year: year, status: 'completed' })
      .orderBy('createdAt', 'desc');

    const transaction = voucher_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    const prepaid_transactions = await knex('prepaid_transactions')
      .where({ year: year, status: 'completed' })
      .select('_id', 'info', 'status', 'year', 'createdAt')
      .orderBy('createdAt', 'desc');

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

    const count = {
      labels: ['Vouchers & Tickets', 'Prepaid Units', 'Airtime Transfer'],
      data: [voucherCount, ecgCount, airtimeCount],
    };

    const recents = _.orderBy(
      [
        ...getRecentTransaction(transaction, 3),
        ...getRecentTransaction(ecgTransaction, 3),
        ...getRecentTransaction(airtimeTransaction, 3),
      ],
      'createdAt',
      'desc'
    );

    //Get ECG Total Amount
    const ecgTotal = _.sum(
      _.map(ecgTransaction, (item) => Number(item?.info?.amount))
    );

    //Get Voucher & Ticket Total Amount
    const voucherTotal = _.sum(
      _.map(transaction, (item) => Number(item?.info?.amount))
    );

    //Get Voucher & Ticket Total Amount
    const airtimeTotal = _.sum(
      _.map(airtimeTransaction, (item) => Number(item?.amount))
    );

    const grandTotal = {
      ecg: ecgTotal,
      voucher: voucherTotal,
      airtime: airtimeTotal,
      total: Number(ecgTotal + voucherTotal + airtimeTotal),
    };

    //GET Total Sales today

    const today = {
      voucher: getTodayTransaction(transaction),
      ecg: getTodayTransaction(ecgTransaction),
      airtime: getTodayTransaction(airtimeTransaction),
    };

    //GROUP transactions by Week
    const sevenDays = getLastSevenDaysTransactions(transaction, ecgTransaction);
    const airtimeSevenDays = getLastSevenDaysTransactions(
      [],
      airtimeTransaction
    );
    sevenDays.airtime = airtimeSevenDays.ecg;

    //GROUP transactions by month
    const transactionByMonth = getTransactionsByMonth(
      transaction,
      ecgTransaction
    );
    const airtimeByMonth = getTransactionsByMonth([], airtimeTransaction);
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
  '/products',
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const categories = await knex('categories').select('*').where('active', 1);
    const vouchers = await knex('vouchers').select('category', 'status');

    const voucher_transactions = await knex('voucher_transactions')
      .select('*')
      .where('status', 'completed')
      .orderBy('createdAt', 'desc');

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
      if (['bus', 'cinema', 'stadium'].includes(category.category)) {
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
    const groupedVouchers = _.groupBy(voucherPins, 'status');
    const groupedTickets = _.groupBy(ticketPins, 'status');

    const voucherTransactions = _.filter(
      transactions,
      (transaction) => transaction?.info?.domain === 'Voucher'
    );
    const ticketTransactions = _.filter(
      transactions,
      (transaction) => transaction?.info?.domain === 'Ticket'
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
          groupedVouchers['new']?.length ?? 0,
          groupedVouchers['sold']?.length ?? 0,
        ],
        ticket: [
          groupedTickets['new']?.length ?? 0,
          groupedTickets['sold']?.length ?? 0,
          groupedTickets['used']?.length ?? 0,
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
  '/electricity',
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const prepaid_transactions = await knex('prepaid_transactions')
      .where({ year: moment().year(), status: 'completed' })
      .select('_id', 'info', 'status', 'processed', 'year', 'createdAt')
      .orderBy('createdAt', 'desc');

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

    const groupedTransactions = _.groupBy(transaction, 'isProcessed');

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
        groupedTransactions['0']?.length ?? 0,
        groupedTransactions['1']?.length ?? 0,
      ],
      topCustomers,
    });
  })
);

router.get(
  '/airtime',
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const airtime_transactions = await knex('airtime_transactions')
      .where({ year: moment().year(), status: 'completed' })
      .select(
        '_id',
        'amount',
        'phonenumber',
        'domain',
        'info',
        'status',
        'year',
        'createdAt'
      )
      .orderBy('createdAt', 'desc');

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
  '/email',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { email, mobileNo } = req.query;

    if (!email || !mobileNo) {
      return res.status(401).json('Inavalid Request!');
    }

    const voucher_transactions = await knex('voucher_transactions')
      .select('_id', 'info', 'createdAt', 'year', 'active')
      .where({
        email,
        phonenumber: mobileNo,
        active: 1,
        status: 'completed',
      })
      .orderBy('createdAt', 'desc');

    const transactions = voucher_transactions.map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    const modifiedTransaction = transactions.map(async (transaction) => {
      const category = await knex('categories')
        .select('voucherType')
        .where('_id', transaction?.info?.categoryId)
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
        status: 'completed',
      };
    });

    const vouchers = await Promise.all(modifiedTransaction);

    const prepaid_transactions = await knex('prepaid_transactions')
      .join('meters', 'prepaid_transactions.meter', '=', 'meters._id')
      .where({
        'prepaid_transactions.email': email,
        'prepaid_transactions.mobileNo': mobileNo,
        'prepaid_transactions.active': 1,
        'prepaid_transactions.status': 'completed',
      })
      .select(
        'prepaid_transactions._id as _id',
        'prepaid_transactions.info as info',
        'prepaid_transactions.processed as processed',
        'prepaid_transactions.createdAt as createdAt',
        'meters._id as meterId',
        'meters.number as number'
      );

    const modifiedECGTransaction = prepaid_transactions.map((transaction) => {
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
        status: Boolean(transaction?.processed) ? 'compeleted' : 'pending',
      };
    });

    //Airtime

    const airtime_transactions = await knex('airtime_transactions')
      .where({
        phonenumber: mobileNo,
        active: 1,
        status: 'completed',
      })
      .select(
        '_id',
        'type as kind',
        'recipient',
        'phonenumber',
        'amount',
        'domain',
        'domain as type',
        'status',
        'isProcessed',
        'createdAt'
      );

    res
      .status(200)
      .json([...vouchers, ...modifiedECGTransaction, ...airtime_transactions]);
  })
);

router.get(
  '/status',
  // limit,
  // verifyToken,
  // verifyAdmin,
  asyncHandler(async (req, res) => {
    const { clientReference, type } = req.query;

    if (!clientReference || !type) {
      return res.status(400).json('Invalid Reference ID');
    }

    let transaction = [];

    if (type === 'Voucher' || type === 'Ticket') {
      transaction = await knex('voucher_transactions')
        .select('reference')
        .where('reference', clientReference)
        .limit(1);
    }

    if (type === 'Prepaid') {
      transaction = await knex('prepaid_transactions')
        .select('reference')
        .where('reference', clientReference)
        .limit(1);
    }

    //if creating new transaction fails
    if (_.isEmpty(transaction)) {
      return res
        .status(403)
        .json('We could not find a transaction which match your ID!');
    }
    try {
      const response = await moneyStatus(clientReference);
      return res.status(200).json(response.data);
    } catch (error) {
      return res
        .status(500)
        .json('Could not check transaction status.Try again later');
    }
  })
);
router.get(
  '/:transactionId',
  limit,
  asyncHandler(async (req, res) => {
    const transactionId = req.params.transactionId;
    const { mobileNo } = req.query;

    if (!isValidUUID2(transactionId) || !mobileNo) {
      return res.status(400).json('No results match your search');
    }

    const transaction = await knex('voucher_transactions')
      .select('*')
      .where({ _id: transactionId, status: 'completed' })
      .limit(1);

    if (
      _.isEmpty(transaction) ||
      transaction[0]?.status !== 'completed' ||
      mobileNo !== transaction[0]?.phonenumber
    ) {
      return res.status(400).json('No results match your search!');
    }

    res.status(200).json({
      ...transaction[0],
      info: JSON.parse(transaction[0].info),
      vouchers: '',
    });
  })
);

router.put(
  '/delete',
  // verifyToken,
  asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (_.isEmpty(ids)) {
      return res.status(400).json('Invalid Request');
    }

    await knex('voucher_transactions').where('_id', 'IN', ids).update({
      active: 0,
    });
    await knex('prepaid_transactions').where('_id', 'IN', ids).update({
      active: 0,
    });
    await knex('airtime_transactions').where('_id', 'IN', ids).update({
      active: 0,
    });

    res.sendStatus(204);
  })
);

module.exports = router;
