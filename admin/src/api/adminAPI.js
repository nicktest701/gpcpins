import { saveToken, } from "../config/sessionHandler";
import api from "./customAxios";

export const getAdmin = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/admin/auth`,
    });

    // saveUser(res.data?.user);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAdminToken = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/admin/token`,
    });
    saveToken(res.data?.accessToken, res.data?.refreshToken);

    return res.data;
  } catch (error) {
    throw "an error has occurred";
  }
};

export const loginAdmin = async (adminInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/admin/login`,
      data: adminInfo,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logoutAdmin = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/admin/logout`,
      data,
    });

    return res.status;
  } catch (error) {
    throw error.response.data;
  }
};

export const verifyAdmin = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/admin/verify`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const verifyAdminOTP = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/admin/verify-otp`,
      data,
    });


    saveToken(res.data?.accessToken, res.data?.refreshToken);

    return res.data;
  } catch (error) {
    throw error?.response?.data;
  }
};

export const updateAdminProfile = async (data) => {
  const formData = new FormData();
  formData.append("id", data?.id);
  formData.append("profile", data?.profile);

  try {
    const res = await api({
      method: "PUT",
      url: `/admin/profile`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response.data || "Error Updating profile");
  }
};

export const putAdmin = async (updatedAdmin) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/admin`,
      data: updatedAdmin,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const resetAdminPassword = async (updatedAdmin) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/admin/password-reset`,
      data: updatedAdmin,
    });
    saveToken(res.data?.accessToken, res.data?.refreshToken);

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const putAdminPassword = async (updatedAdmin) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/admin/password`,
      data: updatedAdmin,
    });

    saveToken(res.data?.accessToken, res.data?.refreshToken);

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const putAdminResetPasswordLink = async (data) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/employees/reset`,
      data,
    });

    saveToken(res.data?.accessToken, res.data?.refreshToken);
    // saveUser(res.data?.user);

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteAdmin = async (id) => {
  try {
    const res = await api({
      method: "DELETE",
      url: `/admin/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const enableOrDisableAccount = async (info) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/admin/account`,
      data: info,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const getPhoneNumberToken = async ({ token }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/admin/phonenumber/token`,
      params: {
        code: token,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const verifyUserIdentity = async (data) => {

  try {
    const res = await api({
      method: "GET",
      url: `/admin/verify-identity`,
      params: {
        ...data
      }
    });

    saveToken(res.data?.accessToken, res.data?.refreshToken);
    // saveUser(res.data?.accessToken);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


///SMS API
export const getSMSAPI = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/admin/sms`,
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


///SMS API
export const postSMSAPI = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/admin/sms`,
      data
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};