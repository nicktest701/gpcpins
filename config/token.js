const jwt = require("jsonwebtoken");
const redisClient = require("./redisClient");
const { randomUUID } = require("crypto");
const {
  getExpiryTimeByRole,
  getExpiryTimeByRoleMs,
} = require("../utils/helper");

const tid = randomUUID();

function signRefreshToken(data) {
  const token = jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: "1000d",
  });
  return token;
}

async function signMainToken(data, userData) {
  // 1. Generate JWT token
  const token = jwt.sign(data, process.env.TOKEN, {
    expiresIn: getExpiryTimeByRole(data?.role).accessTime,
    jwtid: tid,
  });

  // 3. Save to Redis cache
  await redisClient.set(`user:${tid}`, token, {
    EX: getExpiryTimeByRoleMs(data.role)?.accessTimeMs,
  });

  //4. Save user details to redis cache
  await redisClient.set(`user:profile:${tid}`, JSON.stringify(userData), {
    EX: getExpiryTimeByRoleMs(data.role)?.accessTimeMs,
  });

  return token; // Added: Return token for outer scope usage
}

function signMainRefreshToken(data) {
  const token = jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: getExpiryTimeByRole(data?.role).refreshTime,
  });
  return token;
}

module.exports = {
  signRefreshToken,
  signMainToken,
  signMainRefreshToken,
};
