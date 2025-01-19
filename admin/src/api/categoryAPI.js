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
      headers: {
        Authorization: `Bearer ${localStorage.getItem("gab_user")}`,
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

///
export const postCategory = async (newCategory) => {
  try {
    const res = await api({
      url: `/category`,
      method: "POST",
      data: newCategory,
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

///
export const editCategory = async (updatedCategory) => {
  try {
    const res = await api({
      url: `/category`,
      method: "PUT",
      data: updatedCategory,
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const disableCategory = async (updatedCategory) => {
  try {
    const res = await api({
      url: `/category`,
      method: "PATCH",
      data: updatedCategory,
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

///DELETE CATEGORY
export const deleteCategory = async (id) => {
  try {
    const res = await api({
      url: `/category`,
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

export const deleteMoreCategory = async (id) => {
  try {
    const res = await api({
      url: `/category/remove`,
      method: "PUT",
      data: {
        id,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

/**....................module...................... */
export const getModuleStatus = async () => {
  try {
    const res = await api({
      url: `/category/module/status`,
      method: "GET",
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const postModuleStatus = async (data) => {
  try {
    const res = await api({
      url: `/category/module/status`,
      method: "POST",
      data,
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

// .........................................BUS

// export const getBusByOrigin = async (voucherType) => {
//   try {
//     const res = await api({
//       url: `/category/bus`,
//       method: 'GET',
//       timeout: 10000,
//       timeoutErrorMessage: 'Could not connect to server.Plase try again later',
//       params: {
//         voucherType,
//       },
//     });
//     return res.data;
//   } catch (error) {
//     throw error.response.data;
//   }
// };
