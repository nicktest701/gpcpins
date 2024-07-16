const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const { otpGen } = require("otp-gen-agent");
const { signMainToken, signMainRefreshToken } = require("../config/token");
const multer = require("multer");
const moment = require('moment')
const { rateLimit } = require("express-rate-limit");
const sendMail = require("../config/sendEmail");
const {
  verifyToken,
  verifyRefreshToken,
} = require("../middlewares/verifyToken");
const { isValidUUID2 } = require("../config/validation");
const verifyScanner = require("../middlewares/verifyScanner");
const { uploadPhoto } = require("../config/uploadFile");
const { mailTextShell } = require("../config/mailText");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10000, // 5 requests per windowMs
  message: "Too many requests! Please try again later.",
});

//model
const { hasTokenExpired } = require("../config/dateConfigs");

const knex = require("../db/knex");
const { sendOTPSMS } = require("../config/sms");
const generateId = require("../config/generateId");

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

// Define the route for getting all non-scanner verifiers
router.get(
  '/',
  // verifyToken,
  // verifyScanner,
  // Handle async errors
  asyncHandler(async (req, res) => {
    // const { email } = req.user

    // Fetch all non-scanner verifiers from the database
    const verifiers = await knex("verifiers")
      .select(
        "_id",
        "firstname",
        "lastname",
        "username",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "phonenumber",
        "nid",
        "dob",
        "residence",
        "role",
        "profile",
        "active"
      );
    // const verifiers = await knex('verifiers').whereNot('email', email);

    // Map through the verifiers and modify the permissions property
    const modifiedVerifiers = verifiers.map(({ role, permissions, ...rest }) => {
      // Parse the permissions string to a JSON object
      return {
        ...rest,
        // permissions: JSON.parse(permissions),
      };
    });

    // Send the modified verifiers as a JSON response with a 200 status code
    res.status(200).json(modifiedVerifiers);
  })
);

router.get(
  "/auth",
  limit,
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const verifier = await knex("verifiers")
      .select(
        "_id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "nid",
        "dob",
        "residence",
        "permissions",
        "email",
        "role",
        "phonenumber",
        "profile"
      )
      .where("_id", id)
      .limit(1);

    if (_.isEmpty(verifier) || verifier[0]?.active === 0) {
      return res.sendStatus(204);
    }

    res.status(200).json({
      user: {
        id: verifier[0]?._id,
        firstname: verifier[0]?.firstname,
        lastname: verifier[0]?.lastname,
        name: verifier[0]?.name,
        email: verifier[0]?.email,
        role: verifier[0]?.role,
        permissions: JSON.parse(verifier[0]?.permissions),
        phonenumber: verifier[0]?.phonenumber,
        profile: verifier[0]?.profile,
      },
    });
  })
);



router.get(
  "/auth/token",
  limit,
  verifyRefreshToken,
  asyncHandler(async (req, res) => {
    const { id, isAdmin, active, role, createdAt } = req.user;

    const updatedVerifier = {
      id,
      active,
      role,
      isAdmin,
      createdAt,
    };

    const accessToken = signMainToken(updatedVerifier, "15m");

    res.status(200).json({
      accessToken,
    });

  })
);

