const redisConnectionOptions = {
  url: process.env.REDIS_HOST_EXT,
  maxRetriesPerRequest: null,
};

module.exports = {
  redisConnectionOptions,
};
