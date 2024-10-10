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

// Define the route for getting all non-admin employees
router.get(
  '/',
  verifyToken,
  verifyAdmin,

  asyncHandler(async (req, res) => {
    const { email } = req.user

    // Fetch all non-admin employees from the database
    const employees = await knex('employees').where({ isAdmin: 0 }).whereNot('email', email);

    // Map through the employees and modify the permissions property
    const modifiedEmployees = employees.map(({ role, permissions, password, ...rest }) => {
      // Parse the permissions string to a JSON object
      return {
        ...rest,
        role: role === process.env.ADMIN_ID ? "Administrator" : "Employee",
        permissions: JSON.parse(permissions),
      };
    });

    // Send the modified employees as a JSON response with a 200 status code
    res.status(200).json(modifiedEmployees);
  })
);




router.get(
  "/auth/token",
  limit,
  verifyRefreshToken,
  asyncHandler(async (req, res) => {
    const authEmployee = req.user;

    const accessToken = signMainToken(authEmployee, "15m");

    res.status(200).json({
      accessToken,
    });

  })
);

router.get(
  "/verify-identity",
  limit,
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user
    const { nid, dob } = req.query;


    const employees = await knex("employees").where({ _id: id })
      .select('nid', 'dob', knex.raw("DATE_FORMAT(dob,'%D %M %Y') as dobb"))
      .limit(1);


    if (_.isEmpty(employees[0])) {
      return res.status(400).json('Invalid Request!');
    }

    if (nid && employees[0]?.nid !== nid) {

      return res.status(400).json("Sorry.We couldn't find your National ID.");
    }

    if (dob) {
      const formattedDate = moment(dob).format('Do MMMM YYYY')

      if (employees[0]?.dobb !== formattedDate) {

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
  verifyAdmin,
  asyncHandler(async (req, res) => {

    const { id } = req.user;
    const { code } = req.query;

    if (code) {
      const employeeToken = await knex("verify_tokens")
        .select("_id", "code")
        .where({
          _id: id,
          code,
        })
        .limit(1);

      if (_.isEmpty(employeeToken) || Number(code) !== Number(employeeToken[0]?.code)) {
        return res.status(400).json("Invalid code.Try again");
      }
    } else {
      const employee = await knex("employees")
        .select("_id", "phonenumber", "active")
        .where("_id", id)
        .limit(1);

      if (_.isEmpty(employee) && !employee[0]?.phonenumber) {
        return res.status(400).json("Invalid Request");
      }

      const code = await otpGen();
      await knex("verify_tokens").upsert({
        _id: id,
        code,
      });
      console.log(code);

      sendOTPSMS(`Your verification code is ${code}.`, employee[0]?.phonenumber);
    }

    res.sendStatus(201);
  })
);


//@GET employee by email
router.post(
  "/login",
  limit,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const employee = await knex("employees")
      .select("email", "password", "active")
      .where("email", email)
      .limit(1);

    if (_.isEmpty(employee[0])) {
      return res.status(400).json("Invalid Email or Password!!");
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      employee[0]?.password
    );

    if (!passwordIsValid) {
      return res.status(400).json("Invalid Email or Password!");
    }

    if (employee[0]?.active === 0) {
      return res.status(400).json("Account disabled!");
    }

    const token = await otpGen();

    await knex("tokens").insert({
      _id: generateId(),
      token,
      email: employee[0]?.email,
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
      await sendMail(employee[0]?.email, mailTextShell(message));

      // if (type === "phone") {
      await sendOTPSMS(
        `Please ignore this message if you did not request the OTP.Your verification code is ${token}.If the code is incorrect or expired, you will not be able to proceed. Request a new code if necessary.`,
        employee[0]?.phonenumber
      );
      // }
    } catch (error) {
      await knex("tokens").where("email", employee[0]?.email).del();

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

    const employeeToken = await knex("tokens")
      .where({
        _id: id,
        token,
      })
      .select("*");

    if (_.isEmpty(employeeToken)) {
      return res.status(400).json("An unknown error has occurred!");
    }

    if (hasTokenExpired(employeeToken[0]?.createdAt)) {
      return res.status(400).json("Sorry! Your link has expired.");
    }

    await knex("employees")
      .where("email", employeeToken[0]?.email)
      .update({ active: 1 });

    const employee = await knex("employees")
      .select("_id")
      .where({
        email: employeeToken[0]?.email,
      })
      .limit(1);

    res.status(201).json({
      user: {
        id: employee[0]?._id,
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

    const employeeToken = await knex("tokens")
      .select("*")
      .where({
        email,
        token,
      })
      .limit(1);

    if (_.isEmpty(employeeToken)) {
      return res.status(400).json("Invalid Code");
    }

    if (hasTokenExpired(employeeToken[0]?.createdAt)) {
      return res.status(400).json("Sorry! Your code has expired.");
    }

    await knex("employees")
      .where("email", employeeToken[0]?.email)
      .update({ active: 1 });

    const employee = await knex("employees")

      .select("_id ",
        "_id as id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "role",
        "permissions",
        "phonenumber",
        "profile",
        "isAdmin",
        "active",
        'createdAt')
      .where("email", employeeToken[0]?.email);

    if (_.isEmpty(employee)) {
      return res.status(401).json("Authentication Failed!");

    }

    const { active, isAdmin, permissions, ...rests } = employee[0];

    const authEmployee = {
      ...rests,
      permissions: JSON.parse(permissions),
      active: Boolean(active),
      isAdmin: Boolean(isAdmin)

    };



    const accessToken = signMainToken(authEmployee, "15m");
    const refreshToken = signMainRefreshToken(authEmployee, "24h");


    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await knex("employees").where("_id", employee[0]?._id).update({
      token: hashedToken,
    });

    //logs
    await knex("activity_logs").insert({
      employee_id: employee[0]?._id,
      title: "Logged into account.",
      severity: "info",
    });


    res.status(201).json({

      accessToken,
      refreshToken,
    });


  })
);

router.post(
  "/logout",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Logged out of account.",
      severity: "info",
    });
    req.user = null;

    res.sendStatus(204);
  })
);

router.put(
  "/",
  limit,
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { _id, ...rest } = req.body;

    const updatedEmployee = await knex("employees")
      .where("_id", _id)
      .update(rest);

    if (updatedEmployee !== 1) {
      return res.status(400).json("Error updating employee information.");
    }
    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Updated account details.",
      severity: "info",
    });


    const employee = await knex("employees")
      .select(
        "_id as id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "role",
        "permissions",
        "phonenumber",
        "profile",
        "isAdmin",
        "active",
        'createdAt'
      )
      .where("_id", _id).limit(1)
    if (_.isEmpty(employee)) {
      return res.status(404).json("Error! Could not save changes.");
    }



    const { active, isAdmin, permissions, ...rests } = employee[0];

    const authEmployee = {
      ...rests,
      permissions: JSON.parse(permissions),
      active: Boolean(active),
      isAdmin: Boolean(isAdmin)

    };

    const accessToken = signMainToken(authEmployee, "15m");

    res.status(201).json({
      accessToken,

    });
  })
);

