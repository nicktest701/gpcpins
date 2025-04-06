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
  max: 200, // 5 requests per windowMs
  message: "Too many requests! Please try again later.",
});

//model
const { hasTokenExpired } = require("../config/dateConfigs");

const knex = require("../db/knex");
const { sendOTPSMS } = require("../config/sms");
const generateId = require("../config/generateId");
const { getVerifier } = require("./users/authUsers");
const generateRandomNumber = require("../config/generateRandomCode");
const redisClient = require("../config/redisClient");

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    const ext = file?.mimetype?.split("/")[1];

    cb(null, `${generateId(10)}.${ext}`);
  },
});

const Upload = multer({ storage: Storage });

// Define the route for getting all non-scanner verifiers
router.get(
  '/',
  verifyToken,
  verifyScanner,
  // Handle async errors
  asyncHandler(async (req, res) => {
    const { id } = req.user

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
      ).whereNot('_id', id);
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
  "/auth/token",
  limit,
  verifyRefreshToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const verifier = await getVerifier(id);
    const accessToken = await signMainToken(verifier, "180d");

    res.status(200).json({
      accessToken,
    });

  })
);



router.get(
  "/verify-identity",
  verifyToken,
  verifyScanner,
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
  verifyScanner,
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

      sendOTPSMS(`Please ignore this message if you did not request the OTP.Your verification code is ${code}.Don't share this code with anyone; Our employees will never ask for the code.If the code is incorrect or expired, you will not be able to proceed. Request a new code if necessary.`, verifier[0]?.phonenumber);
    }

    res.sendStatus(201);
  })
);

