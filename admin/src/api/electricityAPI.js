import api from "./customAxios";

export const getAllElectricityPayment = async ({ startDate, endDate }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/electricity`,
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
export const getElectricity = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/electricity/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllElectricityPaymentByUserId = async (userId) => {
  try {
    const res = await api({
      method: "GET",
      url: `/electricity/user/${userId}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateElectricityPayment = async (paymentInfo) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/electricity`,
      data: paymentInfo,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deletePrepaidTransaction = async (id) => {
  try {
    const res = await api({
      method: "DELETE",
      url: `/electricity/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
