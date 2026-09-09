// import { isMobileBrowser } from "../config/isMobileBrowser";
import axios from "axios";
import { getToken, saveAccessToken, saveToken } from "../config/sessionHandler";
import api from "./customAxios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

//Get all User

export const getUserToken = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/users/auth/token`,
    });

    saveToken(res.data?.accessToken);
    saveAccessToken(res.data?.accessToken);

    return res.data;
  } catch (error) {
    throw "an error ahs occurred";
  }
};

export const getUser = async () => {
  const token = getToken();
  try {
    const res = await axios({
      method: "GET",
      url: `${BASE_URL}/users/auth`,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginUser = async (userInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/users/login`,
      data: userInfo,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginGoogleUser = async (userInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/users/login-google`,
      data: userInfo,
    });

    // if (isMobileBrowser()) {
    saveAccessToken(res.data?.accessToken);

    // }

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logoutUser = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/users/logout`,
      data,
    });

    return res.status;
  } catch (error) {
    throw error.response.data;
  }
};

export const verifyUserOTP = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/users/verify-otp`,
      data,
    });

    saveAccessToken(res.data?.accessToken);

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const verifyUserIdentity = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/users/verify-identity`,
      data: {
        ...data,
      },
    });

    saveAccessToken(res.data?.accessToken);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateUserProfile = async (data) => {
  const formData = new FormData();
  formData.append("id", data?.id);
  formData.append("profile", data?.profile);

  try {
    const res = await api({
      method: "PUT",
      url: `/users/profile`,
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

export const createNewUser = async (userInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/users`,
      data: userInfo,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const createNewAgent = async (agentInfo) => {
  try {
    const res = await api({
      method: "POST",
      url: `/users/agents/request`,
      data: agentInfo,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const putUser = async (updatedUser) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/users`,
      data: updatedUser,
    });

    saveAccessToken(res.data?.accessToken);

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const getWalletTransaction = async ({ startDate, endDate }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/users/wallet/transactions`,
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

export const getPhoneNumberToken = async ({ token }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/users/phonenumber/token`,
      params: {
        code: token,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};




