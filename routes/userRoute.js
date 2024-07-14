const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateId = require("../config/generateId");
const { otpGen, customOtpGen } = require("otp-gen-agent");
const multer = require("multer");
const moment = require("moment");
const { rateLimit } = require("express-rate-limit");
const cron = require("node-cron");
const {
  signSampleRefreshToken,
  signSampleToken,
  signMainToken,
  signMainRefreshToken
} = require("../config/token");
const {
  verifyToken,
  verifyRefreshToken,
} = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const sendMail = require("../config/sendEmail");
const { uploadPhoto } = require("../config/uploadFile");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

//model
const { hasTokenExpired } = require("../config/dateConfigs");
// const isMobile = require("../config/isMobile");

//db
const knex = require("../db/knex");
const { isValidUUID2, isValidEmail } = require("../config/validation");
const sendEMail = require("../config/sendEmail");
const { sendBirthdayWishes } = require("../config/cronMessages");
const currencyFormatter = require("../config/currencyFormatter");
const { sendSMS, sendOTPSMS } = require("../config/sms");
const { calculateTimeDifference } = require("../config/timeHelper");
const { mailTextShell } = require("../config/mailText");
const { getInternationalMobileFormat } = require("../config/PhoneCode");

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

// const ACCESS_EXPIRATION = new Date(Date.now() + 3600000);
// const REFRESH_EXPIRATION = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

cron.schedule("0 0 * * *", async () => {
  await sendBirthdayWishes();
});

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const users = await knex("users")
      .select(
        "_id",
        "profile",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "nid",
        knex.raw("DATE_FORMAT(dob,'%D %M, %Y') as dobb"),
        "dob",
        "email",
        "phonenumber",
        "active",
        "createdAt"
      )
      .whereNot("email", "test@test.com");

    res.status(200).json(users);
  })
);

router.get(
  "/auth",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const user = await knex("users")
      .select(
        "_id",
        "profile",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "nid",
        "dob",
        "phonenumber",
        "role",
        "active"
      )
      .where("_id", id)
      .limit(1);

    if (
      _.isEmpty(user) ||
      Boolean(user[0]?.active) === false ||
      user[0]?.email === "test@test.com"
    ) {
      return res.sendStatus(204);
    }

    res.status(200).json({
      user: {
        id: user[0]?._id,
        firstname: user[0]?.firstname,
        lastname: user[0]?.lastname,
        name: user[0]?.name,
        email: user[0]?.email,
        role: user[0]?.role,
        nid: user[0]?.nid,
        dob: user[0]?.dob,
        phonenumber: user[0]?.phonenumber,
        profile: user[0]?.profile,
        active: Boolean(user[0]?.active),
      },
    });
  })
);

router.get(
  "/verify-identity",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user
    const { nid, dob } = req.query;


    const users = await knex("users").where({ _id: id })
      .select('nid', 'dob', knex.raw("DATE_FORMAT(dob,'%D %M %Y') as dobb"))
      .limit(1);


    if (_.isEmpty(users[0])) {
      return res.status(400).json('Invalid Request!');
    }

    if (nid && users[0]?.nid !== nid) {

      return res.status(400).json("Sorry.We couldn't find your National ID.");
    }

    if (dob) {
      const formattedDate = moment(dob).format('Do MMMM YYYY')

      if (users[0]?.dobb !== formattedDate) {

        return res.status(400).json("Sorry.We couldn't find your date of birth.");
      }
    }


    return res.status(200).json('OK');
  })
);
router.get(
  "/:id",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const users = await knex("user_business_view").where("_id", id).limit(1);
    res.status(200).json(users[0]);
  })
);

