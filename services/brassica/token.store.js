// services/brassica/token.store.js

const redisClient = require("../../config/redisClient.js");

const TOKEN_KEY = process.env.BRASSICA_TOKEN_KEY;

async function getToken() {
  return redisClient.get(TOKEN_KEY);
}

async function setToken(token) {
  return redisClient.set(
    TOKEN_KEY,
    token,
    "EX",
    Number(process.env.BRASSICA_TOKEN_TTL),
  );
}

async function deleteToken() {
  return redisClient.del(TOKEN_KEY);
}

module.exports = {
  getToken,
  setToken,
  deleteToken,
};
