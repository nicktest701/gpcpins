const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const path = require("path")
const fs = require("fs")
const { randomBytes } = require("crypto");
const { otpGen, customOtpGen } = require("otp-gen-agent");
const { signMainToken, signMainRefreshToken } = require("../config/token");
const multer = require("multer");
const { rateLimit } = require("express-rate-limit");
// const sendMail = require("../config/sendEmail");
const {
  verifyToken,
  verifyRefreshToken,
} = require("../middlewares/verifyToken");
const { isValidUUID2 } = require("../config/validation");
const verifyAgent = require("../middlewares/verifyAgent");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { uploadPhoto } = require("../config/uploadFile");
const { mailTextShell } = require("../config/mailText");
const generateId = require("../config/generateId");
const { calculateTimeDifference } = require("../config/timeHelper");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 5 requests per windowMs
  message: "Too many requests! please try again later.",
});

//model
const { hasTokenExpired } = require("../config/dateConfigs");

const knex = require("../db/knex");
const {
  sendBundle,
  sendAirtime,
  getBundleList,
  accountBalance,
} = require("../config/sendMoney");
const { MTN, VODAFONE, AIRTELTIGO } = require("../config/bundleList");
const { getPhoneNumberInfo } = require("../config/PhoneCode");
const verifyAdminORAgent = require("../middlewares/verifyAdminORAgent");
const sendEMail = require("../config/sendEmail");
const generateRandomNumber = require("../config/generateRandomCode");
const { sendSMS, sendOTPSMS } = require("../config/sms");
const currencyFormatter = require("../config/currencyFormatter");
const redisClient = require("../config/redisClient");

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    const ext = file?.mimetype?.split("/")[1];

    cb(null, `${generateId()}.${ext}`);
  },
});

const Upload = multer({ storage: Storage });

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const agents = await knex("agent_business_view").select(
      "_id",
      "profile",
      "firstname",
      "lastname",
      "username",
      "name",
      "dob",
      "nid",
      "email",
      "phonenumber",
      "residence",
      "active",
      "createdAt",
      "updatedAt",
      "business_id",
      "business_name",
      "business_location",
      "business_description",
      "business_email",
      "business_phonenumber",

    );

    res.status(200).json(agents);
  })
);

router.get(
  "/auth",
  limit,
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const agent = await knex("agent_business_view")
      .select(
        "_id",
        "firstname",
        "lastname",
        'username',
        "name",
        "email",
        "role",
        "phonenumber",
        "profile",
        "business_name",
        "business_location",
        "business_description"
      )
      .where("_id", id)
      .limit(1).first();

    if (_.isEmpty(agent) || agent?.active === 0) {
      return res.sendStatus(204);
    }

    res.status(200).json({
      user: {
        id: agent?._id,
        firstname: agent?.firstname,
        lastname: agent?.lastname,
        username: agent?.username,
        name: agent?.name,
        email: agent?.email,
        role: agent?.role,
        phonenumber: agent?.phonenumber,
        profile: agent?.profile,
        //business
        businessName: agent?.business_name,
        businessLocation: agent?.business_location,
        businessDescription: agent?.business_description,
      },
    });
  })
);

// @GET Agent commission
router.get(
  "/commission/:id",
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const commissions = await knex("agent_commissions")
      .where("agent_id", id)
      .select("*");
    res.status(200).json(commissions);
  })
);

router.get(
  "/logs",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { startDate, endDate } = req.query;

    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    const logs = await knex.raw(
      `SELECT *
          FROM (
              SELECT *,DATE(createdAt) AS created_date
              FROM agent_activity_logs_view
          ) AS agent_activity_logs_view_  WHERE agentId=? AND isActive=1  AND created_date BETWEEN ? AND ? ORDER BY createdAt DESC;`,
      [id, sDate, eDate]
    );

    return res.status(200).json(logs[0]);
  })
);

// PUT Remove All Selected Logs
router.put(
  "/logs",
  verifyToken,
  asyncHandler(async (req, res) => {

    const { logs } = req.body;


    await knex('agent_activity_logs').where("_id", "IN", logs).update({
      isActive: false
    });
    return res.sendStatus(204);

  })
);



router.get(
  "/verify-identity",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user
    const { nid, dob } = req.query;


    const agent = await knex("agents").where({ _id: id })
      .select('nid', 'dob', knex.raw("DATE_FORMAT(dob,'%D %M %Y') as dobb"))
      .limit(1);


    if (_.isEmpty(agent[0])) {
      return res.status(400).json('Invalid Request!');
    }

    if (nid && agent[0]?.nid !== nid) {

      return res.status(400).json("Sorry.We couldn't find your National ID.");
    }

    if (dob) {
      const formattedDate = moment(dob).format('Do MMMM YYYY')

      if (agent[0]?.dobb !== formattedDate) {

        return res.status(400).json("Sorry.We couldn't find your date of birth.");
      }
    }


    return res.status(200).json('OK');
  })
);


router.get(
  "/phonenumber/token",
  limit,
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { code } = req.query;

    if (code) {
      const agentToken = await knex("verify_tokens")
        .select("_id", "code")
        .where({
          _id: id,
          code,
        })
        .limit(1);

      if (
        _.isEmpty(agentToken) ||
        Number(code) !== Number(agentToken[0]?.code)
      ) {
        return res.status(400).json("Invalid code.Try again");
      }
    } else {
      const agent = await knex("agents")
        .select("_id", "phonenumber", "active")
        .where("_id", id)
        .limit(1);

      if (_.isEmpty(agent) && !agent[0]?.phonenumber) {
        return res.status(400).json("Invalid Request");
      }

      const code = await otpGen();
      await knex("verify_tokens").upsert({
        _id: id,
        code,
      });
      console.log(code);

      await sendOTPSMS(`Please ignore this message if you did not request the OTP.Your verification code is ${code}.Don't share this code with anyone; Our employees will never ask for the code.If the code is incorrect or expired, you will not be able to proceed. Request a new code if necessary.`, agent[0]?.phonenumber);
    }

    res.sendStatus(201);
  })
);

router.get(
  "/:id",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const agent = await knex("agent_business_view")
      .select("*")
      .where("_id", id)
      .limit(1);

    if (_.isEmpty(agent)) res.status(200).json({});
    // console.log(agent)

    res.status(200).json(agent[0]);
  })
);

