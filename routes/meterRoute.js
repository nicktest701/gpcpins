const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const generateId = require("../config/generateId");

//model

const { isValidUUID2 } = require("../config/validation");

const knex = require("../db/knex");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { verifyToken } = require("../middlewares/verifyToken");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const meterNo = req.query?.meterNo;

    if (meterNo) {
      const meter = await knex("meters")
        .select(
          "id",
          "name",
          "number",
          "type",
          "spn",
          "address",
          "district",
          "geo_code as geoCode",
          "account_number as accountNumber",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .where("number", meterNo)
        .first();

      return res.status(200).json(meter);
    }

    // const meters = await Meter.find({});
    const meters = await knex("meters")
      .select(
        "id",
        "name",
        "number",
        "type",
        "spn",
        "address",
        "district",
        "active",
        "geo_code as geoCode",
        "account_number as accountNumber",
        "created_at as createdAt",
        "updated_at as updatedAt",
        knex.raw("DATE_FORMAT(created_at,'%D %M %Y 🔸 %r') as modifiedAt"),
      )
      .orderBy("created_at", "desc");

    // console.log(meters);

    res.status(200).json(meters);
  }),
);

router.get(
  "/find",
  asyncHandler(async (req, res) => {
    const { number, name } = req.query;

    if (!number) {
      return res.status(400).json("Meter number is required!");
    }

    const meter = {
      number: number,
      name: name || "Test dmin", // Show this to user for confirmation
      address: "94; Okn306; Adaman",
      type: "PREPAID",
    };

    res.status(200).json(meter);
  }),
);

router.get(
  "/all",
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const meters = await knex("meters").select(
      "*",
      "geo_code as geoCode",
      "account_number as accountNumber",
      "created_at as createdAt",
      "updated_at as updatedAt",
    );
    res.status(200).json(meters);
  }),
);

router.get(
  "/meter/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request ID!");
    }

    const meter = await knex("meters")
      .select(
        "id",
        "name",
        "number",
        "type",
        "spn",
        "address",
        "district",
        "geo_code as geoCode",
        "account_number as accountNumber",
        "created_at as createdAt",
        "updated_at as updatedAt",
      )
      .where("number", id)
      .first();

    res.status(200).json(meter);
  }),
);
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request ID!");
    }

    const meter = await knex("meters")
      .select(
        "id",
        "name",
        "number",
        "type",
        "spn",
        "address",
        "district",
        "geo_code as geoCode",
        "account_number as accountNumber",
        "created_at as createdAt",
        "updated_at as updatedAt",
      )
      .where("id", id)
      .first();

    res.status(200).json(meter);
  }),
);
router.get(
  "/user/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request ID!");
    }

    const meters = await knex("meters")
      .select(
        "id",
        "name",
        "number",
        "type",
        "spn",
        "address",
        "district",
        "geo_code as geoCode",
        "account_number as accountNumber",
        "created_at as createdAt",
        "updated_at as updatedAt",
      )
      .where("user_id", id)
      .orderBy("created_at", "desc");

    res.status(200).json(meters);
  }),
);

router.post(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const newMeter = req.body;

    const ifMeterExists = await knex("meters")
      .where({
        number: newMeter?.number,
        user_id: newMeter.user_id,
      })
      .first();

    if (!_.isEmpty(ifMeterExists)) {
      return res.status(404).json("Meter already exist!.");
    }

    const meter = await knex("meters").insert({
      id: generateId(),
      ...newMeter,
    });

    if (_.isEmpty(meter)) {
      return res.status(400).json("Error saving meter information!");
    }

    res.status(201).json("Meter saved!");
  }),
);

router.put(
  "/",
  asyncHandler(async (req, res) => {
    const { id, ...rest } = req.body;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }

    const meter = await knex("meters").where("id", id).update(rest);

    if (meter !== 1) {
      return res.status(404).json("Error updating meter information!");
    }
    res.status(201).json("Meter info updated successfully!!!");
  }),
);

router.delete(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }

    const meter = await knex("meters").where("id", id).del();

    if (meter !== 1) {
      return res.status(404).json("Error removing meter!");
    }
    res.status(200).json("Meter removed!");
  }),
);

module.exports = router;
