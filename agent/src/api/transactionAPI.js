import api from "./customAxios";

export const getTransactions = async ({
  date: { startDate, endDate },
  sort,
}) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agent/transaction`,
      params: {
        sort: sort?.toLowerCase(),
        startDate: startDate || new Date("2023-01-01"),
        endDate: endDate || new Date(),
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getTransactionStatus = async (clientReference, type) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/status`,
      params: {
        clientReference,
        type,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const makeTransaction = async (transactionInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/transaction`,
      data: transactionInfo,
      timeout: 15000,
      timeoutErrorMessage: "Error connecting to the server",
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getTransactionReport = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/transaction/agent/transactions/report`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

//Transactions
export const getTotalSales = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agent/total-sales`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getProductsTransaction = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/products`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getElectricityTransaction = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/electricity`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getAirtimeANDBundleTransaction = async (type) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agent/airtime?type=${type}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getReportTransaction = async (year, type) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agent/report`,
      params: {
        year,
        type,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

// export const getTransaction = async () => {
//   try {
//     const res = await api({
//       method: 'GET',
//       url: `/transaction`,
//       timeout: 10000,
//       timeoutErrorMessage: 'Error connecting to the server',
//     });

//     return res.data;
//   } catch (error) {
//     throw error.response.data;
//   }
// };

export const getTransactionById = async (id, mobileNo) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/${id}`,
      params: {
        mobileNo,
      },
      timeout: 10000,
      timeoutErrorMessage: "Error connecting to the server",
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const verifyTransaction = async (id, ticket) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/verify`,
      params: {
        id,
        ticket,
      },
      timeout: 10000,
      timeoutErrorMessage: "Error connecting to the server",
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const sendVoucherMail = async (id) => {
  try {
    const res = await api({
      method: "POST",
      url: `/transaction/send-mail`,
      data: {
        id,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTransactionByEmail = async (email, mobileNo) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/email`,
      params: {
        email,
        mobileNo,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const removeAnyTransaction = async (ids) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/transaction/delete`,
      data: {
        ids,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


