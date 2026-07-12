const { body } = require("express-validator");
const Joi = require("joi");

const phoneNumberREgex = /^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/;
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

const userIdentitySchema = Joi.object({
  nid: Joi.string()
    .pattern(/^(?:GHA-\d{9}-\d|\d{10})$/)
    .optional(),

  dob: Joi.date().optional(),
})
  .xor("nid", "dob") // Enforces that exactly ONE of these fields must be present
  .messages({
    "object.xor":
      "You must provide either your National/Voter ID or Date of Birth !",
  });

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  phonenumber: Joi.string().required(),
});

const googleRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),

  // Optional strings that must not be empty if they are provided
  phonenumber: Joi.string().optional().empty(""),
  profile: Joi.string().optional().empty(""),

  register: Joi.boolean().optional(),
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
  recipient: Joi.string().required(),
  amount: Joi.required(),
  phonenumber: Joi.required(),
  provider: Joi.required(),
  email: Joi.required(),
  isWallet: Joi.boolean().required(),
  bulk: Joi.boolean().required(),
  pricing: Joi.required(),
  token: Joi.string().optional(),
});

const prepaidSchema = Joi.object({
  type: Joi.string().allow(null).required(),
  service: Joi.string()
    .valid(...serviceTypeEnum)
    .required(),
  user: Joi.alternatives().try(Joi.object(), Joi.string()).optional(),
  meter: Joi.alternatives().try(Joi.object(), Joi.string()).required(),
  info: Joi.object({
    amount: Joi.number().required(),
    email: Joi.string().allow(null).optional(),
    phonenumber: Joi.string().allow(null).optional(),
    provider: Joi.string().allow(null).optional(),
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

const loginSchema = Joi.object({
  email: Joi.alternatives()
    .try(Joi.string().email(), Joi.string().pattern(phoneNumberREgex))
    .required()
    .messages({
      "alternatives.match": '"Input" must be a valid email or phone number',
      "any.required": '"email" is a required field',
    }),

  type: Joi.string().valid("email", "phone").required(),
});

const otpSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.alternatives()
    .try(Joi.string().email(), Joi.string().pattern(phoneNumberREgex))
    .required()
    .messages({
      "alternatives.match": '"Input" must be a valid email or phone number',
      "any.required": '"email" is a required field',
    }),
  type: Joi.string().valid("email", "phone").required(),
  token: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required(),
});
const adminOTPSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().email().required(),
  token: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required(),
});

const pinSchema = Joi.object({
  token: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required(),
});

const pinResetSchema = Joi.object({
  id: Joi.string().required(),
  pin: Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required(),
  userEmail: Joi.string().email().required(),
  isAdmin: Joi.boolean().optional(),
});

const airtimeTopUpSchema = Joi.object({
  recipient: Joi.string().required(),
  amount: Joi.number().positive().required(),
  network: Joi.number().valid(4, 6, 1).required(),
  transaction_reference: Joi.string().required(),
});

const bundleTopUpSchema = Joi.object({
  recipient: Joi.string().required(),
  data_code: Joi.string().required(),
  network: Joi.number().valid(4, 6, 1).required(),
  transaction_reference: Joi.string().required(),
});

const billerPaymentSchema = [
  body("accountNumber")
    .notEmpty()
    .withMessage("accountNumber (meter number) is required."),
  body("phoneNumber")
    .matches(/^\d{12,13}$/)
    .withMessage("phoneNumber must be in international format."),
  body("accountCategory")
    .isIn(["PREPAID", "POSTPAID"])
    .withMessage('accountCategory must be "PREPAID" or "POSTPAID".'),
  body("amount")
    .isNumeric({ min: 1 })
    .withMessage("amount must be a positive number."),
  body("paymentBy")
    .notEmpty()
    .withMessage("paymentBy (payer name) is required."),
  // Fields from the Lookup step
  body("accountLookUpId")
    .notEmpty()
    .withMessage("accountLookUpId from lookup is required."),
  body("serviceDistrictId").notEmpty(),
  body("serviceRegionId").notEmpty(),
  body("serviceProviderName").notEmpty(),
  body("accountName").notEmpty(),
  body("accountReferenceId").notEmpty(),
  body("altAccountNumber").notEmpty(),
];

module.exports = {
  voucherSchema,
  ticketSchema,
  airtimeSchema,
  bundleSchema,
  bulkAirtimeSchema,
  prepaidSchema,
  walletTopUpSchema,
  otpSchema,
  adminOTPSchema,
  registrationSchema,
  googleRegistrationSchema,
  loginSchema,
  userIdentitySchema,
  pinSchema,
  pinResetSchema,
  airtimeTopUpSchema,
  bundleTopUpSchema,
  billerPaymentSchema,
};
