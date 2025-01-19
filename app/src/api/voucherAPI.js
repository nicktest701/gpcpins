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

export const getAllRemainingVouchers = async (id, type) => {
  try {
    const response = await api({
      method: 'GET',
      url: `/voucher/available`,
      params: {
        id,
        type,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllRemainingTickets = async (id) => {
  try {
    const response = await api({
      method: 'GET',
      url: `/voucher/available/tickets`,
      params: {
        id,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

/////////////////////////////////////////////////////....BUS....///////////////////////////

export const getAvailbleBusSeats = async (id) => {
  try {
    const res = await api({
      url: `/voucher/bus/available/${id}`,
      method: 'GET',
    });
    // console.log(res.data);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
