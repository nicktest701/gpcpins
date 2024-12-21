const jwt = require("jsonwebtoken");

function signAccessToken(data) {
  return jwt.sign(data, process.env.TOKEN, {
    expiresIn: "180d",
  });
}

function signRefreshToken(data) {
  return jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: "1000d",
  });
}

function signSampleToken(data) {
  return jwt.sign(data, process.env.TOKEN, {
    expiresIn: "1h",
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
    expiresIn: "1000d",

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
