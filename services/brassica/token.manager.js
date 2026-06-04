// services/brassica/token.manager.js

// Token storage helpers for reading and writing the current cached token.
const { getToken, setToken } = require("./token.store.js");

// Lock helpers to avoid concurrent refresh attempts.
const { acquireLock, releaseLock } = require("./token.lock.js");
// Circuit breaker wrapper for the brassica auth endpoint.
const { authBreaker } = require("./auth.client.js");
// Metrics collector used for debugging and observability.
const { tokenMetrics } = require("./token.metrics.js");

function sleep(ms) {
  // Pause execution for a defined interval before retrying.
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshToken() {
  // Request a fresh token from the auth service.
  const response = await authBreaker.fire();

  // Extract the token from the expected response structure.
  const token = response?.data?.resp1;

  if (!token) {
    // Ensure callers receive an error when auth fails to return a token.
    throw new Error("Brassica token missing");
  }

  // Persist the new token in local storage so future requests can reuse it.
  await setToken(token);

  // Track refresh activity for monitoring cache behavior.
  tokenMetrics.refreshes++;

  return token;
}

async function getBrassicaToken() {
  // Try to read from the local token cache first.
  let token = await getToken();

  if (token) {
    tokenMetrics.cacheHits++;
    return token;
  }

  // Cache miss means we need to refresh or wait for another process to refresh.
  tokenMetrics.cacheMisses++;

  // Acquire a lock to ensure only one refresh request happens at once.
  const lock = await acquireLock();

  if (lock) {
    try {
      return await refreshToken();
    } finally {
      // Always release the lock after refresh attempts.
      await releaseLock();
    }
  }

  // Another process is refreshing the token, poll the cache until it appears.
  for (let i = 0; i < 20; i++) {
    await sleep(500);

    token = await getToken();
    console.log(token);

    if (token) {
      return token;
    }
  }

  // If the token is still unavailable after retries, fail clearly.
  throw new Error("Unable to obtain Brassica token");
}

module.exports = {
  refreshToken,
  getBrassicaToken,
};
