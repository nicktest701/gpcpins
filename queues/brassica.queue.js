// queues/brassica.queue.js

const { Queue } = require("bullmq");

const connectionOptions = {
  url: process.env.REDIS_HOST_EXT,
  maxRetriesPerRequest: null,
};

const brassicaQueue = new Queue("brassica", {
  connection: connectionOptions,
});

module.exports = { brassicaQueue };
