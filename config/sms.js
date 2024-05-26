const axios = require("axios");

const BASE_URL = process.env.SMS_BASE_URL;

const sendOTPSMS = async (message, telephoneNumber) => {
  //  if (process.env.NODE_ENV !== 'production') return true
  try {
    // SEND SMS

    const data = {
      From: "GPC",
      To: telephoneNumber,
      Content: message,
      clientid: process.env.SMS_CLIENT_ID,
      clientsecret: process.env.SMS_CLIENT_SECRET,
    };

    const res = await axios({
      method: "GET",
      url: `${BASE_URL}/send`,
      params: data,
    });

    return res.data;
  } catch (error) {
    console.log(error.message);
    // throw error.message;
  }
};
const sendSMS = async (message, telephoneNumber) => {
  // if (process.env.NODE_ENV !== 'production') return true
  try {
    // SEND SMS

    const data = {
      From: "GPC",
      To: telephoneNumber,
      Content: message,
    };

    const res = await axios({
      method: "POST",
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
  // if (process.env.NODE_ENV !== 'production') return true
  
  try {
    // SEND SMS

    const data = {
      From: "GPC",
      Recipients: [...telephoneNumbers],
      Content: message,
    };

    const res = await axios({
      method: "POST",
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
  sendOTPSMS,
  sendSMS,
  sendBatchSMS,
};