router.get(
  "/auth/token",
  limit,
  verifyRefreshToken,
  asyncHandler(async (req, res) => {
    const { id, active, role, createdAt } = req.user;

    const user = await knex("users")
      .select(
        "_id as id",
        "profile",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "nid",
        "dob",
        "phonenumber",
        "role",
        "active"
      )
      .where("_id", id)
      .limit(1);

    const accessToken = signMainToken(user[0], '15m');

    res.status(200).json({
      accessToken,
    });

  })
);
router.get(
  "/phonenumber/token",
  limit,
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { code } = req.query;

    if (code) {
      const userToken = await knex("verify_tokens")
        .select("_id", "code")
        .where({
          _id: id,
          code,
        })
        .limit(1);

      if (_.isEmpty(userToken) || Number(code) !== Number(userToken[0]?.code)) {
        return res.status(400).json("Invalid code.Try again");
      }
    } else {
      const user = await knex("users")
        .select("_id", "phonenumber", "active")
        .where("_id", id)
        .limit(1);

      if (_.isEmpty(user) && !user[0]?.phonenumber) {
        return res.status(400).json("Invalid Request");
      }

      const code = await otpGen();
      await knex("verify_tokens").upsert({
        _id: id,
        code,
      });
      console.log(code);

      sendOTPSMS(`Your verification code is ${code}.`, user[0]?.phonenumber);
    }

    res.sendStatus(201);
  })
);

//@GET user by email
router.post(
  "/sample",
  limit,
  asyncHandler(async (req, res) => {
    const email = "test@test.com";

    let user = await knex("users").select("*").where("email", email).limit(1);

    if (_.isEmpty(user[0])) {
      req.body._id = generateId();
      req.body.role = process.env.USER_ID;
      req.body.email = email;

      await knex("users").insert(req.body);

      user = await knex("users").select("*").where("email", email).limit(1);
    }

    const updatedUser = {
      id: user[0]?._id,
      role: user[0]?.role,
      active: false,
      createdAt: user[0]?.createdAt,
    };

    const accessToken = signSampleToken(updatedUser);
    const refreshToken = signSampleRefreshToken(updatedUser);

    // res.cookie("_SSUID_kyfc", accessToken, {
    //   maxAge: 10 * 60 * 1000,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    // res.cookie("_SSUID_X_ayd", refreshToken, {
    //   maxAge: 10 * 60 * 1000,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await knex("users").where("_id", user[0]?._id).update({
      token: hashedToken,
    });

    // if (isMobile(req)) {
    res.status(200).json({
      refreshToken,
      accessToken,
    });
    // }

    // res.sendStatus(201);
  })
);

//@GET user by email
router.post(
  "/login",
  limit,
  asyncHandler(async (req, res) => {
    const { email, type } = req.body;

    const transx = await knex.transaction();
    try {
      let user = null;
      if (type === "email") {
        if (!isValidEmail(email)) {
          return res.status(400).json("Invalid Email Address!");
        }

        user = await transx("users")
          .select("email", "phonenumber", "active", 'isEnabled')
          .where("email", email)
          .limit(1);
      }

      if (type === "phone") {
        user = await transx("users")
          .select("email", "phonenumber", "active", "isEnabled")
          .where("phonenumber", email)
          .limit(1);
      }

      if (_.isEmpty(user)) {
        return res
          .status(404)
          .json(
            `We could not find your ${type === "email" ? "email address" : "phone number"
            }!`
          );
      }

      if (Boolean(user[0]?.isEnabled) === false) {
        return res
          .status(400)
          .json("Account disabled! Try again later.");
      }

      const token = await otpGen();

      if (process.env.NODE_ENV !== "production") {
        console.log(token);
      }

      await transx("tokens").insert({
        _id: generateId(),
        token,
        email: email,
      });

      if (type === "email") {
        const message = `
        <div style="width:100%;max-width:500px;margin-inline:auto;">
        <h2>Gab Powerful Consult</h2>
        <p>Your verification code is</p>
        <h1>${token}</h1>

        <p>-- Gab Powerful Team --</p>
    </div>
        `;

        await sendMail(user[0]?.email, mailTextShell(message));
      }

      if (type === "phone") {
        await sendOTPSMS(
          `Your verification code is ${token}`,
          user[0]?.phonenumber
        );
      }

      await transx.commit();
    } catch (error) {
      await transx.rollback();
      console.log(error);
      return res.status(500).json("An error has occurred!");
    }

    res.sendStatus(201);
  })
);

