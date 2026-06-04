// src/routes/webhook.js
"use strict";

/**
 * Webhook / Callback Receiver
 *
 * POST /api/webhook/transaction
 *   Brassica Pay POSTs the final SUCCESSFUL/FAILED status here.
 *   We acknowledge immediately (required by Brassica) then handle
 *   the event asynchronously.
 *
 * In production, replace the in-memory event handler below with
 * your actual persistence layer (DB update, queue message, push
 * notification, etc.).
 */

const express = require("express");
const webhookAuth = require("../middleware/webhookAuth");
const logger = require("../utils/logger");

const router = express.Router();

// ─── POST /api/webhook/transaction ───────────────────────────────────────────
router.post("/transaction", webhookAuth, (req, res) => {
  const payload = req.body;

  // Acknowledge immediately — Brassica expects this JSON back
  res.status(200).json({
    status: "OK",
    message: "Received successfully.",
  });

  // ── Process asynchronously (after ack) ────────────────────────────────────
  setImmediate(() => {
    try {
      const { statusCode, status, transactionId, extralTransactionId, institutionApprovalCode } = payload;

      logger.info(
        `[Webhook] txId=${transactionId} brassicaTxId=${extralTransactionId} ` +
        `status=${status}(${statusCode}) approvalCode=${institutionApprovalCode}`
      );

      // ── TODO: Replace with your business logic ─────────────────────────────
      // Examples:
      //   await db.transactions.updateOne({ transactionId }, { status, statusCode, institutionApprovalCode });
      //   await notifyUser(transactionId, status);
      //   await publishToQueue("transaction.completed", payload);
      // ──────────────────────────────────────────────────────────────────────

      if (status === "SUCCESSFUL" || statusCode === "200") {
        // Handle success
        logger.info(`[Webhook] Transaction ${transactionId} SUCCEEDED.`);
      } else if (status === "FAILED" || ["424", "412", "300"].includes(String(statusCode))) {
        // Handle failure — do NOT retry 424; it is terminal
        logger.warn(`[Webhook] Transaction ${transactionId} FAILED (code=${statusCode}).`);
      } else {
        logger.info(`[Webhook] Transaction ${transactionId} status=${status} — no action taken.`);
      }
    } catch (err) {
      logger.error("[Webhook] Error processing callback payload:", err);
    }
  });
});

module.exports = router;
