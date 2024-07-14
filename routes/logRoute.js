const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const moment = require("moment");



const { verifyToken } = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");


// GET All Logs
router.get(
    "/logs",
    verifyToken,
    verifyAdmin,
    asyncHandler(async (req, res) => {
        const { id, isAdmin } = req.user;
        const { startDate, endDate } = req.query;

        const sDate = moment(startDate).format("YYYY-MM-DD");
        const eDate = moment(endDate).format("YYYY-MM-DD");

        let logs = [];

        if (isAdmin) {
            logs = await knex.raw(
                `SELECT *
            FROM (
                SELECT *,DATE(createdAt) AS created_date
                FROM activity_logs_view
            ) AS activity_logs_view_ WHERE created_date BETWEEN ? AND ? ORDER BY createdAt DESC;`,
                [sDate, eDate]
            );
        } else {
            logs = await knex.raw(
                `SELECT *
            FROM (
                SELECT *,DATE(createdAt) AS created_date
                FROM activity_logs_view
            ) AS activity_logs_view_  WHERE employeeId=? AND isActive=1 AND created_date BETWEEN ? AND ? ORDER BY createdAt DESC;`,
                [id, sDate, eDate]
            );
        }

        return res.status(200).json(logs[0]);
    })
);



//Verifier Logs
router.get(
    "/verifier",
    verifyToken,
    // verifyAdmin,
    asyncHandler(async (req, res) => {
        const { id, isAdmin } = req.user;
        const { startDate, endDate } = req.query;

        const sDate = moment(startDate).format("YYYY-MM-DD");
        const eDate = moment(endDate).format("YYYY-MM-DD");

        let logs = [];

        if (isAdmin) {
            logs = await knex.raw(
                `SELECT *
            FROM (
                SELECT *,DATE(createdAt) AS created_date
                FROM verifier_activity_logs_view
            ) AS verifier_activity_logs_view_ WHERE created_date BETWEEN ? AND ? ORDER BY createdAt DESC;`,
                [sDate, eDate]
            );
        } else {
            logs = await knex.raw(
                `SELECT *
            FROM (
                SELECT *,DATE(createdAt) AS created_date
                FROM verifier_activity_logs_view
            ) AS verifier_activity_logs_view_  WHERE verifierId=? AND isActive=1 AND created_date BETWEEN ? AND ? ORDER BY createdAt DESC;`,
                [id, sDate, eDate]
            );
        }

        return res.status(200).json(logs[0]);
    })
);


router.put(
    "/logs",
    verifyToken,
    verifyAdmin,
    asyncHandler(async (req, res) => {
        const { id, isAdmin } = req.user;
        const { logs } = req.body;


        await knex('activity_logs').where("_id", "IN", logs).update({
            isActive: false
        });
        return res.sendStatus(204);

    })
);















module.exports = router;