// src/middleware/webhookAuth.js
"use strict";

/**
 * Webhook signature verification.
 *
 * Brassica Pay does not currently document an HMAC signature scheme, so this
 * middleware uses a shared-secret header check as the first line of defence.
 * When Brassica adds a signature mechanism, replace the comparison below.
 *
 * The webhook secret is configured via WEBHOOK_SECRET in your .env file.
 * Brassica Pay support can whitelist your callback IP for additional security.
 */
function webhookAuth(req, res, next) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return next(); // Skip if not configured (dev only)

  const incomingSecret = req.headers["x-brassica-secret"] || req.headers["x-webhook-secret"];

  if (!incomingSecret || incomingSecret !== secret) {
    return res.status(403).json({ success: false, error: { message: "Forbidden: invalid webhook secret." } });
  }

  next();
}

module.exports = webhookAuth;
