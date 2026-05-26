// src/context/SocketProvider.jsx

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";
import { getToken } from "../../config/sessionHandler";

/*
|--------------------------------------------------------------------------
| SOCKET CONTEXT
|--------------------------------------------------------------------------
*/

const SocketContext = createContext(null);

/*
|--------------------------------------------------------------------------
| SOCKET PROVIDER
|--------------------------------------------------------------------------
*/

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);

  const [socketId, setSocketId] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | INITIALIZE SOCKET
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    /*
      Prevent duplicate connections

      token
    */

    if (socketRef.current) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      timeout: 20000,

      auth: {
        token: getToken() || "",
      },
    });

    socketRef.current = socket;

    /*
    |--------------------------------------------------------------------------
    | CONNECTED
    |--------------------------------------------------------------------------
    */

    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);

      setConnected(true);

      setSocketId(socket.id);
    });

    /*
    |--------------------------------------------------------------------------
    | DISCONNECTED
    |--------------------------------------------------------------------------
    */

    socket.on("disconnect", (reason) => {
      console.log("Socket Disconnected:", reason);

      setConnected(false);
    });

    /*
    |--------------------------------------------------------------------------
    | SOCKET ERROR
    |--------------------------------------------------------------------------
    */

    socket.on("connect_error", (error) => {
      console.error("Socket Error:", error.message);
    });

    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    return () => {
      socket.removeAllListeners();

      socket.disconnect();

      socketRef.current = null;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | JOIN PAYMENT ROOM
  |--------------------------------------------------------------------------
  */

  const joinPaymentRoom = (txRef) => {
    if (!txRef) return;

    socketRef.current?.emit("join-payment-room", txRef);
  };

  /*
  |--------------------------------------------------------------------------
  | LEAVE PAYMENT ROOM
  |--------------------------------------------------------------------------
  */

  const leavePaymentRoom = (txRef) => {
    if (!txRef) return;

    socketRef.current?.emit("leave-payment-room", txRef);
  };

  /*
  |--------------------------------------------------------------------------
  | GENERIC EVENT EMITTER
  |--------------------------------------------------------------------------
  */

  const emitEvent = (event, payload = {}) => {
    socketRef.current?.emit(event, payload);
  };

  /*
  |--------------------------------------------------------------------------
  | GENERIC EVENT LISTENER
  |--------------------------------------------------------------------------
  */

  const onEvent = (event, callback) => {
    socketRef.current?.on(event, callback);
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE EVENT LISTENER
  |--------------------------------------------------------------------------
  */

  const offEvent = (event, callback) => {
    socketRef.current?.off(event, callback);
  };

  /*
  |--------------------------------------------------------------------------
  | RECONNECT WITH NEW TOKEN
  |--------------------------------------------------------------------------
  */

  const reconnectSocket = () => {
    if (!socketRef.current) return;

    socketRef.current.auth = {
      token: localStorage.getItem("accessToken") || "",
    };

    socketRef.current.disconnect();

    socketRef.current.connect();
  };

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value = useMemo(
    () => ({
      socket: socketRef.current,

      connected,

      socketId,

      joinPaymentRoom,

      leavePaymentRoom,

      emitEvent,

      onEvent,

      offEvent,

      reconnectSocket,
    }),
    [connected, socketId],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| USE SOCKET HOOK
|--------------------------------------------------------------------------
*/

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return context;
};
