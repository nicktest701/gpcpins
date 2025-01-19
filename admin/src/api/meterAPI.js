import api from "./customAxios";

export const getAllMeters = async () => {
  try {
    const res = await api({
      url: `/meters`,
      method: "GET",
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getMeterById = async (meterId) => {
  try {
    const res = await api({
      url: `/meters/${meterId}`,
      method: "GET",
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getMetersByUser = async (userId) => {
  try {
    const res = await api({
      url: `/meters/user/${userId}`,
      method: "GET",
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

///DELETE METER
export const deleteMeter = async (id) => {
  try {
    const res = await api({
      url: `/meters`,
      method: "DELETE",
      params: {
        id,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
