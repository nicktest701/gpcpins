const mongoose = require('mongoose');
const db = require('../db/dbConnection');

const MeterSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      unique: true,
       require:true
    },
    name: {
      type: String,
      uppercase: true,
    },
    type: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    geoCode: {
      type: String,
      default: '',
    },
    accountNumber: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = db.model('Meter', MeterSchema);