router.put(
  "/password",
  limit,
  asyncHandler(async (req, res) => {
    const { id, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const modifiedEmployee = await knex("employees").where("_id", id).update({
      password: hashedPassword,
    });

    if (modifiedEmployee !== 1) {
      return res.status(404).json("Error updating employee information.");
    }
    const employee = await knex("employees")
      .select(
        "_id as id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "role",
        "permissions",
        "phonenumber",
        "profile",
        "isAdmin",
        "active",
        'createdAt'
      )
      .where("_id", id).limit(1)

    if (_.isEmpty(employee)) {
      return res.status(404).json("Error! Could not save changes.");
    }


    const { active, isAdmin, permissions, ...rests } = employee[0];


    const authEmployee = {
      ...rests,
      permissions: JSON.parse(permissions),
      active: Boolean(active),
      isAdmin: Boolean(isAdmin)

    };

    const accessToken = signMainToken(authEmployee, "15m");

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Updated account password!",
      severity: "info",
    });


    res.status(201).json({
      accessToken,
    });



  })
);


router.put(
  "/password-reset",
  limit,
  verifyToken, verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id, oldPassword, password } = req.body;


    const employeePassword = await knex('employees').select('password').where('_id', id).limit(1);

    const passwordIsValid = await bcrypt.compare(
      oldPassword,
      employeePassword[0]?.password
    );

    if (!passwordIsValid) {
      return res.status(400).json("Invalid Password!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const modifiedEmployee = await knex("employees").where("_id", id).update({
      password: hashedPassword,
    });

    if (modifiedEmployee !== 1) {
      return res.status(404).json("Error updating employee information.");
    }
    const employee = await knex("employees")
      .select(
        "_id as id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "role",
        "permissions",
        "phonenumber",
        "profile",
        "isAdmin",
        "active",
        'createdAt'
      )
      .where("_id", _id).limit(1)


    if (_.isEmpty(employee)) {
      return res.status(404).json("Error! Could not save changes.");
    }

    const { active, isAdmin, permissions, ...rests } = employee[0];


    const authEmployee = {
      ...rests,
      permissions: JSON.parse(permissions),
      active: Boolean(active),
      isAdmin: Boolean(isAdmin)

    };

    const accessToken = signMainToken(authEmployee, "15m");

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Updated account password!",
      severity: "info",
    });


    res.status(201).json({
      accessToken,
    });


  })
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

    const employee = await knex("employees")
      .where("_id", id)
      .update({ profile: url });

    if (employee !== 1) {
      return res.status(404).json("An unknown error has occurred!");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Updated account profile!",
      severity: "info",
    });

    res.status(201).json(url);
  })
);

//Enable or Disable Employee Account
router.put(
  "/account",
  limit,
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id, active } = req.body;

    const updatedEmployee = await knex("employees")
      .where("_id", id)
      .update({ active: active });

    if (updatedEmployee !== 1) {
      return res.status(400).json("Error updating employee info");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: `${Boolean(active) === true
        ? "Activated an employee account!"
        : "Disabled an employee account!"
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
  limit,
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(401).json("Invalid Request!");
    }

    const employee = await knex("employees").where("_id", id).del();

    if (!employee) {
      return res.status(500).json("Invalid Request!");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: "Deleted an employee account!",
      severity: "error",
    });

    res.status(200).json("Employee Removed!");
  })
);

module.exports = router;
