// workers/brassica.worker.js

const { Worker } = require("bullmq");
const { refreshToken } = require("../services/brassica/token.manager.js");

const connectionOptions = {
  url: process.env.REDIS_HOST_EXT,
  maxRetriesPerRequest: null,
};

new Worker(
  "brassica",
  async (job) => {
    if (job.name === "refresh-token") {
      await refreshToken();
    }
  },
  {
    connection: connectionOptions,
    concurrency: 1,
  },
);
