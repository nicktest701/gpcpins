const axios = require('axios');

const BASE_URL = process.env.SMS_BASE_URL;
const sendSMS = async (message, telephoneNumber) => {
  try {
    // SEND SMS

    const data = {
      From: 'GPC',
      To: telephoneNumber,
      Content: message,
    };

    const res = await axios({
      method: 'POST',
      url: `${BASE_URL}/send`,
      headers: {
        Authorization: `Basic ${process.env.SMS_API_KEY}`,
      },
      data: data,
    });

    return res.data;
  } catch (error) {
    console.log(error.message);
    // throw error.message;
  }
};
const sendBatchSMS = async (message, telephoneNumbers) => {
  try {
    // SEND SMS

    const data = {
      From: 'GPC',
      Recipients: [...telephoneNumbers],
      Content: message,
    };

    const res = await axios({
      method: 'POST',
      url: `${BASE_URL}/batch/simple/send`,
      headers: {
        Authorization: `Basic ${process.env.SMS_API_KEY}`,
      },
      data: data,
    });

    return res.data;
  } catch (error) {
    console.log(error.message);
    // throw error.message;
  }
};

module.exports = {
  sendSMS,
  sendBatchSMS,
};
