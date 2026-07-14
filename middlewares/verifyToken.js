const jwt = require("jsonwebtoken");
const knex = require("../db/knex");
const redisClient = require("../config/redisClient");
const { signMainRefreshToken, signMainToken } = require("../config/token");
const { safeJSON } = require("../config/helpers");
const { getExpiryTimeByRoleMs } = require("../utils/helper");

const adminRoles = [process?.env.ADMIN_ID, process?.env.EMPLOYEE_ID];
const isProduction = process.env.NODE_ENV === "production";

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
    console.log("Access Role is", user?.role);

    const userId = user.sub; // Extracted from verified JWT
    const cacheKey = `user:profile:${jti}`;

    // 1. Try fetching from Redis
    const cachedUser = await redisClient.get(cacheKey);
    // console.log("Cache data is", cachedUser);
    if (cachedUser) {
      req.user = safeJSON(cachedUser);
      req.authUser = user;
      return next();
    }

    // 2. Fallback to Database on Cache Miss
    const authUser = await knex("vw_users_with_roles")
      .select("*")
      .where("id", userId)
      .first();

    if (!authUser) return res.status(403).json("User not found");

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
      role: user?.role,
      active: authUser?.active,
      createdAt: authUser?.created_at,
    };

    if (user?.role !== process.env.USER_ID) {
      newUser.permissions = safeJSON(authUser?.permissions, []);
    }

    // 3. Populate Cache for next time (e.g., expires in 1 hour)
    await redisClient.set(cacheKey, JSON.stringify(newUser), {
      EX: getExpiryTimeByRoleMs(user?.role).accessTimeMs,
    });
    req.user = newUser;
    req.authUser = user;
    next();
  });
};

const verifyRefreshToken = async (req, res, next) => {
  const cookieToken = req.cookies.refreshToken;
  console.log(cookieToken);

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
      .where("id", user?.sub)
      .first();

    if (Boolean(authUser?.is_enabled) === false) {
      return res.status(403).json("Session has expired.");
    }

    const currentRole =
      user?.role === process.env.USER_ID ? process.env.USER_ID : user?.role;

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
      role: currentRole,
      active: Boolean(authUser?.active),
      createdAt: authUser?.created_at,
      permissions: safeJSON(authUser?.permissions, []),
    };

    if (user?.role !== process.env.USER_ID) {
      newUser.permissions = safeJSON(authUser?.permissions, []);
    }

    if (
      currentRole === process.env.ADMIN_ID ||
      currentRole === Number(process.env.SCANNER_ID)
    ) {
      newUser.isAdmin = true;
    }

    const updatedUser = {
      sub: user?.sub,
      role: currentRole,
    };

    const newRefreshToken = signMainRefreshToken(updatedUser);
    const accessToken = await signMainToken(updatedUser, newUser);

    await knex("user_tokens")
      .where({ id: stored.id })
      .update({ is_revoked: false });

    const expires = getExpiryTimeByRoleMs(user?.role).refreshTimeMs;

    await knex("user_tokens").insert({
      user_id: user.sub,
      session_id: stored.session_id,
      refresh_token: newRefreshToken,
      expiresAt: new Date(expires * 1000),
    });

    const path =
      user?.role === process.env.USER_ID
        ? "user"
        : adminRoles.includes(user?.role)
          ? "admin"
          : "verifier";

    console.log("Path is", path);
    console.log("Refresh Role is", user?.role);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: `/api/gabs/v1/${path}/auth/token`,
      maxAge: expires,
    });

    req.user = newUser;
    req.authUser = user;
    req.accessToken = accessToken;
    req.walletCount = 3;

    next();
  });
};

const verifyOptionalToken = (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    req.user = {
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

    const userId = user.sub; // Extracted from verified JWT
    const cacheKey = `user:profile:${jti}`;

    // 1. Try fetching from Redis
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      req.user = safeJSON(cachedUser);
      return next();
    }

    // 2. Fallback to Database on Cache Miss
    const authUser = await knex("vw_users_with_roles")
      .select("*")
      .where("id", userId)
      .first();

    if (!authUser) return res.status(403).json("User not found");

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
      role: user?.role,
      active: authUser?.active,
      createdAt: authUser?.created_at,
      permissions: safeJSON(authUser?.permissions, "[]"),
    };

    // 3. Populate Cache for next time (e.g., expires in 1 hour)
    await redisClient.set(cacheKey, JSON.stringify(newUser), {
      EX: getExpiryTimeByRoleMs(user?.role).accessTimeMs,
    });
    req.user = newUser;
    next();
  });
};

module.exports = {
  verifyRefreshToken,
  verifyToken,
  verifyOptionalToken,
};
