// src/services/tokenManager.js
"use strict";

/**
 * TokenManager — singleton that handles Brassica Pay authentication.
 *
 * Tokens are valid for 1 hour.  We cache and auto-refresh them slightly
 * before they expire so callers never have to worry about token lifecycle.
 *
 * Thread-safe for Node.js (single-threaded) — for multi-process/cluster
 * deployments replace the in-memory store with Redis.
 */

const axios = require("axios");
const logger = require("../utils/logger");
const brassicaConfig = require("../config/brassica");

class TokenManager {
  constructor() {
    this._token = null;
    this._expiresAt = 0; // epoch ms
    this._refreshPromise = null; // prevents concurrent refresh storms
  }

  /**
   * Returns a valid Bearer token, refreshing if necessary.
   * @returns {Promise<string>}
   */
  async getToken() {
    const now = Date.now();

    // Return cached token if still valid
    if (this._token && now < this._expiresAt) {
      return this._token;
    }

    // Deduplicate concurrent refresh requests
    if (!this._refreshPromise) {
      this._refreshPromise = this._authenticate().finally(() => {
        this._refreshPromise = null;
      });
    }

    return this._refreshPromise;
  }

  /** Force a token refresh (e.g. after a 401 from Brassica) */
  async forceRefresh() {
    this._token = null;
    this._expiresAt = 0;
    return this.getToken();
  }

  async _authenticate() {
    logger.info("Refreshing Brassica Pay Bearer token...");

    const url = `${brassicaConfig.baseURL}/Authenticate`;

    const response = await axios.post(
      url,
      {
        userName: brassicaConfig.credentials.userName,
        password: brassicaConfig.credentials.password,
      },
      {
        timeout: brassicaConfig.timeout,
        headers: { "Content-Type": "application/json" },
      }
    );

    const { data } = response;

    if (data?.response !== "000" || !data?.data?.resp1) {
      logger.error("Authentication failed:", data);
      throw new Error(`Brassica authentication failed: ${data?.responseMesg || "Unknown error"}`);
    }

    this._token = data.data.resp1;
    this._expiresAt = Date.now() + brassicaConfig.tokenTTL;

    logger.info(`Token obtained, valid for ~${brassicaConfig.tokenTTL / 60000} minutes.`);
    return this._token;
  }
}

// Export a single shared instance
module.exports = new TokenManager();