router.get(
  "/auth/token",
  limit,
  verifyRefreshToken,
  asyncHandler(async (req, res) => {
    const { id, active, role } = req.user;

    const agent = await knex("agent_business_view")
      .select(
        "_id",
        "firstname",
        "lastname",
        "username",
        "name",
        "email",
        "role",
        "phonenumber",
        "profile",
        "business_name",
        "business_location",
        "business_description"
      )
      .where("_id", id)
      .limit(1).first();

    const accessData = {
      id: agent?._id,
      name: agent?.name,
      firstname: agent?.firstname,
      lastname: agent?.lastname,
      username: agent?.username,
      email: agent?.email,
      phonenumber: agent?.phonenumber,
      role: agent?.role,
      profile: agent?.profile,
      active: agent?.active,
      //business
      businessName: agent?.business_name,
      businessLocation: agent?.business_location,
      businessDescription: agent?.business_description,
    };

    const accessToken = await signMainToken(accessData, "180d");


    res.status(200).json({

      accessToken,
    });

  })
);


// @POST Agent
router.post(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const transaction = await knex.transaction();
    try {
      const {
        business_name,
        business_location,
        business_description,
        business_email,
        business_phonenumber,
        ...rest
      } = req.body;


      const doesUserNameExists = await transaction("agents")
        .select("username", 'email')
        .where("email", rest?.email)
        .orWhere("phonenumber", rest?.phonenumber)
        .limit(1);

      if (!_.isEmpty(doesUserNameExists)) {
        return res
          .status(400)
          .json("Phone Number / Email Address already exists!");
      }



      const agent_id = generateId();
      const password = generateRandomNumber(10);
      const hashedPassword = await bcrypt.hash(password, 10);


      //Save Agent Personal Information
      await transaction("agents").insert({
        _id: agent_id,
        role: process.env.AGENT_ID,
        password: hashedPassword,
        active: 1,
        ...rest,
        username: `${rest.username}`,
        email: rest?.email?.toLowerCase()
      });

      //Save Agent Business Information
      await transaction("agent_businesses").insert({
        _id: generateId(),
        agent_id,
        name: business_name,
        location: business_location,
        description: business_description,
        email: business_email,
        phonenumber: business_phonenumber,
        active: 1,
      });

      //Create Agent Wallet Information
      const agent_key = await customOtpGen({ length: 4 });
      const hashedPin = await bcrypt.hash(agent_key, 10)

      await transaction("agent_wallets").insert({
        _id: generateId(),
        agent_id,
        agent_key: hashedPin,
      });

      //Create Agent Wallet Information

      await transaction("agent_commissions").insert([
        {
          agent_id,
          provider: "MTN",
          rate: 0.2,
        },
        {
          agent_id,
          provider: "Vodafone",
          rate: 0.25,
        },
        {
          agent_id,
          provider: "AirtelTigo",
          rate: 0.25,
        },
      ]);
      await transaction.commit();

      const message = `<div>
      <h1 style='text-transform:uppercase;'>Welcome to GAB POWERFUL CONSULT.</h1><br/>
      <div style='text-align:left;'>

      <p><strong>Dear ${rest?.firstname} ${rest?.lastname},</strong></p>

      <p>We are delighted to inform you that your application to become an agent at GAB POWERFUL CONSULT has been accepted! Congratulations and welcome aboard!</p>
      <p>As an agent at GAB POWERFUL CONSULT, you will have access to a wide range of resources, support, and opportunities for growth and success. We are committed to providing you with the tools and assistance you need to thrive in your new role.</p>
      <p>Please let us know if you have any questions or if there is anything we can do to assist you as you get started. We are here to help every step of the way.</p>
      <p>Once again, welcome to the team! We look forward to working with you and witnessing your contributions to our company's success.</p>
      

      <p><strong>Details:</strong></p><br/>
      <p><strong>Login URL:</strong> <a href='https://agent.gpcpins.com'>https://agent.gpcpins.com</a></p><br/>
      <p><strong>Username:</strong> ${rest?.phonenumber}</p><br/>
      <p><strong>Default Password:</strong> ${password}</p><br/>
      <p><strong>Email Address:</strong> ${rest?.email}</p><br/>
      <p><strong>Wallet PIN:</strong> ${agent_key}</p><br/>
      <p>We recommend you change your <b>Default Password</b> and <b>Wallet Pin</b> when you log into your account.</p>

      <p>Best regards,</p>
      <p>GAB Powerful Consult Team</p>
      </div>

      </div>`;

      const smsMessage = `We are delighted to inform you that your application to become an agent at GAB POWERFUL CONSULT has been accepted!
      Login URL:https://agent.gpcpins.com,Username: ${rest?.phonenumber},Default Password:${password},Email Address:${rest?.email},Wallet PIN: ${agent_key}.
     We recommend you change your Default Password and Wallet Pin when you log into your account.
      `

      //logs
      await knex("activity_logs").insert({
        employee_id: id,
        title: "Created new agent account!",
        severity: "info",
      });

      await sendEMail(
        rest?.email,
        mailTextShell(message),
        "Welcome to GAB POWERFUL CONSULT."
      );

      await sendSMS(smsMessage, rest?.phonenumber)

      res.sendStatus(201);
    } catch (error) {
      await transaction.rollback();

      res.status(500).json("An unknown error has occurred!");
    }
  })
);

