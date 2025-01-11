const axios = require("axios");
const redisClient = require("./redisClient");

const BASE_URL = process.env.SMS_BASE_URL;

// SEND OTP SMS
const sendOTPSMS = async (message, telephoneNumber) => {

  try {

    const SMSType = await redisClient.get('sms');
    const sms = SMSType || 'arkesel';// default to hubtel if no type is set in redis


    const config = sms === 'hubtel' ? {
      method: "GET",
      url: `${BASE_URL}/send`,
      params: {
        From: "GPC",
        To: telephoneNumber,
        Content: message,
        clientid: process.env.SMS_CLIENT_ID,
        clientsecret: process.env.SMS_CLIENT_SECRET,
      }

    } : {
      method: 'post',
      url: process.env.ARKESEL_SMS_CLIENT,
      headers: {
        'api-key': process.env.ARKESEL_SMS_KEY
      },
      data: {
        "sender": "GPC",
        "message": message,
        "recipients": [telephoneNumber],
      }
    }

    const res = await axios(config);

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

    const SMSType = await redisClient.get('sms');
    const sms = SMSType || 'arkesel';



    const config = sms === 'hubtel' ? {
      method: "POST",
      url: `${BASE_URL}/send`,
      headers: {
        Authorization: `Basic ${process.env.SMS_API_KEY}`,
      },
      data: {
        From: "GPC",
        To: telephoneNumber,
        Content: message,
      }
    } : {
      method: 'POST',
      url: process.env.ARKESEL_SMS_CLIENT,
      headers: {
        'api-key': process.env.ARKESEL_SMS_KEY
      },
      data: {
        "sender": "GPC",
        "message": message,
        "recipients": [telephoneNumber],
      }
    }


    const res = await axios(config);

    return res?.data;
  } catch (error) {
    console.log(error);
    // throw error.message;
  }
};

const sendBatchSMS = async (message, telephoneNumbers) => {
  // if (process.env.NODE_ENV !== 'production') return true

  const SMSType = await redisClient.get('sms');
  const sms = SMSType || 'arkesel';


  try {
    // SEND SMS


    const config = sms === 'hubtel' ? {
      method: "POST",
      url: `${BASE_URL}/batch/simple/send`,
      headers: {
        Authorization: `Basic ${process.env.SMS_API_KEY}`,
      },
      data: {
        From: "GPC",
        Recipients: [...telephoneNumbers],
        Content: message,
      },
    } : {
      method: 'post',
      url: process.env.ARKESEL_SMS_CLIENT,
      headers: {
        'api-key': process.env.ARKESEL_SMS_KEY
      },
      data: {
        "sender": "GPC",
        "message": message,
        "recipients": [...telephoneNumbers],
      }
    }

    const res = await axios(config);

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
