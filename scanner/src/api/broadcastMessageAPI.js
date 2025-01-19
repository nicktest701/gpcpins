import api from './customAxios';

export const getAllBroadcastMessages = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/messages/verifier`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getBroadcastMessage = async (id) => {
  try {
    const res = await api({
      method: 'GET',
      url: `/messages/verifier/${id}`,
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
      url: `/messages/verifier`,
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
      url: `/messages/verifier`,
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
      url: `/messages/verifier`,
      params: { id },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteSelectedBroadcastMessages = async (data) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/messages/verifier/delete-all`,
      data
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
