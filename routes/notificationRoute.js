const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const { randomUUID } = require("crypto");
const moment = require("moment");
const knex = require("../db/knex");
const { isValidUUID2 } = require("../config/validation");
const { verifyToken } = require("../middlewares/verifyToken");
const verifyAgent = require("../middlewares/verifyAgent");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id, createdAt: modifiedAt } = req.user;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }
    const allNotifications = await knex("notifications").select("*");
    const broadcastMessages = await knex("broadcast_messages")
      .where("recipient", "Employees")
      .select("*");

    const recentNotifications = [
      ...broadcastMessages,
      ...allNotifications,
    ].filter(({ createdAt }) => {
      return moment(createdAt).isSameOrAfter(moment(modifiedAt));
    });

    const notifications = _.orderBy(recentNotifications, "createdAt", "desc");

    res.status(200).json(notifications);
  })
);

router.get(
  "/user",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id, createdAt: modifiedAt } = req.user;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }
    const broadcastMessages = await knex("broadcast_messages")
      .where("recipient", "Customers")
      .select("*");

    const userNotifications = await knex("user_notifications")
      .select("*")
      .where("user_id", id);

    const recentNotifications = [
      ...broadcastMessages,
      ...userNotifications,
    ].filter(({ createdAt }) =>
      moment(createdAt).isSameOrAfter(moment(modifiedAt))
    );

    const notifications = _.orderBy(recentNotifications, "createdAt", "desc");

    res.status(200).json(notifications);
  })
);

router.get(
  "/agent",
  verifyToken,
  verifyAgent,
  asyncHandler(async (req, res) => {
    const { id, createdAt: modifiedAt } = req.user;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }
    const broadcastMessages = await knex("broadcast_messages")
      .where("recipient", "Customers")
      .select("*");

    const agentNotifications = await knex("agent_notifications")
      .select("*")
      .where("agent_id", id);

    const recentNotifications = [
      ...broadcastMessages,
      ...agentNotifications,
    ].filter(({ createdAt }) =>
      moment(createdAt).isSameOrAfter(moment(modifiedAt))
    );

    const notifications = _.orderBy(recentNotifications, "createdAt", "desc");
    res.status(200).json(notifications);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }

    const notification = await knex("notifications")
      .select("*")
      .where("_id", id)
      .limit(1);

    res.status(200).json(notification[0]);
  })
);


router.post(
  "/",
  asyncHandler(async (req, res) => {
    const newNotification = req.body;
    const notification = await knex("notifications").insert({
      _id: randomUUID(),
      ...newNotification,
    });

    if (_.isEmpty(notification)) {
      return res.status(404).json("Error saving notification!");
    }
    res.status(201).json("Notification  saved!");
  })
);

router.put(
  "/",
  asyncHandler(async (req, res) => {
    const { ids } = req.query;

    const notifications = await knex("notifications")
      .where("_id", "IN", ids)
      .update({ active: false });

    if (notifications !== 1) {
      return res.status(404).json("Error updating notification!");
    }
    res.status(201).json("Changes Saved!");
  })
);

router.delete(
  "/",
  asyncHandler(async (req, res) => {
    const { id, all } = req.query;

    let notification;
    if (all) {
      notification = await knex("notifications").where("_id", "IN", id).del();
    } else {
      notification = await knex("notifications").where("_id", id).del();
    }
    if (!notification) {
      return res.status(404).json("Error removing notification!");
    }
    res.status(200).json("Notification removed!");
  })
);

module.exports = router;
