const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// accountSid = process.env.TWILIO_SID;
// authToken = process.env.TWILIO_TOKEN;

// const client = require("twilio")(accountSid, authToken);

// const sendWhatsappMessage = async (data) => {
//   try {
//     const message = await client.messages.create({
//       body: data?.message,
//       from: `whatsapp:${process.env.TWILIO_NUMBER}`,
//       to: `whatsapp:${data?.user}`,
//       mediaUrl: data?.media,
//     });

//     console.log(message.sid);
//   } catch (error) {
//     console.log(error);
//   }
// };

const uploadWhatsappMedia = async (user) => {
  let data = new FormData();
  data.append("messaging_product", "whatsapp");
  data.append(
    "file",
    fs.createReadStream("vouchers/3b82827e-068b-4310-9b8b-fda8943b5ff2.pdf")
  );

  try {
    const response = await axios({
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.WHATSAPP_URL}/media`,
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        Cookie: "ps_l=0; ps_n=0",
        ...data.getHeaders(),
      },
      data: data,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const sendWhatsappMessageWithMedia = async (user) => {
  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: user?.recipient,
    type: "document",
    document: {
        id: user?.documentID,
      caption: user?.message,
      filename: user?.filename,
    },
  };

  // let data = {
  //   "messaging_product": "whatsapp",
  //   "to": "233560372844",
  //   "type": "template",
  //   "template": {
  //     "name": "receipt",
  //     "language": {
  //       "code": "en_US"
  //     }
  //   }
  // };

  try {
    const response = await axios({
      method: "post",
      url: `${process.env.WHATSAPP_URL}/messages`,
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
      data,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  // sendWhatsappMessage,
  uploadWhatsappMedia,
  sendWhatsappMessageWithMedia,
};
