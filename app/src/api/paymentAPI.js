import api from "./customAxios";

export const makeMomoTransaction = async (paymentInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/payment/momo`,
      data: paymentInfo,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const makeAirtimeTransaction = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/payment/${data?.type === "Bundle" ? "bundle" : "airtime"}`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const makePayment = async ({ id, type }) => {
  const isVoucher = ["waec", "university", "security"].includes(type)
    ? "vouchers"
    : "tickets";

  try {
    const res = await api({
      method: "GET",
      url: `/payment/${isVoucher}`,
      params: {
        id,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const ConfirmPayment = async ({ id, type, confirm }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/confirm/${id}/${type}`,
      params: {
        confirm,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const CancelPayment = async ({ id, type }) => {
 
  try {
    const res = await api({
      method: "GET",
      url: `/payment/cancel/${id}`,
      params: {
        type,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getPayment = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const resendVoucherORReceipt = async (data) => {
  try {
    const response = await api({
      url: `/payment/resend`,
      method: "POST",
      data,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const downloadVouchers = async (id) => {
  try {
    const response = await api({
      url: `/payment/download/${id}`,
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
    console.log(error);
  }
};

export const getAllElectricityPayment = async (paymentInfo) => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/electricity`,
      params: {
        date: paymentInfo,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getAllElectricityPaymentById = async (userId) => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/electricity/${userId}`,
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
      url: `/payment/electricity/user/${userId}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const makeElectricityPayment = async (paymentInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/payment/electricity`,
      data: paymentInfo,
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
      url: `/payment/electricity`,
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
      url: `/payment/electricity/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const downloadReceipts = async (id) => {
  try {
    const response = await api({
      url: `/payment/download/electricity/${id}`,
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
    console.log(error);
  }
};

export const getBundleList = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/top-up/bundlelist`,
      params: {
        network: id || 0,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const sendBundle = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/payment/top-up/bundle`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const sendAirtime = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/payment/top-up/airtime`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
