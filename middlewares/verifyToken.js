const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const knex = require("../db/knex");

const verifyToken = (req, res, next) => {
  req.user = null;


  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];


  if (!authHeader) {
    return res.status(401).json("Unauthorized Access");
  }

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json("Unauthorized Access");
  }

  jwt.verify(token, process.env.TOKEN, async (err, user) => {
    if (err) {

      return res.status(403).json("Session has expired.");
    }

    const userRole = Number(user?.role)

    let authUser = {};
    if (
      userRole === Number(process.env.ADMIN_ID) ||
      userRole === Number(process.env.EMPLOYEE_ID)
    ) {
      authUser = await knex("employees")
        .select("*")
        .where("_id", user?.id)
        .limit(1);
    } else if (userRole === Number(process.env.AGENT_ID)) {
      authUser = await knex("agents")
        .select("*")
        .where("_id", user?.id)
        .limit(1);
    } else if (userRole === Number(process.env.SCANNER_ID)) {
      authUser = await knex("verifiers")
        .select("*")
        .where("_id", user?.id)
        .limit(1);


    } else {
      authUser = await knex("users")
        .where("_id", user?.id)
        .select("*")
        .limit(1);
    }




    if (Number(authUser[0]?.isEnabled) !== 1) {
      return res.status(403).json("Session has expired.");
    }


    let newUser = {
      id: authUser[0]?._id,
      email: authUser[0]?.email,
      role: authUser[0]?.role,
      active: authUser[0]?.active,
      createdAt: authUser[0]?.createdAt,
    };

    if (user?.role === process.env.ADMIN_ID) {
      newUser.profile = authUser[0]?.profile;
      newUser.firstname = authUser[0]?.firstname;
      newUser.lastname = authUser[0]?.lastname;
      newUser.name = `${authUser[0]?.firstname} ${authUser[0]?.lastname}`;
      newUser.phonenumber = authUser[0]?.phonenumber;
      newUser.isAdmin = Boolean(authUser[0]?.isAdmin);
      newUser.isEnabled = Boolean(authUser[0]?.isEnabled);
      newUser.permissions = JSON.parse(authUser[0]?.permissions)
    }

    req.user = newUser;

    next();
  });

};

const verifyRefreshToken = (req, res, next) => {


  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json("Unauthorized Access");
  }

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json("Unauthorized Access");
  }

  jwt.verify(token, process.env.TOKEN_REFRESH, async (err, user) => {

    if (err) {

      return res.status(403).json("Session has expired.");
    }
    let authUser = {};
    const userRole = Number(user?.role)

    if (
      userRole === Number(process.env.ADMIN_ID) ||
      userRole === Number(process.env.EMPLOYEE_ID)
    ) {
      authUser = await knex("employees")
        .select("*")
        .where("_id", user?.id)
        .limit(1);
    } else if (userRole === Number(process.env.AGENT_ID)) {
      authUser = await knex("agents")
        .select("*")
        .where("_id", user?.id)
        .limit(1);
    } else if (userRole === Number(process.env.SCANNER_ID)) {
      authUser = await knex("verifiers")
        .select("*")
        .where("_id", user?.id)
        .limit(1);


    } else {
      authUser = await knex("users")
        .select("*")
        .where("_id", user?.id)
        .limit(1);
    }


    if (Number(authUser[0]?.isEnabled) !== 1) {
      return res.status(403).json("Session has expired.");
    }




    let newUser = {
      id: authUser[0]?._id,
      role: authUser[0]?.role,
      active: authUser[0]?.active,
      createdAt: authUser[0]?.createdAt,
      email: authUser[0]?.email,
    };

    if (user?.role === process.env.ADMIN_ID) {
      newUser.profile = authUser[0]?.profile;
      newUser.firstname = authUser[0]?.firstname;
      newUser.lastname = authUser[0]?.lastname;
      newUser.name = `${authUser[0]?.firstname} ${authUser[0]?.lastname}`;
      newUser.phonenumber = authUser[0]?.phonenumber;
      newUser.isAdmin = Boolean(authUser[0]?.isAdmin);
      newUser.isEnabled = Boolean(authUser[0]?.isEnabled);
      newUser.permissions = JSON.parse(authUser[0]?.permissions)
    }

    req.user = newUser;

    next();
  });


};

module.exports = {
  verifyRefreshToken,
  verifyToken,
};
