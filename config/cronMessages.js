const cron = require("node-cron");
const moment = require("moment");
const knex = require("../db/knex");
const pLimit = require("p-limit");
const sendEMail = require("./sendEmail");
const { mailTextShell } = require("./mailText");
const { sendSMS } = require("./sms");
const logger = require("../utils/logger");

const getEmailWish = (name) => `
<div class="container">
    <h1>Happy Birthday!</h1>
    <p>Dear ${name},</p>
    <p>Wishing you a day filled with love, laughter, and joy as you celebrate another year of life. May this special day bring you happiness and many wonderful memories.</p>
    <p>Best wishes,</p>
    <div class="signature">
      <p>Gab Powerful Team</p>
    </div>
  </div>
`;

const getSMSWish = (name) => `
Happy Birthday!
Dear ${name},
Wishing you a day filled with love, laughter, and joy as you celebrate another year of life. May this special day bring you happiness and many wonderful memories.
Best wishes,
      
Gab Powerful Team
`;

async function sendBirthdayWishes() {
  logger.info(
    `[${new Date().toISOString()}] Starting birthday wishes cron job...`,
  );

  const today = moment();
  const formattedDate = today.format("M-D");
  const isLeapYear = today.isLeapYear();

  let query = `
    SELECT CONCAT(firstname, ' ', lastname) AS name, email, phonenumber 
    FROM users 
    WHERE dob_month_day = ?;
  `;
  let queryParams = [formattedDate];

  if (formattedDate === "2-28" && !isLeapYear) {
    query = `
      SELECT CONCAT(firstname, ' ', lastname) AS name, email, phonenumber 
      FROM users 
      WHERE dob_month_day IN ('2-28', '2-29');
    `;
    queryParams = [];
  }

  try {
    const [customers] = await knex.raw(query, queryParams);

    if (!customers || customers.length === 0) {
      logger.info("No birthdays found today.");
      return;
    }

    logger.info(
      `Found ${customers.length} customer(s) celebrating today. Sending messages...`,
    );

    const limit = pLimit(3);
    const tasks = customers.map((user) =>
      limit(async () => {
        try {
          const emailPromise = sendEMail(
            user.email,
            mailTextShell(getEmailWish(user.name)),
            "Happy Birthday!",
          );

          const smsPromise = user.phonenumber
            ? sendSMS(getSMSWish(user.name), user.phonenumber)
            : Promise.resolve();

          await Promise.all([emailPromise, smsPromise]);
        } catch (error) {
          logger.error(`Failed to send wishes to ${user.email}:`, error);
        }
      }),
    );

    await Promise.all(tasks);
    logger.info("All birthday wishes processed successfully.");
  } catch (dbError) {
    logger.error("Database error during birthday cron job:", dbError);
  }
}

const currentInstance = parseInt(process.env.INSTANCE_ID || "0", 10);

// Only allow the very first instance to initialize the cron scheduler
if (currentInstance === 0) {
  logger.info(
    `[Instance ${currentInstance}] Master Cron Scheduler successfully initialized.`,
  );

  cron.schedule(
    "0 8 * * *",
    () => {
      sendBirthdayWishes();
    },
    {
      scheduled: true,
      timezone: "Africa/Accra",
    },
  );
} else {
  logger.info(
    `[Instance ${currentInstance}] Cron Scheduler disabled on this worker node.`,
  );
}

module.exports = {
  sendBirthdayWishes,
};
