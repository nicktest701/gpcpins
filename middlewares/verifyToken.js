const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const isMobile = require('../config/isMobile');

const knex = require('../db/knex');

const verifyToken = (req, res, next) => {
  if (isMobile(req)) {
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
      return res.status(401).json('Unauthorized Access');
    }

    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json('Unauthorized Access');
    }

    jwt.verify(token, process.env.TOKEN_REFRESH, async (err, user) => {
      if (err) {
        return res.status(403).json('Session has expired.');
      }

      let authUser = {};
      if (
        user?.role === process.env.ADMIN_ID ||
        user?.role === process.env.EMPLOYEE_ID
      ) {
        authUser = await knex('employees')
          .select('*')
          .where('_id', user?.id)
          .limit(1);
      } else {
        authUser = await knex('users')
          .select('*')
          .where('_id', user?.id)
          .limit(1);
      }

      const isTrue = bcrypt.compare(token, authUser[0]?.token);
      if (!isTrue) {
        return res.status(403).json('Session has expired.');
      }

      req.user = user;

      next();
    });
  } else {
    const token = req.cookies._SSUID_kyfc;

    if (!token) {
      return res.status(401).json('Unauthorized Access!');
    }

    jwt.verify(token, process.env.TOKEN, (err, user) => {
      if (err) {
        return res.status(403).json('Session has expired.');
      }

      req.user = user;

      next();
    });
  }

  // next();
};

const verifyRefreshToken = (req, res, next) => {
  const token = req.cookies._SSUID_X_ayd;

  if (!token) {
    return res.status(401).json('Unauthorized Access!');
  }

  jwt.verify(token, process.env.TOKEN_REFRESH, async (err, user) => {
    if (err) {
      return res.status(403).json('Session has expired.');
    }
    let authUser = {};
    if (
      user?.role === process.env.ADMIN_ID ||
      user?.role === process.env.EMPLOYEE_ID
    ) {
      authUser = await knex('employees')
        .select('*')
        .where('_id', user?.id)
        .limit(1);
    } else {
      authUser = await knex('users')
        .select('*')
        .where('_id', user?.id)
        .limit(1);
    }

    const isTrue = bcrypt.compare(token, authUser[0]?.token);
    if (!isTrue) {
      return res.status(403).json('Session has expired.');
    }

    req.user = user;

    next();
  });

  // next();
};

module.exports = {
  verifyRefreshToken,
  verifyToken,
};
