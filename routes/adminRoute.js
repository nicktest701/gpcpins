const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const { otpGen } = require("otp-gen-agent");
const { signMainToken, signSampleRefreshToken } = require("../config/token");
const multer = require("multer");
const { rateLimit } = require("express-rate-limit");
const sendMail = require("../config/sendEmail");
const {
  verifyToken,
  verifyRefreshToken,
} = require("../middlewares/verifyToken");
const { isValidUUID2 } = require("../config/validation");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { uploadPhoto } = require("../config/uploadFile");
const isMobile = require("../config/isMobile");
const { mailTextShell } = require("../config/mailText");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

//model
const { hasTokenExpired } = require("../config/dateConfigs");

const knex = require("../db/knex");

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

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const employees = await knex("employees").select("*");

    const modifiedEmployees = employees.map(
      ({ permissions, password, ...rest }) => {
        return {
          permissions: JSON.parse(permissions),
          ...rest,
        };
      }
    );

    res.status(200).json(modifiedEmployees);
  })
);

router.get(
  "/auth",
  limit,
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const employee = await knex("employees")
      .select(
        "_id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "permissions",
        "email",
        "role",
        "phonenumber",
        "profile"
      )
      .where("_id", id)
      .limit(1);

    if (_.isEmpty(employee) || employee[0]?.active === 0) {
      return res.sendStatus(204);
    }

    res.status(200).json({
      user: {
        id: employee[0]?._id,
        firstname: employee[0]?.firstname,
        lastname: employee[0]?.lastname,
        name: employee[0]?.name,
        email: employee[0]?.email,
        role: employee[0]?.role,
        permissions: JSON.parse(employee[0]?.permissions),
        phonenumber: employee[0]?.phonenumber,
        profile: employee[0]?.profile,
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

    const updatedEmployee = {
      id,
      active,
      role,
      isAdmin,
      createdAt,
    };

    const accessToken = signMainToken(updatedEmployee, "30m");
    const refreshToken = signSampleRefreshToken(updatedEmployee, "1h");

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
    await knex("employees").where("_id", id).update({
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
      _id: randomUUID(),
      token,
      email: employee[0]?.email,
    });

    const message = `
        <div style="width:100%;max-width:500px;margin-inline:auto;">
    
        <p>Your verification code is</p>
        <h1>${token}</h1>

        <p>-- Gab Powerful Team --</p>
    </div>
        `;

    console.log(token);

    try {
      await sendMail(employee[0]?.email, mailTextShell(message));
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
      .select("*", knex.raw("CONCAT(firstname,' ',lastname) as name"))
      .where("email", employeeToken[0]?.email);

    if (_.isEmpty(employee)) {
      return res.status(401).json("Authentication Failed!");
    }

    const updatedEmployee = {
      id: employee[0]?._id,
      role: employee[0]?.role,
      active: employee[0]?.active,
      createdAt: employee[0]?.createdAt,
    };

    const accessToken = signMainToken(updatedEmployee, "30m");
    const refreshToken = signSampleRefreshToken(updatedEmployee, "1h");

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

    await knex("employees").where("_id", employee[0]?._id).update({
      token: hashedToken,
    });

    //logs
    await knex("activity_logs").insert({
      employee_id: employee[0]?._id,
      title: "Logged into account",
      severity: "info",
    });

    // if (isMobile(req)) {
    res.status(201).json({
      user: {
        id: employee[0]?._id,
        firstname: employee[0]?.firstname,
        lastname: employee[0]?.lastname,
        name: employee[0]?.name,
        email: employee[0]?.email,
        phonenumber: employee[0]?.phonenumber,
        role: employee[0]?.role,
        permissions: JSON.parse(employee[0]?.permissions),
        profile: employee[0]?.profile,
      },
      accessToken,
      refreshToken,
    });
    // }

    // res.status(201).json({
    //   user: {
    //     id: employee[0]?._id,
    //     name: `${employee[0]?.firstname} ${employee[0]?.lastname}`,
    //     email: employee[0]?.email,
    //     phonenumber: employee[0]?.phonenumber,
    //     role: employee[0]?.role,
    //     profile: employee[0]?.profile,
    //   },
    // });
  })
);

router.post(
  "/logout",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Logged out of account.",
      severity: "info",
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
    const { id } = req.user;
    const { _id, ...rest } = req.body;

    const updatedEmployee = await knex("employees")
      .where("_id", _id)
      .update(rest);

    if (updatedEmployee !== 1) {
      return res.status(400).json("Error updating employee information.");
    }

    const employee = await knex("employees")
      .select(
        "_id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "role",
        "permissions",
        "phonenumber",
        "profile"
      )
      .where("_id", _id);

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Updated account details",
      severity: "info",
    });

    res.status(201).json({
      user: {
        id: employee[0]?._id,
        firstname: employee[0]?.firstname,
        lastname: employee[0]?.lastname,
        name: employee[0]?.name,
        email: employee[0]?.email,
        phonenumber: employee[0]?.phonenumber,
        permissions: JSON.parse(employee[0]?.permissions),
        role: employee[0]?.role,
        profile: employee[0]?.profile,
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

    const modifiedEmployee = await knex("employees").where("_id", id).update({
      password: hashedPassword,
    });

    if (modifiedEmployee !== 1) {
      return res.status(404).json("Error updating employee information.");
    }
    const employee = await knex("employees")
      .select(
        "_id",
        "firstname",
        "lastname",
        knex.raw("CONCAT(firstname,' ',lastname) as name"),
        "email",
        "role",
        "permissions",
        "phonenumber",
        "profile"
      )
      .where("_id", id);

    if (_.isEmpty(employee)) {
      return res.status(404).json("Error! Could not save changes.");
    }

    const updatedEmployee = {
      id: employee[0]?._id,
      role: employee[0]?.role,
      active: employee[0]?.active,
    };

    const accessToken = signMainToken(updatedEmployee, "30m");
    const refreshToken = signSampleRefreshToken(updatedEmployee, "1h");

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

    await knex("employees")
      .where("_id", id)
      .update({ token: hashedToken, active: 1 });

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Updated account password!",
      severity: "info",
    });

    // if (isMobile(req)) {
    res.status(201).json({
      user: {
        id: employee[0]?._id,
        firstname: employee[0]?.firstname,
        lastname: employee[0]?.lastname,
        name: employee[0]?.name,
        email: employee[0]?.email,
        phonenumber: employee[0]?.phonenumber,
        role: employee[0]?.role,
        permissions: JSON.parse(employee[0]?.permissions),
        profile: employee[0]?.profile,
      },
      refreshToken,
      accessToken,
    });
    // }

    // res.status(201).json({
    //   user: {
    //     id: employee[0]?._id,
    //     name: `${employee[0]?.firstname} ${employee[0]?.lastname}`,
    //     email: employee[0]?.email,
    //     phonenumber: employee[0]?.phonenumber,
    //     role: employee[0]?.role,
    //     profile: employee[0]?.profile,
    //   },
    // });
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
      title: `${
        Boolean(active) === true
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
