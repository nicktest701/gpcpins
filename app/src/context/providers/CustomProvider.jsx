import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
} from "react";

import { useQuery } from "@tanstack/react-query";

import { CustomReducer } from "../reducers/CustomReducer";

import { useAuth } from "./AuthProvider";

import { getWalletBalance } from "../../api/walletAPI";
import { getAllBroadcastMessages } from "../../api/broadcastMessageAPI";
import { getAllCategory } from "../../api/categoryAPI";

import GlobalSpinner from "../../components/GlobalSpinner";

export const CustomContext = createContext(null);

export const useCustomContext = () => {
  const context = useContext(CustomContext);

  if (!context) {
    throw new Error("useCustomContext must be used within CustomProvider");
  }

  return context;
};

const INITIAL_STATE = {
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

  transaction: {},

  buyElectricity: {
    open: false,
    data: {},
  },

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

  busTicketTotal: [],
  cinemaTicketTotal: [],
  stadiumTicketTotal: [],

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

  airtime_bundle_amount: Number(sessionStorage.getItem("value-x")) || 0,
};

function CustomProvider({ children }) {
  const { user } = useAuth();

  const [customState, customDispatch] = useReducer(
    CustomReducer,
    INITIAL_STATE,
  );

  /**
   * Categories Query
   */
  const categoriesQuery = useQuery({
    queryKey: ["all-category"],
    queryFn: getAllCategory,
    staleTime: 1000 * 60 * 10, // 10 mins
    gcTime: 1000 * 60 * 30, // 30 mins
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data;
    },
  });

  /**
   * Wallet Balance Query
   */
  const walletBalanceQuery = useQuery({
    queryKey: ["wallet-balance", user?.id],
    queryFn: () => getWalletBalance(user?.id),
    enabled: !!user?.id,
    staleTime: 1000 * 30,
    retry: 2,
    refetchOnWindowFocus: true,
    initialData: 0,
    select: (data) => Number(data || 0),
  });

  /**
   * Notifications Query
   */
  const notificationsQuery = useQuery({
    queryKey: ["notifications", user?.id],

    queryFn: getAllBroadcastMessages,
    enabled: !!user?.id,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
    initialData: [],

    select: (data) => {
      if (!Array.isArray(data)) return [];

      return data;
    },
  });

  /**
   * Global Loading State
   */
  const isInitializing =
    categoriesQuery.isLoading ||
    walletBalanceQuery.isLoading ||
    notificationsQuery.isLoading;

  /**
   * Dispatch Helpers
   */
  const setGlobalAlert = useCallback(
    ({ open = false, severity = "info", message = "" }) => {
      customDispatch({
        type: "SET_GLOBAL_ALERT",
        payload: {
          open,
          severity,
          message,
        },
      });
    },
    [],
  );

  const setLoading = useCallback(({ open = false, message = "" }) => {
    customDispatch({
      type: "SET_LOADING",
      payload: {
        open,
        message,
      },
    });
  }, []);

  /**
   * Memoized Context Value
   */

  
  const value = useMemo(
    () => ({
      customState,
      customDispatch,
      products: categoriesQuery.data || [],
      notifications: notificationsQuery.data || [],
      walletBalance: walletBalanceQuery.data || 0,
      walletBalanceQuery,
      notificationsQuery,
      categoriesQuery,
      setGlobalAlert,
      setLoading,
    }),
    [
      customState,
      walletBalanceQuery,
      notificationsQuery,
      categoriesQuery,
      setGlobalAlert,
      setLoading,
    ],
  );

  /**
   * Initial App Loader
   */
  if (isInitializing) {
    return <GlobalSpinner />;
  }

  return (
    <CustomContext.Provider value={value}>{children}</CustomContext.Provider>
  );
}

export default React.memo(CustomProvider);

