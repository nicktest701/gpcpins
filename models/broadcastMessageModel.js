const db = require('../db/dbConnection');

const mongoose = require('mongoose');

const BroadcastMessageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
    },
    recipient: {
      type: String,
    },
    title: {
      type: String,
    },
    body: {
      type: String,
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

module.exports = db.model('BroadcastMessage', BroadcastMessageSchema);
