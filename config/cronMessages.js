const moment = require("moment");
const knex = require("../db/knex");
const pLimit = require("p-limit");
const sendEMail = require("./sendEmail");
const { mailTextShell } = require("./mailText");
const { sendSMS } = require("./sms");

const limit = pLimit(3);
async function sendBirthdayWishes() {
    //  const date = moment(new Date("2024-02-19 14:34:19"));
  const formattedDate = moment().format("MMMM DD");

  const users = await knex.raw(
    `SELECT *
  FROM (
      SELECT name,email,phonenumber, DATE_FORMAT(dob,'%M %d') AS dobb
      FROM users
  ) AS users_
  WHERE dobb = ?;`,
    [formattedDate]
  );

  const wish = (name) => `
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
  const SMSWish = (name) => `
Happy Birthday!
Dear ${name},
Wishing you a day filled with love, laughter, and joy as you celebrate another year of life. May this special day bring you happiness and many wonderful memories.
Best wishes,
      
Gab Powerful Team
`;

  if (users[0]?.length > 0) {
    limit(() => {
      return users[0].map(async (user) => {
        await sendEMail(
          user?.email,
          mailTextShell(wish(user?.name)),
          "Happy Birthday!"
        );

        if (user?.phonenumber) {
          await sendSMS(SMSWish(user?.name), user?.phonenumber);
        }
      });
    });
  }
}

module.exports = {
  sendBirthdayWishes,
};
