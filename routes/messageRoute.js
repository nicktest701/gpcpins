const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const crypto = require("crypto");
const xhub = require("express-x-hub");
const sendEMail = require("../config/sendEmail");
const generateId = require("../config/generateId");
const { mailTextShell } = require("../config/mailText");

//model
const verifyAdmin = require("../middlewares/verifyAdmin");
const { verifyToken } = require("../middlewares/verifyToken");
const { rateLimit } = require("express-rate-limit");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

const knex = require("../db/knex");
const {
  uploadWhatsappMedia,
  sendWhatsappMessageWithMedia,
} = require("../config/sendWhatsapp");

// router.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const messages = await knex("messages")
      .select("_id", "body as message", "email as title", "createdAt")
      .orderBy("createdAt", "desc");
   

    res.status(200).json(messages);
  })
);

router.get(
  "/:id",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const message = await knex("messages")
      .select("_id", "body as message", "email as title", "createdAt")
      .where("_id", id)
      .limit(1);

    if (_.isEmpty(message)) res.status(200).json({});

    res.status(200).json(message[0]);
  })
);

router.post(
  "/",
  limit,
  asyncHandler(async (req, res) => {
    const newMessage = req.body;

    const message = await knex("messages").insert({
      _id: generateId(),
      ...newMessage,
    });

    if (_.isEmpty(message)) {
      return res.status(404).json("Message Failed");
    }

    const body = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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
      "Customer Care & Support"
    );

    res.status(201).json("Message sent!!!");
  })
);

router.post(
  "/hosting",
  limit,
  asyncHandler(async (req, res) => {
    const { name, email, phonenumber, description } = req.body;

    const body = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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
      "Request for hosting services"
    );

    res.status(201).json("Request received.We will contact you shortly!!!");
  })
);

router.post(
  "/organization",
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

    const body = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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
      "Request for Services"
    );

    res.status(201).json("Request received.We will contact you shortly!!!");
  })
);
router.post(
  "/tawk",
  limit,
  asyncHandler(async (req, res) => {
    if (!verifySignature(req.rawBody, req.headers["x-tawk-signature"])) {
      // verification failed
    }
    // verification successfull

    res.status(201).json("Request received.We will contact you shortly!!!");
  })
);

function verifySignature(body, signature) {
  const digest = crypto
    .createHmac("sha1", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return signature === digest;
}

router.post(
  "/whatsapp/media",
  asyncHandler(async (req, res) => {
    try {
      const data = await uploadWhatsappMedia();

      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json(error);
    }
  })
);

router.post(
  "/whatsapp/message",
  asyncHandler(async (req, res) => {
    try {
      const info = {
        documentID: "1354431841838442",
        recipient: "0560372844",
        message: "Thank you for your purchase",
        filename: "Vouchers",
      };
      const data = await sendWhatsappMessageWithMedia(info);

      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json(error);
    }
  })
);

router.get(
  "/whatsapp/callback/471045af9f65250818faa85d8d24912d7501d47114ff1841568267fed07f68dd",
  asyncHandler(async (req, res) => {
    if (
      req.query["hub.mode"] == "subscribe" &&
      req.query["hub.verify_token"] === process.env.WHATSAPP_TOKEN
    ) {
      res.send(req.query["hub.challenge"]);
    } else {
      res.sendStatus(400);
    }
  })
);

router.post(
  "/whatsapp/callback/471045af9f65250818faa85d8d24912d7501d47114ff1841568267fed07f68dd",
  asyncHandler(async (req, res) => {
  
    res.status(200).json('done');
  })
);

module.exports = router;