router.post(
  "/login-google-tap",
  limit,
  asyncHandler(async (req, res) => {
    const { credential } = req.body;
    let register = false;
    let user_key = null;

    if (!credential) {
      return res.status(400).json("Authentication Failed");
    }
    const decodedUser = jwt.decode(credential);

    let user = await knex("users")
      .select("email", 'isEnabled')
      .where("email", decodedUser?.email)
      .limit(1);

    if (_.isEmpty(user)) {
      const info = {
        _id: generateId(),
        name: decodedUser?.name,
        firstname: decodedUser?.given_name,
        lastname: decodedUser?.family_name,
        email: decodedUser?.email,
        phonenumber: decodedUser?.phoneNumber,
        profile: decodedUser?.picture,
        role: process.env.USER_ID,
        active: true,
      };

      await knex("users").insert(info);

      user_key = await customOtpGen({ length: 4 });

      const hashedPin = await bcrypt.hash(user_key, 10)


      await knex("user_wallets").insert({
        _id: generateId(),
        user_id: info?._id,
        user_key: hashedPin,
      });
      register = true;
    } else {
      if (Boolean(user[0]?.isEnabled) === false) {
        return res
          .status(400)
          .json("Account disabled! Try again later.");
      }

      await knex("users").where("email", decodedUser?.email).update({
        firstname: decodedUser?.given_name,
        lastname: decodedUser?.family_name,
        phonenumber: decodedUser?.phoneNumber,
        // profile: decodedUser?.picture,
        active: 1,
      });
    }
    user = await knex("users")
      .select("*", knex.raw("CONCAT(firstname,'',lastname) as name"))
      .where("email", decodedUser?.email)
      .limit(1);

    const accessData = {
      id: user[0]?._id,
      firstname: user[0]?.firstname,
      lastname: user[0]?.lastname,
      name: user[0]?.name,
      email: user[0]?.email,
      phonenumber: user[0]?.phonenumber,
      dob: user[0]?.dob,
      nid: user[0]?.nid,
      role: user[0]?.role,
      profile: user[0]?.profile,
      active: Boolean(user[0]?.active),
    };

    const updatedUser = {
      id: user[0]?._id,
      role: user[0]?.role,
      active: true,
      createdAt: user[0]?.createdAt,
    };

    const accessToken = signMainToken(accessData, '15m');
    const refreshToken = signMainRefreshToken(updatedUser, '365d');

    // res.cookie("_SSUID_kyfc", accessToken, {
    //   maxAge: 1 * 60 * 60 * 1000,
    //   expires: ACCESS_EXPIRATION,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    // res.cookie("_SSUID_X_ayd", refreshToken, {
    //   maxAge: 90 * 24 * 60 * 60 * 1000,
    //   expires: REFRESH_EXPIRATION,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await knex("users").where("_id", user[0]?._id).update({
      token: hashedToken,
    });

    // if (register) {
    //   await sendOTPSMS(
    //     `Welcome to GPC,
    //   Your wallet pin is ${user_key}.Your are recommended to change it at the wallet page of your account when you log into your account.Thank You!`,
    //     user[0]?.phonenumber
    //   );
    // }

    // if (isMobile(req)) {
    res.status(201).json({
      refreshToken,
      accessToken,
      register,
    });
    // }

    // res.status(201).json({
    //   user: {
    //     id: user[0]?._id,
    //     name: user[0]?.name,
    //     firstname: user[0]?.firstname,
    //     lastname: user[0]?.lastname,
    //     email: user[0]?.email,
    //     dob: user[0]?.dob,
    //     nid: user[0]?.nid,
    //     phonenumber: user[0]?.phonenumber,
    //     role: user[0]?.role,
    //     profile: user[0]?.profile,
    //   },
    // });
  })
);

