const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
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
const { mailTextShell } = require("../config/mailText");
const generateId = require("../config/generateId");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 5 requests per windowMs
  message: "Too many requests! please try again later.",
});

//model
const { parseDateRange } = require("../config/dateConfigs");

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
const { safeJSON } = require("../config/helpers");
const generateDeviceId = require("../utils/deviceFingerprint");
const { uploadPhoto } = require("../config/uploadFile");

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
    const agents = await knex("vw_user_business_view").select("*").where({
      role: process.env.AGENT_ID,
    });

    if (_.isEmpty(agents)) return res.status(200).json([]);

    res.status(200).json(agents);
  }),
);

router.get(
  "/auth",
  limit,
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const agent = await knex("vw_user_business_view")
      .select(
        "id",
        "firstname",
        "lastname",
        "username",
        "name",
        "email",
        "role",
        "phonenumber",
        "profile",
        "businessName",
        "businessLocation",
        "businessDescription",
        "active",
        "createdAt",
      )
      .where("id", id)
      .first();

    if (_.isEmpty(agent) || agent?.active === 0) {
      return res.sendStatus(204);
    }

    res.status(200).json({
      user: {
        id: agent?.id,
        firstname: agent?.firstname,
        lastname: agent?.lastname,
        username: agent?.username,
        name: agent?.name,
        email: agent?.email,
        role: agent?.role,
        phonenumber: agent?.phonenumber,
        profile: agent?.profile,
        //business
        businessName: agent?.businessName,
        businessLocation: agent?.businessLocation,
        businessDescription: agent?.businessDescription,
        active: agent?.active,
        createdAt: agent?.createdAt,
      },
    });
  }),
);

// @GET Agent commission
router.get(
  "/commission/:id",
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const commissions = await knex("agent_commissions")
      .where("user_id", id)
      .select("*");

    res.status(200).json(commissions);
  }),
);

router.get(
  "/logs",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { startDate, endDate } = req.query;

    const { start, end, error } = parseDateRange(startDate, endDate);

    if (error) {
      return res.status(400).json(error);
    }

    const logs = await knex("vw_user_logs_view")
      .select(
        "*",
        knex.raw("DATE_FORMAT(createdAt, '%D %M %Y %h:%i:%s %p') as loggedAt"),
      )
      .where({ userId: id, isActive: true })
      .whereBetween("createdAt", [start, end]);

    if (_.isEmpty(logs)) {
      return res.status(200).json([]);
    }

    return res.status(200).json(logs);
  }),
);

// PUT Remove All Selected Logs
router.put(
  "/logs",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { logs } = req.body;

    await knex("activity_logs").where("id", "IN", logs).update({
      is_active: false,
    });
    return res.sendStatus(204);
  }),
);

router.get(
  "/verify-identity",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { nid, dob } = req.query;

    const agent = await knex("users")
      .where({ id })
      .select("nid", "dob", knex.raw("DATE_FORMAT(dob,'%D %M %Y') as dobb"))
      .limit(1);

    if (_.isEmpty(agent[0])) {
      return res.status(400).json("Invalid Request!");
    }

    if (nid && agent[0]?.nid !== nid) {
      return res.status(400).json("Sorry.We couldn't find your National ID.");
    }

    if (dob) {
      const formattedDate = moment(dob).format("Do MMMM YYYY");

      if (agent[0]?.dobb !== formattedDate) {
        return res
          .status(400)
          .json("Sorry.We couldn't find your date of birth.");
      }
    }

    return res.status(200).json("OK");
  }),
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
      const agent = await knex("users")
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

      await sendOTPSMS(
        `Please ignore this message if you did not request the OTP.Your verification code is ${code}.Don't share this code with anyone; Our employees will never ask for the code.If the code is incorrect or expired, you will not be able to proceed. Request a new code if necessary.`,
        agent[0]?.phonenumber,
      );
    }

    res.sendStatus(201);
  }),
);

