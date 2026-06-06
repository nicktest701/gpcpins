// src/utils/logger.js
const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Configuration for Daily Log Rotation
const createRotateTransport = (filename, level) => {
  return new transports.DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true, // Compresses old files into .gz
    maxSize: "20m", // Forces a split if a single day exceeds 20MB
    maxFiles: "14d", // Retains history for exactly 14 days
    level: level,
  });
};

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    
    // In production add file/cloud transports here
    createRotateTransport("combined", "info"), // Captures everything info and above
    createRotateTransport("error", "error"), // Captures only error events
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), logFormat),
    }),
  );
}

module.exports = logger;
