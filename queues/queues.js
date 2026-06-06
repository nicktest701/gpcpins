// queues/whatsapp.queue.js

const { Queue } = require("bullmq");

const connectionOptions = {
  url: process.env.REDIS_HOST_EXT,
  maxRetriesPerRequest: null,
};

const voucherQueue = new Queue("voucher-generation", {
  connection: connectionOptions,

  defaultJobOptions: {
    attempts: 5,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: 1000,

    removeOnFail: false,
  },
});

const ticketQueue = new Queue("ticket-generation", {
  connection: connectionOptions,

  defaultJobOptions: {
    attempts: 5,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: 1000,

    removeOnFail: false,
  },
});

module.exports = {
  voucherQueue,
  ticketQueue,
};
