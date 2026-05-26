const { Server } = require("socket.io");

let io = null;

const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
    transports: ["websocket"],
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.io not initialized yet"
    );
  }
  return io;
};

module.exports = {
  initSocketServer,
  getIO,
};