router.get(
  "/verify-identity",
  verifyToken,
  // verifyScanner,
  asyncHandler(async (req, res) => {
    const { id } = req.user
    const { nid, dob } = req.query;


    const verifiers = await knex("verifiers").where({ _id: id })
      .select('nid', 'dob', knex.raw("DATE_FORMAT(dob,'%D %M %Y') as dobb"))
      .limit(1);


    if (_.isEmpty(verifiers[0])) {
      return res.status(400).json('Invalid Request!');
    }

    if (nid && verifiers[0]?.nid !== nid) {

      return res.status(400).json("Sorry.We couldn't find your National ID.");
    }

    if (dob) {
      const formattedDate = moment(dob).format('Do MMMM YYYY')

      if (verifiers[0]?.dobb !== formattedDate) {

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
  // verifyScanner,
  asyncHandler(async (req, res) => {

    const { id } = req.user;
    const { code } = req.query;

    if (code) {
      const verifierToken = await knex("verify_tokens")
        .select("_id", "code")
        .where({
          _id: id,
          code,
        })
        .limit(1);

      if (_.isEmpty(verifierToken) || Number(code) !== Number(verifierToken[0]?.code)) {
        return res.status(400).json("Invalid code.Try again");
      }
    } else {
      const verifier = await knex("verifiers")
        .select("_id", "phonenumber", "active")
        .where("_id", id)
        .limit(1);

      if (_.isEmpty(verifier) && !verifier[0]?.phonenumber) {
        return res.status(400).json("Invalid Request");
      }

      const code = await otpGen();
      await knex("verify_tokens").upsert({
        _id: id,
        code,
      });
      console.log(code);

      sendOTPSMS(`Your verification code is ${code}.`, verifier[0]?.phonenumber);
    }

    res.sendStatus(201);
  })
);

router.get(
  "/:id",
  // verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const verifier = await knex("verifiers")
      .select(
        "_id",
        "firstname",
        "lastname",
        "username",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "nid",
        "dob",
        "residence",
        "permissions",
        "phonenumber",
        "role",
        "profile",
        "active"
      )
      .where({
        _id: id,
      })
      .limit(1);

    if (_.isEmpty(verifier)) {
      return res.status(400).json({});
    }

    const { permissions, role, ...rest } = verifier[0];

    const modifiedVerifier = {
      ...rest,
      permissions: JSON.parse(permissions),
      role: role === process.env.ADMIN_ID ? "Administrator" : "Verifier",
    };

    res.status(200).json(modifiedVerifier);
  })
);
router.post(
  "/",
  // verifyToken,
  Upload.single("profile"),
  asyncHandler(async (req, res) => {
    // const { id } = req.user;
    const newVerifier = req.body;

    const transx = await knex.transaction();

    const doesVerifierExists = await transx("verifiers")
      .select("email")
      .where("email", newVerifier.email)
      .limit(1);

    if (!_.isEmpty(doesVerifierExists[0])) {
      return res
        .status(400)
        .json("An verifier with this account already exists!");
    }

    const doesUserNameExists = await transx("verifiers")
      .select("username")
      .where("username", newVerifier?.username)
      .limit(1);

    if (!_.isEmpty(doesUserNameExists)) {
      return res
        .status(400)
        .json(`Username, '${newVerifier?.username}' is not available!`);
    }

    if (req.body?.role === "Verifier") {
      newVerifier.role = process.env.VERIFIER_ID;
    }

    if (req.body?.role === "Administrator") {
      newVerifier.role = process.env.ADMIN_ID;
    }

    newVerifier.profile = req.file?.filename;

    if (req.file) {
      const url = await uploadPhoto(req.file);
      newVerifier.profile = url;
    }

    const _id = generateId();
    const verifier = await transx("verifiers").insert({
      _id,
      ...newVerifier,
      permissions: JSON.stringify([]),
    });

    if (_.isEmpty(verifier)) {
      res.status(400).json("Error saving verifier information!");
    }

    //logs
    // await transx("activity_logs").insert({
    //   verifier_id: id,
    //   title: "Created new verifier account.",
    //   severity: "info",
    // });

    await transx.commit();

    // try {
    //   // await sendMail(newVerifier?.email, mailTextShell(message));
    // } catch (error) {
    //   await transx.rollback();

    //   return res.status(400).json("An error has occurred.Try again later");
    // }

    res.status(201).json("Verifier saved successfully!!!");
  })
);


//@GET verifier by email
router.post(
  "/login",
  limit,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const verifier = await knex("verifiers")
      .select("email", "password", "active")
      .where("email", email)
      .limit(1);

    if (_.isEmpty(verifier[0])) {
      return res.status(400).json("Invalid Email or Password!!");
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      verifier[0]?.password
    );

    if (!passwordIsValid) {
      return res.status(400).json("Invalid Email or Password!");
    }

    if (verifier[0]?.active === 0) {
      return res.status(400).json("Account disabled!");
    }

    const token = await otpGen();

    await knex("tokens").insert({
      _id: generateId(),
      token,
      email: verifier[0]?.email,
    });

    const message = `
        <div style="width:100%;max-width:500px;margin-inline:auto;">
    
        <p>Your verification code is</p>
        <h1>${token}</h1>

        <p>-- Gab Powerful Team --</p>
    </div>
        `;

    if (process.env.NODE_ENV !== "production") {
      console.log(token);
    }

    try {
      await sendMail(verifier[0]?.email, mailTextShell(message));
    } catch (error) {
      await knex("tokens").where("email", verifier[0]?.email).del();

      return res.status(500).json("An error has occurred!");
    }

    res.sendStatus(201);
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

    const verifierToken = await knex("tokens")
      .where({
        _id: id,
        token,
      })
      .select("*");

    if (_.isEmpty(verifierToken)) {
      return res.status(400).json("An unknown error has occurred!");
    }

    if (hasTokenExpired(verifierToken[0]?.createdAt)) {
      return res.status(400).json("Sorry! Your link has expired.");
    }

    await knex("verifiers")
      .where("email", verifierToken[0]?.email)
      .update({ active: 1 });

    const verifier = await knex("verifiers")
      .select("_id")
      .where({
        email: verifierToken[0]?.email,
      })
      .limit(1);

    res.status(201).json({
      user: {
        id: verifier[0]?._id,
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

    const verifierToken = await knex("tokens")
      .select("*")
      .where({
        email,
        token,
      })
      .limit(1);

    if (_.isEmpty(verifierToken)) {
      return res.status(400).json("Invalid Code");
    }

    if (hasTokenExpired(verifierToken[0]?.createdAt)) {
      return res.status(400).json("Sorry! Your code has expired.");
    }

    await knex("verifiers")
      .where("email", verifierToken[0]?.email)
      .update({ active: 1 });

    const verifier = await knex("verifiers")

      .select("_id ",
        "_id as id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "role",
        "phonenumber",
        "profile",
        "isAdmin",
        "active",
        'createdAt')
      .where("email", verifierToken[0]?.email);

    if (_.isEmpty(verifier)) {
      return res.status(401).json("Authentication Failed!");

    }

    const { active, isAdmin, permissions, ...rests } = verifier[0];

    const authVerifier = {
      ...rests,
      active: Boolean(active),
      isAdmin: Boolean(isAdmin)

    };

    const updatedVerifier = {
      id: verifier[0]?._id,
      role: verifier[0]?.role,
      active: verifier[0]?.active,
      createdAt: verifier[0]?.createdAt,
      isActive: Boolean(verifier[0]?.isActive),
    };

    const accessToken = signMainToken(authVerifier, "15m");
    const refreshToken = signMainRefreshToken(updatedVerifier, "24h");

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await knex("verifiers").where("_id", verifier[0]?._id).update({
      token: hashedToken,
    });

    //logs
    await knex("verifier_activity_logs").insert({
      verifier_id: verifier[0]?._id,
      title: "Logged into account.",
      severity: "info",
    });

    // if (isMobile(req)) {
    res.status(201).json({
      user: {
        id: verifier[0]?._id,
        firstname: verifier[0]?.firstname,
        lastname: verifier[0]?.lastname,
        name: verifier[0]?.name,
        email: verifier[0]?.email,
        phonenumber: verifier[0]?.phonenumber,
        role: verifier[0]?.role,
        profile: verifier[0]?.profile,
      },
      accessToken,
      refreshToken,
    });



  })
);

router.post(
  "/logout",
  verifyToken,
  // verifyScanner,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    //logs
    await knex("verifier_activity_logs").insert({
      verifier_id: id,
      title: "Logged out of account.",
      severity: "info",
    });


    req.user = null;

    res.sendStatus(204);
  })
);

router.put(
  "/",
  verifyToken,
  // verifyScanner,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { _id, ...rest } = req.body;

    const updatedVerifier = await knex("verifiers")
      .where("_id", _id)
      .update(rest);

    if (updatedVerifier !== 1) {
      return res.status(400).json("Error updating verifier information.");
    }

    const verifier = await knex("verifiers")
      .select(
        "_id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "nid",
        "dob",
        "residence",
        "role",
        "permissions",
        "phonenumber",
        "profile"
      )
      .where("_id", _id);

    //logs
    await knex("verifier_activity_logs").insert({
      verifier_id: id,
      title: "Updated account details.",
      severity: "info",
    });

    res.status(201).json({
      user: {
        id: verifier[0]?._id,
        firstname: verifier[0]?.firstname,
        lastname: verifier[0]?.lastname,
        name: verifier[0]?.name,
        email: verifier[0]?.email,
        phonenumber: verifier[0]?.phonenumber,
        permissions: JSON.parse(verifier[0]?.permissions),
        role: verifier[0]?.role,
        profile: verifier[0]?.profile,
      },
    });
  })
);

