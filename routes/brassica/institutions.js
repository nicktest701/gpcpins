// src/routes/institutions.js
"use strict";

/**
 * GET /api/institutions
 * Returns the full list of Brassica Pay institution codes.
 * Useful for populating dropdowns in the React frontend.
 */

const express = require("express");
const router = express.Router();

const INSTITUTIONS = [
  // ── Banks ──────────────────────────────────────────────────────────────────
  { code: "300303", name: "Absa Bank Ghana Limited", type: "bank" },
  { code: "300329", name: "Access Bank Ghana Plc", type: "bank" },
  { code: "300307", name: "Agricultural Development Bank of Ghana", type: "bank" },
  { code: "300306", name: "ARB Apex Bank PLC", type: "bank" },
  { code: "300320", name: "Bank of Africa Ghana Limited", type: "bank" },
  { code: "300313", name: "Cal Bank Limited", type: "bank" },
  { code: "300331", name: "Consolidated Bank Ghana Limited", type: "bank" },
  { code: "300312", name: "Ecobank Ghana Limited", type: "bank" },
  { code: "300319", name: "FBN Bank Ghana Limited", type: "bank" },
  { code: "300323", name: "Fidelity Bank Ghana Limited", type: "bank" },
  { code: "300316", name: "First Atlantic Bank Limited", type: "bank" },
  { code: "300334", name: "First National Bank Ghana", type: "bank" },
  { code: "300304", name: "GCB Bank Limited", type: "bank" },
  { code: "300322", name: "Guaranty Trust Bank Ghana Limited", type: "bank" },
  { code: "300305", name: "National Investment Bank Limited", type: "bank" },
  { code: "300324", name: "Omni BSIC Bank Ghana Limited", type: "bank" },
  { code: "300317", name: "Prudential Bank Limited", type: "bank" },
  { code: "300310", name: "Republic Bank Ghana Limited", type: "bank" },
  { code: "300308", name: "Société Générale Ghana Limited", type: "bank" },
  { code: "300318", name: "Stanbic Bank Ghana Limited", type: "bank" },
  { code: "300302", name: "Standard Chartered Bank Ghana Limited", type: "bank" },
  { code: "300325", name: "United Bank for Africa Ghana Limited", type: "bank" },
  { code: "300309", name: "Universal Merchant Bank Limited", type: "bank" },
  { code: "300311", name: "Zenith Bank Ghana Limited", type: "bank" },
  // ── Mobile Money Networks ──────────────────────────────────────────────────
  { code: "300591", name: "MTN Mobile Money", type: "mno" },
  { code: "300592", name: "AirtelTigo Money", type: "mno" },
  { code: "300594", name: "Vodafone Cash", type: "mno" },
];

// GET /api/institutions
router.get("/", (req, res) => {
  const { type } = req.query; // optional filter: ?type=bank | ?type=mno
  const list = type
    ? INSTITUTIONS.filter((i) => i.type === type.toLowerCase())
    : INSTITUTIONS;

  return res.status(200).json({ success: true, data: list });
});

// GET /api/institutions/:code
router.get("/:code", (req, res) => {
  const inst = INSTITUTIONS.find((i) => i.code === req.params.code);
  if (!inst) {
    return res.status(404).json({ success: false, error: { message: "Institution code not found." } });
  }
  return res.status(200).json({ success: true, data: inst });
});

module.exports = router;
