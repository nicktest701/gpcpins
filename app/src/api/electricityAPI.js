import api from "./customAxios";

export const getAllElectricityPaymentById = async (id) => {
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
export const getAllElectricityPaymentByMeterId = async (meterId) => {
  try {
    const res = await api({
      method: "GET",
      url: `/electricity/meter/${meterId}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getPrepaidStatus = async ({paymentId, transactionId}) => {
  try {
    const res = await api({
      method: "GET",
      url: `/electricity/payment/status/${paymentId}?id=${transactionId}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const downloadReceipts = async (id) => {
  try {
    const response = await api({
      url: `/electricity/download/${id}`,
      method: "GET",
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${id}.pdf`);

    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    throw new Error(error);
  }
};