//@POST Request to be an agent
router.post(
  "/request",
  limit,
  asyncHandler(async (req, res) => {
    const {
      business_name,
      business_location,
      business_description,
      business_email,
      business_phonenumber,
      ...rest
    } = req.body;

    try {
      const body = `<div>
      <h1 style='text-transform:uppercase;'> Application to Become an Agent</h1><br/>
      <div style='text-align:left;'>

      <p>I am writing to express my interest in joining GAB POWERFUL CONSULT as an agent.
    
      <p><strong>Personal details:</strong></p>
      <p><strong>Firstname:</strong> ${rest?.firstname}</p>
      <p><strong>Lastname:</strong> ${rest?.lastname}</p>
      <p><strong>Date of Birth:</strong> ${rest?.dob}</p>
      <p><strong>Email Address:</strong> ${rest?.email}</p>
      <p><strong>Telephone Number:</strong> ${rest?.phonenumber}</p>
      <p><strong>Address:</strong> ${rest?.residence}</p>
      <p><strong>ID</strong> ${rest?.nid}</p><br/>
      
      <p><strong>Business information:</strong></p>
      <p><strong>Business Name:</strong> ${business_name}</p>
      <p><strong>Business Address:</strong> ${business_location}</p>
      <p><strong>Description of Business:</strong> ${business_description}</p>
      <p><strong>Business Email Address:</strong> ${business_email || ""}</p>
      <p><strong>Business Telephone Line:</strong> ${business_phonenumber || ""
        }</p>

      <p>Thank you for considering my application. I look forward to the possibility of working together and contributing to the growth of GAB POWERFUL CONSULT.</p>
      </div>

      </div>`;

      await sendEMail(
        process.env.MAIL_CLIENT_USER,
        mailTextShell(body),
        " Application to Become an Agent"
      );

      const message = `<div>
      <h1 style='text-transform:uppercase;'> Application to Become an Agent at GAB POWERFUL CONSULT.</h1><br/>
      <div style='text-align:left;'>

      <p><strong>Dear ${rest?.firstname} ${rest?.lastname},</strong></p>

      <p>Thank you for reaching out and expressing your interest in joining our team. We appreciate the time you took to provide us with your personal and business information.</p><br/>
      <p>Your application is currently under review by our hiring team. We will carefully assess your qualifications and experience to determine if there is a suitable fit for you within our organization.</p><br/>
      <p>We will be in touch with you soon regarding the next steps of the application process. In the meantime, if you have any questions or need further information, please don't hesitate to contact us.</p><br/>
      <p>Thank you again for your interest in becoming an agent at GAB POWERFUL CONSULT. We look forward to potentially welcoming you to our team.</p><br/>
      
      <p>Best regards,</p>
      <p>GAB Powerful Consult</p>
      </div>

      </div>`;

      await sendEMail(
        rest?.email,
        mailTextShell(message),
        " Application to Become an Agent at GAB POWERFUL CONSULT."
      );

      await sendSMS(
        `Hi ${rest?.firstname} ${rest?.lastname},
Thank you for your application to become an agent at GAB POWERFUL CONSULT. We've received your details and are currently reviewing your application. We'll be in touch soon with further updates. If you have any questions, feel free to reach out.

Best regards,
GAB Powerful Consult      
        `,
        rest?.phonenumber
      );
      res.status(200).json("Request Sent!");
    } catch (error) {
      res.status(500).json("An unknown error has occurred");
    }
  })
);

// @POST Agent commission
router.post(
  "/commission",
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { rate, agent_id, provider } = req.body;
    await knex("agent_commissions")
      .where({
        agent_id,
        provider,
      })
      .update({
        rate,
      });
    res.status(200).json("Commission Updated");
  })
);

//@GET agent by email
router.post(
  "/login",
  limit,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;


    const agentExists = await knex("agents")
      .select("email", 'phonenumber', "password", "active", 'isEnabled')
      .where("email", email)
      .orWhere('phonenumber', email)
      .limit(1).first();


    if (_.isEmpty(agentExists)) {
      return res.status(400).json("User does not exist!");
    }

    const passwordIsValid = await bcrypt.compare(password, agentExists?.password);

    if (!passwordIsValid) {
      return res.status(400).json("Invalid login credentials!");
    }


    if (Boolean(agentExists?.active) === false || Boolean(agentExists?.isEnabled) === false) {
      return res.status(400).json("Account disabled! Please try again later.");
    }

    //
    const agent = await knex("agent_business_view")
      .select("*")
      .where("email", agentExists?.email).first();

    if (_.isEmpty(agent)) {
      return res.status(401).json("Authentication Failed!");
    }

    const accessData = {
      id: agent?._id,
      name: agent?.name,
      firstname: agent?.firstname,
      lastname: agent?.lastname,
      username: agent?.username,
      email: agent?.email,
      phonenumber: agent?.phonenumber,
      role: agent?.role,
      profile: agent?.profile,
      active: agent?.active,
      //business
      businessName: agent?.business_name,
      businessLocation: agent?.business_location,
      businessDescription: agent?.business_description,
    };

    const updatedAgent = {
      id: agent?._id,
      role: agent?.role,
      active: agent?.active,
    };

    const accessToken = await signMainToken(accessData, "180d");
    const refreshToken = signMainRefreshToken(updatedAgent, "600d");

    // res.cookie("_SSUID_kyfc", accessToken, {
    //   maxAge: 1 * 60 * 60 * 1000,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    // res.cookie("_SSUID_X_ayd", refreshToken, {
    //   maxAge: 90 * 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await knex("agents").where("_id", agent?._id).update({
      token: hashedToken,
    });

    //logs
    await knex("agent_activity_logs").insert({
      agent_id: agent?._id,
      title: "Logged into account.",
      severity: "info",
    });



    return res.status(201).json({
      refreshToken,
      accessToken,
    });




    ///

    // const token = await otpGen();

    // await knex("tokens").insert({
    //   _id: generateId(),
    //   token,
    //   email: agent[0]?.email,
    // });

    // const message = `
    //     <div style="width:100%;max-width:500px;margin-inline:auto;">

    //     <p>Your verification code is</p>
    //     <h1>${token}</h1>

    //     <p>-- Gab Powerful Team --</p>
    // </div>
    //     `;

    // if (process.env.NODE_ENV !== "production") {
    //   console.log(token);
    // }

    // try {
    //   await sendMail(agent[0]?.email, mailTextShell(message));
    // } catch (error) {
    //   await knex("tokens").where("email", agent[0]?.email).del();

    //   return res.status(500).json("An error has occurred!");
    // }

    // res.sendStatus(201);



  })
);

