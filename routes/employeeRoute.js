const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { randomBytes } = require("crypto");
const _ = require("lodash");
const multer = require("multer");

const sendMail = require("../config/sendEmail");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { verifyToken } = require("../middlewares/verifyToken");
const generateId = require("../config/generateId");
//model

const { mailTextShell } = require("../config/mailText");
const { uploadPhoto } = require("../config/uploadFile");

//db
const knex = require("../db/knex");
const { isValidUUID2, isValidEmail } = require("../config/validation");
const { storeOTP } = require("../services/otp.services");
const { safeJSON } = require("../config/helpers");

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    const ext = file?.originalname?.split(".")[1];

    cb(null, `${generateId()}.${ext}`);
  },
});

const Upload = multer({ storage: Storage });

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { search } = req.query;
    const { id } = req.user;
   ;

    let employees = [];
    if (!_.isEmpty(search)) {
      employees = await knex("vw_users_with_roles").select("id", "name");
      // console.log(employees)

      return res.status(200).json(employees);
    } else {
      employees = await knex("vw_users_with_roles")
        .select("*")
        .where("role", process.env.EMPLOYEE_ID)
        .whereNot("id", id);
      // console.log(employees)
    }

    const modifiedEmployees = employees.map(
      ({ role, permissions, ...rest }) => {
        return {
          ...rest,
          permissions: safeJSON(permissions),
          role: role === process.env.ADMIN_ID ? "Administrator" : "Employee",
        };
      },
    );

    res.status(200).json(modifiedEmployees);
  }),
);

router.get(
  "/:id",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const employee = await knex("vw_users_with_roles")
      .select("*")
      .where({
        id,
      })
      .first();

    if (_.isEmpty(employee)) {
      return res.status(400).json({});
    }

    const { permissions, role, ...rest } = employee;

    const modifiedEmployee = {
      ...rest,
      permissions: JSON.parse(permissions),
      role: role === process.env.ADMIN_ID ? "Administrator" : "Employee",
    };

    res.status(200).json(modifiedEmployee);
  }),
);

router.post(
  "/",
  verifyToken,
  verifyAdmin,
  Upload.single("profile"),
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const newEmployee = req.body;

    const transx = await knex.transaction();
    try {
      const doesEmployeeExists = await transx("users")
        .select("email")
        .where("email", newEmployee.email)
        .first();

      if (!_.isEmpty(doesEmployeeExists)) {
        return res
          .status(400)
          .json("An employee with this account already exists!");
      }

      const doesUserNameExists = await transx("users")
        .select("username")
        .where("username", newEmployee?.username)
        .first();

      if (!_.isEmpty(doesUserNameExists)) {
        return res
          .status(400)
          .json(`Username, '${newEmployee?.username}' is not available!`);
      }

      const role = await transx("roles")
        .where("name", req.body?.role)
        .select("id")
        .first();

      newEmployee.role_id = role.id;

      newEmployee.profile = req.file?.filename;

      if (req.file) {
        const url = await uploadPhoto(req.file);
        newEmployee.profile = url;
      }

      const id = generateId();
      const user = await transx("users").insert({
        id,
        ...newUser,
        permissions: JSON.stringify([]),
      });

      if (_.isEmpty(user)) {
        res.status(400).json("Error saving employee information!");
      }

      const token = randomBytes(32).toString("hex");

      await storeOTP(_id, token);

      let message_url = `http://localhost:5003/auth/verify?id=${_id}&token=${token}&type=new`;
      if (process.env.NODE_ENV === "production") {
        message_url = `https://admin.gpcpins.com/auth/verify?id=${_id}&token=${token}&type=new`;
      }

      const message = `
        <div style="width:500px;">
        <h2 style="display:block;text-align:center;">Verify your email</h2>

        <p style="text-align:center;">Please confirm that you want to use ${newUser?.email} as your Gab Powerful Account
        email address. Once it's done you would be able to start using your account.</p>
        <p style="text-align:center;margin-bottom:16px;">Click on the button below to confirm your email address.</p>

        <a href='${message_url}'
            style="display:block;margin-block:20px;text-decoration: none;text-align:center;background-color: #083d77;color: #fff;padding: 12px 15px; font-size: 18px;">Verify</a>
      
      
            <p>Button is not showing? <a href='${message_url}' style="color: #083d77;font-weight: bold;">Click here</a></p>

            <p>Link expires in 15 minutes</p>
      
        <p style="text-align:center;">-- Gab Powerful Team --</p>
    </div>
        `;

      //logs
      await transx("activity_logs").insert({
        user_id: id,
        title: "Created new employee account.",
        severity: "info",
      });

      await transx.commit();
      res.status(201).json("Employee saved successfully!!!");

      setImmediate(async () => {
        await sendMail(newEmployee?.email, mailTextShell(message));
      });
    } catch (error) {
      await transx.rollback();

      return res.status(400).json("An error has occurred.Try again later");
    }
  }),
);

