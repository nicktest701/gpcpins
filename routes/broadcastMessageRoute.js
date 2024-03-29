const router = require('express').Router();
const moment = require('moment');
const asyncHandler = require('express-async-handler');
const _ = require('lodash');
const { randomUUID } = require('crypto');
const sendEMail = require('../config/sendEmail');
const { mailTextShell } = require('../config/mailText');
const { sendBatchSMS } = require('../config/sms');

//model
const verifyAdmin = require('../middlewares/verifyAdmin');

//db
const knex = require('../db/knex');
const { isValidUUID2 } = require('../config/validation');
const { verifyToken } = require('../middlewares/verifyToken');

router.get(
  '/',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { role, createdAt } = req.user;

    const broadcastMessages = await knex('broadcast_messages')
      .select('*')
      .orderBy('createdAt', 'desc');

    if (role === process.env.USER_ID) {
      const filteredMessages = broadcastMessages.filter((message) =>
        moment(message.createdAt).isAfter(createdAt)
      );
      return res.status(200).json(filteredMessages);
    }

    res.status(200).json(broadcastMessages);
  })
);

router.get(
  '/:id',
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(400).json('Invalid Request!');
    }

    const broadcastMessage = await knex('broadcast_messages')
      .select('*')
      .where('_id', id)
      .limit(1);

    res.status(200).json(broadcastMessage[0]);
  })
);

router.post(
  '/',
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const newBroadcastMessage = req.body;

    const _id = randomUUID();
    const broadcastMessage = await knex('broadcast_messages').insert({
      _id,
      ...newBroadcastMessage,
    });

    if (_.isEmpty(broadcastMessage)) {
      return res.status(404).json('Message Failed. An error has occurred.');
    }

    const MAIL_TEXT = `<div>
    <h2>${newBroadcastMessage?.title}</h2>
    <div style='text-align:left;'>
    <p>Dear ${newBroadcastMessage.recipient},</p>
    
    <p>${newBroadcastMessage.message}</p>
    
    <p>-- Gab Powerful Team --</p>
    </div>
   
     </div>`;

    const MESSAGE_TEXT = `Dear ${newBroadcastMessage.recipient},
     ${newBroadcastMessage.message}`;

    let info = [];

    if (newBroadcastMessage?.recipient === 'Customers') {
      const electricityTransactions = await knex('prepaid_transactions').select(
        'email',
        'mobileNo as phonenumber'
      );
      const transactions = await knex('voucher_transactions').select(
        'email',
        'phonenumber'
      );

      const users = await knex('users').select('email', 'phonenumber');
      const employees = await knex('employees').select('email', 'phonenumber');

      info = [
        ...electricityTransactions,
        ...transactions,
        ...users,
        ...employees,
      ];
    }

    if (newBroadcastMessage?.recipient === 'Employees') {
      info = await knex('employees').select('email', 'phonenumber');
    }

    if (newBroadcastMessage?.type === 'Email') {
      const emails = _.uniqWith(_.compact(_.map(info, 'email')), _.isEqual);
      await sendEMail(emails, mailTextShell(MAIL_TEXT));
    }

    if (newBroadcastMessage?.type === 'SMS') {
      const numbers = _.uniqWith(
        _.compact(_.map(info, 'phonenumber')),
        _.isEqual
      );

      await sendBatchSMS(MESSAGE_TEXT, numbers);
    }

    await knex('broadcast_messages').where('_id', _id).update({ active: 1 });
    return res.status(201).json('Message sent!!!');
  })
);

router.put(
  '/',
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const newBroadcastMessage = req.message;

    const MAIL_TEXT = `<div>
    <h2>${newBroadcastMessage?.title}</h2>
    <div style='text-align:left;'>
    <p>Dear ${newBroadcastMessage.recipient},</p>
    
    <p>${newBroadcastMessage.message}</p>
    
    <p>-- Gab Powerful Team --</p>
    </div>
   
     </div>`;

    const MESSAGE_TEXT = `Dear ${newBroadcastMessage.recipient},
     ${newBroadcastMessage.message}`;

    let info = [];

    if (newBroadcastMessage?.recipient === 'Customers') {
      const electricityTransactions = await knex('prepaid_transactions').select(
        'email',
        'mobileNo as phonenumber'
      );
      const transactions = await knex('voucher_transactions').select(
        'email',
        'phonenumber'
      );

      const users = await knex('users').select('email', 'phonenumber');
      const employees = await knex('employees').select('email', 'phonenumber');

      info = [
        ...electricityTransactions,
        ...transactions,
        ...users,
        ...employees,
      ];
    }

    if (newBroadcastMessage?.recipient === 'Employees') {
      info = await knex('employees').select('email', 'phonenumber');
    }

    if (newBroadcastMessage?.type === 'Email') {
      const emails = _.uniqWith(_.compact(_.map(info, 'email')), _.isEqual);
      await sendEMail(emails, mailTextShell(MAIL_TEXT));
    }

    if (newBroadcastMessage?.type === 'SMS') {
      const numbers = _.uniqWith(
        _.compact(_.map(info, 'phonenumber')),
        _.isEqual
      );

      await sendBatchSMS(MESSAGE_TEXT, numbers);
    }

    return res.status(201).json('Message sent!!!');
  })
);

router.delete(
  '/',

  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (!isValidUUID2(id)) {
      return res.status(400).json('An unknown error has occurred!');
    }

    const broadcastMessage = await knex('broadcast_messages')
      .where('_id', id)
      .del();

    if (broadcastMessage !== 1) {
      return res.status(404).json('An error has occurred!');
    }
    res.status(200).json('Message removed.');
  })
);

module.exports = router;
