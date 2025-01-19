import React, { useContext, useReducer, useEffect } from "react";
import { CustomReducer } from "../reducers/CustomReducer";
import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "../../api/notificationAPI";
import { AuthContext } from "./AuthProvider";
import Swal from "sweetalert2";
import tone from "../../assets/sound/tone.wav";

export const CustomContext = React.createContext();
function CustomProvider({ children }) {
  const { user } = useContext(AuthContext);
  const initialValues = {
    ecgNotifications: {
      open: false,
      messages: [],
    },

    loading: {
      open: false,
      message: "",
    },
    alertData: {
      open: false,
      severity: "",
      message: "",
    },
    openSidebar: false,

    ///vouchers
    transaction: {},

    verifyMeter: {
      open: false,
      details: {},
    },
    ecgTransactionInfo: {
      open: false,
      details: {},
    },
    ecgTransactionInfoEdit: {
      open: false,
      details: {},
    },

    verifyPrepaid: {
      open: false,
      details: {},
    },
    ticketDetails: {},

    viewMessage: {
      open: false,
      data: {
        _id: "",
        type: "",
        recipient: "",
        body: "",
        createdAt: "",
      },
    },
  };

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllNotifications(),
    enabled: !!user?.id,
    retry: false,
    initialData: [],
  });

  const notif = notifications?.data?.filter(
    ({ active }) => active === true
  )?.length;

  useEffect(() => {
    if (sessionStorage.getItem("notification") === null) {
      if (notif > 0) {
        // Play the notification sound
        const notificationSound = new Audio(tone);
        notificationSound.play();

        Swal.fire({
          icon: "info", // error, info, warning
          title: "Transaction",
          text: "You have some pending transactions to process!",
          // toast: true,
          position: "top-end",
          // backdrop: false,
          timer: 10000,
        });
        sessionStorage.setItem("notification", "true");
      }
    }
  }, [notif, user]);

  const [customState, customDispatch] = useReducer(
    CustomReducer,
    initialValues
  );

  return (
    <CustomContext.Provider
      value={{
        customState,
        customDispatch,
        notifications: notifications.data,
      }}
    >
      {children}
    </CustomContext.Provider>
  );
}

export default CustomProvider;