router.post(
  "/login-google",
  limit,
  asyncHandler(async (req, res) => {
    const email = req.body.email;
    let register = false;
    let user_key = null;
    let user = await knex("users")
      .select("email", 'isEnabled')
      .where("email", email)
      .limit(1);

    if (_.isEmpty(user)) {
      req.body._id = generateId();
      req.body.role = process.env.USER_ID;
      req.body.active = true;

      await knex("users").insert(req.body);

      user_key = await customOtpGen({ length: 4 });
      const hashedPin = await bcrypt.hash(user_key, 10)

      await knex("user_wallets").insert({
        _id: generateId(),
        user_id: req.body?._id,
        user_key: hashedPin,
      });
      register = true;
    } else {


      if (Boolean(user[0]?.isEnabled) === false) {
        return res
          .status(400)
          .json("Account disabled! Try again later.");
      }


      await knex("users").where("email", email).update({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        active: 1,
      });
    }
    user = await knex("users")
      .select("*", knex.raw("CONCAT(firstname,'',lastname) as name"))
      .where("email", email)
      .limit(1);

    const accessData = {
      id: user[0]?._id,
      name: user[0]?.name,
      firstname: user[0]?.firstname,
      lastname: user[0]?.lastname,
      email: user[0]?.email,
      dob: user[0]?.dob,
      nid: user[0]?.nid,
      phonenumber: user[0]?.phonenumber,
      role: user[0]?.role,
      profile: user[0]?.profile,
      active: Boolean(user[0]?.active),
    };

    const updatedUser = {
      id: user[0]?._id,
      role: user[0]?.role,
      active: true,
      createdAt: user[0]?.createdAt,
    };

    const accessToken = signMainToken(accessData, '15m');
    const refreshToken = signMainRefreshToken(updatedUser, '365d');

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
    //   expires: REFRESH_EXPIRATION,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await knex("users").where("_id", user[0]?._id).update({
      token: hashedToken,
    });

    //   if (register) {
    //     await sendOTPSMS(
    //       `Welcome to GPC,
    //  Your wallet pin is ${user_key}.Your are recommended to change it at the wallet page of your account when you log into your account.Thank You!`,
    //       user[0]?.phonenumber
    //     );
    //   }

    // if (isMobile(req)) {
    res.status(201).json({
      refreshToken,
      accessToken,
      register,
    });
    // }

    // res.status(201).json({
    //   user: {
    //     id: user[0]?._id,
    //     firstname: user[0]?.firstname,
    //     lastname: user[0]?.lastname,
    //     name: user[0]?.name,
    //     email: user[0]?.email,
    //     dob: user[0]?.dob,
    //     nid: user[0]?.nid,
    //     phonenumber: user[0]?.phonenumber,
    //     role: user[0]?.role,
    //     profile: user[0]?.profile,
    //   },
    // });
  })
);

router.post(
  "/",
  limit,
  asyncHandler(async (req, res) => {
    const newUser = req.body;

    const transx = await knex.transaction();

    try {
      const doesUserExists = await transx("users")
        .select("email")
        .where("email", newUser.email)
        .limit(1);

      if (!_.isEmpty(doesUserExists[0])) {
        return res.status(400).json("Email address already taken!");
      }

      const intNumber = getInternationalMobileFormat(newUser.phonenumber);

      const doesPhoneExists = await transx("users")
        .select("phonenumber")
        .where("phonenumber", "IN", [newUser.phonenumber, intNumber]);

      if (!_.isEmpty(doesPhoneExists)) {
        return res
          .status(400)
          .json("An account with this telephone number already exists!");
      }

      newUser._id = generateId();
      newUser.role = process.env.USER_ID;

      const user = await transx("users").insert(newUser);

      if (_.isEmpty(user)) {
        return res.status(400).json("Error occurred.Could not create user.");
      }
      const userData = await transx("users")
        .select("*", knex.raw("CONCAT(firstname,'',lastname) as name"))
        .where("_id", newUser._id);

      const user_key = await customOtpGen({ length: 4 });
      const hashedPin = await bcrypt.hash(user_key, 10)

      await transx("user_wallets").insert({
        _id: generateId(),
        user_id: newUser._id,
        user_key: hashedPin,
      });

      const token = await otpGen();
      if (process.env.NODE_ENV !== "production") {
        console.log(token);
      }

      await transx("tokens").insert({
        _id: generateId(),
        token,
        email: userData[0]?.phonenumber,
      });

      const message = `
        <div style="width:100%;max-width:500px;margin-inline:auto;">
        
        <p>Your verification code is</p>
        <h1>${token}</h1>

        <p>-- Gab Powerful Team --</p>
    </div>
        `;
      //   Send SMS to the User with Verification Code
      if (newUser?.phonenumber) {
        await sendOTPSMS(
          `Your verification code is ${token}`,
          newUser?.phonenumber
        );
      }

      //   Send Email to the User with Verification Code
      // await sendMail(userData[0]?.email, mailTextShell(message));
      await transx.commit();
    } catch (error) {
      await transx.rollback();
      console.log(error)
      return res.status(500).json("An error has occurred!");
    }

    res.sendStatus(201);
  })
);

