const { createClient } = require("redis");
const { Server } = require("socket.io");
const logger = require("../utils/logger");
const { createAdapter } = require("@socket.io/redis-adapter");

let io = null;

// CORS configuration
const allowedList = process.env.WHITELIST?.split(",") || [];
const whitelist = [...allowedList, process.env.CLIENT_URL];

const initSocketServer = async (server) => {
  io = new Server(server, {
    transports: ["polling", "websocket"],
    cors: {
      origin: whitelist,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  /*
|--------------------------------------------------------------------------
| REDIS CLIENTS
|--------------------------------------------------------------------------
|
| pubClient  -> publish socket events
| subClient  -> subscribe socket events
|
*/

  const pubClient = createClient({
    url: process.env.REDIS_HOST_EXT,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    },
  });

  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  logger.info("Redis connected");

  pubClient.on("error", (err) => {
    logger.error("Redis Pub Error:", err);
  });

  subClient.on("error", (err) => {
    logger.error("Redis Sub Error:", err);
  });

  /*
    |--------------------------------------------------------------------------
    | SOCKET REDIS ADAPTER
    |--------------------------------------------------------------------------
    */

  io.adapter(createAdapter(pubClient, subClient));

  /*
|--------------------------------------------------------------------------
| SOCKET INIT FUNCTION (FIX FOR COMMONJS)
|--------------------------------------------------------------------------
*/

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
