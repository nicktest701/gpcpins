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
    const { search } = req.query
    const { email } = req.user

    let employees = [];
    if (!_.isEmpty(search)) {
      employees = await knex("employees")
        .select(
          "_id as id",
          knex.raw("CONCAT(firstname,' ',lastname) as name"),

        )
      // console.log(employees)

      return res.status(200).json(employees);
    } else {
      employees = await knex("employees")
        .select(
          "_id",
          "firstname",
          "lastname",
          "username",
          knex.raw("CONCAT(firstname,' ',lastname) as name"),
          "email",
          "permissions",
          "phonenumber",
          "nid",
          "dob",
          "residence",
          "role",
          "profile",
          "active"
        ).where("isAdmin", 0)
        .whereNot('email', email);

    }



    const modifiedEmployees = employees.map(
      ({ role, permissions, ...rest }) => {
        return {
          ...rest,
          permissions: JSON.parse(permissions),
          role: role === process.env.ADMIN_ID ? "Administrator" : "Employee",
        };
      }
    );

    res.status(200).json(modifiedEmployees);
  })
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

    const employee = await knex("employees")
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

    if (_.isEmpty(employee)) {
      return res.status(400).json({});
    }

    const { permissions, role, ...rest } = employee[0];

    const modifiedEmployee = {
      ...rest,
      permissions: JSON.parse(permissions),

      role: role === process.env.ADMIN_ID ? "Administrator" : "Employee",
    };

    res.status(200).json(modifiedEmployee);
  })
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

    const doesEmployeeExists = await transx("employees")
      .select("email")
      .where("email", newEmployee.email)
      .limit(1);

    if (!_.isEmpty(doesEmployeeExists[0])) {
      return res
        .status(400)
        .json("An employee with this account already exists!");
    }

    const doesUserNameExists = await transx("employees")
      .select("username")
      .where("username", newEmployee?.username)
      .limit(1);

    if (!_.isEmpty(doesUserNameExists)) {
      return res
        .status(400)
        .json(`Username, '${newEmployee?.username}' is not available!`);
    }

    if (req.body?.role === "Employee") {
      newEmployee.role = process.env.EMPLOYEE_ID;
    }

    if (req.body?.role === "Administrator") {
      newEmployee.role = process.env.ADMIN_ID;
    }

    newEmployee.profile = req.file?.filename;

    if (req.file) {
      const url = await uploadPhoto(req.file);
      newEmployee.profile = url;
    }

    const _id = generateId();
    const employee = await transx("employees").insert({
      _id,
      ...newEmployee,
      permissions: JSON.stringify([]),
    });

    if (_.isEmpty(employee)) {
      res.status(400).json("Error saving employee information!");
    }

    const token = randomBytes(32).toString("hex");

    const codeInfo = {
      _id: generateId(),
      token,
      email: newEmployee?.email,
    };
    await transx("tokens").insert(codeInfo);

    let message_url = `http://localhost:5003/auth/verify?id=${codeInfo?._id}&token=${codeInfo?.token}&type=new`;
    if (process.env.NODE_ENV === "production") {
      message_url = `https://admin.gpcpins.com/auth/verify?id=${codeInfo?._id}&token=${codeInfo?.token}&type=new`;
    }


    const message = `
        <div style="width:500px;">
        <h2 style="display:block;text-align:center;">Verify your email</h2>

        <p style="text-align:center;">Please confirm that you want to use ${newEmployee?.email} as your Gab Powerful Account
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
      employee_id: id,
      title: "Created new employee account.",
      severity: "info",
    });

    await transx.commit();

    try {
      await sendMail(newEmployee?.email, mailTextShell(message));
    } catch (error) {
      await transx.rollback();

      return res.status(400).json("An error has occurred.Try again later");
    }

    res.status(201).json("Employee saved successfully!!!");
  })
);

router.put(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { _id, permissions, name, ...rest } = req.body;
    // console.log(req.body);

    rest.role =
      req.body?.role === "Employee"
        ? process.env.EMPLOYEE_ID
        : process.env.ADMIN_ID;

    const employee = await knex("employees")
      .where("_id", _id)
      .update({
        permissions: JSON.stringify(permissions),
        ...rest,
      });

    if (employee !== 1) {
      res.status(404).json("Error updating employee information.");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Modified employee account details.",
      severity: "info",
    });

    res.status(201).json("Changes saved successfully!!!");
  })
);

//Enable or Disable Employee Account
router.put(
  "/status",
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

    const doesEmployeeExists = await knex("employees")
      .select("email")
      .where("email", email)
      .limit(1);

    if (_.isEmpty(doesEmployeeExists)) {
      return res.status(400).json("Invalid Request.Email not available!");
    }

    const token = randomBytes(32).toString("hex");

    const codeInfo = {
      _id: generateId(),
      token,
      email,
    };
    await knex("tokens").insert(codeInfo);

    const message_url = `https://admin.gpcpins.com/auth/verify?id=${codeInfo?._id}&token=${codeInfo?.token}`;

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
    // console.log(message_url)

    try {
      await sendMail(email, mailTextShell(message));
    } catch (error) {
      return res.status(500).json("An error has occurred!");
    }

    res.status(201).json("Password Reset link sent!!!");
  })
);

//@DELETE employees
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

    if (employee !== 1) {
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