router.post(
  "/verify-otp",
  limit,
  asyncHandler(async (req, res) => {
    const { email, type, token } = req.body;

    if (!email || !token) {
      return res.status(400).json("Invalid Code");
    }

    const userToken = await knex("tokens")
      .select("*")
      .where({
        email,
        token,
      })
      .limit(1);

    if (_.isEmpty(userToken)) {
      return res.status(400).json("Invalid Code");
    }

    if (hasTokenExpired(userToken[0]?.createdAt)) {
      return res.status(400).json("Sorry! Your code has expired.");
    }

    let user = null;
    if (type === "email") {
      await knex("users")
        .where("email", userToken[0]?.email)
        .update({ active: 1 });

      user = await knex("users")
        .select("*", knex.raw("CONCAT(firstname,' ',lastname) as name"))
        .where("email", userToken[0]?.email);
    }

    if (type === "phone") {
      await knex("users")
        .where("phonenumber", userToken[0]?.email)
        .update({ active: 1 });

      user = await knex("users")
        .select("*", knex.raw("CONCAT(firstname,' ',lastname) as name"))
        .where("phonenumber", userToken[0]?.email);
    }

    if (_.isEmpty(user)) {
      return res.status(401).json("Authentication Failed!");
    }
    const accessData = {
      id: user[0]?._id,
      name: user[0]?.name,
      firstname: user[0]?.firstname,
      lastname: user[0]?.lastname,
      email: user[0]?.email,
      dob: user[0]?.dob,
      nid: user[0]?.nid,
      phonenumber: user[0]?.phonenumber,
      role: user[0]?.role,
      profile: user[0]?.profile,
      active: Boolean(user[0]?.active),
    };

    const updatedUser = {
      id: user[0]?._id,
      role: user[0]?.role,
      active: Boolean(user[0]?.active),
      createdAt: user[0]?.createdAt,
    };

    const accessToken = signMainToken(accessData, '15m');
    const refreshToken = signMainRefreshToken(updatedUser, '365d');

    // res.cookie("_SSUID_kyfc", accessToken, {
    //   maxAge: 1 * 60 * 60 * 1000,
    //   expires: ACCESS_EXPIRATION,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    // res.cookie("_SSUID_X_ayd", refreshToken, {
    //   maxAge: 90 * 24 * 60 * 60 * 1000,
    //   expires: REFRESH_EXPIRATION,
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    //   // domain:
    //   // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
    //   sameSite: "none",
    // });

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await knex("users").where("_id", user[0]?._id).update({
      token: hashedToken,
    });

    // if (isMobile(req)) {
    res.status(201).json({
      refreshToken,
      accessToken,
    });
    // }

    // res.status(201).json({
    //   user: {
    //     id: user[0]?._id,
    //     firstname: user[0]?.firstname,
    //     lastname: user[0]?.lastname,
    //     name: user[0]?.name,
    //     email: user[0]?.email,
    //     dob: user[0]?.dob,
    //     nid: user[0]?.nid,
    //     phonenumber: user[0]?.phonenumber,
    //     role: user[0]?.role,
    //     profile: user[0]?.profile,
    //   },
    //   // token: accessToken,
    // });
  })
);

router.post(
  "/logout",
  verifyToken,
  asyncHandler(async (req, res) => {
    const id = req.user?.id;

    await knex("users").where("_id", id).update({
      active: false,
    });

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
    req.user = null;
    delete req.user;

    res.sendStatus(204);
  })
);