router.get(
  "/:id",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const agent = await knex("vw_user_business_view")
      .join("wallets", "vw_user_business_view.id", "=", "wallets.user_id")
      .select("vw_user_business_view.*", "wallets.amount")
      .where("vw_user_business_view.id", id)
      .first();

    if (_.isEmpty(agent)) return res.status(200).json({});

    res.status(200).json(agent);
  }),
);

router.get(
  "/auth/token",
  limit,
  verifyRefreshToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const agent = await knex("vw_user_business_view")
      .select(
        "id",
        "firstname",
        "lastname",
        "username",
        "name",
        "email",
        "role",
        "phonenumber",
        "profile",
        "businessName",
        "businessLocation",
        "businessDescription",
        "active",
        "createdAt",
      )
      .where("id", id)
      .first();

    if (_.isEmpty(agent) || Boolean(agent?.active) === false) {
      return res.sendStatus(204);
    }

    const accessToken = await signMainToken(agent, "180d");

    res.status(200).json({
      accessToken,
    });
  }),
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

      const doesUserNameExists = await transaction("users")
        .select("username", "email")
        .where("email", rest?.email)
        .orWhere("phonenumber", rest?.phonenumber)
        .first();

      if (!_.isEmpty(doesUserNameExists)) {
        return res
          .status(400)
          .json("Phone Number / Email Address already exists!");
      }

      const agent_id = generateId();
      const password = generateRandomNumber(10);
      const hashedPassword = await bcrypt.hash(password, 12);

      //Save Agent Personal Information
      await transaction("users").insert({
        id: agent_id,
        role_id: 1,
        firstname: rest?.firstname,
        lastname: rest?.lastname,
        email: rest?.email?.toLowerCase(),
        username: `${rest.username}`,
        phonenumber: rest?.phonenumber,
        residence: rest?.residence,
        permissions: JSON.stringify([]),
        dob: rest?.dob,
        nid: rest?.nid,
        profile: rest?.profile,
        password: hashedPassword,
        active: 1,
      });

      //Save Agent Business Information
      await transaction("agent_businesses").insert({
        id: generateId(),
        user_id: agent_id,
        name: business_name,
        location: business_location,
        description: business_description,
        email: business_email,
        phonenumber: business_phonenumber,
        active: 1,
      });

      //Create Agent Wallet Information
      const user_key = await customOtpGen({ length: 4 });
      const hashedPin = await bcrypt.hash(user_key, 12);

      await transaction("wallets").insert({
        id: generateId(),
        user_id: agent_id,
        user_key: hashedPin,
      });

      //Create Agent Wallet Information

      await transaction("agent_commissions").insert([
        {
          user_id: agent_id,
          provider: "MTN",
          rate: 0.2,
        },
        {
          user_id: agent_id,
          provider: "Vodafone",
          rate: 0.25,
        },
        {
          user_id: agent_id,
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
      <p><strong>Wallet PIN:</strong> ${user_key}</p><br/>
      <p>We recommend you change your <b>Default Password</b> and <b>Wallet Pin</b> when you log into your account.</p>

      <p>Best regards,</p>
      <p>GAB Powerful Consult Team</p>
      </div>

      </div>`;

      const smsMessage = `We are delighted to inform you that your application to become an agent at GAB POWERFUL CONSULT has been accepted!
      Login URL:https://agent.gpcpins.com,Username: ${rest?.phonenumber},Default Password:${password},Email Address:${rest?.email},Wallet PIN: ${user_key}.
     We recommend you change your Default Password and Wallet Pin when you log into your account.
      `;

      //logs
      await knex("activity_logs").insert({
        user_id: id,
        title: "Created new agent account!",
        severity: "info",
      });

      res.sendStatus(201);

      setImmediate(async () => {
        if (process.env.NODE_ENV === "production") {
          await sendEMail(
            rest?.email,
            mailTextShell(message),
            "Welcome to GAB POWERFUL CONSULT.",
          );

          await sendSMS(smsMessage, rest?.phonenumber);
        }
      });
    } catch (error) {
      await transaction.rollback();

      res.status(500).json("An unknown error has occurred!");
    }
  }),
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

    res.status(200).json("Request Sent!");
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
      <p><strong>Business Telephone Line:</strong> ${
        business_phonenumber || ""
      }</p>
      
      <p>Thank you for considering my application. I look forward to the possibility of working together and contributing to the growth of GAB POWERFUL CONSULT.</p>
      </div>

      </div>`;

      if (process.env.NODE_ENV === "production") {
        await sendEMail(
          process.env.MAIL_CLIENT_USER,
          mailTextShell(body),
          " Application to Become an Agent",
        );
      }
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
        " Application to Become an Agent at GAB POWERFUL CONSULT.",
      );

      await sendSMS(
        `Hi ${rest?.firstname} ${rest?.lastname},
Thank you for your application to become an agent at GAB POWERFUL CONSULT. We've received your details and are currently reviewing your application. We'll be in touch soon with further updates. If you have any questions, feel free to reach out.

Best regards,
GAB Powerful Consult      
        `,
        rest?.phonenumber,
      );
    } catch (error) {
      res.status(500).json("An unknown error has occurred");
    }
  }),
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
        user_id: agent_id,
        provider,
      })
      .upsert({
        rate,
        user_id: agent_id,
        provider,
      });
    res.status(200).json("Commission Updated");
  }),
);

