// import { isMobileBrowser } from "../config/isMobileBrowser";
import { saveNonToken, saveToken, saveUser } from "../config/sessionHandler";
import api from "./customAxios";

//Get all User

export const getUserToken = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/users/auth/token`,
    });

    // Save token to localStorage for mobile browsers
    // if (isMobileBrowser()) {
    saveToken(res.data?.accessToken, res.data?.refreshToken);
    // }

    return res.data;
  } catch (error) {
    throw "an error ahs occurred";
  }
};

export const getUser = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/users/auth`,
    });

    saveUser(res.data?.accessToken);

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getNonUser = async () => {
  try {
    const res = await api({
      method: "POST",
      url: `/users/sample`,
    });

    // if (isMobileBrowser()) {
    saveNonToken(res.data?.accessToken, res.data?.refreshToken);
    // }

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
    saveToken(res.data?.accessToken, res.data?.refreshToken);
    saveUser(res.data?.accessToken);
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

    saveToken(res.data?.accessToken, res.data?.refreshToken);
    saveUser(res.data?.accessToken);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const verifyUserIdentity = async (data) => {
 
  try {
    const res = await api({
      method: "GET",
      url: `/users/verify-identity`,
      params: {
        ...data
      }
    });

    saveToken(res.data?.accessToken, res.data?.refreshToken);
    saveUser(res.data?.accessToken);
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
      url: `/agents/request`,
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

    saveToken(res.data?.accessToken, res.data?.refreshToken);
    saveUser(res.data?.accessToken);

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await api({
      method: "DELETE",
      url: `/users/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const sendTopUpRequest = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/users/wallet/request`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getWalletBalance = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/users/wallet/balance?id=${id}`,
    });

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

export const getWalletStatus = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/users/wallet/status`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const disableWallet = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/users/wallet/status?action=disable`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateWalletPin = async (data) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/users/wallet`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
