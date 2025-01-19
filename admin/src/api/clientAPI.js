import api from './customAxios';

export const getAllClients = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/clients`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getClientByToken = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/clients/token`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getClient = async (id) => {
  try {
    const res = await api({
      method: 'GET',
      url: `/clients/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getClientLogin = async (data) => {
  try {
    const res = await api({
      method: 'POST',
      url: `/clients/email`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

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

export const updateClient = async (data) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/clients`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const toggleClientAccount = async (data) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/clients/disable`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const removeClient = async (id) => {
  try {
    const res = await api({
      method: 'DELETE',
      url: `/clients`,
      params: {
        id,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

/*------------------------WAEC & UNIVERSITY & SECURITY------------------------------------*/

export const getAllClientCategory = async (clientId, category) => {
  try {
    const res = await api({
      url: `/clients-category`,
      method: 'GET',
      params: {
        clientId,
        category,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getClientCategory = async (clientId) => {
  try {
    const res = await api({
      url: `/clients-category/${clientId}`,
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addClientCategory = async (data) => {
  try {
    const res = await api({
      method: 'POST',
      url: `/clients-category`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const editClientCategory = async (updatedCategory) => {
  try {
    const res = await api({
      url: `/clients-category`,
      method: 'PUT',
      data: updatedCategory,
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

///DELETE CATEGORY
export const deleteClientCategory = async (id) => {
  try {
    const res = await api({
      url: `/clients-category`,
      method: 'DELETE',
      params: {
        id,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

/*------------------------BUS------------------------------------*/

export const getAllClientBus = async (bus) => {
  try {
    const res = await api({
      url: `/clients-category/bus`,
      method: 'GET',
      params: {
        bus,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getClientBusByVoucherType = async (voucherType) => {
  try {
    const res = await api({
      url: `/clients-category/bus`,
      method: 'GET',
      params: {
        voucherType,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getClientBus = async (id) => {
  try {
    const res = await api({
      url: `/clients-category/bus/${id}`,
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

///
export const addClientBus = async (newBus) => {
  try {
    const res = await api({
      url: `/clients-category/bus`,
      method: 'POST',
      data: newBus,
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

///
export const editClientBus = async (updatedBus) => {
  try {
    const res = await api({
      url: `/clients-category/bus`,
      method: 'PUT',
      data: updatedBus,
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

///DELETE BUS
export const deleteClientBus = async (id) => {
  try {
    const res = await api({
      url: `/clients-category/bus`,
      method: 'DELETE',
      params: {
        id,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

/*------------------------CINEMA------------------------------------*/

export const getAllClientCinema = async (cinema) => {
  try {
    const res = await api({
      url: `/clients-category/cinema`,
      method: 'GET',
      params: {
        cinema,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addClientCinema = async (newCinemaTicket) => {
  const formData = new FormData();

  formData.append('cinema', newCinemaTicket.cinema);
  formData.append('category', newCinemaTicket.category);
  formData.append('voucherType', newCinemaTicket.voucherType);
  formData.append('details', JSON.stringify(newCinemaTicket.details));
  formData.append('client', newCinemaTicket.client);

  try {
    const res = await api({
      url: `/clients-category/cinema`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

///
export const editClientCinema = async (updatedCinema) => {
  try {
    const res = await api({
      url: `/clients-category/cinema`,
      method: 'PUT',
      data: updatedCinema,
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

///DELETE CINEMA
export const deleteClientCinema = async (id) => {
  try {
    const res = await api({
      url: `/clients-category/cinema`,
      method: 'DELETE',
      params: {
        id,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

/*------------------------STADIUM------------------------------------*/

export const addClientStadiumTicket = async (newStadiumTicket) => {
  const formData = new FormData();

  formData.append('category', newStadiumTicket.category);
  formData.append('voucherType', newStadiumTicket.voucherType);
  formData.append('homeImage', newStadiumTicket.homeTeamImage);
  formData.append('awayImage', newStadiumTicket.awayTeamImage);
  formData.append('details', JSON.stringify(newStadiumTicket.details));
  formData.append('client', newStadiumTicket.client);

  try {
    const res = await api({
      url: `/clients-category/stadium`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
