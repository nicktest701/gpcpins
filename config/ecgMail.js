const nodemailer = require('nodemailer');
const { ecgText } = require('./mailText');

const sendElectricityMail = async (transaction_id, email_address, status, url) => {
  try {
    const transportMail = nodemailer.createTransport({
      host: process.env.MAIL_CLIENT_SERVICE,
      auth: {
        user: process.env.MAIL_CLIENT_USER,
        pass: process.env.MAIL_CLIENT_PASS,
      },
      port: 465,
      secure: true,
      from: process.env.MAIL_CLIENT_USER,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const pendingMailOptions = {
      from: `GPC ${process.env.MAIL_CLIENT_USER}`,
      sender: process.env.MAIL_CLIENT_USER,
      to: [email_address],
      subject: 'Prepaid Units',
      text: 'Prepaid units',
      html: ecgText(
        transaction_id,
        `Your request to buy prepaid units has been received. We will notify you after your request has been processed.`
      ),
    };

    const successMailOptions = {
      from: `GPC ${process.env.MAIL_CLIENT_USER}`,
      sender: process.env.MAIL_CLIENT_USER,
      to: [email_address],
      subject: 'Prepaid Units',
      text: 'Prepaid units',
      html: ecgText(
        transaction_id,
        `Thank you for choosing our service! Your transaction is complete, and we appreciate your trust in us. If you have any questions or need further assistance, please don't hesitate to reach out. Wishing you a fantastic day ahead!.
        Attached to this message,is a copy of your receipt. Please keep it for your records.
        `
      ),
      attachments: [
        {
          filename: url,
          path: `./receipts/${url}`,
        },
      ],
    };

    const mailResult = await transportMail.sendMail(
      status === 'pending' ? pendingMailOptions : successMailOptions
    );
    return mailResult;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = sendElectricityMail;
