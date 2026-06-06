import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useQuery } from "@tanstack/react-query";

import { CustomReducer } from "../reducers/CustomReducer";

import { useAuth } from "./AuthProvider";

import { getWalletBalance } from "../../api/walletAPI";
import { getAllBroadcastMessages } from "../../api/broadcastMessageAPI";
import { getAllCategory } from "../../api/categoryAPI";

import GlobalSpinner from "../../components/GlobalSpinner";
import { useSocket } from "./SocketProvider";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import api from "../../api/customAxios";
import { saveAccessToken } from "../../config/sessionHandler";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";
import { ErrorRounded } from "@mui/icons-material";

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
  const { user, login } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { onEvent, offEvent } = useSocket();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [oneTapInitialized, setOneTapInitialized] = useState(false);
  const [err, setErr] = useState("");
  const [customState, customDispatch] = useReducer(
    CustomReducer,
    INITIAL_STATE,
  );

  useGoogleOneTapLogin({
    // Strictly disable if user exists OR if already initialized
    disabled: Boolean(user?.id) || oneTapInitialized,
    onSuccess: async ({ credential }) => {
      try {
        const res = await api({
          method: "POST",
          url: "/users/login-google-tap",
          data: { credential },
          withCredentials: true,
        });

        saveAccessToken(res.data?.accessToken);
        login(res.data?.accessToken);

        if (res.data?.register) {
          navigate("/user/started", { state: { google: true } });
        } else {
          login(res.data?.accessToken);
          navigate(pathname);
        }
        setOneTapInitialized(true); // Mark as initialized
      } catch (error) {
        setErr("Authentication Failed!");
      }
    },
    onError: () => {
      setErr("Authentication Failed!");
    },
  });

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

  // Socket success listener
  useEffect(() => {
    const handleSuccess = (payload) => {
      setPaymentStatus(payload);
    };
    onEvent("payment-success", handleSuccess);
    // onEvent("general", handleSuccess);
    return () => {
      offEvent("payment-success", handleSuccess);
      // offEvent("general", handleSuccess);
    };
  }, [onEvent, offEvent]);

  // Socket failed listener
  useEffect(() => {
    const handleFailed = (payload) => {
      setPaymentStatus(payload);
      // setStatus("failed");
      // setMessage(payload.reason || "Payment failed.");
    };
    onEvent("payment-failed", handleFailed);
    return () => offEvent("payment-failed", handleFailed);
  }, [onEvent, offEvent]);



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
      paymentStatus,
    }),
    [
      customState,
      walletBalanceQuery,
      notificationsQuery,
      categoriesQuery,
      setGlobalAlert,
      setLoading,
      paymentStatus,
    ],
  );

  /**
   * Initial App Loader
   */
  if (isInitializing) {
    return <GlobalSpinner />;
  }

  return (
    <>
      {err && (
        <Alert
          icon={<ErrorRounded color="error" />}
          severity="error"
          onClose={() => setErr("")}
        >
          {err}
        </Alert>
      )}
      <CustomContext.Provider value={value}>{children}</CustomContext.Provider>
    </>
  );
}

export default React.memo(CustomProvider);
