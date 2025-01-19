import api from "./customAxios";

export const getAllCategory = async () => {
  try {
    const res = await api({
      url: `/category`,
      method: "GET",
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const getAllCategories = async () => {
  try {
    const res = await api({
      url: `/category/all`,
      method: "GET",
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const getAllTickets = async (category) => {
  try {
    const res = await api({
      url: `/category/tickets?category=${category}`,
      method: "GET",
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getTicketByID = async (id) => {
  try {
    const res = await api({
      url: `/category/tickets/${id}`,
      method: "GET",
    });



    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
