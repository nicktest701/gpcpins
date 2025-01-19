import api from './customAxios';





export const getAllAssignedTickets = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/tickets`,

    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const getAssignedTicketByVerifier = async (id) => {
  try {
    const res = await api({
      method: 'GET',
      url: `/tickets?verifier=${id}`,
      id
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const enableOrDisableTicket = async (info) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/tickets/account`,
      data: info,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const getScannedTicketSummary = async (id, verifier) => {
  try {

    const res = await api({
      method: 'GET',
      url: `/tickets/${id}/scanned_tickets?scanner=${verifier}`,


    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAssignedTicketByID = async (id) => {
  try {
    const res = await api({
      method: 'GET',
      url: `/tickets/${id}`,
      id
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const assignTicket = async (data) => {
  try {
    const res = await api({
      method: 'POST',
      url: `/tickets`,
      data
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const removeAssignedTicket = async ({ id }) => {
  try {
    const res = await api({
      method: 'DELETE',
      url: `/tickets/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const removeAssignedTickets = async (data) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/tickets`,
      data
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
