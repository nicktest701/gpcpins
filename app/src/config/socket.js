// socket.js (React Frontend)

import { io } from "socket.io-client";

export const socket = io(
  import.meta.env.VITE_API_URL,
  {
    transports: ["websocket"],

    withCredentials: true,

    auth: {
      token:
        localStorage.getItem("accessToken"),
    },
  }
);