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

// airtime
export const allBalance = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/balances`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
// airtime
export const getPOS_Balance = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/hb/pos`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
// airtime
export const getPREPAID_Balance = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/hb/prepaid`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
// airtime
export const getTopUpBalance = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/top-up/balance`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const getAllBulkAirtimePayment = async ({ startDate, endDate }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/airtime`,
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
// airtime
export const completeBulkAirtimePayment = async ({ id, orderId }) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/payment/airtime`,
      params: {
        id,
        orderId
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllElectricityPayment = async ({ startDate, endDate }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/electricity`,
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
      url: `/payment/electricity/${id}`,
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
  const formData = new FormData();
  formData.append("_id", paymentInfo?._id);
  formData.append("receipt", paymentInfo?.receipt);
  formData.append("data", JSON.stringify(paymentInfo?.data));


  try {
    const res = await api({
      method: "PUT",
      url: `/payment/electricity`,
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
