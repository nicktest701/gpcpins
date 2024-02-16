const mongoose = require('mongoose');
const db = require('../db/dbConnection');
const bcrypt = require('bcryptjs');

const ClientSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lasstname: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
    },
    businessname: {
      type: String,
    },
    location: {
      type: String,
    },
    phonenumber: {
      type: String,
    },
    password: {
      type: String,
    },
    category: mongoose.SchemaTypes.Mixed,
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'granted'],
      default: 'pending',
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ClientSchema.statics.getOrganisationByEmail = function (email, next) {
  return this.findOne({ email }, next);
};

ClientSchema.pre('save', function (next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    this.password = hash;
    next();
  });
});

module.exports = db.model('Client', ClientSchema);
