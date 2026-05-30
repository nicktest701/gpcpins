// workers/reservationExpiry.worker.js

const cron = require("node-cron");
const knex = require("../db/knex");
const redisClient = require("../config/redisClient");

const BATCH_SIZE = 500;

const acquireLock = async () => {
  return await redisClient.set(
    "reservation_expiry_lock",
    "locked",
    "NX",
    "EX",
    50, // seconds
  );
};

const releaseExpiredReservations = async () => {
  try {
    // console.log("Running reservation expiry job...");

    const expired = await knex.raw(
      `
  SELECT id FROM vouchers
  WHERE status = 'sold' AND active=1
  AND reservation_expires_at < NOW()
  LIMIT ?
  `,
      [BATCH_SIZE],
    );
    // FOR UPDATE SKIP LOCKED;

    if (!expired[0].length) {
      //   console.log("No expired reservations found");
      return;
    }

    const ids = expired[0].map((v) => v.id);

    await knex("vouchers").whereIn("id", ids).update({
      status: "new",
      active: 1,
      reserved_at: null,
      reservation_expires_at: null,
    });

    console.log(`Released ${ids.length} expired vouchers`);
  } catch (error) {
    console.error("Reservation expiry error:", error);
  }
};

// Run every minute
cron.schedule("* * * * *", async () => {
  if (await acquireLock()) {
    await releaseExpiredReservations();
  }
});

module.exports = { releaseExpiredReservations };
