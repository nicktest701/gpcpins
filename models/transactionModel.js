const db = require('../db/dbConnection');
const mongoose = require('mongoose');
const moment = require('moment');

const TransactionSchema = new mongoose.Schema(
  {
    paymentId: String,
    email: {
      type: String,
      lowercase: true,
    },
    phonenumber: String,
    info: {
      type: Object,
    },
    vouchers: Array,
    year: {
      type: Number,
      default: moment(this?.createdAt).year(),
    },
    active: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = db.model('Transaction', TransactionSchema);
