import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

/**
 * Production-ready payment status polling hook using TanStack Query.
 * Accommodates WebSocket fallbacks perfectly.
 *
 * Status lifecycle:
 *  - "idle"       -> no active payment being tracked (no paymentId yet)
 *  - "pending"    -> polling is active; either the first request hasn't
 *                    resolved yet, or we're between ticks waiting on a
 *                    prior "pending" response
 *  - "processing" -> a poll request is actively in flight (after the
 *                     first response has already come back "pending")
 *  - "success"    -> API confirmed the payment
 *  - "failed"     -> API confirmed failure, or a request errored
 *  - "timeout"    -> max attempts reached without a terminal result
 */
export const usePaymentPolling = ({
  props,
  checkStatusFn,
  interval = 3000, // Base polling frequency (3 seconds)
  maxAttempts = 15, // Maximum allowed polling requests
  onSuccess,
  onFailure,
  onTimeout,
}) => {
  const queryClient = useQueryClient();
  const attemptCounterRef = useRef(0);
  const startTimeRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  const { paymentId } = props;

  const queryKey = ["paymentStatus", paymentId];

  // 1. Reset metrics immediately whenever a new payment cycle triggers,
  //    and cancel any in-flight/scheduled polling when it ends.
  useEffect(() => {
    if (!paymentId) return;
    attemptCounterRef.current = 0;
    startTimeRef.current = Date.now();
    setElapsed(0);

    const elapsedTimer = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    return () => {
      clearInterval(elapsedTimer);
      // Prevent orphaned polling if the consumer unmounts (e.g. modal closed)
      // or switches to a new paymentId mid-poll.
      queryClient.cancelQueries({ queryKey });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  // 2. Main Query Engine
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      attemptCounterRef.current += 1;
      return await checkStatusFn({ ...props });
    },
    // Only execute network calls if a payment ID is validly passed
    enabled: !!paymentId,

    // Core polling logic executed after every API resolution
    refetchInterval: (query) => {
      const result = query?.state?.data;

      // Stop polling if the terminal state matches API expectations
      if (result?.status === "success" || result?.status === "failed") {
        return false;
      }

      // Safeguard: Trigger timeout state if threshold breached
      if (attemptCounterRef.current >= maxAttempts) {
        return false;
      }

      // Production enhancement: progressively ease off polling frequency
      // on late attempts to preserve server bandwidth: 3s -> 4.5s -> 6s
      if (attemptCounterRef.current > 10) {
        return interval * 2;
      }
      if (attemptCounterRef.current > 5) {
        return interval * 1.5;
      }

      return interval;
    },
    // Network-level configuration
    refetchOnWindowFocus: false,
    retry: false, // Disables React Query's default internal error-retries
  });

  // 3. Side-Effect Lifecycle Synchronizer
  const currentStatus = data?.status;
  const currentAttempts = attemptCounterRef.current;
  const attemptsExhausted = currentAttempts >= maxAttempts;

  useEffect(() => {
    if (!paymentId || !data) return;

    if (currentStatus === "success") {
      onSuccess?.(data);
      // console.log(data)
    } else if (currentStatus === "failed") {
      onFailure?.(data);
    } else if (
      attemptsExhausted &&
      currentStatus !== "success" &&
      currentStatus !== "failed"
    ) {
      onTimeout?.({ message: "Polling limit reached before confirmation." });
    }
  }, [currentStatus, attemptsExhausted, paymentId, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Manual Actions & State Derivation
  const manualRetry = () => {
    attemptCounterRef.current = 0;
    startTimeRef.current = Date.now();
    setElapsed(0);
    refetch();
  };

  const cancelPolling = () => {
    queryClient.cancelQueries({ queryKey });
  };

  // Derive the active business logic state.
  // Order matters: terminal states first, then timeout, then in-flight
  // states, then "waiting between ticks" — falling through to "idle"
  // only when there's genuinely no active payment to track.
  let computedStatus;
  if (currentStatus === "success") {
    computedStatus = "success";
  } else if (currentStatus === "failed" || error) {
    computedStatus = "failed";
  } else if (attemptsExhausted && paymentId) {
    computedStatus = "timeout";
  } else if (isLoading) {
    computedStatus = "pending"; // first request in flight, no data yet
  } else if (isFetching) {
    computedStatus = "processing"; // subsequent request actively in flight
  } else if (paymentId) {
    computedStatus = "pending"; // polling active, waiting between ticks
  } else {
    computedStatus = "idle"; // nothing being tracked
  }

  return {
    status: computedStatus,
    attempts: currentAttempts,
    error: error?.message || data?.message || null,
    elapsed,
    retry: manualRetry,
    cancel: cancelPolling,
    rawData: data,
  };
};

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useEffect, useRef, useState } from "react";

// /**
//  * Production-ready payment status polling hook using TanStack Query.
//  * Accommodates WebSocket fallbacks perfectly.
//  */
// export const usePaymentPolling = ({
//   paymentId,
//   transactionId,
//   checkStatusFn,
//   interval = 3000, // Base polling frequency (3 seconds)
//   maxAttempts = 15, // Maximum allowed polling requests
//   onSuccess,
//   onFailure,
//   onTimeout,
// }) => {
//   const queryClient = useQueryClient();
//   const attemptCounterRef = useRef(0);
//   const startTimeRef = useRef(null);
//   const [elapsed, setElapsed] = useState(0);

//   const queryKey = ["paymentStatus", paymentId];

//   // 1. Reset metrics immediately whenever a new payment cycle triggers
//   useEffect(() => {
//     if (!paymentId) return;
//     attemptCounterRef.current = 0;
//     startTimeRef.current = Date.now();
//     setElapsed(0);

//     const elapsedTimer = setInterval(() => {
//       if (startTimeRef.current) {
//         setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
//       }
//     }, 1000);

//     return () => clearInterval(elapsedTimer);
//   }, [paymentId]);

//   // 2. Main Query Engine
//   const { data, error, isLoading, isFetching, refetch } = useQuery({
//     queryKey,
//     queryFn: async () => {
//       attemptCounterRef.current += 1;
//       return await checkStatusFn(paymentId, transactionId);
//     },
//     // Only execute network calls if a payment ID is validly passed
//     enabled: !!paymentId,

//     // Core polling logic executed after every API resolution
//     refetchInterval: (query) => {
//       const result = query?.state?.data;

//       // Stop polling if the terminal state matches API expectations
//       if (result?.status === "success" || result?.status === "failed") {
//         return false;
//       }

//       // Safeguard: Trigger timeout state if threshold breached
//       if (attemptCounterRef.current >= maxAttempts) {
//         return false;
//       }

//       // Production enhancement: Exponentially scale delays on late attempts
//       // e.g., 3s -> 3s -> 4.5s -> 6s to preserve server bandwidth
//       if (attemptCounterRef.current > 5) {
//         return interval * 1.5;
//       }

//       return interval;
//     },
//     // Network-level configuration
//     refetchOnWindowFocus: false,
//     retry: false, // Disables React Query's default internal error-retries
//   });

//   // 3. Side-Effect Lifecycle Synchronizer
//   const currentStatus = data?.status;
//   const currentAttempts = attemptCounterRef.current;

//   useEffect(() => {
//     if (!paymentId || !data) return;

//     if (currentStatus === "success") {
//       onSuccess?.(data);
//     } else if (currentStatus === "failed") {
//       onFailure?.(data);
//     } else if (currentAttempts >= maxAttempts && currentStatus === "pending") {
//       onTimeout?.({ message: "Polling limit reached before confirmation." });
//     }
//   }, [currentStatus, currentAttempts, maxAttempts, paymentId, data]);

//   // 4. Manual Actions & State Derivation
//   const manualRetry = () => {
//     attemptCounterRef.current = 0;
//     startTimeRef.current = Date.now();
//     setElapsed(0);
//     refetch();
//   };

//   const cancelPolling = () => {
//     queryClient.cancelQueries({ queryKey });
//   };

//   // Derive the active business logic state
//   let computedStatus = "idle";
//   if (isLoading) computedStatus = "pending";
//   if (isFetching && currentStatus === "pending") computedStatus = "processing";
//   if (currentStatus === "success") computedStatus = "success";
//   if (currentStatus === "failed" || error) computedStatus = "failed";
//   if (currentAttempts >= maxAttempts && currentStatus === "pending")
//     computedStatus = "timeout";

//   return {
//     status: computedStatus,
//     attempts: currentAttempts,
//     error: error?.message || data?.message || null,
//     elapsed,
//     retry: manualRetry,
//     cancel: cancelPolling,
//     rawData: data,
//   };
// };
