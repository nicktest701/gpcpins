// Import the Worker class from BullMQ using CommonJS syntax
const { Worker } = require("bullmq");

// Import the instantiated whatsappService instance to send messages
const { whatsappService } = require("../services/whatsapp/whatsapp.service");

const connectionOptions = {
  url: process.env.REDIS_HOST_EXT,
  maxRetriesPerRequest: null,
};

// Initialize a new BullMQ worker to process the "whatsapp-messages" queue
new Worker(
  "whatsapp-messages",

  // Async processor function that executes for each job in the queue
  async (job) => {
    // Destructure core payload properties from the job data
    const { type, sessionId, phone } = job.data;

    // Route and process standard text messages
    if (type === "text") {
      await whatsappService.sendText(sessionId, phone, job.data.message);
    }

    // Route and process PDF document messages
    if (type === "pdf") {
      await whatsappService.sendPDF(
        sessionId,
        phone,
        job.data.filePath,
        job.data.fileName,
      );
    }
  },

  // Worker configuration options
  {
    // Process up to 5 jobs simultaneously in parallel
    concurrency: 5,
    // Define the Redis connection details using environment variables
    connection: connectionOptions,
  },
);
