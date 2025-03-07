import React, { useContext, useReducer, useEffect, useState } from "react";
import { CustomReducer } from "../reducers/CustomReducer";
import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "../../api/notificationAPI";
import { useAuth } from "./AuthProvider";
import Swal from "sweetalert2";
import tone from "../../assets/sound/tone.wav";
import { useNavigate } from "react-router-dom";

export const CustomContext = React.createContext();

export const useCustomData = () => {
  const context = useContext(CustomContext);
  if (!context) {
    throw new Error("An unknown error has occurred.");
  }
  return context;
};

function CustomProvider({ children }) {
  const { user } = useAuth();
  const [played, setPlayed] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    allCategory: [],

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
    openPreviewChecker: false,
    loadedChecker: {
      meta: [],
      data: [],
    },
    newCheckers: [],

    //View Details

    ///add category
    category: {
      open: false,
      category: "",
    },
    securityCategory: {
      open: false,
      category: "",
    },
    universityCategory: {
      open: false,
      category: "",
    },
    cinemaCategory: {
      open: false,
      category: "",
    },
    stadiumCategory: {
      open: false,
      category: "",
    },
    busCategory: {
      open: false,
      category: "",
    },
    ///add category
    editWaecCategory: {
      open: false,
      id: "",
    },
    editSecurityCategory: {
      open: false,
      id: "",
    },
    editUniversityCategory: {
      open: false,
      id: "",
    },
    editCinemaCategory: {
      open: false,
      id: "",
    },
    editStadiumCategory: {
      open: false,
      id: "",
    },
    editBusCategory: {
      open: false,
      id: "",
    },

    ticketDetails: {},

    ecgTransactionInfoEdit: {
      open: false,
      details: {},
    },
  };

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllNotifications(),
    enabled: !!user?.id,
    initialData: [],
    // refetchIntervalInBackground: true,
    // refetchInterval: 10000,
    onSuccess: (data) => {
      const unReadNotifications = data?.filter((item) => item?.active === 1);

      if (
        unReadNotifications?.length > localStorage.getItem("no-notification") ??
        0
      ) {
        setPlayed(false);
      }

      if (unReadNotifications?.length > 0) {
        if (!played) {
          // Play the notification sound
          const notificationSound = new Audio(tone);
          notificationSound.play();
          Swal.fire({
            icon: "info", // error, info, warning
            title: "New Notification ",
            text: "New notification available!",
            position: "top-end",
            toast: true,
            backdrop:false,
          }).then(({ isConfirmed }) => {
            if (isConfirmed) {
              setPlayed(true);
              navigate("/notifications");
            }
          });
        }
      }
    },
  });

  useEffect(() => {
    const unReadNotifications = notifications?.data?.filter(
      (item) => item?.active === 1
    );
    if (
      unReadNotifications?.length > localStorage.getItem("no-notification") ??
      0
    ) {
      // Play the notification sound
      const notificationSound = new Audio(tone);
      notificationSound.play();

      Swal.fire({
        icon: "info", // error, info, warning
        title: "Notifications",
        text: "New Notiications available",

        position: "top-end",
        // backdrop: false,
        timer: 10000,
      });

      localStorage.setItem("no-notification", notifications?.data?.length);
    }
    if (unReadNotifications?.length > 0) {
      // Play the notification sound
      const notificationSound = new Audio(tone);
      notificationSound.play();
    }
  }, [notifications.data, user]);

  const [customState, customDispatch] = useReducer(
    CustomReducer,
    initialValues
  );

  return (
    <CustomContext.Provider
      value={{
        customState,
        customDispatch,
        notifications: notifications?.data,
      }}
    >
      {children}
    </CustomContext.Provider>
  );
}

export default CustomProvider;
