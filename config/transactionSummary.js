const moment = require("moment");
const _ = require("lodash");

const { getDatesOfLastSevenDates } = require("./dateConfigs");

const knex = require("../db/knex");

function getRecentTransaction(data, quantity) {
  const orderedData = _.orderBy(data, "updatedAt", "desc");

  //GET Recent Transactions
  const recentTransaction = _.map(_.take(orderedData, quantity), (item) => {
    return {
      _id: item?._id,
      email: item?.info?.agentEmail || item?.info?.email,
      phonenumber:
        item?.info?.agentPhoneNumber ||
        item?.info?.mobileNo ||
        item?.phonenumber,
      amount: item?.info?.amount || item?.amount,
      issuer: item?.issuer || "N/A",
      domain: item?.info?.domain || item?.domain,
      createdAt: item?.updatedAt,
      updated: item?.updatedAt,
    };
  });

  return recentTransaction;
}

function getTodayTransactionArray(data) {
  const modifiedTodayTransaction = data?.filter(
    (transaction) =>
      moment(transaction?.updatedAt).format("l") === moment().format("l")
  );

  return modifiedTodayTransaction;
}
function getTodayTransaction(data) {
  const modifiedTodayTransaction = data?.filter(
    (transaction) =>
      moment(transaction?.updatedAt).format("l") === moment().format("l")
  );
  const todayTotal = _.sum(
    _.map(modifiedTodayTransaction, (item) =>
      Number(item?.info?.amount || item?.amount)
    )
  );
  return todayTotal;
}

function getYesterdayTransaction(data) {
  const modifiedTodayTransaction = data?.filter(
    (transaction) =>
      moment(transaction?.updatedAt).format("l") ===
      moment().subtract(1, "days").format("l")
  );

  const todayTotal = _.sum(
    _.map(modifiedTodayTransaction, (item) =>
      Number(item?.info?.amount || item?.amount)
    )
  );
  return todayTotal;
}
function getYesterdayTransactionArray(data) {
  const yesterdayTransaction = data?.filter(
    (transaction) =>
      moment(transaction?.updatedAt).format("l") ===
      moment().subtract(1, "days").format("l")
  );

  return yesterdayTransaction;
}

function getThisMonthTransaction(data) {
  const modifiedTodayTransaction = data?.filter(
    (transaction) =>
      moment(transaction?.updatedAt).format("MMM,YYYY") ===
      moment().format("MMM,YYYY")
  );

  const todayTotal = _.sum(
    _.map(modifiedTodayTransaction, (item) =>
      Number(item?.info?.amount || item?.amount)
    )
  );
  return todayTotal;
}
function getThisMonthTransactionArray(data) {
  const thisMonthTransaction = data?.filter(
    (transaction) =>
      moment(transaction?.updatedAt).format("MMM,YYYY") ===
      moment().format("MMM,YYYY")
  );

  return thisMonthTransaction;
}
function getLastMonthTransactionArray(data) {
  // Assuming you have a date in a string format

  const lastMonthStart = moment().subtract(1, "months").startOf("month");
  const lastMonthEnd = moment().subtract(1, "months").endOf("month");

  const lastMonthTransaction = data?.filter((transaction) =>
    moment(transaction?.updatedAt).isBetween(
      lastMonthStart,
      lastMonthEnd,
      null,
      "[]"
    )
  );

  return lastMonthTransaction;
}
function getThisYearTransactionArray(data) {
  const currentYearStart = moment().startOf("year");
  const currentYearEnd = moment().endOf("year");

  const thisYearTransaction = data?.filter((transaction) =>
    moment(transaction?.updatedAt).isBetween(
      currentYearStart,
      currentYearEnd,
      null,
      "[]"
    )
  );

  return thisYearTransaction;
}
function getLastYearTransactionArray(data) {
  const lastYearStart = moment().subtract(1, "years").startOf("year");
  const lastYearEnd = moment().subtract(1, "years").endOf("year");

  const lastYearTransaction = data?.filter((transaction) =>
    moment(transaction?.updatedAt).isBetween(
      lastYearStart,
      lastYearEnd,
      null,
      "[]"
    )
  );

  return lastYearTransaction;
}

