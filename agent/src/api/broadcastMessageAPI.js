import api from './customAxios';

export const getAllBroadcastMessages = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/broadcast-messages`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getBroadcastMessage = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/broadcast-messages`,
      timeout: 10000,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const postBroadcastMessage = async (broadcastMessage) => {
  try {
    const res = await api({
      method: 'POST',
      url: `/broadcast-messages`,
      data: broadcastMessage,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const resendBroadcastMessage = async (message) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/broadcast-messages`,
      data: message,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteBroadcastMessages = async (id) => {
  try {
    const res = await api({
      method: 'DELETE',
      url: `/broadcast-messages`,
      params: { id },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
