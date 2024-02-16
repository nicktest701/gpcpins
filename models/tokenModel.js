const mongoose = require('mongoose');
const db = require('../db/dbConnection');

const TokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = db.model('Token', TokenSchema);
