// services/brassica/token.lock.js

const redisClient = require("../../config/redisClient");

const LOCK_KEY = process.env.BRASSICA_TOKEN_LOCK;

async function acquireLock() {
  return redisClient.set(LOCK_KEY, process.pid, "NX", "EX", 30);
}

async function releaseLock() {
  return redisClient.del(LOCK_KEY);
}

module.exports = {
  acquireLock,
  releaseLock,
};
