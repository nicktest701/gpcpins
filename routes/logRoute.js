const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const moment = require("moment");

const knex = require("../db/knex");
const { verifyToken } = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyScanner = require("../middlewares/verifyScanner");
const { parseDateRange } = require("../config/dateConfigs");

// GET All Logs
router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id, isAdmin } = req.user;
    const { startDate, endDate } = req.query;

    const { start, end, error } = parseDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json("error fetching logs");
    }

    let query = knex("vw_user_logs_view").whereBetween("createdAt", [
      start,
      end,
    ]);

    if (!isAdmin) {
      query.where({ userId: id, is_active: true });
    }

    const logs = await query.orderBy("createdAt", "desc").select("*");

    return res.status(200).json(logs);
  }),
);

//Verifier Logs
router.get(
  "/verifier",
  verifyToken,
  // verifyScanner,
  asyncHandler(async (req, res) => {
    const { id, isAdmin } = req.user;
    const { startDate, endDate } = req.query;

    const { start, end, error } = parseDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json("error fetching logs");
    }

    const verifiers = await knex("vw_users_with_roles")
      .where({
        active: true,
        role: process.env.SCANNER_ID,
      })
      .pluck("id"); // 🔥 only get ids (lighter + faster)

    let query = knex("vw_user_logs_view")
      .whereIn("userId", verifiers)
      .whereBetween("createdAt", [start, end]);

    if (!isAdmin) {
      query.where({ userId: id, is_active: true });
    }

    const logs = await query.orderBy("createdAt", "desc").select("*");

    return res.status(200).json(logs);
  }),
);

// PUT Remove All Selected Logs
router.put(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { isAdmin } = req.user;
    const { logs } = req.body;
    console.log(logs);

    if (isAdmin) {
      await knex("activity_logs").where("id", "IN", logs).del();
    } else {
      await knex("activity_logs").where("id", "IN", logs).update({
        is_active: false,
      });
    }

    return res.sendStatus(204);
  }),
);

router.put(
  "/verifier",
  verifyToken,
  verifyScanner,
  asyncHandler(async (req, res) => {
    const { logs } = req.body;
    console.log(logs);

    await knex("verifier_activity_logs").where("_id", "IN", logs).update({
      isActive: false,
    });
    return res.sendStatus(204);
  }),
);

module.exports = router;
