const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const _ = require('lodash');
const sendEMail = require('../config/sendEmail');
const { randomUUID } = require('crypto');
const { mailTextShell } = require('../config/mailText');

//model
const verifyAdmin = require('../middlewares/verifyAdmin');
const { verifyToken } = require('../middlewares/verifyToken');
const { rateLimit } = require('express-rate-limit');

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many requests!. please try again later.',
});

const knex = require('../db/knex');

router.get(
  '/',
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const messages = await knex('messages')
      .select('_id', 'body as message', 'email as title', 'createdAt')
      .orderBy('createdAt', 'desc');
    // .limit(15);

    res.status(200).json(messages);
  })
);

router.get(
  '/:id',
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const message = await knex('messages')
      .select('_id', 'body as message', 'email as title', 'createdAt')
      .where('_id', id)
      .limit(1);

    if (_.isEmpty(message)) res.status(200).json({});

    res.status(200).json(message[0]);
  })
);

router.post(
  '/',
  limit,
  asyncHandler(async (req, res) => {
    const newMessage = req.body;

    const message = await knex('messages').insert({
      _id: randomUUID(),
      ...newMessage,
    });

    if (_.isEmpty(message)) {
      return res.status(404).json('Message Failed');
    }

    const body = `<div>
    <h1 style='text-transform:uppercase;'>Customer Care & Support</h1><br/>
    <div style='text-align:left;'>
    <p><strong>Name:</strong> ${newMessage.name}</p>
    <p><strong>Email:</strong> ${newMessage.email}</p><br/>
    <p>${newMessage.body}</p><br/>
    
    </div>
    </div>`;

    await sendEMail(
      process.env.MAIL_CLIENT_USER,
      mailTextShell(body),
      'Customer Care & Support'
    );

    res.status(201).json('Message sent!!!');
  })
);

router.post(
  '/hosting',
  limit,
  asyncHandler(async (req, res) => {
    const { name, email, phonenumber, description } = req.body;

    const body = `<div>
    <h1 style='text-transform:uppercase;'>hosting services</h1><br/>
    <div style='text-align:left;'>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone number:</strong> ${phonenumber}</p>
    <p><strong>Business Description:</strong></p><br/>
    <p>${description}</p><br/>
    </div>

    </div>`;

    await sendEMail(
      process.env.MAIL_CLIENT_USER,
      mailTextShell(body),
      'Request for hosting services'
    );

    res.status(201).json('Request received.We will contact you shortly!!!');
  })
);

router.post(
  '/organization',
  limit,
  asyncHandler(async (req, res) => {
    const {
      firstname,
      lastname,
      email,
      phonenumber,
      businessname,
      location,
      category,
      description,
    } = req.body;

    const body = `<div>
    <h1 style='text-transform:uppercase;'>Request For Services</h1><br/>
    <div style='text-align:left;'>
    <p><strong>First Name:</strong> ${firstname}</p>
    <p><strong>Last Name:</strong> ${lastname}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone number:</strong> ${phonenumber}</p><br/>
    
    <p><strong>Product:</strong> ${category?.name}</p><br/>
    
    <p><strong>Business Name:</strong> ${businessname}</p>
    <p><strong>Location:</strong> ${location}</p><br/>
    <p><strong>Business Description:</strong></p><br/>
    <p>${description}</p><br/>
    </div>
    
    </div>`;

    // 'nicktest701@gmail.com',
    await sendEMail(
      process.env.MAIL_CLIENT_USER,
      mailTextShell(body),
      'Request for Services'
    );

    res.status(201).json('Request received.We will contact you shortly!!!');
  })
);

module.exports = router;
