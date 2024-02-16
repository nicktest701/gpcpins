const db = require('../db/dbConnection');
const mongoose = require('mongoose');
const moment = require('moment');

const ElectricityTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    meter: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Meter',
    },
    email: {
      type: String,
      lowercase: true,
    },
    mobileNo: String,
    info: {
      type: Object,
    },
    year: {
      type: Number,
      default: moment(this?.createdAt).year(),
    },

    status: {
      type: String,
      default: 'pending',
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

module.exports = db.model(
  'ElectricityTransaction',
  ElectricityTransactionSchema
);
