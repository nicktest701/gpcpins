// redisClient.js
const {Redis} = require("@upstash/redis");

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});


module.exports = redisClient;


// // redisClient.js
// const redis = require("redis");

// const redisClient = redis.createClient({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// redisClient.on("error", (err) => {
//   if (process.env.NODE_ENV !== "production") {
//     console.error("Redis client error:", err);
//   }
//   throw err;
// });

// (async () => {
//   try {
//     await redisClient.connect();
//   } catch (error) {
//     if (process.env.NODE_ENV !== "production") {
//       console.error("Redis client error:", error);
//     }
//     throw error;
//   }
// })();

// module.exports = redisClient;
