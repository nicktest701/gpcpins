import api from "./customAxios";




export const getAllLogs = async ({ startDate, endDate }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/logs/verifier`,
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

export const removeLogs = async (data) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/logs/verifier`,
      data
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};