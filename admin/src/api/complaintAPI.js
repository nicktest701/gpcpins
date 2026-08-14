// src/api/complaintAPI.js
import api from './customAxios';

// ─── Complaints ──────────────────────────────────────────────

/**
 * Create a new complaint
 * @param {Object} data - Complaint data
 * @param {string} data.serviceType - 'meter' | 'airtime' | 'voucher'
 * @param {string} data.transactionId - Transaction ID
 * @param {string} [data.meterNo] - Meter number (if serviceType === 'meter')
 * @param {string} data.paymentMode - 'wallet' | 'mobile_money'
 * @param {string} data.comment - Description of the issue
 */
export const createComplaint = async (data) => {
  try {
    const res = await api({
      method: 'POST',
      url: '/complaints',
      data,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all complaints (admin)
 * @param {Object} params - Filter params
 * @param {string} [params.status] - 'pending' | 'open' | 'resolved' | 'unresolved'
 * @param {string} [params.serviceType] - 'meter' | 'airtime' | 'voucher'
 * @param {number} [params.page] - Page number (1-indexed)
 * @param {number} [params.limit] - Items per page
 */
export const getComplaints = async (params = {}) => {
  try {
    const res = await api({
      method: 'GET',
      url: '/complaints',
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get a single complaint by ID
 * @param {string} id - Complaint ID
 */
export const getComplaint = async (id) => {
  try {
    const res = await api({
      method: 'GET',
      url: `/complaints/${id}`,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update a complaint (status, resolution, assignee)
 * @param {string} id - Complaint ID
 * @param {Object} updates
 * @param {string} [updates.status] - 'pending' | 'open' | 'resolved' | 'unresolved'
 * @param {string} [updates.resolution] - Resolution notes
 * @param {string} [updates.assignedTo] - Admin email or ID
 */
export const updateComplaint = async (id, updates) => {
  try {
    const res = await api({
      method: 'PATCH',
      url: `/complaints/${id}`,
      data: updates,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a complaint (admin only)
 * @param {string} id - Complaint ID
 */
export const deleteComplaint = async (id) => {
  try {
    const res = await api({
      method: 'DELETE',
      url: `/complaints/${id}`,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};