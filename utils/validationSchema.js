const Joi = require("joi");

const serviceTypeEnum = [
  "ticket",
  "voucher",
  "airtime",
  "bundle",
  "wallet",
  "prepaid",
];

const userSchema = Joi.object({
  name: Joi.string().empty("").default("").optional(),
  email: Joi.string().email().empty("").default("").optional(),
  phoneNumber: Joi.string().empty("").default("").optional(),
  provider: Joi.string().empty("").default("").optional(),
});

const planSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  volume: Joi.string().required(),
});

const voucherSchema = Joi.object({
  category: Joi.required(),
  categoryId: Joi.required(),
  service: Joi.string()
    .valid(...serviceTypeEnum)
    .required(),
  voucherName: Joi.required(),
  price: Joi.number().required(),
  quantity: Joi.number().integer().min(1).required(),
  totalAmount: Joi.number().required(),
  user: userSchema.optional(),
  isWallet: Joi.boolean().required(),
  token: Joi.string().optional(),
});

const ticketSchema = Joi.object({
  categoryId: Joi.required(),
  service: Joi.string()
    .valid(...serviceTypeEnum)
    .required(),
  category: Joi.required(),
  voucherName: Joi.required(),
  paymentDetails: Joi.object({
    tickets: Joi.array().items(Joi.any()).required(),
    quantity: Joi.number().integer().min(1).required(),
    totalAmount: Joi.number().required(),
  }).required(),

  totalAmount: Joi.number().required(),
  user: userSchema.required(),
  isWallet: Joi.boolean().required(),
  token: Joi.string().optional(),
});

const airtimeSchema = Joi.object({
  type: Joi.string().allow(null).required(),
  service: Joi.string()
    .valid(...serviceTypeEnum)
    .required(),

  amount: Joi.alternatives()
    .try(Joi.string(), Joi.number(), Joi.allow(null))
    .required(),
  recipient: Joi.string().allow(null).required(),
  phonenumber: Joi.required(),
  provider: Joi.string().allow(null).required(),
  email: Joi.required(),
  isWallet: Joi.boolean().required(),
  token: Joi.string().optional(),
});

const bundleSchema = Joi.object({
  type: Joi.string().allow(null).required(),
  service: Joi.string()
    .valid(...serviceTypeEnum)
    .required(),

  amount: Joi.alternatives()
    .try(Joi.string(), Joi.number(), Joi.allow(null))
    .required(),

  recipient: Joi.string().allow(null).required(),
  phonenumber: Joi.required(),
  provider: Joi.string().allow(null).required(),
  email: Joi.required(),
  isWallet: Joi.boolean().required(),
  plan: planSchema.required(),
  token: Joi.string().optional(),
});

const bulkAirtimeSchema = Joi.object({
  type: Joi.string().required(),

  service: Joi.string()
    .valid(...serviceTypeEnum)
    .required(),
  amount: Joi.required(),
  recipient: Joi.string().required(),
  phonenumber: Joi.required(),
  provider: Joi.required(),
  email: Joi.required(),
  isWallet: Joi.boolean().required(),
  bulk: Joi.boolean().required(),
  pricing: Joi.required(),
  token: Joi.string().optional(),
});

const prepaidSchema = Joi.object({
  user: Joi.alternatives().try(Joi.object(), Joi.string()).optional(),
  meter: Joi.alternatives().try(Joi.object(), Joi.string()).required(),
  info: Joi.object({
    amount: Joi.number().required(),
    email: Joi.required(),
    mobileNo: Joi.required(),
    provider: Joi.required(),
  }).required(),
  topup: Joi.number().required(),
  charges: Joi.number().required(),
  amount: Joi.number().required(),
  isWallet: Joi.boolean().required(),
  token: Joi.string().optional(),
});

const walletTopUpSchema = Joi.object({
  amount: Joi.number().required(),
  mobilePartner: Joi.string().required(),
  phoneNumber: Joi.string().required(),
});

module.exports = {
  voucherSchema,
  ticketSchema,
  airtimeSchema,
  bundleSchema,
  bulkAirtimeSchema,
  prepaidSchema,
  walletTopUpSchema,
};