router.put(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id, admin, iat, exp, google, register, ...rest } = req.body;


    if (!google && rest?.phonenumber) {
      const intNumber = getInternationalMobileFormat(rest?.phonenumber || "");

      const doesPhoneExists = await knex("users")
        .select("phonenumber")
        .where("phonenumber", "IN", [rest?.phonenumber, intNumber])
        .whereNot("_id", id);

      if (!_.isEmpty(doesPhoneExists)) {
        return res.status(400).json("Telephone number already in use!");
      }
    }

    const modifiedUser = await knex("users").where("_id", id).update(rest);

    if (modifiedUser !== 1) {
      return res.status(400).json("Error updating user information.");
    }
    if (admin) {
      return res.status(201).json("Changes Saved!");
    }

    const user = await knex("users")
      .select(
        "_id as id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,'',lastname) as name"),
        "email",
        "role",
        "nid",
        "dob",
        "phonenumber",
        "profile",
        "active"
      )
      .where("_id", id)
      .limit(1);
    if (!user[0]) {
      return res.status(400).json("Error updating user information.");
    }

    // set the user object on the request so it can be accessed in other routes
    const accessData = {
      id: user[0]?.id,
      firstname: user[0]?.firstname,
      lastname: user[0]?.lastname,
      name: user[0]?.name,
      email: user[0]?.email,
      role: user[0]?.role,
      nid: user[0]?.nid,
      dob: user[0]?.dob,
      phonenumber: user[0]?.phonenumber,
      profile: user[0]?.profile,
      active: Boolean(user[0]?.active),
    };

    const updatedUser = {
      id: user[0]?.id,
      role: user[0]?.role,
      active: Boolean(user[0]?.active),
      createdAt: user[0]?.createdAt,
    };

    const accessToken = signMainToken(accessData, '15m');

    if (register) {


      await sendOTPSMS(
        `Welcome to GPC.You are recommended to setup your wallet pin at the wallet page of your account when you log into your account.Thank You!`,
        user[0]?.phonenumber
      );

      const message = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h2 style="color: #333333;">Important: Profile Update Notification</h2>
<p>Dear ${user[0]?.name || "Customer"} ,</p>
<p> Welcome to GPC</p>
<p>You are recommended to setup your wallet pin at the wallet page of your account when you log into your account.</p>
<p>Thank you</p>

<p>Best regards,</p>
<p>Gab Powerful Team<p>
</div>`;

      await sendEMail(user[0]?.email, message, "GPC Account Confirmation");


    } else {
      const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333333;">Important: Profile Update Notification</h2>
    <p>Dear ${user[0]?.name || "Customer"} ,</p>
    <p> Your profile information has been updated.</p>
    <p>For security purposes, we wanted to ensure that you are aware of these changes. If you did not make these adjustments yourself or if you believe your account may have been compromised, please take immediate action by contacting our support team at <a href='mailto:info@gpcpins.com'>info@gpcpins</a>.</p>
    <p>If you have made these changes intentionally, please disregard this message.</p>
    <p>Thank you for your attention to this matter.</p>

    <p>Best regards,</p>
    <p>Gab Powerful Team<p>
</div>
    `;

      await sendEMail(user[0]?.email, message, "Profile Update Notification");
    }
    res.status(201).json({
      accessToken,
    });
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
    // console.log(url);

    const user = await knex("users").where("_id", id).update({ profile: url });

    if (user !== 1) {
      return res.status(404).json("An unknown error has occurred!");
    }

    res.status(201).json(url);
  })
);