// import React, { useContext, useReducer, useState } from "react";
// import { CustomReducer } from "../reducers/CustomReducer";
// import { useQuery } from "@tanstack/react-query";
// import { getWalletBalance } from "../../api/walletAPI";
// import { AuthContext } from "./AuthProvider";
// import { getAllBroadcastMessages } from "../../api/broadcastMessageAPI";
// import { getAllCategory } from "../../api/categoryAPI";
// import GlobalSpinner from "../../components/GlobalSpinner";

// export const CustomContext = React.createContext();

// export const useCustomContext = () => {
//   const context = useContext(CustomContext);
//   if (!context) {
//     throw new Error("An unknown error has occurred.");
//   }
//   return context;
// };

// function CustomProvider({ children }) {
//   const { user } = useContext(AuthContext);
//   const [notifications, setNotifications] = useState([]);
//   const [products, setProducts] = useState([]);

//   useQuery({
//     queryFn: getAllCategory,
//     queryKey: ["all-category"],
//     onSuccess: (data) => {
//       updateProducts(data);
//     },
//   });

//   const initialValues = {
//     search: false,
//     openUnavailable: true,
//     globalAlert: {
//       open: false,
//       severity: "info",
//       message: "",
//     },
//     allCategory: [],

//     ecgNotifications: {
//       open: false,
//       messages: [],
//     },

//     loading: {
//       open: false,
//       message: "",
//     },
//     alertData: {
//       open: false,
//       severity: "",
//       message: "",
//     },
//     openSidebar: false,

//     voucherPaymentDetails: {
//       open: false,
//       data: {},
//     },
//     ticketPaymentDetails: {
//       open: false,
//       data: {},
//     },
//     loadedChecker: {
//       meta: [],
//       data: [],
//     },
//     newCheckers: [],

//     ///vouchers
//     transaction: {},

//     ///prepaid
//     buyElectricity: {
//       open: false,
//       data: {},
//     },
//     //meter
//     meters: [],

//     addMeter: {
//       open: false,
//       type: "",
//       details: {},
//     },
//     verifyNewMeter: {
//       open: false,
//       details: {},
//     },
//     viewMeter: {
//       open: false,
//       details: {},
//     },

//     verifyMeter: {
//       open: false,
//       details: {},
//     },
//     ecgTransactionInfo: {
//       open: false,
//       details: {},
//     },
//     ecgTransactionInfoEdit: {
//       open: false,
//       details: {},
//     },

//     verifyPrepaid: {
//       open: false,
//       details: {},
//     },
//     ticketDetails: {},

//     //total details,
//     busTicketTotal: [],
//     cinemaTicketTotal: [],
//     stadiumTicketTotal: [],

//     //match search
//     matchSearchDetails: {
//       open: false,
//       value: "",
//     },
//     viewMessage: {
//       open: false,
//       data: {
//         _id: "",
//         type: "",
//         recipient: "",
//         body: "",
//         createdAt: "",
//       },
//     },

//     airtime_bundle_amount: sessionStorage.getItem("value-x") || 0,
//   };

//   const updateNotifications = (data) => setNotifications(data);
//   const updateProducts = (data) => setProducts(data);

//   const walletBalance = useQuery({
//     queryKey: ["wallet-balance", user?.id],
//     queryFn: () => getWalletBalance(user?.id),
//     enabled: !!user?.id,
//     initialData: 0,
//   });

//   const notificationsQuery = useQuery({
//     queryKey: ["notifications"],
//     queryFn: () => getAllBroadcastMessages(),
//     enabled: !!user?.id,
//     initialData: [],
//     onSuccess: (data) => {
//       updateNotifications(data);
//     },
//   });

//   const [customState, customDispatch] = useReducer(
//     CustomReducer,
//     initialValues,
//   );

//   if (notificationsQuery.isLoading || walletBalance.isLoading) {
//     return <GlobalSpinner />; // or a loading spinner
//   }

//   return (
//     <CustomContext.Provider
//       value={{
//         customState,
//         customDispatch,
//         products: products,
//         notifications,
//         updateNotifications,
//         updateProducts,
//         walletBalance,
//       }}
//     >
//       {children}
//     </CustomContext.Provider>
//   );
// }

// export default CustomProvider;
