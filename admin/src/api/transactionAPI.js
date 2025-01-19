import api from "./customAxios";

export const getTransactions = async ({
  date: { startDate, endDate },
  sort,
}) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction`,
      params: {
        sort,
        startDate,
        endDate,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getAllRefundTransactions = async ({
  date: { startDate, endDate },
  sort,
}) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/refund`,
      params: {
        sort,
        startDate,
        endDate,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getRefundTransaction = async ({
  id,
  category,
}) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/refund/${id}`,
      params: {
        category
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



export const refundTransaction = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/transaction/refund`,
      data,
      timeout: 15000,
      timeoutErrorMessage: "Error connecting to the server",
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


//Transactions
export const getTotalSales = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/total-sales`,
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
export const getAirtimeTransaction = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/airtime`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getBundleTransaction = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/bundle`,
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
      url: `/transaction/report`,
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
export const getTransactionReport = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/transaction/report/history`,
      data,
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

export const AllAgentsWallet = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agents/wallet`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const topUpWallet = async (data) => {

  const formData = new FormData();
  formData.append("id", data?.id);
  formData.append("type", data?.type);
  formData.append("amount", data?.amount);
  formData.append("comment", data?.comment);
  formData.append("attachment", data?.attachment);
  try {
    const res = await api({
      method: "POST",
      url: `/transaction/agents/wallet`,
      data: formData,

      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const getAgentTransaction = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agents/transactions?id=${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const geAllAgentWalletTransaction = async ({ startDate, endDate }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agents/wallet/transaction`,
      params: { startDate, endDate, report: false },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAgentWalletTransaction = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agents/wallet/transactions?id=${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const geAllAgentWalletTransactionReport = async ({
  startDate,
  endDate,
}) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agents/wallet/transaction`,
      params: { startDate, endDate, report: true },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const AllUsersWallet = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/users/wallet`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const topUpUserWallet = async (data) => {
  const formData = new FormData();
  formData.append("id", data?.id);
  formData.append("type", data?.type);
  formData.append("amount", data?.amount);
  formData.append("comment", data?.comment);
  formData.append("attachment", data?.attachment);


  try {
    const res = await api({
      method: "POST",
      url: `/transaction/users/wallet`,
      data: formData,

      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const geAllUserWalletTransaction = async ({ startDate, endDate }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/users/wallet/transactions`,
      params: { startDate, endDate, report: false },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const geAllUserWalletTransactionReport = async ({
  startDate,
  endDate,
}) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/users/wallet/transactions`,
      params: { startDate, endDate, report: true },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getUserTransaction = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/users/transactions?id=${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getUserWalletTransaction = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/users/wallet/transactions/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllLogs = async ({ startDate, endDate }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/logs`,
      params: {
        startDate,
        endDate,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const removeLogs = async (data) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/transaction/logs`,
      data
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
