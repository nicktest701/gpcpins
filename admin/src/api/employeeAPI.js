
import { isMobileBrowser } from '../config/isMobileBrowser';
import api from './customAxios';

export const getAllEmployees = async (search) => {
  const isSearch = search || ""
  try {
    const res = await api({
      method: 'GET',
      url: `/employees?search=${isSearch}`,
    });


    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getEmployeeByToken = async () => {
  try {
    const res = await api({
      method: 'GET',
      url: `/employees/token`,
      // headers: {
      //   Authorization: `Bearer ${Cookie.get('employee')}`,
      // },
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getEmployee = async (id) => {
  try {
    const res = await api({
      method: 'GET',
      url: `/employees/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getEmployeeLogin = async (data) => {
  try {
    const res = await api({
      method: 'POST',
      url: `/employees/email`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addEmployee = async (employee) => {
  const formData = new FormData();
  formData.append('profile', employee.profile);
  formData.append('firstname', employee.firstname);
  formData.append('lastname', employee.lastname);
  formData.append('username', employee.username);
  formData.append('email', employee.email);
  formData.append('dob', employee.dob);
  formData.append('residence', employee.residence);
  formData.append('nid', employee.nid);
  formData.append('phonenumber', employee.phonenumber);
  formData.append('role', employee.role);
  formData.append('password', employee.password);

  try {
    const res = await api({
      method: 'POST',
      url: `/employees`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const resetEmployeePassword = async (data) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/employees/reset`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const updateEmployee = async (data) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/employees`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const verifyEmployee = async (data) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/employees/verify`,
      data,
    });

    if (isMobileBrowser()) {
      localStorage.setItem('SSID_', res.data?.SSID_);
      localStorage.setItem('SSID_X', res.data?.SSID_X);
    }

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const toggleEmployeeAccount = async (data) => {
  try {
    const res = await api({
      method: 'PUT',
      url: `/employees/status`,
      data,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const removeEmployee = async ({ id }) => {
  try {
    const res = await api({
      method: 'DELETE',
      url: `/employees/${id}`,
    });

    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
