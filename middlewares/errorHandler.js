// src/middleware/errorHandler.js
"use strict";

const logger = require("../utils/logger");
const { AppError } = require("../services/brassicaClient");

/**
 * Central error-handling middleware.
 * Must be registered LAST in the Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== "production";

  if (err instanceof AppError) {
    logger.warn(`AppError [${err.brassicaCode}] on ${req.path}: ${err.message}`);
    return res.status(err.statusCode || 500).json({
      success: false,
      error: {
        message: err.message,
        code: err.brassicaCode || null,
        ...(isDev && { raw: err.raw }),
      },
    });
  }

  // express-validator errors arrive as an array via next(validationResult)
  if (err.type === "VALIDATION_ERROR") {
    return res.status(422).json({
      success: false,
      error: {
        message: "Validation failed.",
        fields: err.errors,
      },
    });
  }

  // Unexpected / unhandled errors
  logger.error(`Unhandled error on ${req.path}:`, err);
  return res.status(500).json({
    success: false,
    error: {
      message: "An internal server error occurred.",
      ...(isDev && { detail: err.message }),
    },
  });
}

module.exports = errorHandler;
