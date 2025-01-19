import api from './customAxios';

export const addClient = async (data) => {
  try {
    const res = await api({
      method: 'POST',
      url: `/clients`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
