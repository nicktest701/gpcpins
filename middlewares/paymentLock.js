const redisClient = require("../config/redisClient.js");

const paymentLockMiddleware = async (req, res, next) => {
  try {
    const key = req.headers["idempotency-key"];

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Missing lock key",
      });
    }

    const lockKey = `lock:${key}`;

    /*
        NX = only set if not exists
      */

    const lock = await redisClient.set(lockKey, "processing", {
      NX: true,
      EX: 30,
    });

    if (!lock) {
      return res.status(409).json({
        success: false,
        message: "Payment already processing",
      });
    }

    /*
        Release lock after response
      */

    res.on("finish", async () => {
      await redisClient.del(lockKey);
    });

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Payment lock middleware failed",
    });
  }
};

module.exports = {
  paymentLockMiddleware,
};
