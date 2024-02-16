const db = require('../db/dbConnection');

const mongoose = require('mongoose');

const ClientCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      lowercase: true,
      required: true,
    },
    year: {
      type: String,
      default: new Date().getFullYear(),
    },
    voucherType: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    details: Object,
    client: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Client',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = db.model('ClientCategory', ClientCategorySchema);
