const jwt = require('jsonwebtoken');

function signAccessToken(data) {
  return jwt.sign(data, process.env.TOKEN, {
    expiresIn: '1h',
  });
}

function signRefreshToken(data) {
  return jwt.sign(data, process.env.TOKEN_REFRESH, {
    expiresIn: '90d',
  });
}

function signSampleToken(data) {
  return jwt.sign(data, process.env.TOKEN, {
    expiresIn: '1m',
  });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  signSampleToken,
};
