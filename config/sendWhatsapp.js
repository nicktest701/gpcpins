accountSid = process.env.TWILIO_SID;
authToken = process.env.TWILIO_TOKEN;

const client = require("twilio")(accountSid, authToken);

const sendWhatsappMessage = async (data) => {
  try {
    const message = await client.messages.create({
      body: data?.message,
      from: `whatsapp:${process.env.TWILIO_NUMBER}`,
      to: `whatsapp:${data?.user}`,
      mediaUrl: data?.media,
    });

    console.log(message.sid);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendWhatsappMessage,
};
