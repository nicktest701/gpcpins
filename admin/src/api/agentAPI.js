import api from "./customAxios";

export const getAllAgents = async () => {
  try {
    const res = await api({
      method: "GET",
      url: `/agents`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAgent = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/agents/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAgentCommission = async (id) => {
  try {
    const res = await api({
      method: "GET",
      url: `/agents/commission/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const postAgentCommission = async (agent) => {
  try {
    const res = await api({
      method: "POST",
      url: `/agents/commission`,
      data: agent,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const postAgent = async (agent) => {
  try {
    const res = await api({
      method: "POST",
      url: `/agents`,
      data: agent,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateAgentProfile = async (data) => {
  const formData = new FormData();
  formData.append("id", data?.id);
  formData.append("profile", data?.profile);

  try {
    const res = await api({
      method: "PUT",
      url: `/agents/profile`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response.data || "Error Updating profile");
  }
};
export const putAgent = async (message) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/agents`,
      data: message,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const putAgentPassword = async (updatedAgent) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/agents/password`,
      data: updatedAgent,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const toggleAgentAccount = async (updatedAgent) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/agents/account`,
      data: updatedAgent,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteAgent = async ({ id }) => {
  try {
    const res = await api({
      method: "DELETE",
      url: `/agents/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const updateAgentWalletPin = async (data) => {
  try {
    const res = await api({
      method: "PUT",
      url: `/agents/wallet`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const getAirtimeANDBundleTransaction = async (type) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agent/airtime?type=${type}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getReportTransaction = async (year, type) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agent/report`,
      params: {
        year,
        type,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getTransactionReport = async (data) => {
  try {
    const res = await api({
      method: "POST",
      url: `/transaction/agent/transactions/report`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};



export const getTransactions = async ({
  date: { startDate, endDate },
  sort,
}) => {
  try {
    const res = await api({
      method: "GET",
      url: `/transaction/agent/transaction`,
      params: {
        sort: sort?.toLowerCase(),
        startDate: startDate || new Date("2023-01-01"),
        endDate: endDate || new Date(),
      },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};