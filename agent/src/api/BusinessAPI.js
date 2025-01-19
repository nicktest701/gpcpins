import api from "./customAxios";

export const getAllBusiness = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/agents/business`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getBusiness = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/agents/business/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const postBusiness = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/agents/business`,
      data
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const updateBusiness = async (data) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/agents/business`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


