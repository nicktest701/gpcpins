import api from "./customAxios";

export const getTransactions = async (sort) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction?sort=${sort}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

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
export const findTransaction = async (id, mobileNo) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/general`,
      params: {
        mobileNo,
        id
      },
      timeout: 10000,
      timeoutErrorMessage: "Error connecting to the server",
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

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

export const getTransactionByEmail = async (date) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/email`,
      params: {
        startDate: date?.startDate,
        endDate: date?.endDate,
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
