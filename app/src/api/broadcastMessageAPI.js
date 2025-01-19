import api from "./customAxios";

export const getAllBroadcastMessages = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/notifications/user`,
    });

   

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const changeNotificationStatus = async () => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/notifications/user`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const removeNotification = async (id) => {
  try {
    const res = await api({
      method: 'DELETE',
      url: id ? `/notifications/user/${id}` : `/notifications/user`,

    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const removeAllNotifications = async (id) => {
  try {
    const res = await api({
      method: 'DELETE',
      url: `/notifications/user`,
      params: { id },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};