router.get(
  "/:id",
  verifyToken, verifyScanner,
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
      .limit(1).first();

    if (_.isEmpty(verifier)) {
      return res.status(400).json({});
    }

    const { permissions, role, ...rest } = verifier;

    const modifiedVerifier = {
      ...rest,
      permissions: JSON.parse(permissions),
      role: role === process.env.SCANNER_ID ? "Administrator" : "Verifier",
    };

    res.status(200).json(modifiedVerifier);
  })
);
router.post(
  "/",
  verifyToken,
  verifyScanner,
  Upload.single("profile"),
  asyncHandler(async (req, res) => {
    const { id } = req.user;
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
    newVerifier.role = process.env.SCANNER_ID;
    newVerifier.profile = req.file?.filename;

    if (req.file) {
      const url = await uploadPhoto(req.file);
      newVerifier.profile = url;
    }

    const _id = generateId();
    const password = generateRandomNumber(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const verifier = await transx("verifiers").insert({
      _id,
      ...newVerifier,
      permissions: JSON.stringify([]),
      password: hashedPassword,
      isAdmin: req?.body?.isAdmin === 'true',
      active: true,
      isEnabled: true
    });

    if (_.isEmpty(verifier)) {
      res.status(400).json("Error saving verifier information!");
    }

    //logs
    await transx("verifier_activity_logs").insert({
      _id: generateId(10),
      verifier_id: id,
      title: "Created new verifier account.",
      severity: "info",
    });


    try {

      const message = `<div>
      <h1 style='text-transform:uppercase;'>Welcome to GAB POWERFUL CONSULT.</h1><br/>
      <div style='text-align:left;'>

      <p><strong>Dear ${newVerifier?.firstname} ${newVerifier?.lastname},</strong></p>

      <p>welcome to the team! We look forward to working with you and witnessing your contributions to our company's success.</p>
      

      <p><strong>Details:</strong></p>
      <p><strong>Login URL:</strong> <a href='https://verification.gpcpins.com'>https://verification.gpcpins.com</a></p>
      <p><strong>Username/Email Address:</strong> ${newVerifier?.email}</p>
      <p><strong>Default Password:</strong> ${password}</p>
      <p>We recommend you change your <b>Default Password</b> when you log into your account.</p>

      <p>Best regards,</p>
      
      <p>GAB Powerful Consult Team</p>
   
      </div>

      </div>`;


      await sendMail(newVerifier?.email, mailTextShell(message), "Welcome to GAB POWERFUL CONSULT.");
    } catch (error) {
      await transx.rollback();

      return res.status(400).json("An error has occurred.Try again later");
    }

    await transx.commit();
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
      .select("email", 'phonenumber', "password", "active")
      .where("email", email)
      .first();

    if (_.isEmpty(verifier)) {
      return res.status(400).json("Invalid Email or Password!!");
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      verifier?.password
    );

    if (!passwordIsValid) {
      return res.status(400).json("Invalid Email or Password!");
    }

    if (verifier?.active === 0) {
      return res.status(400).json("Account disabled!");
    }

    const token = await otpGen();

    await knex("tokens").insert({
      _id: generateId(),
      token,
      email: verifier?.email,
    });

    const message = `
        <div style="width:100%;max-width:500px;margin-inline:auto;">
      <p>Please ignore this message if you did not request the OTP.</p>
        <p>Your verification code is</p>
        <h1>${token}</h1>
        <p>If the code is incorrect or expired, you will not be able to proceed. Request a new code if necessary.</p>

        <p>-- Gab Powerful Team --</p>
    </div>
        `;

    if (process.env.NODE_ENV !== "production") {
      console.log(token);
    }

    try {
      await sendMail(verifier?.email, mailTextShell(message));

      await sendOTPSMS(
        `Please ignore this message if you did not request the OTP.Your verification code is ${token}.If the code is incorrect or expired, you will not be able to proceed. Request a new code if necessary.`,
        verifier?.phonenumber
      );

    } catch (error) {
      await knex("tokens").where("email", verifier?.email).del();

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

    if (!id || !token) {
      return res.status(400).json("An unknown error has occurred!");
    }

    const verifierToken = await knex("verify_tokens")
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
//Verify Email or Phonenumber
router.post(
  "/send-otp",
  limit,
  asyncHandler(async (req, res) => {
    const { contact, type } = req.body;

    let verifier = {};
    if (type === 'phone') {

      verifier = await knex("verifiers")
        .select("_id", "phonenumber", "active")
        .where("phonenumber", contact)
        .limit(1).first()
    }
    if (type === 'email') {

      verifier = await knex("verifiers")
        .select("_id", "email", "active")
        .where("email", contact)
        .limit(1).first()
    }

    if (_.isEmpty(verifier)) {
      return res.status(400).json("We could not find your account!");
    }

    if (Boolean(verifier?.active) !== true) {
      return res.status(400).json("Account disabled!");

    }


    const code = await otpGen();
    await knex("tokens")
      .upsert({
        email: contact,
        token: code,
      })

    console.log(code);

    if (type === 'phone') {
      sendOTPSMS(`Your verification code is ${code}.`, verifier?.phonenumber);
    }
    if (type === 'email') {

      const message = `
      <div style="width:100%;max-width:500px;margin-inline:auto;">
  
      <p>Your verification code is</p>
      <h1>${code}</h1>

      <p>-- Gab Powerful Team --</p>
  </div>
      `;



      try {
        await sendMail(verifier?.email, mailTextShell(message));
      } catch (error) {
        await knex("tokens").where("_id", verifier?._id,).del();

        return res.status(500).json("An error has occurred!");
      }

    }


    res.sendStatus(201);
  })
);


//Verify OTP
router.post(
  "/verify-otp",
  limit,
  asyncHandler(async (req, res) => {
    const { email, token, type, reset } = req.body;

   
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
    if (type === "email") {
      await knex("verifiers")
        .where("email", verifierToken[0]?.email)
        .update({ active: 1 });
    }
    if (type === "phone") {
      await knex("verifiers")
        .where("phonenumber", verifierToken[0]?.email)
        .update({ active: 1 });
    }


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
      .where("email", verifierToken[0]?.email)
      .orWhere("phonenumber", verifierToken[0]?.email);

    if (_.isEmpty(verifier)) {
      return res.status(401).json("Authentication Failed!");

    }

    if (reset) {
      return res.json({ id: verifier[0]?._id })
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

    const accessToken = await signMainToken(authVerifier, "180d");
    const refreshToken = signMainRefreshToken(updatedVerifier, "365d");

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await knex("verifiers").where("_id", verifier[0]?._id).update({
      token: hashedToken,
    });

    //logs
    await knex("verifier_activity_logs").insert({
      _id: generateId(10),
      verifier_id: verifier[0]?._id,
      title: "Logged into account.",
      severity: "info",
    });

    // if (isMobile(req)) {
    res.status(201).json({
      accessToken,
      refreshToken,
    });



  })
);

router.post(
  "/logout",
  verifyToken,
  verifyScanner,
  asyncHandler(async (req, res) => {
    const { id, jti } = req.user;

    //logs
    await knex("verifier_activity_logs").insert({
      _id: generateId(10),
      verifier_id: id,
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
  verifyScanner,
  asyncHandler(async (req, res) => {
    const { id } = req.user;


    const { _id, ...rest } = req.body;

    const updatedVerifier = await knex("verifiers")
      .where("_id", _id)
      .update(rest);

    if (updatedVerifier !== 1) {
      return res.status(400).json("Error updating verifier information.");
    }

    const verifier = await getVerifier(_id);


    //logs
    await knex("verifier_activity_logs").insert({
      _id: generateId(10),
      verifier_id: id,
      title: "Updated account details.",
      severity: "info",
    });

    const accessToken = await signMainToken(verifier, "180d");

    res.status(201).json({
      accessToken
    });
  })
);

router.put(
  "/password",
  limit,
  verifyToken,
  verifyScanner,
  asyncHandler(async (req, res) => {
    const { id, oldPassword, password } = req.body;


    const verifierPassword = await knex('verifiers').select('password').where('_id', id).first();

    const passwordIsValid = await bcrypt.compare(
      oldPassword,
      verifierPassword?.password
    );

    if (!passwordIsValid) {
      return res.status(400).json("Invalid Password!");
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const modifiedVerifier = await knex("verifiers").where("_id", id).update({
      password: hashedPassword,
    });


    if (modifiedVerifier !== 1) {
      return res.status(404).json("Error! Could not save changes.");

    }

    res.status(201).json('Changes Saved!')



  })
);

router.put(
  "/password/update",
  limit,
  asyncHandler(async (req, res) => {
    const { id, password } = req.body;

    if (!id) {
      return res.status(400).json("Invalid Request!");
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const modifiedVerifier = await knex("verifiers").where("_id", id).update({
      password: hashedPassword,
    });


    if (modifiedVerifier !== 1) {
      return res.status(404).json("Failed! An unknown error has occurred.");

    }

    res.sendStatus(204)



  })
);




router.put(
  "/password/reset",
  limit,
  verifyToken,
  verifyScanner,
  asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json("Invalid Request!");
    }
    const code = await otpGen();
    const password = generateRandomNumber(10);

    const newPassword = `${password}${code}@gpc`
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const modifiedVerifier = await knex("verifiers").where("_id", id).update({
      password: hashedPassword,
    });

    if (modifiedVerifier !== 1) {
      return res.status(404).json("Error updating verifier information.");
    }

    const verifier = await getVerifier(id)

    const message = `<div>
    <h1 style='text-transform:uppercase;'>Welcome to GAB POWERFUL CONSULT.</h1><br/>
    <div style='text-align:left;'>

    <p><strong>Dear ${verifier?.firstname} ${verifier?.lastname},</strong></p>

    <p>Your password has been changed!</p>
    <p>Your new Password is:<strong> ${newPassword}</strong></p>
    <p>We recommend you change your <b>Your Password</b> when you log into your account.</p>

    <p>Best regards,</p>
    
    <p>GAB Powerful Consult Team</p>
 
    </div>

    </div>`;

    await sendMail(verifier?.email, mailTextShell(message), "Password Reset");
    res.status(200).send('Password reset complete!')
  })
);



router.put(
  "/profile",
  verifyToken,
  verifyScanner,
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
      _id: generateId(10),
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
  limit,
  verifyToken,
  verifyScanner,
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
      _id: generateId(10),
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
  verifyScanner,
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
      _id: generateId(10),
      verifier_id: _id,
      title: "Deleted an verifier account!",
      severity: "error",
    });

    res.status(200).json("Verifier Removed!");
  })
);

module.exports = router;
