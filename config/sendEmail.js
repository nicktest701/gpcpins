const nodemailer = require("nodemailer");

const sendEMail = async (email_address, message, subject) => {
  // if (process.env.NODE_ENV !== 'production') return true

  try {
    const transportMail = nodemailer.createTransport({
      host: process.env.MAIL_CLIENT_SERVICE,
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_CLIENT_USER,
        pass: process.env.MAIL_CLIENT_PASS,
      },
      connectionTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
        // ciphers: "SSLv3",
      },
      // from: process.env.MAIL_CLIENT_USER,
    });

    // verify connection configuration
    if (process.env.NODE_ENV !== "production") {
      transportMail.verify(function (error, success) {
        if (error) {
          console.log("Err is", error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
    }

    const mailOptions = {
      from: `GPC ${process.env.MAIL_CLIENT_USER}`,
      sender: process.env.MAIL_CLIENT_USER,
      to: typeof email_address === "string" ? [email_address] : email_address,
      subject: subject || "Gab Powerful Consult",
      text: "",
      html: message,
    };

    const mailResult = await transportMail.sendMail(mailOptions);

    return mailResult;
  } catch (error) {
    console.log(error.message);
    // throw error.message;
  }
};

module.exports = sendEMail;
