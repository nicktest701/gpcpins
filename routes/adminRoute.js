const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const { otpGen } = require("otp-gen-agent");
const { signMainToken } = require("../config/token");
const multer = require("multer");
const { rateLimit } = require("express-rate-limit");
const sendMail = require("../config/sendEmail");
const { verifyToken } = require("../middlewares/verifyToken");
const { isValidUUID2 } = require("../config/validation");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { uploadPhoto } = require("../config/uploadFile");
const { mailTextShell } = require("../config/mailText");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

//model
const { hasTokenExpired } = require("../config/dateConfigs");

const knex = require("../db/knex");
const { sendOTPSMS } = require("../config/sms");
const generateId = require("../config/generateId");
const redisClient = require("../config/redisClient");
const { storeOTP, verifyOTP } = require("../services/otp.services");

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

// Define the route for getting all non-admin users
router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { email } = req.user;

    // Fetch all non-admin users from the database
    const users = await knex("vw_users_with_roles")
      .where({ role: process.env.EMPLOYEE_ID })
      .whereIn("role", "IN", [process.env.EMPLOYEE_ID, process.env.ADMIN_ID])
      .whereNot("email", email);

    // Map through the users and modify the permissions property
    const modifiedusers = users.map(
      ({ role, permissions, password, ...rest }) => {
        // Parse the permissions string to a JSON object
        return {
          ...rest,
          role: role === process.env.ADMIN_ID ? "Administrator" : "user",
          permissions: JSON.parse(permissions),
        };
      },
    );

    // Send the modified users as a JSON response with a 200 status code
    res.status(200).json(modifiedusers);
  }),
);

router.post(
  "/verify",
  limit,
  asyncHandler(async (req, res) => {
    const { id, token } = req.body;
    console.log(req.body);

    if (!id || !isValidUUID2(id) || !token) {
      return res.status(400).json("An unknown error has occurred!");
    }

    const result = await verifyOTP(
      id,
      token,
      "gpcpins_password_reset",
      "gpcpins_password_reset_attempts",
    );

    if (!result.success) {
      return res.status(400).json("Invalid or expired token!");
    }

    res.status(201).json({
      user: {
        id,
      },
    });
  }),
);

//@GET user by email
router.post(
  "/login",
  limit,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await knex("users")
        .join("roles", "users.role_id", "roles.id")
        .select("email", "phonenumber", "password", "role_id", "code", "active")
        .where("email", email)
        .first();

      if (
        [process.env.ADMIN_ID, process.env.EMPLOYEE_ID].indexOf(user?.code) ===
        -1
      ) {
        return res.status(401).json("Unauthorized Access!!");
      }

      if (_.isEmpty(user)) {
        return res.status(400).json("Invalid Email or Password!!");
      }

      const passwordIsValid = await bcrypt.compare(password, user?.password);

      if (!passwordIsValid) {
        return res.status(400).json("Invalid Email or Password!");
      }

      if (user?.active === 0) {
        return res.status(400).json("Account disabled!");
      }

      const otp = await otpGen();

      if (process.env.NODE_ENV !== "production") {
        console.log(otp);
      }

      await storeOTP(user?.id, otp);

      const message = `
        <div style="width:100%;max-width:500px;margin-inline:auto;">
      <p>Please ignore this message if you did not request the OTP.</p>
        <p>Your verification code is</p>
        <h1>${otp}</h1>
        <p>If the code is incorrect or expired, you will not be able to proceed. Request a new code if necessary.</p>

        <p>-- Gab Powerful Team --</p>
    </div>
        `;

      if (process.env.NODE_ENV !== "production") {
        console.log(otp);
      }

      await sendMail(user?.email, mailTextShell(message));

      await sendOTPSMS(
        `Please ignore this message if you did not request the OTP.Your verification code is ${otp}.If the code is incorrect or expired, you will not be able to proceed. Request a new code if necessary.`,
        user?.phonenumber,
      );

      res.status(201).json({
        id: user?.id,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json("An error has occurred!");
    }
  }),
);

router.get(
  "/sms",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    try {
      const sms = await redisClient.get("sms");
      res.json({ sms });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error fetching from Redis" });
    }
  }),
);

router.post(
  "/sms",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { api } = req.body;

    try {
      await redisClient.set("sms", api);
      res.json("SMS API saved successfully");
    } catch (error) {
      res.status(500).json("Error saving to Redis");
    }
  }),
);

router.put(
  "/",
  limit,
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { _id, ...rest } = req.body;

    const updateduser = await knex("users").where("id", _id).update(rest);

    if (updateduser !== 1) {
      return res.status(400).json("Error updating user information.");
    }
    //logs
    await knex("activity_logs").insert({
      user_id: id,
      title: "Updated account details.",
      severity: "info",
    });

    const user = await knex("vw_users_with_roles")
      .select("*")
      .where("id", _id)
      .first();

    if (_.isEmpty(user)) {
      return res.status(404).json("Error! Could not save changes.");
    }

    const { active, isAdmin, permissions, isEnabled, ...rests } = user;

    const authUser = {
      ...rests,
      permissions: JSON.parse(permissions),
      active: Boolean(active),
      isAdmin: Boolean(isAdmin),
      isEnabled: Boolean(isEnabled),
    };

    const accessToken = await signMainToken(authUser, "15m");

    res.status(201).json({
      accessToken,
    });
  }),
);

router.put(
  "/password",
  limit,
  asyncHandler(async (req, res) => {
    const { id, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const modifiedUser = await knex("users").where("id", id).update({
      password: hashedPassword,
    });

    if (modifiedUser !== 1) {
      return res.status(404).json("Error updating userinformation.");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: id,
      title: "Updated account password!",
      severity: "info",
    });

    res.status(201).json("ok");
  }),
);

router.put(
  "/password-reset",
  limit,
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id, oldPassword, password } = req.body;

    const userPassword = await knex("users")
      .select("password")
      .where("id", id)
      .first();

    const passwordIsValid = await bcrypt.compare(
      oldPassword,
      userPassword?.password,
    );

    if (!passwordIsValid) {
      return res.status(400).json("Invalid Password!");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const modifiedUser = await knex("users").where("id", id).update({
      password: hashedPassword,
    });

    if (modifiedUser !== 1) {
      return res.status(404).json("Error updating user information.");
    }
    //logs
    await knex("activity_logs").insert({
      user_id: id,
      title: "Updated account password!",
      severity: "info",
    });

    res.status(201).json("ok");
  }),
);

router.put(
  "/profile",
  limit,
  verifyToken,
  verifyAdmin,
  Upload.single("profile"),
  asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!req.file) {
      return res.status(404).json("No Image was found!");
    }

    let url = req.file?.filename;

    if (req.file) {
      url = await uploadPhoto(req.file);
    }

    const user = await knex("users").where("_id", id).update({ profile: url });

    if (user !== 1) {
      return res.status(404).json("An unknown error has occurred!");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: id,
      title: "Updated account profile!",
      severity: "info",
    });

    res.status(201).json(url);
  }),
);

//@DELETE student
router.delete(
  "/:id",
  limit,
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(401).json("Invalid Request!");
    }

    const user = await knex("users").where("id", id).del();

    if (!user) {
      return res.status(500).json("Invalid Request!");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: _id,
      title: "Deleted an user account!",
      severity: "error",
    });

    res.status(200).json("User Removed!");
  }),
);

module.exports = router;