//@GET agent by email
router.post(
  "/login",
  limit,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const agent = await knex("users")
      .join("roles", "users.role_id", "roles.id")
      .select(
        "email",
        "phonenumber",
        "password",
        "role_id",
        "code",
        "active",
        "is_enabled as isEnabled",
      )
      .where("email", email)
      .first();

    if (_.isEmpty(agent)) {
      return res.status(400).json("User does not exist!");
    }

    if ([process.env.AGENT_ID].indexOf(agent?.code) === -1) {
      return res.status(401).json("Unauthorized Access!!");
    }

    const passwordIsValid = await bcrypt.compare(password, agent?.password);

    if (!passwordIsValid) {
      return res.status(400).json("Invalid login credentials!");
    }

    if (
      Boolean(agent?.active) === false ||
      Boolean(agent?.isEnabled) === false
    ) {
      return res.status(400).json("Account disabled! Please try again later.");
    }

    //
    const agentBusiness = await knex("vw_user_business_view")
      .select(
        "id",
        "name",
        "firstname",
        "lastname",
        "username",
        "email",
        "phonenumber",
        "role",
        "profile",
        "active",
        "businessName",
        "businessLocation",
        "businessDescription",
        "active",
        "createdAt",
      )
      .where("email", agent?.email)
      .first();

    if (_.isEmpty(agent)) {
      return res.status(401).json("Authentication Failed!");
    }

    const updatedAgent = {
      id: agentBusiness?.id,
      role: agentBusiness?.role,
      active: agentBusiness?.active,
      createdAt: agentBusiness?.createdAt,
    };

    const deviceId = generateDeviceId(req);

    const [sessionId] = await knex("user_sessions").insert({
      user_id: agentBusiness.id,
      device_id: deviceId,
      device_name: req.headers["user-agent"],
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    const accessToken = await signMainToken(agentBusiness, "180d");
    const refreshToken = signMainRefreshToken(updatedAgent, "365d");

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    await knex("user_tokens").insert({
      user_id: agentBusiness.id,
      session_id: sessionId,
      refresh_token: refreshToken,
      expiresAt: expires,
    });

    //logs
    await knex("activity_logs").insert({
      user_id: agentBusiness?.id,
      title: "Logged into account.",
      severity: "info",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/agents/auth/token",
    });

    res.status(201).json({
      refreshToken,
      accessToken,
    });
  }),
);

router.post(
  "/logout",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id, jti } = req.user;

    res.clearCookie("refreshToken");

    await knex("user_tokens")
      .where({ user_id: id })
      .update({ is_revoked: true });

    await knex("activity_logs").insert({
      user_id: id,
      title: "Logged out of account.",
      severity: "info",
    });

    await redisClient.del(`user:${jti}`);

    req.user = null;
    delete req.user;

    res.sendStatus(204);
  }),
);

