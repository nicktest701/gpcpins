import api from "./customAxios";
import { v4 as uuid } from "uuid";

export const makeMomoTransaction = async (paymentInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/payment`,
      headers: {
        "Idempotency-Key": uuid(),
      },
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
      headers: {
        "Idempotency-Key": uuid(),
      },
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
      headers: {
        "Idempotency-Key": uuid(),
      },
      params: {
        id,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const ConfirmPayment = async ({ id, serviceType }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/payment/confirm/${id}/${serviceType}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const reConfirmPayment = async ({ paymentReference, type }) => {
  try {
    const res = await api({
      method: "POST",
      url: `/payment/re-confirm`,
      data: {
        type,
        paymentReference,
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


export const makeElectricityPayment = async (paymentInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/payment/electricity`,
      headers: {
        "Idempotency-Key": uuid(),
      },
      data: paymentInfo,
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

