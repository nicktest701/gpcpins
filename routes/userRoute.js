const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { otpGen } = require("otp-gen-agent");
const multer = require("multer");
const { rateLimit } = require("express-rate-limit");
const axios = require("axios");

const { signAccessToken, signRefreshToken } = require("../config/token");
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
const isMobile = require("../config/isMobile");

//db
const knex = require("../db/knex");
const { isValidUUID2, isValidEmail } = require("../config/validation");

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

const ACCESS_EXPIRATION = new Date(Date.now() + 3600000);
const REFRESH_EXPIRATION = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const users = await knex("users").select(
      "_id",
      "profile",
      "name",
      "nid",
      "dob",
      "email",
      "phonenumber",
      "active"
    );

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
        "name",
        "email",
        "nid",
        "dob",
        "phonenumber",
        "role",
        "active"
      )
      .where("_id", id)
      .limit(1);

    if (_.isEmpty(user) || user[0]?.active === 0) {
      return res.sendStatus(204);
    }

    res.status(200).json({
      user: {
        id: user[0]?._id,
        name: user[0]?.name,
        email: user[0]?.email,
        role: user[0]?.role,
        nid: user[0]?.nid,
        dob: user[0]?.dob,
        phonenumber: user[0]?.phonenumber,
        profile: user[0]?.profile,
      },
    });
  })
);

