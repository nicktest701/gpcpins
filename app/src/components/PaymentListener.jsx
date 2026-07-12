// PaymentListener.jsx

import { useEffect } from "react";
import { socket } from "./socket";

const PaymentListener = ({ txRef, onSuccess, onFailed }) => {
  useEffect(() => {
    if (!txRef) return;

    /*
      Join room
    */

    socket.emit("join-payment-room", txRef);

    /*
      Success listener
    */

    const handleSuccess = (data) => {
      // console.log("Payment Success:", data);

      onSuccess?.(data);
    };

    /*
      Failed listener
    */

    const handleFailed = (data) => {
      // console.log("Payment Failed:", data);

      onFailed?.(data);
    };

    socket.on("payment-success", handleSuccess);

    socket.on("payment-failed", handleFailed);

    return () => {
      socket.off("payment-success", handleSuccess);

      socket.off("payment-failed", handleFailed);

      socket.emit("leave-payment-room", txRef);
    };
  }, [txRef]);

  return null;
};

export default PaymentListener;
