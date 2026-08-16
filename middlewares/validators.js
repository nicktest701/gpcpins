// const validatePayment = (req, res, next) => {
//   const { error, value } = paymentSchema.validate(req.body);

const { bulkAirtimeSchema } = require("../utils/validationSchema");

//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.details[0].message,
//     });
//   }

//   req.validatedData = value;

//   next();
// };

const validatePayment = (schema, otherSchema) => (req, res, next) => {
  // console.log(req.body);
  const selectedSchema = req.body?.service === "ticket" ? otherSchema : schema;
  const detailedSchema =
    req.body?.service === "airtime" && req.body?.type === "Bulk"
      ? bulkAirtimeSchema
      : selectedSchema;
  const { error, value } = detailedSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((e) => e.message);
    return res.status(400).json(errors);

    // return res.status(400).json({
    //   success: false,
    //   message: "Validation error",
    //   errors: error.details.map((e) => e.message),
    // });
  }

  req.validatedData = value;
  next();
};
const validate = (schema) => (req, res, next) => {
  // console.log(req.body)
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((e) => e.message);
    return res.status(400).json(errors);

    // return res.status(400).json({
    //   success: false,
    //   message: "Validation error",
    //   errors: error.details.map((e) => e.message),
    // });
  }

  req.validatedData = value;
  next();
};

module.exports = {
  validatePayment,
  validate,
};
