// redisClient.js
const redis = require("redis");
const logger = require("../utils/logger");

const redisClient = redis.createClient({
  url: process.env.REDIS_HOST_EXT,
  socket: {
    connectTimeout: 10000, // 1. Increased timeout to 10s for external hosts
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000), // 2. Slightly relaxed backoff
  },
});

// REMOVED 'throw err' to prevent crashing
redisClient.on("error", (err) => {
  if (process.env.NODE_ENV !== "production") {
    logger.error("Redis client error event:", err);
  }
});

(async () => {
  try {
    await redisClient.connect();
    logger.info("Successfully connected to Redis.");
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      logger.error("Initial Redis connection failed:", error);
    }
    // REMOVED 'throw error' so your main app server can still boot
  }
})();

module.exports = redisClient;



// // redisClient.js
// const redis = require("redis");
// const logger = require("../utils/logger");


// const redisClient = redis.createClient({
//   url: process.env.REDIS_HOST_EXT,
//   socket: {
//      connectTimeout: 5000,
//     reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
//   },
// });

// redisClient.on("error", (err) => {
//   if (process.env.NODE_ENV !== "production") {
//     logger.error("Redis client error:", err);
//   }
//   throw err;
// });

// (async () => {
//   try {
//     await redisClient.connect();
//   } catch (error) {
//     if (process.env.NODE_ENV !== "production") {
//       logger.error("Redis client error:", error);
//     }
//     throw error;
//   }
// })();


// module.exports = redisClient;
