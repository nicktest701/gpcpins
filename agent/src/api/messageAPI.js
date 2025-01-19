import api from './customAxios';

export const getAllMessages = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/messages`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getMessage = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/messages`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

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
export const updateMessage = async (ids) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/messages`,
      params: { ids },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteMessages = async ({ id, all }) => {
  try {
    const res = await api({
      method: 'DELETE',
      url: `/messages`,
      params: { id, all },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