router.post(
  "/verify",
  limit,
  asyncHandler(async (req, res) => {
    const { id, token } = req.body;

    if (!id || !isValidUUID2(id) || !token) {
      return res.status(400).json("An unknown error has occurred!");
    }

    const agentToken = await knex("tokens")
      .where({
        _id: id,
        token,
      })
      .select("*");

    if (_.isEmpty(agentToken)) {
      return res.status(400).json("An unknown error has occurred!");
    }

    if (hasTokenExpired(agentToken[0]?.createdAt)) {
      return res.status(400).json("Sorry! Your link has expired.");
    }

    await knex("agents")
      .where("email", agentToken[0]?.email)
      .update({ active: 1 });

    const agent = await knex("agents")
      .select("_id")
      .where({
        email: agentToken[0]?.email,
      })
      .limit(1);

    res.status(201).json({
      user: {
        id: agent[0]?._id,
      },
    });
  })
);

//Verify OTP
router.post(
  "/verify-otp",
  limit,
  asyncHandler(async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json("Invalid Code");
    }

    const agentToken = await knex("tokens")
      .select("*")
      .where({
        email,
        token,
      })
      .limit(1);

    if (_.isEmpty(agentToken)) {
      return res.status(400).json("Invalid Code");
    }

    if (hasTokenExpired(agentToken[0]?.createdAt)) {
      return res.status(400).json("Sorry! Your code has expired.");
    }

    await knex("agents")
      .where("email", agentToken[0]?.email)
      .update({ active: 1 });

    const agent = await knex("agent_business_view")
      .select("*")
      .where("email", agentToken[0]?.email);

    if (_.isEmpty(agent)) {
      return res.status(401).json("Authentication Failed!");
    }

    const accessData = {
      id: agent[0]?._id,
      name: agent[0]?.name,
      firstname: agent[0]?.firstname,
      lastname: agent[0]?.lastname,
      username: agent[0]?.username,
      email: agent[0]?.email,
      phonenumber: agent[0]?.phonenumber,
      role: agent[0]?.role,
      profile: agent[0]?.profile,
      active: agent[0]?.active,
      //business
      businessName: agent[0]?.business_name,
      businessLocation: agent[0]?.business_location,
      businessDescription: agent[0]?.business_description,
    };

    const updatedAgent = {
      id: agent[0]?._id,
      role: agent[0]?.role,
      active: agent[0]?.active,
    };

    const accessToken = await signMainToken(accessData, "180d");
    const refreshToken = signMainRefreshToken(updatedAgent, "600d");

    // res.cookie("_SSUID_kyfc", accessToken, {
    //   maxAge: 1 * 60 * 60 * 1000,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    // res.cookie("_SSUID_X_ayd", refreshToken, {
    //   maxAge: 90 * 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await knex("agents").where("_id", agent[0]?._id).update({
      token: hashedToken,
    });

    //logs
    await knex("agent_activity_logs").insert({
      agent_id: agent[0]?._id,
      title: "Logged into account.",
      severity: "info",
    });


    return res.status(201).json({
      refreshToken,
      accessToken,
    });

  })
);

router.post(
  "/logout",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id, jti } = req.user;
    // res.cookie("_SSUID_kyfc", "", {
    //   httpOnly: true,
    //   path: "/",
    //   expires: new Date(0),
    // });

    // res.cookie("_SSUID_X_ayd", "", {
    //   httpOnly: true,
    //   path: "/",
    //   expires: new Date(0),
    // });

    // res.clearCookie("_SSUID_kyfc");
    // res.clearCookie("_SSUID_X_ayd");

    //logs
    await knex("agent_activity_logs").insert({
      agent_id: id,
      title: "Logged out of account.",
      severity: "info",
    });
    await redisClient.del(`user:${jti}`)
    req.user = null;

    res.sendStatus(204);
  })
);

router.put(
  "/",
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id, role } = req.user;
    const { _id, agent_id, ...rest } = req.body;

    if (agent_id) {
      const updatedAgent = await knex("agent_businesses")
        .where("agent_id", agent_id)
        .update({
          name: rest?.business_name,
          location: rest?.business_location,
          description: rest?.business_description,
          email: rest?.business_email,
          phonenumber: rest?.business_phonenumber,
        });

      if (updatedAgent !== 1) {
        return res.status(400).json("Error updating agent information.");
      }

      return res.status(201).json("Changes Saved!");
    }

    const updatedAgent = await knex("agents").where("_id", _id).update(rest);

    if (updatedAgent !== 1) {
      return res.status(400).json("Error updating agent information.");
    }

    if (role === process.env.ADMIN_ID) {
      //logs
      await knex("activity_logs").insert({
        employee_id: id,
        title: "Modified an agent account.",
        severity: "info",
      });

      return res.status(201).json("Changes Saved!");
    }

    const agent = await knex("agent_business_view")
      .select(
        "_id",
        "firstname",
        "lastname",
        "username",
        "name",
        "email",
        "role",
        "phonenumber",
        "profile",
        "business_name",
        "business_location",
        "business_description"
      )
      .where("_id", _id);
    const accessData = {
      id: agent[0]?._id,
      firstname: agent[0]?.firstname,
      lastname: agent[0]?.lastname,
      username: agent[0]?.username,
      name: agent[0]?.name,
      email: agent[0]?.email,
      phonenumber: agent[0]?.phonenumber,
      role: agent[0]?.role,
      profile: agent[0]?.profile,
      //business
      businessName: agent[0]?.business_name,
      businessLocation: agent[0]?.business_location,
      businessDescription: agent[0]?.business_description,
    };

    const accessToken = await signMainToken(accessData, "180d");

    //logs
    await knex("agent_activity_logs").insert({
      agent_id: agent[0]?._id,
      title: "Modified your account details.",
      severity: "info",
    });

    const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333333;">Important: Profile Update Notification</h2>
    <p>Dear ${accessData?.name || "Customer"},</p>
    <p> Your profile information has been updated.</p>
    <p>For security purposes, we wanted to ensure that you are aware of these changes. If you did not make these adjustments yourself or if you believe your account may have been compromised, please take immediate action by contacting our support team at <a href='mailto:info@gpcpins.com'>info@gpcpins</a>.</p>
    <p>If you have made these changes intentionally, please disregard this message.</p>
    <p>Thank you for your attention to this matter.</p>

    <p>Best regards,</p>
    <p>Gab Powerful Team<br>
