// redisClient.js
const redis = require("redis");


// let redisClient;

// if (process.env.NODE_ENV === "production") {
const redisClient = redis.createClient({
  url: process.env.REDIS_HOST_EXT,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
  },
});

redisClient.on("error", (err) => {
  if (process.env.NODE_ENV !== "production") {
    console.error("Redis client error:", err);
  }
  throw err;
});

(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Redis client error:", error);
    }
    throw error;
  }
})();
// } else {
//   redisClient = new Redis({
//     url: process.env.UPSTASH_REDIS_REST_URL,
//     token: process.env.UPSTASH_REDIS_REST_TOKEN,
//   });
// }

module.exports = redisClient;
