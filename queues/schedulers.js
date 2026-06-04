const { brassicaQueue } = require("./brassica.queue.js");


async function initializeSchedulers() {
  
  await brassicaQueue.upsertJobScheduler(
    "refresh-token",
    {
      every: 55 * 60 * 1000, // 55 minutes
    },
    {
      name: "refresh-token",
      data: {},
    }
  );

  console.log(
    "✓ Brassica token refresh scheduler initialized"
  );
}

module.exports = { initializeSchedulers };