
const jwt = require("jsonwebtoken");

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    /*
      Guest users allowed
    */

    if (!token) {
      socket.user = null;
      return next();
    }

    /*
      Verify JWT
    */

    const decoded = jwt.verify(token, process.env.TOKEN);

    socket.user = decoded;

    next();
  } catch (error) {
    console.error(error);

    next(new Error("Unauthorized"));
  }
};

module.exports = socketAuth;
