const mongoose = require('mongoose');
const db = require('../db/dbConnection');

const UserSchema = new mongoose.Schema(
  {
    profile: String,
    name: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phonenumber: {
      type: String,
      // required: true,
    },
    role: {
      type: String,
      enum: [process.env.USER_ID],
      default: process.env.USER_ID,
    },
    token: String,
    active: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

UserSchema.statics.findByEmail = function (email) {
  return this.find({ email });
};

module.exports = db.model('User', UserSchema);
