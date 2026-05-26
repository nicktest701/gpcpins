const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redisClient.js");

const paymentLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) =>
      redisClient.sendCommand(args),
  }),

  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many payment attempts. Try again later.",
  },

  keyGenerator: (req) => {
    return (
      req.user?.id ||
      req.ip ||
      req.headers["x-forwarded-for"]
    );
  },
});


module.exports = {
  paymentLimiter,
};
