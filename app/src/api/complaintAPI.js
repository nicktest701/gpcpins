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