</div>
    `;

    await sendEMail(accessData?.email, message, "Profile Update Notification");
    const smsMessage = `Your profile information has been updated.For security purposes, we wanted to ensure that you are aware of these changes. If you did not make these adjustments yourself or if you believe your account may have been compromised, please take immediate action by contacting our support team.If you have made these changes intentionally, please disregard this message.`
    await sendOTPSMS(smsMessage, agent[0]?.phonenumber);

    res.status(201).json({
      user: accessToken,
    });
  })
);

router.put(
  "/password",
  limit,
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id: ID, role } = req.user;
    const { id, oldPassword, password } = req.body;



    if (role === process.env.AGENT_ID) {

      const agentPassword = await knex('agents').select('password').where('_id', id).limit(1);

      const passwordIsValid = await bcrypt.compare(
        oldPassword,
        agentPassword[0]?.password
      );


      if (!passwordIsValid) {
        return res.status(400).json("Invalid Password!");
      }
    }




    const hashedPassword = await bcrypt.hash(password, 10);

    const modifiedAgent = await knex("agents").where("_id", id).update({
      password: hashedPassword,
    });

    if (modifiedAgent !== 1) {
      return res.status(404).json("Error updating agent information.");
    }

    if (role === process.env.ADMIN_ID) {
      //logs
      await knex("activity_logs").insert({
        employee_id: ID,
        title: "Modified an agent password.",
        severity: "info",
      });

      return res.status(200).json("Changes Saved");
    }



    //logs
    await knex("agent_activity_logs").insert({
      agent_id: id,
      title: "Modified your account password.",
      severity: "info",
    });

    return res.status(200).json("Changes Saved");
  })
);

router.put(
  "/profile",
  verifyToken,
  Upload.single("profile"),
  asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!req.file) {
      return res.status(404).json("No Image was found!");
    }

    let url = req.file?.filename;
    url = await uploadPhoto(req.file);

    const agent = await knex("agents")
      .where("_id", id)
      .update({ profile: url });

    if (agent !== 1) {
      return res.status(404).json("An unknown error has occurred!");
    }
    //logs
    await knex("agent_activity_logs").insert({
      agent_id: id,
      title: "Modified your account details.",
      severity: "info",
    });

    res.status(201).json(url);
  })
);

//Enable or Disable Agent Account
router.put(
  "/account",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id, active } = req.body;


    const updatedAgent = await knex("agents")
      .where("_id", id)
      .update({ active: active, isEnabled: active });

    if (updatedAgent !== 1) {
      return res.status(400).json("Error updating agent info");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: `${Boolean(active) === true
        ? "Activated an agent account!"
        : "Disabled an agent account!"
        }`,
      severity: "warning",
    });

    res
      .status(201)
      .json(
        Boolean(active) === true ? "Account enabled!" : "Account disabled!"
      );
  })
);

//@DELETE student
router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(401).json("Invalid Request!");
    }

    const agent = await knex("agents").where("_id", id).del();

    if (!agent) {
      return res.status(500).json("Invalid Request!");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: "Deleted an agent account!",
      severity: "error",
    });

    res.status(200).json("Agent Account Removed!");
  })
);
//////////////////...............Business............////////////

router.get(
  "/business/:id",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const business = await knex("agent_businesses")
      .select("*")
      .where("agent_id", id)
      .limit(1);

    if (_.isEmpty(business)) res.status(200).json({});

    res.status(200).json(business[0]);
  })
);

router.put(
  "/business",
  limit,
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { _id, ...newBusiness } = req.body;

    const business = await knex("agent_businesses")
      .where("_id", _id)
      .update({
        ...newBusiness,
      });

    if (business !== 1) {
      return res.status(404).json("Changes Failed");
    }

    //logs
    await knex("agent_activity_logs").insert({
      agent_id: id,
      title: "Modified your account details.",
      severity: "info",
    });

    res.status(201).json("Changes Saved!!!");
  })
);

////////////////.............Wallet..................///////////

router.get(
  "/top-up/wallet",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const wallet = await knex("agent_wallets")
      .where("agent_id", id)
      .select("amount")
      .limit(1);

    if (_.isEmpty(wallet)) {
      res.status(200).json(0);
    }

    res.status(200).json(wallet[0]?.amount);
  })
);



//Get Wallet Balance
router.get(
  "/wallet/status",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { action } = req.query;

    if (action && action === "disable") {
      await knex("agent_wallets").where("agent_id", id).update({ active: 0 });
      return res.sendStatus(204);
    }

    const wallet = await knex("agent_wallets")
      .where("agent_id", id)
      .select("active", "createdAt", "updatedAt")
      .limit(1);

    if (_.isEmpty(wallet) || Boolean(wallet[0]?.active) === false) {
      const now = moment();
      const upTime = moment(new Date(wallet[0]?.updatedAt));
      const timeLeft = calculateTimeDifference(now, upTime);

      if (timeLeft.value <= 0) {
        await knex("agent_wallets").where("agent_id", id).update({
          active: 1,
        });

        return res.status(200).json({
          active: true,
        });
      }

      return res.status(200).json({
        active: false,
        timeOut:
          timeLeft?.type === "hours"
            ? `${timeLeft.value} hours`
            : `${timeLeft.value} minutes`,
      });
    }

    return res.status(200).json({
      active: true,
    });
  })
);


router.get(
  "/wallet/transactions",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { startDate, endDate } = req.query;

    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    const transactions = await knex.raw(
      `SELECT *
          FROM (
              SELECT _id,agent_id,amount,type,comment,status,createdAt,DATE(createdAt) AS purchaseDate
              FROM agent_wallet_transactions
          ) AS agent_wallet_transactions_ 
          WHERE agent_id=? AND purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
      [id, sDate, eDate]
    );

    res.status(200).json(transactions[0]);
  })
);

// /airtime/template
router.get(
  "/airtime/template",
  verifyToken,
  asyncHandler(async (req, res) => {
    const filePath = path.join(process.cwd(), "/views/", `template.xlsx`);

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      return res.sendStatus(204);

    }
  })
);

