import api from "./customAxios";

export const getTransactions = async ({
  date: { startDate, endDate },
  verifier,
  sort,
}) => {
  try {
    const res = await api({
      method: "GET",
      url: `/tickets/summary/history?verifier=${verifier}`,
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

//Transactions
export const getTransactionSummary = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/tickets/summary?verifier=${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


//Transactions
export const getTransactionReport = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/tickets/summary`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


