// queues/whatsapp.queue.js

const { Queue } = require("bullmq");

const connectionOptions = {
  url: process.env.REDIS_HOST_EXT,
  maxRetriesPerRequest: null,
};
const whatsappQueue = new Queue("whatsapp-messages", {
  connection: connectionOptions,
});

module.exports = {
  whatsappQueue,
};
