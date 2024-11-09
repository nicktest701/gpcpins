const axios = require("axios");
const redisClient = require("./redisClient");

const BASE_URL = process.env.SMS_BASE_URL;

// SEND OTP SMS
const sendOTPSMS = async (message, telephoneNumber) => {

  try {

    let sms = 'hubtel';
    let res;
    const SMSType = await redisClient.get('sms');
    sms = SMSType || 'hubtel';// default to hubtel if no type is set in redis


    if (sms === 'hubtel') {
      const data = {
        From: "GPC",
        To: telephoneNumber,
        Content: message,
        clientid: process.env.SMS_CLIENT_ID,
        clientsecret: process.env.SMS_CLIENT_SECRET,
      };

      res = await axios({
        method: "GET",
        url: `${BASE_URL}/send`,
        params: data,
      });

    }

    if (sms === 'arkesel') {
      res = await axios({
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
      });
    }

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



    let sms = 'hubtel';
    let res;
    const SMSType = await redisClient.get('sms');
    sms = SMSType || 'hubtel';

    if (sms === 'hubtel') {

      res = await axios({
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
      });

    }

    if (sms === 'arkesel') {
      res = await axios({
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
      });
    }



    return res?.data;
  } catch (error) {
    console.log(error);
    // throw error.message;
  }
};
const sendBatchSMS = async (message, telephoneNumbers) => {
  // if (process.env.NODE_ENV !== 'production') return true

  let sms = 'hubtel';
  let res;
  const SMSType = await redisClient.get('sms');
  sms = SMSType || 'hubtel';


  try {
    // SEND SMS

    if (sms === 'hubtel') {

      res = await axios({
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
      });
    }

    if (sms === 'arkesel') {
      res = await axios({
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
      });
    }



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
