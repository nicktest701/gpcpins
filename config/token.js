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
  signMainToken,
  signMainRefreshToken,
};
