const db = require('../db/dbConnection');

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      lowercase: true,
      required: true,
    },
    year: {
      type: String,
      default: new Date().getFullYear().toString(),
    },
    voucherType: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    details: Object,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = db.model('Category', CategorySchema);
