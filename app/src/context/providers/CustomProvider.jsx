import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  useEffect,
  useState,
} from "react";
import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { CustomReducer } from "../reducers/CustomReducer";
import { useAuth } from "./AuthProvider";
import { getWalletBalance, getWalletStatus } from "../../api/walletAPI";
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
    disabled: !!user?.id || oneTapInitialized,
    onSuccess: async ({ credential }) => {
      try {
        const res = await api({
          method: "POST",
          url: "/users/login-google-tap",
          data: { credential },
          withCredentials: true,
        });

        saveAccessToken(res.data?.accessToken);
        login(res.data);

        if (res.data?.register) {
          navigate("/user/started", { state: { google: true } });
        } else {
          login(res.data);
          navigate(pathname);
        }
      } catch (error) {
        setErr("Authentication Failed!");
      } finally {
        setOneTapInitialized(true); // Mark as initialized
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
    staleTime: 1000 * 30, // ✅ Reduced to 30s. 10 minutes was too long for notifications
    cacheTime: 1000 * 60 * 5, // ✅ Matched to standard 5 mins
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: () => [], // ✅ Changed to placeholderData to keep cache clean
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data;
    },
  });

  /**
   * Wallet Status Query
   */
  const { data: walletStatus, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status", user?.id], // ✅ Added user?.id so cache clears/reloads if user switches accounts
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // ✅ Cache for 5 mins (Status rarely changes)
    cacheTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  /**
   * Wallet Balance Query
   */
  const walletBalanceQuery = useQuery({
    queryKey: ["wallet-balance", user?.id],
    queryFn: () => getWalletBalance(user?.id),
    enabled: !!user?.id,
    staleTime: 0, // ✅ Always stale: ensures it refetches on every single mount/screen change
    cacheTime: 1000 * 60, // 1 minute memory life
    retry: 2,
    refetchOnWindowFocus: true,
    placeholderData: 0, // ✅ FIX: Shows 0 while loading, but DOES NOT trick the cache into skipping the fetch
    select: (data) => Number(data || 0),
  });

  /**
   * Notifications Query
   */
  const notificationsQuery = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: getAllBroadcastMessages, // Note: Ensure this fn accepts user?.id if your API needs it
    enabled: !!user?.id,
    staleTime: 1000 * 30, // ✅ Reduced to 30s. 10 minutes was too long for notifications
    cacheTime: 1000 * 60 * 5, // ✅ Matched to standard 5 mins
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: () => [], // ✅ Changed to placeholderData to keep cache clean
    select: (data) => (Array.isArray(data) ? data : []),
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
    return () => {
      offEvent("payment-success", handleSuccess);
    };
  }, [onEvent, offEvent]);

  // Socket failed listener
  useEffect(() => {
    const handleFailed = (payload) => {
      setPaymentStatus(payload);
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
      products: categoriesQuery.data,
      notifications: notificationsQuery.data,
      walletBalance: walletBalanceQuery.data,
      walletStatus,
      walletBalanceQuery,
      notificationsQuery,
      categoriesQuery,
      setGlobalAlert,
      setLoading,
      paymentStatus,
    }),
    [
      walletStatus,
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