router.put(
  "/",
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;
    const { id, agent_id, ...rest } = req.body;

    if (agent_id) {
      await knex("agent_businesses").where("id", rest.business_id).update({
        name: rest?.business_name,
        location: rest?.business_location,
        description: rest?.business_description,
        email: rest?.business_email,
        phonenumber: rest?.business_phonenumber,
      });

      return res.status(201).json("Changes Saved!");
    }

    const updatedAgent = await knex("users").where("id", id).update(rest);

    if (updatedAgent !== 1) {
      return res.status(400).json("Error updating agent information.");
    }

    if (role === process.env.ADMIN_ID) {
      //logs
      await knex("activity_logs").insert({
        user_id: userId,
        title: "Modified an agent account.",
        severity: "info",
      });

      return res.status(201).json("Changes Saved!");
    }

    const agent = await knex("vw_user_business_view")
      .select(
        "id",
        "firstname",
        "lastname",
        "username",
        "name",
        "email",
        "role",
        "phonenumber",
        "profile",
        "businessName",
        "businessLocation",
        "businessDescription",
        "active",
        "createdAt",
      )
      .where("id", id)
      .first();

    const accessToken = await signMainToken(agent, "180d");

    //logs
    await knex("activity_logs").insert({
      user_id: agent?.id,
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

    res.status(201).json({
      user: accessToken,
    });

    setImmediate(async () => {
      await sendEMail(
        accessData?.email,
        message,
        "Profile Update Notification",
      );
      const smsMessage = `Your profile information has been updated.For security purposes, we wanted to ensure that you are aware of these changes. If you did not make these adjustments yourself or if you believe your account may have been compromised, please take immediate action by contacting our support team.If you have made these changes intentionally, please disregard this message.`;
      await sendOTPSMS(smsMessage, agent?.phonenumber);
    });
  }),
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
      const agentPassword = await knex("users")
        .select("password")
        .where("id", id)
        .first();

      const passwordIsValid = await bcrypt.compare(
        oldPassword,
        agentPassword?.password,
      );

      if (!passwordIsValid) {
        return res.status(400).json("Invalid Password!");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const modifiedAgent = await knex("users").where("id", id).update({
      password: hashedPassword,
    });

    if (modifiedAgent !== 1) {
      return res.status(404).json("Error updating agent information.");
    }

    if (role === process.env.ADMIN_ID) {
      //logs
      await knex("activity_logs").insert({
        user_id: ID,
        title: "Modified an agent password.",
        severity: "info",
      });

      return res.status(200).json("Changes Saved");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: id,
      title: "Modified your account password.",
      severity: "info",
    });

    return res.status(200).json("Changes Saved");
  }),
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

    const user = await knex("users").where("id", id).update({ profile: url });

    if (user !== 1) {
      return res.status(404).json("An unknown error has occurred!");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: id,
      title: "Modified your account details.",
      severity: "info",
    });

    res.status(201).json(url);
  }),
);

//Enable or Disable Agent Account
router.put(
  "/account",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id, active } = req.body;

    const updatedAgent = await knex("users")
      .where("id", id)
      .update({ active: active, is_enabled: active });

    if (updatedAgent !== 1) {
      return res.status(400).json("Error updating agent info");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: _id,
      title: `${
        Boolean(active) === true
          ? "Activated an agent account!"
          : "Disabled an agent account!"
      }`,
      severity: "warning",
    });

    res
      .status(201)
      .json(
        Boolean(active) === true ? "Account enabled!" : "Account disabled!",
      );
  }),
);

//@DELETE agent account (soft delete)
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

    const agent = await knex("users").where("id", id).update({
      active: 0,
      is_enabled: 0,
    });

    if (!agent) {
      return res.status(500).json("Invalid Request!");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: _id,
      title: "Deleted an agent account!",
      severity: "error",
    });

    res.status(200).json("Agent Account Removed!");
  }),
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
      .where("user_id", id)
      .first();

    if (_.isEmpty(business)) res.status(200).json({});

    res.status(200).json(business);
  }),
);

router.put(
  "/business",
  limit,
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id: USERID } = req.user;
    const { id, ...newBusiness } = req.body;

    const business = await knex("agent_businesses")
      .where("id", id)
      .update({
        ...newBusiness,
      });

    if (business !== 1) {
      return res.status(404).json("Changes Failed");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: USERID,
      title: "Modified your account details.",
      severity: "info",
    });

    res.status(201).json("Changes Saved!!!");
  }),
);

