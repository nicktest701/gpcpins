const nodemailer = require('nodemailer');
const { resendMailText } = require('./mailText');
const { thankYouText } = (require = require('./mailText'));

const transportMail = nodemailer.createTransport({
  host: process.env.MAIL_CLIENT_SERVICE,
  auth: {
    user: process.env.MAIL_CLIENT_USER,
    pass: process.env.MAIL_CLIENT_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3',
  },
  secure: true,
  from: process.env.MAIL_CLIENT_USER,
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async (transaction_id, email_address) => {
  try {
    const mailOptions = {
      from: `GPC PINS ${process.env.MAIL_CLIENT_USER}`,
      sender: process.env.MAIL_CLIENT_USER,
      to: [email_address],
      subject: 'Vouchers & Tickets',
      text: 'Application Vouchers',
      html: '<h1>Thank you for your business!!!.</h1>',
      attachments: [
        {
          filename: `${transaction_id}.pdf`,
          path: `./vouchers/${transaction_id}.pdf`,
        },
      ],
    };

    const mailResult = await transportMail.sendMail(mailOptions);
    return mailResult;
  } catch (error) {
    console.log(error);
  }
};

const sendTicketMail = async (transaction_id, email_address) => {
  try {
    const mailOptions = {
      from: `GPC PINS ${process.env.MAIL_CLIENT_USER}`,
      sender: process.env.MAIL_CLIENT_USER,
      to: [email_address],
      subject: 'Gab Powerful Consult',
      text: 'Vouchers & Tickets',
      html: thankYouText(transaction_id),
      attachments: [
        {
          filename: `${transaction_id}.pdf`,
          path: `./vouchers/${transaction_id}.pdf`,
        },
      ],
    };

    const mailResult = await transportMail.sendMail(mailOptions);

    return mailResult;
  } catch (error) {
    // throw error.message;
    console.log(error);
  }
};
const resendReceiptMail = async (
  transaction_id,
  email_address,
  downloadLink
) => {
  try {
    const mailOptions = {
      from: `GPC PINS ${process.env.MAIL_CLIENT_USER}`,
      sender: process.env.MAIL_CLIENT_USER,
      to: [email_address],
      subject: 'Gab Powerful Consult',
      text: 'Application Vouchers',
      html: resendMailText(transaction_id, downloadLink),
    };
    const mailResult = await transportMail.sendMail(mailOptions);

    return mailResult;
  } catch (error) {
    // throw error.message;
    console.log(error);
  }
};

module.exports = {
  sendMail,
  sendTicketMail,
  resendReceiptMail,
};
