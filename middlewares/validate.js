// src/middleware/validate.js
"use strict";

const { validationResult } = require("express-validator");

/**
 * Runs express-validator checks and short-circuits with a 422 if any fail.
 * Usage: router.post("/foo", [...validators], validate, handler)
 */
function validate(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const err = new Error("Validation failed.");
    err.type = "VALIDATION_ERROR";
    err.errors = result.array();
    const errors = result.array().map((e) => e.msg);
    if (errors.length > 0) {
      err.message = errors[0];
      err.stack = errors[0];
    }

    return next(err);
  }
  next();
}

module.exports = validate;
