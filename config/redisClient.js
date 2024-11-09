// redisClient.js
const redis = require("redis");

const redisClient = redis.createClient({
    url: process.env.REDIS_HOST_EXT, // You can configure the URL if using a Redis server URL
});

redisClient.on('error', (err) => {
    // console.error('Redis client error:', err);
});

(async () => {
    try {
        await redisClient.connect();
        
    } catch (error) {
        // console.log('error');

    }
})();

module.exports = redisClient

