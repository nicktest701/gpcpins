const mongoose = require('mongoose');
const _ = require('lodash');
const db = require('../db/dbConnection');

const EmployeeSchema = new mongoose.Schema(
  {
    profile: String,
    firstname: {
      type: String,
      lowercase: true,
    },
    lastname: {
      type: String,
      lowercase: true,
    },
    username: {
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
      enum: [process.env.EMPLOYEE_ID, process.env.ADMIN_ID],
      default: process.env.EMPLOYEE_ID,
    },
    token: {
      type: String,
    },
    password: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
    virtuals: {
      name: {
        get() {
          const name = _.startCase(`${this.firstname} ${this.lastname}`);
          return name;
        },
      },
    },
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

EmployeeSchema.statics.findByEmail = function (email) {
  return this.find({ email });
};

module.exports = db.model('Employee', EmployeeSchema);