router.put(
  "/password",
  limit,
  asyncHandler(async (req, res) => {
    const { id, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const modifiedVerifier = await knex("verifiers").where("_id", id).update({
      password: hashedPassword,
    });

    if (modifiedVerifier !== 1) {
      return res.status(404).json("Error updating verifier information.");
    }
    const verifier = await knex("verifiers")
      .select(
        "_id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "role",
        "nid",
        "dob",
        "residence",
        "permissions",
        "phonenumber",
        "profile",
        "isScanner"
      )
      .where("_id", id);

    if (_.isEmpty(verifier)) {
      return res.status(404).json("Error! Could not save changes.");
    }

    const updatedVerifier = {
      id: verifier[0]?._id,
      role: verifier[0]?.role,
      active: verifier[0]?.active,
      isScanner: Boolean(verifier[0]?.isScanner),
    };

    const accessToken = signMainToken(updatedVerifier, "15m");

    //logs
    await knex("verifier_activity_logs").insert({
      verifier_id: id,
      title: "Updated account password!",
      severity: "info",
    });

    // if (isMobile(req)) {
    res.status(201).json({
      user: {
        id: verifier[0]?._id,
        firstname: verifier[0]?.firstname,
        lastname: verifier[0]?.lastname,
        name: verifier[0]?.name,
        email: verifier[0]?.email,
        phonenumber: verifier[0]?.phonenumber,
        role: verifier[0]?.role,
        permissions: JSON.parse(verifier[0]?.permissions),
        profile: verifier[0]?.profile,
      },
      refreshToken,
      accessToken,
    });
  })
);


router.put(
  "/password-reset",
  limit,
  // verifyToken, verifyScanner,
  asyncHandler(async (req, res) => {
    const { id, oldPassword, password } = req.body;


    const verifierPassword = await knex('verifiers').select('password').where('_id', id).limit(1);

    const passwordIsValid = await bcrypt.compare(
      oldPassword,
      verifierPassword[0]?.password
    );

    if (!passwordIsValid) {
      return res.status(400).json("Invalid Password!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const modifiedVerifier = await knex("verifiers").where("_id", id).update({
      password: hashedPassword,
    });

    if (modifiedVerifier !== 1) {
      return res.status(404).json("Error updating verifier information.");
    }
    const verifier = await knex("verifiers")
      .select(
        "_id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "role",
        "nid",
        "dob",
        "residence",
        "permissions",
        "phonenumber",
        "profile",
        "isScanner"
      )
      .where("_id", id);

    if (_.isEmpty(verifier)) {
      return res.status(404).json("Error! Could not save changes.");
    }

    const updatedVerifier = {
      id: verifier[0]?._id,
      role: verifier[0]?.role,
      active: verifier[0]?.active,
      isScanner: Boolean(verifier[0]?.isScanner),
    };

    const accessToken = signMainToken(updatedVerifier, "1d");

    //logs
    await knex("verifier_activity_logs").insert({
      verifier_id: id,
      title: "Updated account password!",
      severity: "info",
    });

    // if (isMobile(req)) {
    res.status(201).json({
      user: {
        id: verifier[0]?._id,
        firstname: verifier[0]?.firstname,
        lastname: verifier[0]?.lastname,
        name: verifier[0]?.name,
        email: verifier[0]?.email,
        phonenumber: verifier[0]?.phonenumber,
        role: verifier[0]?.role,
        permissions: JSON.parse(verifier[0]?.permissions),
        profile: verifier[0]?.profile,
      },
      refreshToken,
      accessToken,
    });

  })
);

router.put(
  "/profile",
  verifyToken,
  // verifyScanner,
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

    const verifier = await knex("verifiers")
      .where("_id", id)
      .update({ profile: url });

    if (verifier !== 1) {
      return res.status(404).json("An unknown error has occurred!");
    }

    //logs
    await knex("verifier_activity_logs").insert({
      verifier_id: id,
      title: "Updated account profile!",
      severity: "info",
    });

    res.status(201).json(url);
  })
);

//Enable or Disable Verifier Account
router.put(
  "/account",
  verifyToken,
  // verifyScanner,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id, active } = req.body;

    const updatedVerifier = await knex("verifiers")
      .where("_id", id)
      .update({ active: active });

    if (updatedVerifier !== 1) {
      return res.status(400).json("Error updating verifier info");
    }

    //logs
    await knex("verifier_activity_logs").insert({
      verifier_id: _id,
      title: `${Boolean(active) === true
        ? "Activated an verifier account!"
        : "Disabled an verifier account!"
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

//@DELETE verifier
router.delete(
  "/:id",
  verifyToken,
  // verifyScanner,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(401).json("Invalid Request!");
    }

    const verifier = await knex("verifiers").where("_id", id).del();

    if (!verifier) {
      return res.status(500).json("Invalid Request!");
    }

    //logs
    await knex("verifier_activity_logs").insert({
      verifier_id: _id,
      title: "Deleted an verifier account!",
      severity: "error",
    });

    res.status(200).json("Verifier Removed!");
  })
);

module.exports = router;