router.put(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: userID } = req.user;
    const { id, ...rest } = req.body;

    rest.role =
      req.body?.role === "Employee"
        ? process.env.EMPLOYEE_ID
        : process.env.ADMIN_ID;

    const role = await knex("roles")
      .where("id", rest.role)
      .select("id")
      .first();
    const employee = await knex("users").where("id", id).update({
      firstname: rest?.firstname,
      lastname: rest?.lastname,
      username: rest?.username,
      email: rest?.email,
      dob: rest?.dob,
      nid: rest?.nid,
      phonenumber: rest?.phonenumber,
      residence: rest?.residence,
      role_id: role?.id,
    });

    if (employee !== 1) {
      res.status(404).json("Error updating employee information.");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: userID,
      title: "Modified employee account details.",
      severity: "info",
    });

    res.status(201).json("Changes saved successfully!!!");
  }),
);

//Enable or Disable Employee Account
router.put(
  "/status",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: userID } = req.user;
    const { id, active } = req.body;

    const updatedUser = await knex("users")
      .where("id", id)
      .update({ active: active, is_enabled: active });

    if (updatedUser !== 1) {
      return res.status(400).json("Error updating user info");
    }

    //logs
    await knex("activity_logs").insert({
      user_id: userID,
      title: `${
        Boolean(active) === true
          ? "Activated an user account!"
          : "Disabled an user account!"
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

//Reset Password
router.put(
  "/reset",
  // verifyToken,
  // verifyAdmin,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json("Invalid Request.Email not available!");
    }

    try {
      const doesEmployeeExists = await knex("users")
        .select("id", "email")
        .where("email", email)
        .first();

      if (_.isEmpty(doesEmployeeExists)) {
        return res.status(201).json("Password Reset link sent!!!");
      }

      const token = randomBytes(32).toString("hex");

      //  const hashedToken = await bcrypt.hash(refreshToken, 12);

      await storeOTP(
        doesEmployeeExists.id,
        token,
        "gpcpins_password_reset",
        "gpcpins_password_reset_attempts",
      );

      let message_url = `http://localhost:5003/auth/verify?id=${doesEmployeeExists.id}&token=${token}&reset=true`;
      if (process.env.NODE_ENV === "production") {
        message_url = `https://admin.gpcpins.com/auth/verify?id=${doesEmployeeExists.id}&token=${token}&reset=true`;
      }

      const message = `
        <div style="width:500px;">
        <h2 style="display:block;text-align:center;">Password Reset</h2>

        <p style="text-align:center;">Please click on the link below to reset your password.Once it's done ,you would be able to reactivate your account.</p>
        <p style="text-align:center;margin-bottom:16px;">Click on the button.</p>

        <a href='${message_url}' target='_blank'
            style="display:block;margin-block:20px;text-decoration: none;text-align:center;background-color: #083d77;color: #fff;padding: 12px 15px; font-size: 18px;">Reset</a>
      
      
            <p>Button is not showing? <a href='${message_url}' target='_blank' style="color: #083d77;font-weight: bold;">Click here</a></p>

        <p style="text-align:center;">-- Gab Powerful Team --</p>
    </div>
        `;
      res.status(201).json("Password Reset link sent!!!");

      setImmediate(async () => {
        await sendMail(email, mailTextShell(message));
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json("An error has occurred!");
    }
  }),
);

//@DELETE employees
router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: userID } = req.user;
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(401).json("Invalid Request!");
    }

    const user = await knex("users").where("id", id).del();

    if (user !== 1) {
      return res.status(500).json("Invalid Request!");
    }
    //logs
    await knex("activity_logs").insert({
      user_id: userID,
      title: "Deleted an user account!",
      severity: "error",
    });

    res.status(200).json("User Removed!");
  }),
);

module.exports = router;
