import api from "./customAxios";

export const getRoles = async () => {
  const res = await api.get("/roles");
  return res.data;
};

export const getRole = async (id) => {
  const res = await api.get(`/roles/${id}`);
  return res.data;
};

export const createRole = async (data) => {
  const res = await api.post("/roles", data);
  return res.data;
};

export const updateRole = async (id, data) => {
  const res = await api.patch(`/roles/${id}`, data);
  return res.data;
};

export const deleteRole = async (id) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
};

export const getPermissions = async () => {
  const res = await api.get("/roles/permissions");
  return res.data;
};

export const createPermission = async (data) => {
  const res = await api.post("/roles/permissions", data);
  return res.data;
};

export const deletePermission = async (id) => {
  const res = await api.delete(`/roles/permissions/${id}`);
  return res.data;
};