// src/config/brassica.js
"use strict";

const config = {
  baseURL: process.env.BRASSICA_BASE_URL,
  credentials: {
    userName: process.env.BRASSICA_USERNAME,
    password: process.env.BRASSICA_PASSWORD,
  },
  tokenTTL: parseInt(process.env.TOKEN_TTL_MS || "3480000", 10), // 58 min default
  timeout: 30_000, // 30-second HTTP timeout
  tokenKey: process.env.BRASSICA_TOKEN_KEY,
  tokenLock: process.env.BRASSICA_TOKEN_LOCK,
};

// Fail fast if required env vars are missing
const required = [
  "BRASSICA_BASE_URL",
  "BRASSICA_USERNAME",
  "BRASSICA_PASSWORD",
];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = config;