//Enable or Disable User Account
router.put(
  "/account",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id, active } = req.body;

    const updatedUser = await knex("users")
      .where("_id", id)
      .update({ active: active, isEnabled: active });

    if (updatedUser !== 1) {
      return res.status(400).json("Error updating user info");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: `${Boolean(active) === true
        ? "Activated a user account!"
        : "Disabled a user account!"
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

//@DELETE user
router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(401).json("Invalid User information!");
    }

    const user = await knex("users").where("_id", id).del();

    if (user !== 1) {
      return res.status(500).json("Invalid Request!");
    }
    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: "Deleted a user account!",
      severity: "error",
    });

    res.status(200).json("User Removed!");
  })
);

////////////////.............Wallet..................///////////

//Get Wallet Balance
router.get(
  "/wallet/status",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { action } = req.query;

    if (action && action === "disable") {
      await knex("user_wallets").where("user_id", id).update({ active: 0 });
      return res.sendStatus(204);
    }

    const wallet = await knex("user_wallets")
      .where("user_id", id)
      .select("active", "createdAt", "updatedAt")
      .limit(1);

    if (_.isEmpty(wallet) || Boolean(wallet[0]?.active) === false) {
      const now = moment();
      const upTime = moment(new Date(wallet[0]?.updatedAt));
      const timeLeft = calculateTimeDifference(now, upTime);

      if (timeLeft.value <= 0) {
        await knex("user_wallets").where("user_id", id).update({
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

//Get Wallet Balance
router.get(
  "/wallet/balance",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.query;

    const wallet = await knex("user_wallets")
      .where("user_id", id)
      .select("amount")
      .limit(1);

    if (_.isEmpty(wallet)) {
      return res.status(200).json(0);
    }

    res.status(200).json(wallet[0]?.amount);
  })
);

//Get all wallet top up trnsactions
router.get(
  "/wallet/transactions",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { startDate, endDate } = req.query;

    const sDate = moment(startDate).format("YYYY-MM-DD");
    const eDate = moment(endDate).format("YYYY-MM-DD");

    const transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,user_id,type,wallet,amount,comment,status,createdAt,DATE(createdAt) AS purchaseDate
            FROM user_wallet_transactions
        ) AS user_wallet_transactions_ 
        WHERE user_id=? AND purchaseDate BETWEEN ? AND ? ORDER BY createdAt DESC;`,
      [id, sDate, eDate]
    );

    res.status(200).json(transactions[0]);
  })
);

//Send wallet top up request
router.post(
  "/wallet/request",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const user = await knex("users")
      .where("_id", id)
      .select(
        "name",
        "phonenumber",
        "email"
        // knex.raw("CONCAT(firstname,'',lastname) as name")
      )
      .limit(1);

    try {
      const body = `<div>
      <h1 style='text-transform:uppercase;'>Wallet Top Up Request</h1><br/>
      <div style='text-align:left;'>

      <p>A request has been placed by <strong>${user[0]?.name
        }</strong> to top up wallet balance.
      <p><strong>Name:</strong> ${user[0]?.name}</p>
      <p><strong>Email:</strong> ${user[0]?.email}</p><br/>
      <p><strong>Telephone Number:</strong> ${user[0]?.phonenumber}</p><br/>
      <p><strong>Top Up Amount:</strong> ${currencyFormatter(
          req?.body?.amount
        )}</p><br/>
       
      </div>
      </div>`;

      const message = `A request has been placed by ${user[0]?.name
        } to top up wallet balance.
      Name: ${user[0]?.name},
      Email: ${user[0]?.email},
      Telephone Number: ${user[0]?.phonenumber}, 
      Top Up Amount: ${currencyFormatter(req?.body?.amount)}
      `;

      await knex("notifications").insert({
        _id: generateId(),
        title: "Wallet top up request",
        message,
      });

      // await sendEMail(
      //   process.env.MAIL_CLIENT_USER,
      //   mailTextShell(body),
      //   "Wallet Top Up Request"
      // );


      res.status(200).json("Request Sent!");
    } catch (error) {
      res.status(500).json("An unknown error has occurred");
    }
  })
);

//update wallet pin
router.put(
  "/wallet",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id, email } = req.user;
    const { _id, pin, isAdmin, userEmail } = req.body;

    const userId = isAdmin ? _id : id;
    const emailAddress = isAdmin ? userEmail : email;

    const hashedPin = await bcrypt.hash(pin, 10)

    const wallet = await knex("user_wallets")
      .where("user_id", userId)
      .update("user_key", hashedPin);

    if (wallet !== 1) {
      return res
        .status(400)
        .json("Error updating user pin! Please try again later.");
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

module.exports = router;
