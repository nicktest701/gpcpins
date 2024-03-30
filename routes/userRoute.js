const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { otpGen, customOtpGen } = require("otp-gen-agent");
const multer = require("multer");
const moment = require("moment");
const { rateLimit } = require("express-rate-limit");
const axios = require("axios");
const cron = require("node-cron");
const {
  signAccessToken,
  signRefreshToken,
  signSampleRefreshToken,
  signSampleToken,
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
  max: 15, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

//model
const { mailTextShell } = require("../config/mailText");
const { hasTokenExpired } = require("../config/dateConfigs");
// const isMobile = require("../config/isMobile");

//db
const knex = require("../db/knex");
const { isValidUUID2, isValidEmail } = require("../config/validation");
const sendEMail = require("../config/sendEmail");
const { sendBirthdayWishes } = require("../config/cronMessages");
const currencyFormatter = require("../config/currencyFormatter");
const { sendSMS, sendOTPSMS } = require("../config/sms");

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    const ext = file?.mimetype?.split("/")[1];

    cb(null, `${randomUUID()}.${ext}`);
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

    const updatedUser = {
      id,
      active,
      role,
      createdAt,
    };

    const accessToken = signAccessToken(user[0]);
    const refreshToken = signRefreshToken(updatedUser);

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
    await knex("users").where("_id", id).update({
      token: hashedToken,
    });

    // if (isMobile(req)) {
    res.status(200).json({
      refreshToken,
      accessToken,
    });
    // }

    // res.sendStatus(200);
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
      req.body._id = randomUUID();
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
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json("Invalid Email Address!");
    }

    const user = await knex("users")
      .select("email", "active")
      .where("email", email)
      .limit(1);

    if (_.isEmpty(user)) {
      return res.status(404).json("We could not find your Email Address!");
    }

    const token = await otpGen();

    console.log(token);

    await knex("tokens").insert({
      _id: randomUUID(),
      token,
      email: user[0]?.email,
    });

    const message = `
        <div style="width:100%;max-width:500px;margin-inline:auto;">
        <h2>Gab Powerful Consult</h2>
        <p>Your verification code is</p>
        <h1>${token}</h1>

        <p>-- Gab Powerful Team --</p>
    </div>
        `;

    try {
      await sendMail(user[0]?.email, mailTextShell(message));
    } catch (error) {
      await knex("tokens").where("email", user[0]?.email).del();

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

    if (!credential) {
      return res.status(400).json("Authentication Failed");
    }
    const decodedUser = jwt.decode(credential);

    let user = await knex("users")
      .select("email")
      .where("email", decodedUser?.email)
      .limit(1);

    if (_.isEmpty(user)) {
      const info = {
        _id: randomUUID(),
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

      const user_key = await customOtpGen({ length: 4 });
      await knex("user_wallets").insert({
        _id: randomUUID(),
        user_id: info?._id,
        user_key,
      });
    } else {
      await knex("users").where("email", decodedUser?.email).update({
        firstname: decodedUser?.given_name,
        lastname: decodedUser?.family_name,
        phonenumber: decodedUser?.phoneNumber,
        profile: decodedUser?.picture,
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

    const accessToken = signAccessToken(accessData);
    const refreshToken = signRefreshToken(updatedUser);

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

    // let user = await User.findByEmail(email);
    let user = await knex("users")
      .select("email")
      .where("email", email)
      .limit(1);

    if (_.isEmpty(user)) {
      req.body._id = randomUUID();
      req.body.role = process.env.USER_ID;
      req.body.active = true;

      await knex("users").insert(req.body);

      const user_key = await customOtpGen({ length: 4 });
      await knex("user_wallets").insert({
        _id: randomUUID(),
        user_id: req.body?._id,
        user_key,
      });
    } else {
      await knex("users").where("email", email).update({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phonenumber: req.body.phonenumber,
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

    const accessToken = signAccessToken(accessData);
    const refreshToken = signRefreshToken(updatedUser);

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
      newUser._id = randomUUID();
      newUser.role = process.env.USER_ID;

      const user = await transx("users").insert(newUser);

      if (_.isEmpty(user)) {
        return res.status(400).json("Error occurred.Could not create user.");
      }
      const userData = await transx("users")
        .select("*", knex.raw("CONCAT(firstname,'',lastname) as name"))
        .where("_id", newUser._id);

      const user_key = await customOtpGen({ length: 4 });
      await transx("user_wallets").insert({
        _id: randomUUID(),
        user_id: newUser._id,
        user_key,
      });

      const token = await otpGen();
      console.log(token);

      await transx("tokens").insert({
        _id: randomUUID(),
        token,
        email: userData[0]?.email,
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
      await sendMail(userData[0]?.email, mailTextShell(message));
      await transx.commit();
    } catch (error) {
      await transx.rollback();
      return res.status(500).json("An error has occurred");
    }

    res.sendStatus(201);
  })
);

router.post(
  "/verify-otp",
  limit,
  asyncHandler(async (req, res) => {
    const { email, token } = req.body;

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

    await knex("users")
      .where("email", userToken[0]?.email)
      .update({ active: 1 });

    const user = await knex("users")
      .select("*", knex.raw("CONCAT(firstname,'',lastname) as name"))
      .where("email", userToken[0]?.email);

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

    const accessToken = signAccessToken(accessData);
    const refreshToken = signRefreshToken(updatedUser);

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

    res.sendStatus(204);
  })
);

router.put(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id, admin, iat, exp, ...rest } = req.body;

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

    const accessToken = signAccessToken(accessData);
    const refreshToken = signRefreshToken(updatedUser);

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await knex("users").where("_id", user[0]?.id).update({
      token: hashedToken,
    });

    res.status(201).json({
      refreshToken,
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
      .update({ active: active });

    if (updatedUser !== 1) {
      return res.status(400).json("Error updating user info");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: `${
        Boolean(active) === true
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
  "/wallet/balance",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

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

    const sDate = moment(startDate).format("MMMM DD YYYY");
    const eDate = moment(endDate).format("MMMM DD YYYY");

    const transactions = await knex.raw(
      `SELECT *
        FROM (
            SELECT _id,user_id,amount,status,createdAt,DATE_FORMAT(createdAt,'%M %d %Y') AS purchaseDate
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

      <p>A request has been placed by <strong>${
        user[0]?.name
      }</strong> to top up wallet balance.
      <p><strong>Name:</strong> ${user[0]?.name}</p>
      <p><strong>Email:</strong> ${user[0]?.email}</p><br/>
      <p><strong>Telephone Number:</strong> ${user[0]?.phonenumber}</p><br/>
      <p><strong>Top Up Amount:</strong> ${currencyFormatter(
        req?.body?.amount
      )}</p><br/>
       
      </div>
      </div>`;

      const message = `A request has been placed by '${
        user[0]?.name
      }' to top up wallet balance.
      Name: ${user[0]?.name}
      Email: ${user[0]?.email}
      Telephone Number: ${user[0]?.phonenumber} 
      Top Up Amount: ${currencyFormatter(req?.body?.amount)}
      `;

      await knex("notifications").insert({
        _id: randomUUID(),
        title: "Wallet top up request",
        message,
      });

      await sendEMail(
        process.env.MAIL_CLIENT_USER,
        mailTextShell(body),
        "Wallet Top Up Request"
      );

      res.status(200).json("Request Sent!");
    } catch (error) {
      res.status(500).json("An unkonwn error has occurred");
    }
  })
);

module.exports = router;