////////////////.............Wallet..................///////////

router.get(
  "/top-up/wallet",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const wallet = await knex("wallets")
      .where("user_id", id)
      .select("amount")
      .first();

    if (_.isEmpty(wallet)) {
      res.status(200).json(0);
    }

    res.status(200).json(wallet?.amount);
  }),
);

router.get(
  "/wallet/transactions",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { startDate, endDate } = req.query;

    // const sDate = moment(startDate).format("YYYY-MM-DD");
    // const eDate = moment(endDate).format("YYYY-MM-DD");

    const transactions = await knex("vw_wallet_transactions_issuer_view")
      .where({
        userId: id,
        type: "credit",
      })
      .whereBetween("createdAt", [startDate, endDate])
      .select(
        "id",
        "userId",
        "amount",
        "wallet",
        "type",
        "comment",
        "status",
        "createdAt",
        "issuerName",
        // "DATE(created_at) AS purchaseDate",
      )
      .orderBy("createdAt", "desc");

    res.status(200).json(transactions);
  }),
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
  }),
);

//update wallet pin
router.put(
  "/wallet",
  verifyToken,
  verifyAdminORAgent,
  asyncHandler(async (req, res) => {
    const { id, email } = req.user;
    const { _id, pin, isAdmin, agentEmail } = req.body;

    const userId = isAdmin ? _id : id;
    const emailAddress = isAdmin ? agentEmail : email;

    const hashedPin = await bcrypt.hash(pin, 10);

    const wallet = await knex("wallets")
      .where("user_id", userId)
      .update("user_key", hashedPin);

    if (wallet !== 1) {
      return res
        .status(400)
        .json("Error updating wallet pin! Please try again later.");
    }

    if (isAdmin) {
      //logs
      await knex("activity_logs").insert({
        user_id: id,
        title: "Updated an User Wallet pin.",
        severity: "info",
      });
    } else {
      //logs
      await knex("user_activity_logs").insert({
        user_id: userId,
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
  }),
);

router.get(
  "/top-up/transaction",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    let { startDate, endDate, type } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }
    // Use extracted function
    const { start, end, error } = parseDateRange(startDate, endDate);

    if (error) {
      return res.status(400).json(error);
    }

    // Build query
    const transactions = await knex("agent_transactions")
      .where({ user_id: id, type })
      .whereBetween("created_at", [start, end])
      .select(
        "id",
        "user_id",
        "reference",
        "type",
        "recipient",
        "provider",
        "info",
        "commission",
        "amount as amt",
        "total_amount as amount",
        "year",
        "active",
        "status",
        "created_at as createdAt",
      )
      .orderBy("created_at", "desc");

    // Transform results (parse JSON info)
    const transformed = transactions.map(({ info, ...rest }) => ({
      ...rest,
      info: safeJSON(info),
    }));

    res.status(200).json(transformed);
  }),
);

