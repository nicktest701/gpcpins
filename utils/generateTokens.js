const jwt = require("jsonwebtoken");
const config = require("../config/jwt");

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.accessSecret,
    { expiresIn: config.accessExpires }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    config.refreshSecret,
    { expiresIn: config.refreshExpires }
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};