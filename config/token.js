const jwt = require("jsonwebtoken");

function signAccessToken(data) {
  return jwt.sign(data, process.env.TOKEN, {
    expiresIn: "30m",
  });
}

function signRefreshToken(data) {
  return jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: "90d",
  });
}

function signSampleToken(data) {
  return jwt.sign(data, process.env.TOKEN, {
    expiresIn: "30m",
  });
}
function signSampleRefreshToken(data) {
  return jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: "1h",
  });
}

function signMainToken(data, expires) {
  return jwt.sign(data, process.env.TOKEN, {
    expiresIn: expires,
  });
}
function signMainRefreshToken(data, expires) {
  return jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: expires,

  });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  signSampleToken,
  signSampleRefreshToken,
  signMainToken,
  signMainRefreshToken,
};
