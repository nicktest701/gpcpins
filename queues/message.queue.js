// queue/index.js
const { Queue } = require("bullmq");
const connectionOptions = {
  url: process.env.REDIS_HOST_EXT,
  maxRetriesPerRequest: null,
};

const messageQueue = new Queue("messages", {
  connection: connectionOptions,
});

module.exports = {
  messageQueue,
};
