import api from "./customAxios";

export const getAllLogs = async ({ startDate, endDate, page, limit,search }) => {
  try {
    const res = await api({
      method: "GET",
      url: `/logs`,
      params: { startDate, endDate, page, limit ,search},
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
      url: `/logs`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
