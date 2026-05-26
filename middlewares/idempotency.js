const redisClient = require("../config/redisClient");

const idempotencyMiddleware = async (req, res, next) => {
  try {
    const key = req.headers["idempotency-key"];

    if (!key) {
      return res.status(400).json("key missing");
      // return res.status(400).json({
      //   success: false,
      //   message: "Idempotency key missing",
      // });
    }

    const redisKey = `payment:${key}`;

    /*
        Check existing response
      */

    const existingResponse = await redisClient.get(redisKey);

    if (existingResponse) {
      return res.status(200).json(JSON.parse(existingResponse));
    }

    /*
        Store original res.json
      */

    const originalJson = res.json.bind(res);

    /*
        Override res.json
      */

    res.json = async (body) => {
      try {
        if (res.statusCode < 400) {
          await redisClient.set(redisKey, JSON.stringify(body), {
            EX: 60 * 60,
          });
        }
      } catch (err) {
        console.error("Idempotency Redis Error:", err);
      }

      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Idempotency middleware error",
    });
  }
};

module.exports = {
  idempotencyMiddleware,
};