//update wallet pin
router.put(
  "/wallet",
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id, email } = req.user;
    const { _id, pin, isAdmin, agentEmail } = req.body;

    const agentId = isAdmin ? _id : id;
    const emailAddress = isAdmin ? agentEmail : email;

    const hashedPin = await bcrypt.hash(pin, 10)

    const wallet = await knex("agent_wallets")
      .where("agent_id", agentId)
      .update("agent_key", hashedPin);

    if (wallet !== 1) {
      return res
        .status(400)
        .json("Error updating agent pin! Please try again later.");
    }

    if (isAdmin) {
      //logs
      await knex("activity_logs").insert({
        employee_id: id,
        title: "Updated an Agent Wallet pin.",
        severity: "info",
      });
    } else {
      //logs
      await knex("agent_activity_logs").insert({
        agent_id: agentId,
        title: "Updated Wallet pin.",
        severity: "info",
      });
    }

    const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333333;">Important: Profile Update Notification</h2>
    <p>Dear Customer ,</p>
    <p> Your profile information has been updated.</p>
    <p>For security purposes, we wanted to ensure that you are aware of these changes. If you did not make these adjustments yourself or if you believe your account may have been compromised, please take immediate action by contacting our support team at <a href='mailto:info@gpcpins.com'>info@gpcpins</a>.</p>
    <p>If you have made these changes intentionally, please disregard this message.</p>
    <p>Thank you for your attention to this matter.</p>

    <p>Best regards,</p>
    <p>Gab Powerful Team<br>
</div>
    `;

    await sendEMail(emailAddress, message, "Profile Update Notification");

    res.status(200).json("Wallet Pin Changed!");
  })
);

//Top up wallet request
router.post(
  "/top-up/request",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const agent = await knex("agents")
      .where("_id", id)
      .select(
        "phonenumber",
        "email",
        knex.raw("CONCAT(firstname,'',lastname) as name")
      )
      .limit(1);

    try {
      const body = `<div>
      <h1 style='text-transform:uppercase;'>Wallet Top Up Request</h1><br/>
      <div style='text-align:left;'>

      <p>A request has been placed by <strong>${agent[0]?.name}</strong> to top up wallet balance.
      <p><strong>Name:</strong> ${agent[0]?.name}</p>
      <p><strong>Email:</strong> ${agent[0]?.email}</p><br/>
      <p><strong>Telephone Number:</strong> ${agent[0]?.phonenumber}</p><br/>
      <p><strong>Top Up Amount:</strong> ${req?.body?.amount}</p><br/>
       
      </div>
      </div>`;

      await sendEMail(
        process.env.MAIL_CLIENT_USER,
        mailTextShell(body),
        "Wallet Top Up Request"
      );

      await sendOTPSMS(`Your request has been received.We'll get back to you shortly.`, agent[0]?.phonenumber);

      //logs
      await knex("agent_activity_logs").insert({
        agent_id: id,
        title: "Requested Wallet Top Up.",
        severity: "info",
      });

      res.status(200).json("Request Sent!");
    } catch (error) {
      res.status(500).json("An unknown error has occurred");
    }
  })
);

router.get(
  "/top-up/transaction",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { startDate, endDate, type } = req.query;

    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    const transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,
agent_id,
reference,
type,
recipient,
provider,
info,
commission,
amount as amt,
totalAmount as amount,
year,
active,
status,
createdAt,
updatedAt ,DATE(createdAt) AS purchaseDate
            FROM agent_transactions
        ) AS agent_transactions_ 
            WHERE agent_id=? AND type=? AND purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
      [id, type, sDate, eDate]
    );

    const transaction = transactions[0].map(({ info, ...rest }) => {
      return {
        ...rest,
        info: JSON.parse(info),
      };
    });

    res.status(200).json(transaction);
  })
);


router.delete(
  "/top-up/transaction",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.query;

    await knex("agent_transactions").where("_id", id).del();

    res.sendStatus(204);
  })
);



//Check Transaction Status
router.get(
  "/top-up/status",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const reference_id = req.query?.reference;

    try {
      const response = await topUpStatus(reference_id);

      res.status(200).json(response);
    } catch (error) {
      res.status(401).json(error?.response?.data);
    }
  })
);

//Get List of all bundles
router.get(
  "/top-up/bundlelist",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const network = req.query?.network;
    let response = [];
    try {
      if (process.env.NODE_ENV === "production") {
        response = await getBundleList(network);
      } else {
        if (network === "4") {
          response = MTN;
        }
        if (network === "6") {
          response = VODAFONE;
        }
        if (network === "1") {
          response = AIRTELTIGO;
        }
      }

      const bundles = response?.bundles?.map((bundle) => {
        const { meta, network, ...rest } = bundle;
        if (Number(rest.price) === 0) return;
        return rest;
      });

      res.status(200).json(_.compact(bundles));
    } catch (error) {
      res.status(401).json("An unknown error has occurred");
    }
  })
);

//Send bundle to recipient
// router.post(
//   "/top-up/bundle",
//   verifyToken,
//   verifyAgent,
//   asyncHandler(async (req, res) => {
//     const info = req.body;

//     try {
//       const response = await sendBundle(info);

//       res.status(200).json(response);
//     } catch (error) {
//       res.status(401).json("An unknown error has occurred");
//     }
//   })
// );

