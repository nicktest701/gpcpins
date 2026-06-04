// src/services/brassicaClient.js
"use strict";

/**
 * brassicaClient
 *
 * A thin wrapper around axios that:
 *   1. Automatically injects a valid Bearer token on every request.
 *   2. Retries once with a fresh token if the API responds with 401.
 *   3. Normalises Brassica error shapes into a consistent AppError.
 */

const axios = require("axios");
const brassicaConfig = require("../config/brassica");
const logger = require("../utils/logger");
const tokenMetrics = require("./brassica/token.metrics");
const { deleteToken } = require("./brassica/token.store");
const { refreshToken, getBrassicaToken } = require("./brassica/token.manager");

class AppError extends Error {
  constructor(message, statusCode, brassicaCode, raw) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode; // HTTP status to send to the client
    this.brassicaCode = brassicaCode; // Brassica statusCode field
    this.raw = raw; // Full Brassica response body
  }
}

/**
 * Make an authenticated POST request to Brassica Pay.
 *
 * @param {string} endpoint  - e.g. "/sendMoney"
 * @param {object} body      - JSON request body (empty object for no-body endpoints)
 * @param {boolean} retry    - Internal flag — do not set manually
 * @returns {Promise<object>} Brassica response body
 */
async function brassicaPost(endpoint, body = {}, retry = true) {
  const token = await getBrassicaToken();
  const url = `${brassicaConfig.baseURL}${endpoint}`;

  let response;
  try {
    response = await axios.post(url, body, {
      timeout: brassicaConfig.timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    // Network / timeout errors
    if (err.code === "ECONNABORTED") {
      throw new AppError("Request to Brassica Pay timed out.", 504, null, null);
    }
    const code = err?.response?.data?.statusCode;

    const status = err.response?.status;
    const data = err.response?.data;

    // Brassica returns 401 for expired/invalid tokens
    if (code === "401" || (status === 401 && retry)) {
      logger.warn(
        "Received 401 from Brassica — refreshing token and retrying.",
      );

      tokenMetrics.retries401++;

      await deleteToken();
      token = await refreshToken();

      return axios.post(url, body, {
        timeout: brassicaConfig.timeout,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    logger.error(`Brassica API error [${status}] on ${endpoint}:`, data);
    throw new AppError(
      data?.message || data?.responseMesg || "Brassica Pay request failed.",
      status || 502,
      data?.statusCode || data?.response,
      data,
    );
  }

  const data = response.data;

  // Brassica uses statusCode inside the body for business errors
  const bCode = String(data?.statusCode || data?.response || "");
  const errorCodes = [
    "300",
    "303",
    "401",
    "402",
    "403",
    "404",
    "405",
    "406",
    "407",
    "408",
    "409",
    "410",
    "411",
    "412",
    "413",
    "414",
    "415",
    "416",
    "419",
    "420",
    "422",
    "424",
    "500",
  ];

  if (errorCodes.includes(bCode)) {
    logger.warn(`Brassica business error [${bCode}] on ${endpoint}:`, data);
    throw new AppError(
      data?.message ||
        data?.responseMesg ||
        "Operation rejected by Brassica Pay.",
      mapBrassicaCodeToHttp(bCode),
      bCode,
      data,
    );
  }

  return data;
}

/** Map Brassica statusCodes to appropriate HTTP status codes */
function mapBrassicaCodeToHttp(bCode) {
  const map = {
    200: 200,
    202: 202,
    401: 401,
    407: 401,
    402: 404,
    403: 404,
    404: 404,
    420: 422,
    405: 503,
    416: 503,
    500: 502,
    406: 422,
    422: 422,
    408: 400,
    409: 408,
    410: 402,
    412: 402,
    424: 200, // 424 FAILED — still a valid terminal state
    300: 422,
    303: 502,
    411: 502,
    413: 502,
    414: 400,
    415: 403,
    419: 202,
  };
  return map[bCode] || 500;
}

module.exports = { brassicaPost, AppError };
