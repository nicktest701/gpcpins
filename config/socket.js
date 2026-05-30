const { Server } = require("socket.io");

let io = null;

// CORS configuration
const allowedList = process.env.WHITELIST?.split(",");

const whitelist = [...allowedList, process.env.CLIENT_URL];

const initSocketServer = (server) => {
  io = new Server(server, {
    transports: ["polling", "websocket"],
    cors: {
      origin: whitelist,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized yet");
  }
  return io;
};

module.exports = {
  initSocketServer,
  getIO,
};