router.get(
  "/auth/token",
  // limit,
  verifyRefreshToken,
  asyncHandler(async (req, res) => {
    const { id, active, role, createdAt } = req.user;

    const updatedUser = {
      id,
      active,
      role,
      createdAt,
    };

    const accessToken = signAccessToken(updatedUser);
    const refreshToken = signRefreshToken(updatedUser);

    res.cookie("_SSUID_kyfc", accessToken, {
      maxAge: 1 * 60 * 60 * 1000,
      expires: ACCESS_EXPIRATION,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    res.cookie("_SSUID_X_ayd", refreshToken, {
      maxAge: 90 * 24 * 60 * 60 * 1000,
      expires: REFRESH_EXPIRATION,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await knex("users").where("_id", id).update({
      token: hashedToken,
    });

    if (isMobile(req)) {
      return res.status(200).json({
        refreshToken,
      });
    }

    res.sendStatus(200);
  })
);

//@GET user by email
router.post(
  "/sample",
  limit,
  asyncHandler(async (req, res) => {
    const email = req.body.email || "test@test.com";

    let user = await knex("users").select("*").where("email", email).limit(1);

    if (_.isEmpty(user[0])) {
      req.body._id = randomUUID();
      req.body.role = process.env.USER_ID;
      req.body.email = email;

      await knex("users").insert(req.body);
      console.log(req.body);
      user = await knex("users").select("*").where("email", email).limit(1);
    }

    const updatedUser = {
      id: user[0]?._id,
      role: user[0]?.role,
      active: user[0]?.active,
      createdAt: user[0]?.createdAt,
    };

    const accessToken = signAccessToken(updatedUser);
    const refreshToken = signRefreshToken(updatedUser);

    res.cookie("_SSUID_kyfc", accessToken, {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    res.cookie("_SSUID_X_ayd", refreshToken, {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await knex("users").where("_id", user[0]?._id).update({
      token: hashedToken,
    });

    if (isMobile(req)) {
      return res.status(200).json({
        refreshToken,
      });
    }

    res.sendStatus(201);
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
      return res.status(404).json("Invalid Email Address!");
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
      .select("*")
      .where("email", decodedUser?.email)
      .limit(1);

    if (_.isEmpty(user)) {
      const info = {
        _id: randomUUID(),
        name: decodedUser?.name,
        email: decodedUser?.email,
        phonenumber: decodedUser?.phoneNumber,
        profile: decodedUser?.picture,
        role: process.env.USER_ID,
        active: true,
      };

      await knex("users").insert(info);
    } else {
      await knex("users").where("email", decodedUser?.email).update({
        name: decodedUser?.name,
        phonenumber: decodedUser?.phoneNumber,
        active: 1,
      });
    }
    user = await knex("users")
      .select("*")
      .where("email", decodedUser?.email)
      .limit(1);

    const updatedUser = {
      id: user[0]?._id,
      role: user[0]?.role,
      active: true,
      createdAt: user[0]?.createdAt,
    };

    const accessToken = signAccessToken(updatedUser);
    const refreshToken = signRefreshToken(updatedUser);

    res.cookie("_SSUID_kyfc", accessToken, {
      maxAge: 1 * 60 * 60 * 1000,
      expires: ACCESS_EXPIRATION,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    res.cookie("_SSUID_X_ayd", refreshToken, {
      maxAge: 90 * 24 * 60 * 60 * 1000,
      expires: REFRESH_EXPIRATION,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await knex("users").where("_id", user[0]?._id).update({
      token: hashedToken,
    });

    if (isMobile(req)) {
      return res.status(201).json({
        user: {
          id: user[0]?._id,
          name: user[0]?.name,
          email: user[0]?.email,
          phonenumber: user[0]?.phonenumber,
          dob: user[0]?.dob,
          nid: user[0]?.nid,
          role: user[0]?.role,
          profile: user[0]?.profile,
        },
        refreshToken,
      });
    }

    res.status(201).json({
      user: {
        id: user[0]?._id,
        name: user[0]?.name,
        email: user[0]?.email,
        dob: user[0]?.dob,
        nid: user[0]?.nid,
        phonenumber: user[0]?.phonenumber,
        role: user[0]?.role,
        profile: user[0]?.profile,
      },
    });
  })
);

router.post(
  "/login-google",
  limit,
  asyncHandler(async (req, res) => {
    const email = req.body.email;

    // let user = await User.findByEmail(email);
    let user = await knex("users").select("*").where("email", email).limit(1);

    if (_.isEmpty(user)) {
      req.body._id = randomUUID();
      req.body.role = process.env.USER_ID;
      req.body.active = true;

      await knex("users").insert(req.body);
    } else {
      await knex("users").where("email", email).update({
        name: req.body.name,
        phonenumber: req.body.phonenumber,
        active: 1,
      });
    }
    user = await knex("users").select("*").where("email", email).limit(1);

    const updatedUser = {
      id: user[0]?._id,
      role: user[0]?.role,
      active: true,
      createdAt: user[0]?.createdAt,
    };

    const accessToken = signAccessToken(updatedUser);
    const refreshToken = signRefreshToken(updatedUser);

    res.cookie("_SSUID_kyfc", accessToken, {
      maxAge: 1 * 60 * 60 * 1000,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    res.cookie("_SSUID_X_ayd", refreshToken, {
      maxAge: 90 * 24 * 60 * 60 * 1000,
      expires: REFRESH_EXPIRATION,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await knex("users").where("_id", user[0]?._id).update({
      token: hashedToken,
    });

    if (isMobile(req)) {
      return res.status(201).json({
        user: {
          id: user[0]?._id,
          name: user[0]?.name,
          email: user[0]?.email,
          dob: user[0]?.dob,
          nid: user[0]?.nid,
          phonenumber: user[0]?.phonenumber,
          role: user[0]?.role,
          profile: user[0]?.profile,
        },

        refreshToken,
      });
    }

    res.status(201).json({
      user: {
        id: user[0]?._id,
        name: user[0]?.name,
        email: user[0]?.email,
        dob: user[0]?.dob,
        nid: user[0]?.nid,
        phonenumber: user[0]?.phonenumber,
        role: user[0]?.role,
        profile: user[0]?.profile,
      },
    });
  })
);

router.post(
  "/",
  limit,
  asyncHandler(async (req, res) => {
    const newUser = req.body;

    const doesUserExists = await knex("users")
      .select("*")
      .where("email", newUser.email)
      .limit(1);

    if (!_.isEmpty(doesUserExists[0])) {
      return res.status(400).json("Email address already taken!");
    }
    newUser._id = randomUUID();
    newUser.role = process.env.USER_ID;

    const user = await knex("users").insert(newUser);

    if (_.isEmpty(user)) {
      return res.status(400).json("Error occurred.Could not create user.");
    }
    const userData = await knex("users").select("*").where("_id", newUser._id);

    const token = await otpGen();
    console.log(token);

    await knex("tokens").insert({
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

    try {
      await sendMail(userData[0]?.email, mailTextShell(message));
    } catch (error) {
      await knex("tokens").where("email", userData[0]?.email).del();

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
      .select("*")
      .where("email", userToken[0]?.email);

    if (_.isEmpty(user)) {
      return res.status(401).json("Authentication Failed!");
    }

    const updatedUser = {
      id: user[0]?._id,
      role: user[0]?.role,
      active: user[0]?.active,
      createdAt: user[0]?.createdAt,
    };

    const accessToken = signAccessToken(updatedUser);
    const refreshToken = signRefreshToken(updatedUser);

    res.cookie("_SSUID_kyfc", accessToken, {
      maxAge: 1 * 60 * 60 * 1000,
      expires: ACCESS_EXPIRATION,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    res.cookie("_SSUID_X_ayd", refreshToken, {
      maxAge: 90 * 24 * 60 * 60 * 1000,
      expires: REFRESH_EXPIRATION,
      httpOnly: true,
      path: "/",
      secure: true,
      // domain:
      // process.env.NODE_ENV !== 'production' ? 'localhost' : '.gpcpins.com',
      sameSite: "none",
    });

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await knex("users").where("_id", user[0]?._id).update({
      token: hashedToken,
    });

    if (isMobile(req)) {
      return res.status(201).json({
        user: {
          id: user[0]?._id,
          name: user[0]?.name,
          email: user[0]?.email,
          dob: user[0]?.dob,
          nid: user[0]?.nid,
          phonenumber: user[0]?.phonenumber,
          role: user[0]?.role,
          profile: user[0]?.profile,
        },

        refreshToken,
      });
    }

    res.status(201).json({
      user: {
        id: user[0]?._id,
        name: user[0]?.name,
        email: user[0]?.email,
        dob: user[0]?.dob,
        nid: user[0]?.nid,
        phonenumber: user[0]?.phonenumber,
        role: user[0]?.role,
        profile: user[0]?.profile,
      },
      // token: accessToken,
    });
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

    res.cookie("_SSUID_kyfc", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    res.cookie("_SSUID_X_ayd", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });
    res.clearCookie("_SSUID_kyfc");
    res.clearCookie("_SSUID_X_ayd");
    req.user = null;

    res.sendStatus(204);
  })
);

router.put(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id, ...rest } = req.body;

    const updatedUser = await knex("users").where("_id", id).update(rest);

    if (updatedUser !== 1) {
      return res.status(400).json("Error updating user information.");
    }

    const user = await knex("users")
      .select(
        "_id",
        "name",
        "email",
        "role",
        "nid",
        "dob",
        "phonenumber",
        "profile"
      )
      .where("_id", id);

    res.status(201).json({
      user: {
        id: user[0]?._id,
        name: user[0]?.name,
        email: user[0]?.email,
        dob: user[0]?.dob,
        nid: user[0]?.nid,
        phonenumber: user[0]?.phonenumber,
        role: user[0]?.role,
        profile: user[0]?.profile,
      },
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

    res.status(201).json("Profile Updated!");
  })
);

//Enable or Disable User Account
router.put(
  "/account",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id, active } = req.body;

    const updatedUser = await knex("users")
      .where("_id", id)
      .update({ active: active });

    if (updatedUser !== 1) {
      return res.status(400).json("Error updating user info");
    }

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
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(401).json("Invalid User information!");
    }

    const user = await knex("users").where("_id", id).del();

    if (user !== 1) {
      return res.status(500).json("Invalid Request!");
    }
    res.status(200).json("User Removed!");
  })
);

module.exports = router;
