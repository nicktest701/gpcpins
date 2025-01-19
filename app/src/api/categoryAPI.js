import api from "./customAxios";

export const getAllCategory = async () => {
  try {
    const res = await api({
      url: `/category`,
      method: "GET",
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getMainCategory = async (category) => {
  try {
    const res = await api({
      url: `/category/main`,
      method: "GET",
      params: {
        category,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getCategoryByType = async (category, page) => {
  try {
    const res = await api({
      url: `/category/type`,
      method: "GET",
      params: {
        category,
        page,
      },

    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllCategories = async () => {
  try {
    const res = await api({
      url: `/category/all`,
      method: "GET",
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getCategory = async (id) => {
  try {
    const res = await api({
      url: `/category/${id}`,
      method: "GET",

    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

// .........................................BUS

export const getBusByOrigin = async ({ origin, destination }) => {
  try {
    const res = await api({
      url: `/category/bus`,
      method: "GET",
      params: {
        origin,
        destination
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

/**  .........................module..................... */
export const getModuleStatus = async (title) => {
  try {
    const res = await api({
      url: `/category/module/status?title=${title}`,
      method: "GET",
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