//Send airtime to recipient
router.post(
  "/top-up/airtime",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const info = req.body;

    const balanceResponse = await accountBalance();
    const balance = Number(balanceResponse?.balance);
    const amount = Number(info?.amount);


    if (balance < amount) {
      await insufficientBalanceWarning(balance);
      return res.status(401).json("Service Not Available. Try again later.");
    }

    const transx = await knex.transaction();
    const [agentWallet] = await transx("agent_wallets")
      .select("_id", "agent_key", "amount", "active")
      .where({ agent_id: id })
      .limit(1);

    if (!agentWallet || !(await bcrypt.compare(info?.token, agentWallet.agent_key))) {
      await transx.rollback();
      return res.status(401).json("Invalid pin!");
    }

    if (Number(agentWallet.amount) < amount) {
      await transx("agent_notifications").insert({
        _id: generateId(),
        agent_id: id,
        type: "airtime",
        title: "Airtime Transfer Failed!",
        message: "Insufficient wallet balance to complete transaction!",
      });
      await transx.commit();
      return res.status(401).json("Insufficient wallet balance to complete transaction!");
    }

    const transaction_reference = randomBytes(24).toString("hex");
    const airtimeInfo = {
      recipient: info?.recipient,
      amount,
      network: info?.network === "MTN" ? 4 : info?.network === "Vodafone" ? 6 : info?.network === "AirtelTigo" ? 1 : 0,
      transaction_reference,
    };

    const [commissionData] = await transx("agent_commissions")
      .select("rate")
      .where({ agent_id: id, provider: info?.network })
      .limit(1);

    if (!commissionData) {
      await transx.rollback();
      return res.status(400).json("Invalid Request");
    }

    const commission = (commissionData.rate / 100) * amount;
    const payableAmount = amount - commission;

    const transactionInfo = {
      _id: generateId(),
      agent_id: id,
      reference: transaction_reference,
      type: "airtime",
      recipient: info?.recipient,
      provider: info?.network,
      info: JSON.stringify({ recipient: info?.recipient, ref: transaction_reference, amount: payableAmount }),
      amount: payableAmount,
      commission,
      totalAmount: amount,
    };

    await transx("agent_wallets").where("agent_id", id).decrement({ amount: payableAmount });
    await transx.commit();

    const tranx = await knex.transaction();

    try {
      const response = await sendAirtime(airtimeInfo);
      const statusCode = response["status-code"];
      const isSuccess = ["00", "09"].includes(statusCode);

      await tranx("agent_transactions").insert({
        ...transactionInfo,
        status: isSuccess ? "completed" : "failed",
      });

      if (isSuccess) {
        if (Number(response?.balance_after) < 1000) {
          await insufficientBalanceWarning(response?.balance_after);
        }

        await tranx("agent_notifications").insert({
          _id: generateId(),
          agent_id: id,
          type: "airtime",
          title: "Airtime Transfer",
          message: `You have successfully recharged ${airtimeInfo.recipient} with ${currencyFormatter(
            airtimeInfo.amount
          )} of airtime. Commission: GHS ${currencyFormatter(commission)}.`,
        });
      } else {
        await tranx("agent_notifications").insert({
          _id: generateId(),
          agent_id: id,
          type: "airtime",
          title: "Airtime Transfer Failed!",
          message: `Your airtime transfer of ${currencyFormatter(
            airtimeInfo.amount
          )} to ${airtimeInfo.recipient} failed. Please try again later.`,
        });
      }

      await tranx("agent_activity_logs").insert({
        agent_id: id,
        title: "Transferred airtime to customer.",
        severity: "info",
      });

      await tranx.commit();
      return res.status(200).json(isSuccess ? "Airtime transfer was successful!" : "Airtime transfer failed!");
    } catch (error) {
      await tranx("agent_transactions").insert({
        ...transactionInfo,
        status: "failed",
      });

      await tranx("agent_notifications").insert({
        _id: generateId(),
        agent_id: id,
        type: "airtime",
        title: "Airtime Transfer Failed!",
        message: `Your airtime transfer of ${currencyFormatter(
          airtimeInfo.amount
        )} to ${airtimeInfo.recipient} failed. Please try again later.`,
      });

      await tranx.commit();
      return res.status(401).json("Transaction failed! An error has occurred.");
    }
  })
);


//Send airtime to recipient
router.post(
  "/top-up/bulk/airtime",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { content, token } = req.body;
    const { id } = req.user;

    // Step 1: Calculate total amount to be charged from all recipients
    const totalAmount = _.sumBy(content, (info) => Number(info?.amount));

    // Step 2: Check platform account balance
    const response = await accountBalance();
    if (Number(response?.balance) < Number(totalAmount)) {
      await insufficientBalanceWarning(response?.balance);
      return res.status(401).json("Service Not Available. Try again later.");
    }

    const transx = await knex.transaction();

    try {
      // Step 3: Fetch agent wallet and validate PIN
      const agentWallet = await transx("agent_wallets")
        .select("_id", "agent_key", "amount", "active")
        .where({ agent_id: id })
        .limit(1);

      if (
        !agentWallet.length ||
        !(await bcrypt.compare(token, agentWallet[0].agent_key))
      ) {
        await transx.rollback();
        return res.status(401).json("Invalid PIN!");
      }

      // Step 4: Check if agent has enough balance
      if (Number(agentWallet[0].amount) < Number(totalAmount)) {
        await transx("agent_notifications").insert({
          _id: generateId(),
          agent_id: id,
          type: "airtime",
          title: "Airtime Transfer Failed!",
          message: "Insufficient wallet balance to complete transaction!",
        });
        await transx.commit();
        return res
          .status(401)
          .json("Insufficient wallet balance to complete transaction!");
      }

      // Step 5: Prepare transactions for each recipient
      const transactions = await Promise.all(
        content.map(async (info) => {
          const transaction_reference = randomBytes(24).toString("hex");
          const { code, providerName, phoneNumber } = getPhoneNumberInfo(
            info?.recipient.toString()
          );

          const airtimeInfo = {
            recipient: info.recipient,
            amount: Number(info.amount),
            network: code,
            transaction_reference,
          };

          const commissionRate = await transx("agent_commissions")
            .select("rate")
            .where({ agent_id: id, provider: providerName })
            .limit(1);

          // if (!commissionRate.length) {
          //   throw new Error("Invalid commission data");
          // }

          const commissionAmount =
            ((commissionRate[0]?.rate || 0.20) / 100) * airtimeInfo.amount;

          const payableAmount = airtimeInfo.amount - commissionAmount;

          const transactionInfo = {
            _id: generateId(),
            agent_id: id,
            reference: transaction_reference,
            type: "airtime",
            recipient: phoneNumber,
            provider: providerName,
            info: JSON.stringify({
              recipient: info.recipient,
              ref: transaction_reference,
              amount: payableAmount,
            }),
            amount: payableAmount,
            commission: commissionAmount,
            totalAmount: airtimeInfo.amount,
          };

          return { transactionInfo, airtimeInfo, payableAmount };
        })
      );

      const totalPayable = _.sumBy(transactions, "payableAmount");

      // Step 6: Deduct total payable amount from agent's wallet
      await transx("agent_wallets")
        .where("agent_id", id)
        .decrement({ amount: totalPayable });

      await transx.commit(); // Wallet deduction done, move to send airtime

      // Step 7: Process each airtime transaction
      const airtimeTx = await knex.transaction();

      await Promise.all(
        transactions.map(async ({ transactionInfo, airtimeInfo }) => {
          try {
            const response = await sendAirtime(airtimeInfo);
            const isSuccess = ["00", "09"].includes(response["status-code"]);

            await airtimeTx("agent_transactions").insert({
              ...transactionInfo,
              status: isSuccess ? "completed" : "failed",
            });

            await airtimeTx("agent_notifications").insert({
              _id: generateId(),
              agent_id: id,
              type: "airtime",
              title: isSuccess ? "Airtime Transfer" : "Airtime Transfer Failed!",
              message: isSuccess
                ? `You have successfully recharged ${airtimeInfo.recipient} with ${currencyFormatter(
                  airtimeInfo.amount
                )} of airtime. Commission earned: GHS ${transactionInfo.commission}.`
                : `Your airtime transfer of ${currencyFormatter(
                  airtimeInfo.amount
                )} to ${airtimeInfo.recipient} failed. Please try again later.`,
            });

            return isSuccess;
          } catch (err) {
            // Fallback for unexpected errors
            await airtimeTx("agent_transactions").insert({
              ...transactionInfo,
              status: "failed",
            });

            await airtimeTx("agent_notifications").insert({
              _id: generateId(),
              agent_id: id,
              type: "airtime",
              title: "Airtime Transfer Failed!",
              message: `Your airtime transfer of ${currencyFormatter(
                airtimeInfo.amount
              )} to ${airtimeInfo.recipient} failed. Please try again later.`,
            });

            return false;
          }
        })
      );

      // Step 8: Log activity
      await airtimeTx("agent_activity_logs").insert({
        agent_id: id,
        title: "Transferred bulk airtime to Customers.",
        severity: "info",
      });

      await airtimeTx.commit();

      return res.status(200).json("Airtime transfer was successful!");
    } catch (err) {
      console.log("2", err)
      await transx.rollback();
      // await transx.commit();
      // await airtimeTx.commit();
      return res
        .status(500)
        .json("Transaction failed! An error has occurred.");
    }
  })
);

