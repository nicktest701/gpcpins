import React, { useContext, useReducer, useState } from "react";
import { CustomReducer } from "../reducers/CustomReducer";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "../../api/userAPI";
import { AuthContext } from "./AuthProvider";
import { getAllBroadcastMessages } from "../../api/broadcastMessageAPI";
import { getAllCategory } from "../../api/categoryAPI";

export const CustomContext = React.createContext();
function CustomProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [products, setProducts] = useState([]);

  useQuery({
    queryFn: getAllCategory,
    queryKey: ["all-category"],
    onSuccess: (data) => {
      updateProducts(data);
    },
  });

  const initialValues = {
    search: false,
    openUnavailable: true,
    globalAlert: {
      open: false,
      severity: "info",
      message: "",
    },
    allCategory: [],

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

    voucherPaymentDetails: {
      open: false,
      data: {},
    },
    ticketPaymentDetails: {
      open: false,
      data: {},
    },
    loadedChecker: {
      meta: [],
      data: [],
    },
    newCheckers: [],

    ///vouchers
    transaction: {},

    ///prepaid
    buyElectricity: {
      open: false,
      data: {},
    },
    //meter
    meters: [],

    addMeter: {
      open: false,
      type: "",
      details: {},
    },
    verifyNewMeter: {
      open: false,
      details: {},
    },
    viewMeter: {
      open: false,
      details: {},
    },

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

    //total details,
    busTicketTotal: [],
    cinemaTicketTotal: [],
    stadiumTicketTotal: [],

    //match search
    matchSearchDetails: {
      open: false,
      value: "",
    },
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

    airtime_bundle_amount: sessionStorage.getItem("value-x") || 0,
  };

  const updateNotifications = (data) => setNotifications(data);
  const updateProducts = (data) => setProducts(data);

  const walletBalance = useQuery({
    queryKey: ["wallet-balance", user?.id],
    queryFn: () => getWalletBalance(user?.id),
    // refetchOnReconnect: true,
    // refetchOnMount: true,
    enabled: !!user?.id,
    initialData: 0,
  });

  useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllBroadcastMessages(),
    enabled: !!user?.id,
    initialData: [],
    onSuccess: (data) => {
      updateNotifications(data);
    },
  });

  const [customState, customDispatch] = useReducer(
    CustomReducer,
    initialValues
  );

  return (
    <CustomContext.Provider
      value={{
        customState,
        customDispatch,
        products: products,
        notifications,
        updateNotifications,
        updateProducts,
        walletBalance,
      }}
    >
      {children}
    </CustomContext.Provider>
  );
}

export default CustomProvider;
