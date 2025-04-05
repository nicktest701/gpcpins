const jwt = require("jsonwebtoken");
const redisClient = require("./redisClient");
const { randomUUID } = require("crypto");


const tid = randomUUID()
function signRefreshToken(data) {
  const token = jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: "1000d",
  });
  return token;
}

async function signSampleToken(data) {
  const token = jwt.sign(data, process.env.TOKEN, {
    expiresIn: "1h",
    jwtid: tid
  });
  await redisClient.set(`user:${tid}`, token, {
    EX: 60 * 60 // or just 3600
  });
  return token;
}
function signSampleRefreshToken(data) {
  const token = jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: "1h",
  });
  return token;
}

async function signMainToken(data, expires) {
  const token = jwt.sign(data, process.env.TOKEN, {
    expiresIn: expires,
    jwtid: tid
  });
  await redisClient.set(`user:${tid}`, token, {
    EX: 60 * 60 * 24 * 180 // 180 days in seconds
  });


  return token;
}
function signMainRefreshToken(data, expires) {
  const token = jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: "1000d",


  });
  return token;
}

module.exports = {
  signRefreshToken,
  signSampleToken,
  signSampleRefreshToken,
  signMainToken,
  signMainRefreshToken,
};