//Send bundle to recipient
router.post(
  "/top-up/bundle",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { bundle, recipient, token, network } = req.body;
    const { id } = req.user;


    // Step 1: Check system balance
    const systemBalance = await accountBalance();

    const systemAvailable = Number(systemBalance?.balance || 0);
    const bundlePrice = Number(bundle?.price || 0);

    if (systemAvailable < bundlePrice) {
      await insufficientBalanceWarning(systemAvailable);
      return res.status(401).json("Service Not Available. Try again later.");
    }

    // Step 2: Verify agent wallet and pin
    const transx = await knex.transaction();

    const [agentWallet] = await transx("agent_wallets")
      .select("_id", "agent_key", "amount", "active")
      .where({ agent_id: id })
      .limit(1);

    if (!agentWallet) {
      await transx.rollback();
      return res.status(401).json("Invalid pin!");
    }

    const isPinValid = await bcrypt.compare(token, agentWallet.agent_key);
    if (!isPinValid) {
      await transx.rollback();
      return res.status(401).json("Invalid pin!");
    }

    if (Number(agentWallet.amount) < bundlePrice) {
      await transx("agent_notifications").insert({
        _id: generateId(),
        agent_id: id,
        type: "bundle",
        title: "Data Bundle Transfer Failed",
        message: "Insufficient wallet balance to complete transaction!"
      });
      await transx.commit();
      return res.status(401).json("Insufficient wallet balance to complete transaction!");
    }

    // Step 3: Prepare transaction
    const transaction_reference = randomBytes(24).toString("hex");

    const bundleInfo = {
      recipient,
      data_code: bundle.plan_id,
      network: bundle.network_code || 0,
      transaction_reference,
    };

    const transactionInfo = {
      _id: generateId(),
      agent_id: id,
      reference: transaction_reference,
      type: "bundle",
      recipient,
      provider: network,
      info: JSON.stringify({ recipient, ref: transaction_reference, amount: bundlePrice, ...bundle }),
      amount: bundlePrice,
      commission: 0,
      totalAmount: bundlePrice,
    };

    await transx("agent_wallets").where("agent_id", id).decrement("amount", bundlePrice);
    await transx.commit();

    // Step 4: Process bundle
    const tranx = await knex.transaction();

    try {
      const result = await sendBundle(bundleInfo);
      const { ["status-code"]: statusCode, balance_after } = result;

      const isSuccess = ["00", "09"].includes(statusCode);

      await tranx("agent_transactions").insert({
        ...transactionInfo,
        status: isSuccess ? "completed" : "failed",
      });

      await tranx("agent_notifications").insert({
        _id: generateId(),
        agent_id: id,
        type: "bundle",
        title: isSuccess ? "Data Bundle Transfer" : "Data Bundle Transfer Failed",
        message: isSuccess
          ? `You have successfully recharged ${recipient} with ${bundle.plan_id}, you were charged GHS ${bundlePrice}`
          : "Could not process your request. Try again later!",
      });

      await tranx("agent_activity_logs").insert({
        agent_id: id,
        title: `Transferred data bundle, ${bundle.plan_id} to ${recipient}.`,
        severity: "info",
      });

      // Notify if balance is low
      if (isSuccess && Number(balance_after) < 1000) {
        await insufficientBalanceWarning(balance_after);
      }

      await tranx.commit();

      return res.status(200).json(
        isSuccess ? "Bundle transfer was successful!" : "Bundle transfer failed!"
      );
    } catch (error) {
      await tranx("agent_notifications").insert({
        _id: generateId(),
        agent_id: id,
        type: "bundle",
        title: "Data Bundle Transfer Failed",
        message: "Could not process your request. Try again later!",
      });
      await tranx.commit();
      return res.status(401).json("Transaction failed! An error has occurred.");
    }
  })
);


const insufficientBalanceWarning = async (bal) => {
  const body = `
    Your one-4-all top up account balance is running low. Your remaining balance is GHS ${currencyFormatter(bal)}.
    Please recharge to avoid any inconveniences. Thank you.
  `;
  await sendEMail(process.env.MAIL_CLIENT_USER, mailTextShell(`<p>${body}</p>`), "LOW TOP UP ACCOUNT BALANCE");
  await sendSMS(body, process.env.CLIENT_PHONENUMBER);
};


module.exports = router;
