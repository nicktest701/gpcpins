const jwt = require("jsonwebtoken");
const knex = require("../db/knex");
const redisClient = require("../config/redisClient");
const { signMainRefreshToken } = require("../config/token");


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

    const jti = user?.jti;

    // Now you can check Redis for validity
    const tokenInRedis = await redisClient.get(`user:${jti}`);
    if (!tokenInRedis) {
      return res.status(403).json("Session has expired");
    }

    req.user = user;

    next();
  });
};

const verifyRefreshToken = async (req, res, next) => {
  // const authHeader =
  //   req.headers["authorization"] || req.headers["Authorization"];

  const cookieToken = req.cookies.refreshToken;

  if (!cookieToken) {
    return res.status(401).json("Unauthorized Access");
  }

  const token = cookieToken?.split(" ")[1];

  if (!token) {
    return res.status(401).json("Unauthorized Access");
  }

  const stored = await knex("user_tokens")
    .where({ refresh_token: token })
    .first();

  if (!stored || Boolean(stored.is_revoked)) return res.sendStatus(403);

  jwt.verify(token, process.env.TOKEN_REFRESH, async (err, user) => {
    if (err) {
      return res.status(403).json("Session has expired.");
    }
    let authUser = await knex("vw_users_with_roles")
      .select("*")
      .where("id", user?.id)
      .first();

    if (Boolean(authUser?.is_enabled) === false) {
      return res.status(403).json("Session has expired.");
    }

    let newUser = {
      id: authUser?.id,
      lastname: authUser?.lastname,
      firstname: authUser?.firstname,
      name: authUser?.name,
      profile: authUser?.profile,
      email: authUser?.email,
      phonenumber: authUser?.phonenumber,
      nid: authUser?.nid,
      dob: authUser?.dob,
      role: authUser?.role,
      active: authUser?.active,
      createdAt: authUser?.created_at,
      permissions: JSON.parse(authUser?.permissions || "[]"),
    };

    const updatedUser = {
      id: user?.id,
      role: user?.role,
      active: Boolean(user?.active),
      createdAt: user?.created_at,
    };


    if (
      user?.role === process.env.ADMIN_ID ||
      user?.role === Number(process.env.SCANNER_ID)
    ) {
      newUser.isAdmin = true;
    }

    const newRefreshToken = signMainRefreshToken(updatedUser, "365d");

    await knex("user_tokens")
      .where({ id: stored.id })
      .update({ is_revoked: true });

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    await knex("user_tokens").insert({
      user_id: user.id,
      session_id: stored.session_id,
      refresh_token: newRefreshToken,
      expiresAt: expires,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/users/auth/token",
    });

    req.user = newUser;

    next();
  });
};

const verifyOptionalToken = (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    req.user = {
      // id: process.env.CUSTOMER_ID,
      // name: process.env.CUSTOMER_EMAIL,
      // email: process.env.CUSTOMER_NAME,
      id: "",
      email: "",
      name: "",
    };
    return next();
  }

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json("Unauthorized Access");
  }

  jwt.verify(token, process.env.TOKEN, async (err, user) => {
    if (err) {
      return res.status(403).json("Session has expired.");
    }

    const jti = user?.jti;

    // Now you can check Redis for validity
    const tokenInRedis = await redisClient.get(`user:${jti}`);
    if (!tokenInRedis) {
      return res.status(403).json("Session has expired");
    }

    req.user = user;

    next();
  });
};

module.exports = {
  verifyRefreshToken,
  verifyToken,
  verifyOptionalToken,
};