function getLastSevenDaysTransactions(vouchersTransaction, ecgTransaction) {
  let vouchers = [];
  let ecg = [];
  const lastSevenDates = getDatesOfLastSevenDates();
  const initData = lastSevenDates.map((date) => {
    return {
      createdAt: date,
      amount: 0,
    };
  });

  if (vouchersTransaction?.length > 0) {
    const lastSevenDatesTransactions = _.reverse(
      vouchersTransaction?.filter(({ updatedAt }) =>
        lastSevenDates.includes(moment(updatedAt).format("ddd,Do MMM"))
      )
    );

    //Filter out only amount and group transactions by date
    const lastSevenDaysVouchersTransaction = lastSevenDatesTransactions.map(
      (transaction) => {
        return {
          createdAt: moment(transaction?.updatedAt).format("ddd,Do MMM"),
          amount: _.isNaN(
            Number(transaction?.info?.amount || transaction?.amount)
          )
            ? 0
            : Number(transaction?.info?.amount),
        };
      }
    );

    const vouchersLast7 = _.groupBy(
      [...initData, ...lastSevenDaysVouchersTransaction],
      "createdAt"
    );

    vouchers = Object.values(vouchersLast7).map((item) =>
      _.sumBy(item, "amount")
    );
  }

  if (ecgTransaction?.length > 0) {
    const lastSevenDatesECGTransactions = _.reverse(
      ecgTransaction?.filter(({ updatedAt }) =>
        lastSevenDates.includes(moment(updatedAt).format("ddd,Do MMM"))
      )
    );

    const lastSevenDaysECGTransaction = lastSevenDatesECGTransactions.map(
      (transaction) => {
        return {
          createdAt: moment(transaction?.updatedAt).format("ddd,Do MMM"),
          amount: Number(transaction?.info?.amount || transaction?.amount),
        };
      }
    );

    const ecgLast7 = _.groupBy(
      [...initData, ...lastSevenDaysECGTransaction],
      "createdAt"
    );
    ecg = Object.values(ecgLast7).map((item) => _.sumBy(item, "amount"));
  }

  return {
    labels: lastSevenDates,
    voucher: {
      data: vouchers,
    },
    ecg: {
      data: ecg,
    },
  };
}

function getLastSevenDaysTransactionsArray(data) {
  const lastSevenDates = getDatesOfLastSevenDates();

  const lastSevenDatesTransactions = _.reverse(
    data?.filter(({ updatedAt }) =>
      lastSevenDates.includes(moment(updatedAt).format("ddd,Do MMM"))
    )
  );

  return lastSevenDatesTransactions;
}

function getTransactionsByMonth(vouchersTransaction, ecgTransaction) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const initData = [
    { createdAt: "January", amount: 0 },
    { createdAt: "February", amount: 0 },
    { createdAt: "March", amount: 0 },
    { createdAt: "April", amount: 0 },
    { createdAt: "May", amount: 0 },
    { createdAt: "June", amount: 0 },
    { createdAt: "July", amount: 0 },
    { createdAt: "August", amount: 0 },
    { createdAt: "September", amount: 0 },
    { createdAt: "October", amount: 0 },
    { createdAt: "November", amount: 0 },
    { createdAt: "December", amount: 0 },
  ];
  let vouchers = [];
  let ecg = [];

  if (vouchersTransaction?.length > 0) {
    const currentYearTransactions = _.reverse(
      vouchersTransaction?.filter(
        (transaction) =>
          moment(transaction?.updatedAt).year() === moment().year()
      )
    );

    //Modified Date
    const modifiedTransaction = currentYearTransactions?.map((transaction) => {
      return {
        createdAt: moment(transaction?.updatedAt).format("MMMM"),
        amount: _.isNaN(
          Number(transaction?.info?.amount || transaction?.amount)
        )
          ? 0
          : Number(transaction?.info?.amount || transaction?.amount),
      };
    });

    const groupedTransactions = _.groupBy(
      [...initData, ...modifiedTransaction],
      "createdAt"
    );

    vouchers = Object.values(groupedTransactions).map((item) =>
      _.sumBy(item, "amount")
    );
  }

  if (ecgTransaction?.length > 0) {
    const currentYearTransactions = _.reverse(
      ecgTransaction?.filter(
        (transaction) =>
          moment(transaction?.updatedAt).year() === moment().year()
      )
    );

    //Modified Date
    const modifiedTransaction = currentYearTransactions?.map((transaction) => {
      return {
        createdAt: moment(transaction?.updatedAt).format("MMMM"),
        amount: _.isNaN(
          Number(transaction?.info?.amount || transaction?.amount)
        )
          ? 0
          : Number(transaction?.info?.amount || transaction?.amount),
      };
    });

    const groupedTransactions = _.groupBy(
      [...initData, ...modifiedTransaction],
      "createdAt"
    );

    ecg = Object.values(groupedTransactions).map((item) =>
      _.sumBy(item, "amount")
    );
  }

  return {
    labels: months,
    voucher: {
      data: vouchers,
    },
    ecg: {
      data: ecg,
    },
  };
}
function getTransactionsArrayByMonth(data) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const initData = [
    { createdAt: "January", amount: 0 },
    { createdAt: "February", amount: 0 },
    { createdAt: "March", amount: 0 },
    { createdAt: "April", amount: 0 },
    { createdAt: "May", amount: 0 },
    { createdAt: "June", amount: 0 },
    { createdAt: "July", amount: 0 },
    { createdAt: "August", amount: 0 },
    { createdAt: "September", amount: 0 },
    { createdAt: "October", amount: 0 },
    { createdAt: "November", amount: 0 },
    { createdAt: "December", amount: 0 },
  ];
  let items = [];

  if (data?.length > 0) {
    const currentYearTransactions = _.reverse(data);

    //Modified Date
    const modifiedTransaction = currentYearTransactions?.map((transaction) => {
      return {
        createdAt: moment(transaction?.updatedAt).format("MMMM"),
        amount: _.isNaN(
          Number(transaction?.info?.amount || transaction?.amount)
        )
          ? 0
          : Number(transaction?.info?.amount || transaction?.amount),
      };
    });

    const groupedTransactions = _.groupBy(
      [...initData, ...modifiedTransaction],
      "createdAt"
    );

    items = Object.values(groupedTransactions).map((item) =>
      _.sumBy(item, "amount")
    );
  }

  return items;
}

