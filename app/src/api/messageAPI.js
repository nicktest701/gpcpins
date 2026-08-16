import api from './customAxios';

export const postMessage = async (message) => {
  try {
    const res = await api({
      method: 'POST',
      url: `/messages`,
      data: message,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


