import api from './customAxios';

export const getAllNotifications = async (title) => {
  try {
    const res = await api({
      method: 'GET',
      url: `/notifications`,
      params: {
        title
      }
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const getNotification = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/notifications`,
      timeout: 10000,
      timeoutErrorMessage: 'Error connecting to the server',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateNotification = async (ids) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/notifications`,
      data: { ids },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteNotifications = async ({ id, all }) => {
  try {
    const res = await api({
      method: 'DELETE',
      url: `/notifications`,
      data: { id, all },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