function getTopCustomers(data) {
  //GET Recent Transactions
  const modifiedCustomers = _.map(data, (item) => {
    return {
      _id: item?._id,
      email: item?.info?.agentEmail || item?.info?.email || item?.phonenumber,
      phonenumber:
        item?.info?.agentPhoneNumber ||
        item?.info?.mobileNo ||
        item?.phonenumber,
      amount: Number(item?.info?.amount || item?.amount),
      createdAt: item?.updatedAt,
    };
  });

  const groupedCustomers = _.groupBy(modifiedCustomers, "phonenumber");

  const customers = Object.entries(groupedCustomers).map((customer) => {
    return {
      phonenumber: customer[0],
      amount: _.sumBy(customer[1], "amount"),
    };
  });

  return _.take(_.orderBy(customers, "amount", "desc"), 5);
}

async function getTopSellingProducts(data) {
  //GET Recent Transactions
  const cummulativeVouchers = data.flatMap(({ vouchers }) =>
    JSON.parse(vouchers)
  );

  const vouchers = cummulativeVouchers.map(async (id) => {
    const voucher = await knex("vouchers")
      .join("categories", "vouchers.category", "=", "categories._id")
      .where("vouchers._id", id)
      .select("vouchers._id as _id", "categories.voucherType as voucherType");

    return {
      _id: voucher[0]?._id,
      type: voucher[0]?.voucherType,
    };
  });

  const purchasedVouchers = await Promise.all(vouchers);

  const groupedVouchers = _.groupBy(purchasedVouchers, "type");

  const topVouchers = Object.entries(groupedVouchers).map((voucher) => {
    return {
      type: voucher[0],
      count: voucher[1]?.length,
    };
  });

  return _.orderBy(topVouchers, "count", "desc");
}

function getRangeTransactions(startDate, endDate, data) {

  const sDate = moment(startDate);
  const eDate = moment(endDate);



  const modifiedTransaction = data?.filter(({ createdAt }) => {
    // return moment(updatedAt).isBetween(sDate, eDate, "days", "[]");
    return moment(createdAt).isBetween(sDate, eDate, null, '[]')
  });

  const sortedTransaction = _.orderBy(
    modifiedTransaction,
    ["updatedAt"],
    ["desc"]
  );

  return sortedTransaction;
}

module.exports = {
  getTopCustomers,
  getRecentTransaction,
  getTodayTransaction,
  getYesterdayTransaction,
  getLastSevenDaysTransactions,
  getTransactionsByMonth,
  getThisMonthTransaction,
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
};
