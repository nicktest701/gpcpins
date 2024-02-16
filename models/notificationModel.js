const db = require('../db/dbConnection');

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    message: {
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

module.exports = db.model('Notification', NotificationSchema);