router.delete(
  "/top-up/transaction",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id } = req.query;

    await knex("agent_transactions").where("id", id).del();

    res.sendStatus(204);
  }),
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
  }),
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
  }),
);

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
    const agentWallet = await transx("wallets")
      .select("id", "user_key", "amount", "active")
      .where({ user_id: id })
      .first();

    if (
      !agentWallet ||
      !(await bcrypt.compare(info?.token, agentWallet.user_key))
    ) {
      await transx.rollback();
      return res.status(401).json("Invalid pin!");
    }

    if (Number(agentWallet.amount) < amount) {
      await transx("notifications").insert({
        id: generateId(),
        user_id: id,
        type: "airtime",
        title: "Airtime Transfer Failed!",
        body: "Insufficient wallet balance to complete transaction!",
      });
      await transx.commit();
      return res
        .status(401)
        .json("Insufficient wallet balance to complete transaction!");
    }

    const transaction_reference = randomBytes(24).toString("hex");
    const airtimeInfo = {
      recipient: info?.recipient,
      amount,
      network:
        info?.network === "MTN"
          ? 4
          : info?.network === "Vodafone"
            ? 6
            : info?.network === "AirtelTigo"
              ? 1
              : 0,
      transaction_reference,
    };

    const commissionData = await transx("agent_commissions")
      .select("rate")
      .where({ user_id: id, provider: info?.network })
      .first();

    if (!commissionData) {
      await transx.rollback();
      return res.status(400).json("Invalid Request");
    }

    const commission = (commissionData.rate / 100) * amount;
    const payableAmount = amount - commission;

    const transactionInfo = {
      id: generateId(),
      user_id: id,
      reference: transaction_reference,
      type: "airtime",
      recipient: info?.recipient,
      provider: info?.network,
      info: JSON.stringify({
        recipient: info?.recipient,
        ref: transaction_reference,
        amount: payableAmount,
      }),
      amount: payableAmount,
      commission,
      total_amount: amount,
    };

    await transx("wallets")
      .where("user_id", id)
      .decrement({ amount: payableAmount });
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

        await tranx("notifications").insert({
          id: generateId(),
          user_id: id,
          type: "airtime",
          title: "Airtime Transfer",
          body: `You have successfully recharged ${airtimeInfo.recipient} with ${currencyFormatter(
            airtimeInfo.amount,
          )} of airtime. Commission: GHS ${currencyFormatter(commission)}.`,
        });
      } else {
        await tranx("notifications").insert({
          id: generateId(),
          agent_id: id,
          type: "airtime",
          title: "Airtime Transfer Failed!",
          body: `Your airtime transfer of ${currencyFormatter(
            airtimeInfo.amount,
          )} to ${airtimeInfo.recipient} failed. Please try again later.`,
        });
      }

      await tranx("activity_logs").insert({
        user_id: id,
        title: "Transferred airtime to customer.",
        severity: "info",
      });

      await tranx.commit();
      return res
        .status(200)
        .json(
          isSuccess
            ? "Airtime transfer was successful!"
            : "Airtime transfer failed!",
        );
    } catch (error) {
      await tranx("agent_transactions").insert({
        ...transactionInfo,
        status: "failed",
      });

      await tranx("notifications").insert({
        id: generateId(),
        user_id: id,
        type: "airtime",
        title: "Airtime Transfer Failed!",
        body: `Your airtime transfer of ${currencyFormatter(
          airtimeInfo.amount,
        )} to ${airtimeInfo.recipient} failed. Please try again later.`,
      });

      await tranx.commit();
      return res.status(401).json("Transaction failed! An error has occurred.");
    }
  }),
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
      const agentWallet = await transx("wallets")
        .select("id", "user_key", "amount", "active")
        .where({ agent_id: id })
        .first();

      if (
        !agentWallet.length ||
        !(await bcrypt.compare(token, agentWallet.user_key))
      ) {
        await transx.rollback();
        return res.status(401).json("Invalid PIN!");
      }

      // Step 4: Check if agent has enough balance
      if (Number(agentWallet[0].amount) < Number(totalAmount)) {
        await transx("notifications").insert({
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
            info?.recipient.toString(),
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
            ((commissionRate[0]?.rate || 0.2) / 100) * airtimeInfo.amount;

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
        }),
      );

      const totalPayable = _.sumBy(transactions, "payableAmount");

      // Step 6: Deduct total payable amount from agent's wallet
      await transx("wallets")
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

            await airtimeTx("notifications").insert({
              _id: generateId(),
              agent_id: id,
              type: "airtime",
              title: isSuccess
                ? "Airtime Transfer"
                : "Airtime Transfer Failed!",
              message: isSuccess
                ? `You have successfully recharged ${airtimeInfo.recipient} with ${currencyFormatter(
                    airtimeInfo.amount,
                  )} of airtime. Commission earned: GHS ${transactionInfo.commission}.`
                : `Your airtime transfer of ${currencyFormatter(
                    airtimeInfo.amount,
                  )} to ${airtimeInfo.recipient} failed. Please try again later.`,
            });

            return isSuccess;
          } catch (err) {
            // Fallback for unexpected errors
            await airtimeTx("agent_transactions").insert({
              ...transactionInfo,
              status: "failed",
            });

            await airtimeTx("notifications").insert({
              _id: generateId(),
              agent_id: id,
              type: "airtime",
              title: "Airtime Transfer Failed!",
              message: `Your airtime transfer of ${currencyFormatter(
                airtimeInfo.amount,
              )} to ${airtimeInfo.recipient} failed. Please try again later.`,
            });

            return false;
          }
        }),
      );

      // Step 8: Log activity
      await airtimeTx("activity_logs").insert({
        agent_id: id,
        title: "Transferred bulk airtime to Customers.",
        severity: "info",
      });

      await airtimeTx.commit();

      return res.status(200).json("Airtime transfer was successful!");
    } catch (err) {
      console.log("2", err);
      await transx.rollback();
      // await transx.commit();
      // await airtimeTx.commit();
      return res.status(500).json("Transaction failed! An error has occurred.");
    }
  }),
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

    const agentWallet = await transx("wallets")
      .select("id", "user_key", "amount", "active")
      .where({ user_id: id })
      .first();

    if (!agentWallet) {
      await transx.rollback();
      return res.status(401).json("Invalid pin!");
    }

    const isPinValid = await bcrypt.compare(token, agentWallet.user_key);
    if (!isPinValid) {
      await transx.rollback();
      return res.status(401).json("Invalid pin!");
    }

    if (Number(agentWallet.amount) < bundlePrice) {
      await transx("notifications").insert({
        id: generateId(),
        user_id: id,
        type: "bundle",
        title: "Data Bundle Transfer Failed",
        body: "Insufficient wallet balance to complete transaction!",
      });
      await transx.commit();
      return res
        .status(401)
        .json("Insufficient wallet balance to complete transaction!");
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
      id: generateId(),
      user_id: id,
      reference: transaction_reference,
      type: "bundle",
      recipient,
      provider: network,
      info: JSON.stringify({
        recipient,
        ref: transaction_reference,
        amount: bundlePrice,
        ...bundle,
      }),
      amount: bundlePrice,
      commission: 0,
      total_amount: bundlePrice,
    };

    await transx("wallets")
      .where("user_id", id)
      .decrement("amount", bundlePrice);
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

      await tranx("notifications").insert({
        id: generateId(),
        user_id: id,
        type: "bundle",
        title: isSuccess
          ? "Data Bundle Transfer"
          : "Data Bundle Transfer Failed",
        body: isSuccess
          ? `You have successfully recharged ${recipient} with ${bundle.plan_id}, you were charged GHS ${bundlePrice}`
          : "Could not process your request. Try again later!",
      });

      await tranx("activity_logs").insert({
        user_id: id,
        title: `Transferred data bundle, ${bundle.plan_id} to ${recipient}.`,
        severity: "info",
      });

      // Notify if balance is low
      if (isSuccess && Number(balance_after) < 1000) {
        await insufficientBalanceWarning(balance_after);
      }

      await tranx.commit();

      return res
        .status(200)
        .json(
          isSuccess
            ? "Bundle transfer was successful!"
            : "Bundle transfer failed!",
        );
    } catch (error) {
      await tranx("notifications").insert({
        id: generateId(),
        user_id: id,
        type: "bundle",
        title: "Data Bundle Transfer Failed",
        body: "Could not process your request. Try again later!",
      });
      await tranx.commit();
      return res.status(401).json("Transaction failed! An error has occurred.");
    }
  }),
);

const insufficientBalanceWarning = async (bal) => {
  const body = `
    Your one-4-all top up account balance is running low. Your remaining balance is GHS ${currencyFormatter(bal)}.
    Please recharge to avoid any inconveniences. Thank you.
  `;

  if (process.env.NODE_ENV === "production") {
    await sendEMail(
      process.env.MAIL_CLIENT_USER,
      mailTextShell(`<p>${body}</p>`),
      "LOW TOP UP ACCOUNT BALANCE",
    );

    await sendSMS(body, process.env.CLIENT_PHONENUMBER);
  }
};

module.exports = router;
