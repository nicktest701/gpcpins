import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

const TERMINAL_STATUSES = new Set(["success", "failed", "timeout"]);

/**
 * Best-effort match between an inbound socket payload and the payment this
 * hook instance is tracking. Falls back to "accept anything" if the payload
 * carries no identifying field — override via `matchSocketStatus` if you run
 * multiple concurrent polls and need stricter scoping.
 */
const defaultMatchSocketStatus = (payload, { paymentId, transactionId }) => {
  if (!payload) return false;
  if (payload.paymentId != null && paymentId != null) {
    return String(payload.paymentId) === String(paymentId);
  }
  if (payload.transactionId != null && transactionId != null) {
    return String(payload.transactionId) === String(transactionId);
  }
  return true;
};

/**
 * Production-ready payment status polling hook using TanStack Query, with
 * an optional real-time socket shortcut layered on top.
 *
 * Fully generic: pass any `checkStatusFn(paymentId, transactionId)` that
 * resolves `{ status: "pending" | "success" | "failed", ... }`, plus your
 * own `onSuccess` / `onFailure` handlers. Nothing here is tied to a specific
 * payment type (prepaid electricity, wallet top-up, bill payment, etc.).
 *
 * Status lifecycle:
 *  - "idle"       -> no active payment being tracked (no paymentId yet)
 *  - "pending"    -> polling is active; either the first request hasn't
 *                    resolved yet, or we're between ticks waiting on a
 *                    prior "pending" response
 *  - "processing" -> a poll request is actively in flight (after the
 *                     first response has already come back "pending")
 *  - "success"    -> confirmed via HTTP poll or socket push
 *  - "failed"     -> confirmed via HTTP poll or socket push, or a request errored
 *  - "timeout"    -> max attempts reached without a terminal result
 *
 * @param {object} params
 * @param {string} params.paymentId
 * @param {string} [params.transactionId]
 * @param {(paymentId: string, transactionId?: string) => Promise<{status:string}>} params.checkStatusFn
 * @param {number} [params.interval] Base polling frequency, ms
 * @param {number} [params.maxAttempts]
 * @param {(data:any) => void} [params.onSuccess]
 * @param {(data:any) => void} [params.onFailure]
 * @param {() => void} [params.onTimeout]
 * @param {object|null} [params.socketStatus] Latest payload from your socket
 *   provider (e.g. `paymentStatus` from `useCustomContext()`). When it
 *   matches the payment being tracked, it's treated as an immediate,
 *   authoritative result — polling stops right away instead of waiting for
 *   the next tick.
 * @param {() => void} [params.resetSocketStatus] Clears the socket payload
 *   in your provider once consumed, so it doesn't leak into the next
 *   payment cycle (e.g. `resetPaymentStatus` from `useCustomContext()`).
 * @param {(payload:any, ids:{paymentId:string, transactionId?:string}) => boolean} [params.matchSocketStatus]
 *   Override the default id-matching heuristic between socketStatus and
 *   the payment currently being tracked.
 */
export const useStatusPolling = ({
  paymentId,
  transactionId,
  checkStatusFn,
  interval = 3000,
  maxAttempts = 15,
  onSuccess,
  onFailure,
  onTimeout,
  socketStatus = null,
  resetSocketStatus,
  matchSocketStatus = defaultMatchSocketStatus,
}) => {
  const queryClient = useQueryClient();
  const attemptCounterRef = useRef(0);
  const startTimeRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  const queryKey = ["paymentStatus", paymentId];

  // Dev-time guard: don't silently no-op if the consumer forgot checkStatusFn.
  useEffect(() => {
    if (paymentId && typeof checkStatusFn !== "function") {
      // eslint-disable-next-line no-console
      console.error(
        "useStatusPolling: `checkStatusFn` must be a function. Polling is disabled until one is provided.",
      );
    }
  }, [paymentId, checkStatusFn]);

  // 1. Reset metrics whenever a new payment cycle starts, and clean up
  //    (timers + in-flight/scheduled queries + stale socket payload) when
  //    it ends or the component unmounts.
  useEffect(() => {
    if (!paymentId) return undefined;
    attemptCounterRef.current = 0;
    startTimeRef.current = Date.now();
    setElapsed(0);

    elapsedTimerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    return () => {
      clearInterval(elapsedTimerRef.current);
      queryClient.cancelQueries({ queryKey });
      resetSocketStatus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  // 2. Main Query Engine (HTTP polling)
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      attemptCounterRef.current += 1;
      return await checkStatusFn(paymentId, transactionId);
    },
    enabled: !!paymentId && typeof checkStatusFn === "function",

    refetchInterval: (query) => {
      const result = query?.state?.data;

      if (result?.status === "success" || result?.status === "failed") {
        return false;
      }
      if (attemptCounterRef.current >= maxAttempts) {
        return false;
      }
      // Progressively ease off polling frequency on late attempts:
      // 3s -> 4.5s -> 6s
      if (attemptCounterRef.current > 10) return interval * 2;
      if (attemptCounterRef.current > 5) return interval * 1.5;
      return interval;
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  // 3. Socket shortcut: an authoritative real-time push short-circuits
  //    polling by seeding the exact same query cache polling reads from.
  //    This reuses the terminal-state derivation below instead of adding a
  //    second, parallel state machine.
  useEffect(() => {
    if (!paymentId || !socketStatus) return;
    if (!matchSocketStatus(socketStatus, { paymentId, transactionId })) return;

    queryClient.setQueryData(queryKey, socketStatus);
    queryClient.cancelQueries({ queryKey }); // abort any in-flight/slower HTTP poll
    resetSocketStatus?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketStatus, paymentId, transactionId]);

  // 4. Side-Effect Lifecycle Synchronizer
  const currentStatus = data?.status;
  const currentAttempts = attemptCounterRef.current;
  const attemptsExhausted = currentAttempts >= maxAttempts;

  useEffect(() => {
    if (!paymentId || !data) return;

    if (currentStatus === "success") {
      onSuccess?.(data);
    } else if (currentStatus === "failed") {
      onFailure?.(data);
    } else if (attemptsExhausted && currentStatus !== "success" && currentStatus !== "failed") {
      onTimeout?.({ message: "Polling limit reached before confirmation." });
    }
  }, [currentStatus, attemptsExhausted, paymentId, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // 5. Manual Actions
  const manualRetry = () => {
    attemptCounterRef.current = 0;
    startTimeRef.current = Date.now();
    setElapsed(0);
    refetch();
  };

  const cancelPolling = () => {
    queryClient.cancelQueries({ queryKey });
  };

  // 6. State Derivation — terminal states first, then timeout, then
  //    in-flight states, then "waiting between ticks" — falling through to
  //    "idle" only when there's genuinely no active payment to track.
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

  // Stop the elapsed-time clock once we've reached a terminal state.
  useEffect(() => {
    if (TERMINAL_STATUSES.has(computedStatus) && elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
    }
  }, [computedStatus]);

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