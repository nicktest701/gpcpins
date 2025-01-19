import api from './customAxios';

export const getVoucherByCategory = async (category, id) => {
  try {
    const response = await api({
      method: 'GET',
      url: `/voucher/category`,
      params: {
        type: category,
        id,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getVoucherDetails = async (id) => {
  try {
    const response = await api({
      method: 'GET',
      url: `/voucher/tickets`,
      params: {
        id,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

