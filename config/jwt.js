module.exports = {
  accessSecret: process.env.TOKEN,
  refreshSecret: process.env.TOKEN_REFRESH,

  accessExpires: "15m",
  refreshExpires: "7d",
};
