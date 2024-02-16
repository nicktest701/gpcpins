const db = require('../db/dbConnection');

const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
    },
    type: String,
    serial: {
      type: String,
    },
    pin: {
      type: String,
    },
    details: mongoose.SchemaTypes.Mixed,
    active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['new', 'sold', 'used', 'expired'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = db.model('Voucher', VoucherSchema);
