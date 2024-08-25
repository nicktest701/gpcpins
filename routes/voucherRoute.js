const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const moment = require("moment");

const generateId = require("../config/generateId");
const findDuplicates = require("../config/findDuplicates");
//model

const { verifyToken } = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { isValidUUID2 } = require("../config/validation");

const knex = require("../db/knex");

const ALLOWED_CATEGORIES = [
  "waec",
  "stadium",
  "university",
  "cinema",
  "security",
  "bus",
];

router.get(
  "/category",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { type, id } = req.query;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    if (!ALLOWED_CATEGORIES.includes(type)) {
      return res.status(400).json("Unknown Category");
    }

    if (id && type) {
      const vouchers = await knex("vouchers")
        .orderBy("createdAt", "desc")
        .join("categories", "vouchers.category", "categories._id")
        .where("vouchers.category", id)
        .select(
          "vouchers.*",
          "categories.voucherType as voucher",
          "categories.category as category"
        );

      const modifiedVouchers = vouchers.map(({ details, ...rest }) => {
        return {
          ...rest,
          details: JSON.parse(details),
        };
      });

      return res.status(200).json(modifiedVouchers);
    }

    return res.status(200).json([]);
  })
);

router.get(
  "/details",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.query;
    const isTicket = ["cinema", "stadium", "bus"];

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const vouchers = await knex("vouchers")
      .join("categories", "vouchers.category", "categories._id")
      .where("vouchers.category", id)
      .select(
        "vouchers.status",
        "vouchers.createdAt",
        "categories.category as category"
      );

    if (_.isEmpty(vouchers)) {
      return res.status(200).json({
        total: 0,
        new: 0,
        sold: 0,
        used: 0,
        expired: 0,
      });
    }

    const groupedStatus = _.groupBy(vouchers, "status");

    let expired = 0;
    if (isTicket.includes(vouchers[0]?.category)) {
      expired = vouchers?.filter(
        (voucher) =>
          voucher?.status === "new" &&
          moment().isAfter(moment(voucher?.createdAt))
      );
    }

    res.status(200).json({
      total: vouchers?.length,
      new: groupedStatus?.new?.length ?? 0,
      sold: groupedStatus?.sold?.length ?? 0,
      used: groupedStatus?.used?.length ?? 0,
      expired: expired?.length ?? 0,
    });
  })
);
router.get(
  "/tickets",
  // verifyToken,
  // verifyScanner,
  asyncHandler(async (req, res) => {
    const { id } = req.query;


    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }
    const category = await knex("categories").where('_id', id).select("details")
    const details = JSON.parse(category[0]?.details)
    const pricingTypes = details?.pricing

    const vouchers = await knex("vouchers")
      .join("categories", "vouchers.category", "categories._id")
      .where("vouchers.category", id)
      .select(
        "vouchers.type",
        "vouchers.status",
        "vouchers.createdAt",
        "categories.category as category",
        "categories.details as details"
      );

    if (_.isEmpty(vouchers)) {
      return res.status(200).json({
        total: 0,
        new: 0,
        sold: 0,
        used: 0,
        pricingTypes: _.map(pricingTypes, 'type'),
        ticketTypes: {},
        recent: [],
        verifiers: []
      });
    }
    //Vew Vouchers
    const newVouchers = vouchers?.filter(voucher => voucher?.status === "new")?.length
    // Recently Scanned Vouchers 
    const scannedVouchers = await knex("scanned_tickets_vouchers_view")
      .select("createdAt", 'voucherType', 'type', 'verifierName')
      .where({ categoryId: id })
      .limit(5)
      .orderBy("createdAt", "desc");
    // console.log(scannedVouchers)

    //Assigned Verifiers
    const assignedVerifiers = await knex("tickets_view").select("verifierId", "verifierName", 'type')
      .where({ categoryId: id })
      .orderBy("createdAt", "desc");

    const modifiedVerifiers = assignedVerifiers.map(verifier => {
      return {
        verifierId: verifier?.verifierId,
        verifierName: verifier.verifierName,
        type: _.map(JSON.parse(verifier.type), 'type')
      }
    })

    //Get last seven days scanned data
    // const sevenDays = getLastSevenDaysTransactionsArray(scannedVouchers)
    // console.log(sevenDays)





    //GET ALL TICKET TYPES
    const ticketTypes = pricingTypes?.map(({ type }) => {
      const sold = vouchers?.filter(voucher => voucher?.status === "sold" && voucher?.type === type)?.length
      const used = vouchers?.filter(voucher => voucher?.status === "used" && voucher?.type === type)?.length
      return {
        type,
        sold,
        used
      }
    })


    const ticketPricingTypes = {
      labels: _.map(ticketTypes, 'type'),
      datasets: [
        {
          label: 'Sold/Unscanned', data: _.map(ticketTypes, 'sold'),
          backgroundColor: '#031523',
        },
        {
          label: 'Used/Scanned', data: _.map(ticketTypes, 'used'),
          backgroundColor: '#f78e2a',

        }
      ]
    }
    const groupedStatus = _.groupBy(vouchers, "status");

    // console.log(pricingTypes)
    res.status(200).json({
      total: vouchers?.length ?? 0,
      new: newVouchers ?? 0,
      sold: groupedStatus?.sold?.length ?? 0,
      used: groupedStatus?.used?.length ?? 0,
      pricingTypes: _.map(pricingTypes, 'type'),
      ticketTypes: ticketPricingTypes,
      recent: scannedVouchers,
      verifiers: modifiedVerifiers
    });
  })
);

router.get(
  "/available",
  // verifyToken,
  asyncHandler(async (req, res) => {
    const { id, type } = req.query;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    let count;
    if (!_.isNull(type)) {
      count = await knex("vouchers")
        .count("_id as total")
        .where({
          category: id,
          type,
          status: "new",
          active: 1,
        })
        .first();
    } else {
      count = await knex("vouchers")
        .count("_id as total")
        .where({
          category: id,
          status: "new",
          active: 1,
        })
        .first();
    }

    const totalCount = count.total;

    res.status(200).json(totalCount);
  })
);
router.get(
  "/available/tickets",
  // verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.query

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid Request Token!");
    }

    const ticketTypes = await knex("vouchers")
      .select("_id", 'type')
      .where({
        category: id,
        status: "new",
        active: 1,
      })

    const groupTickets = _.countBy(ticketTypes, 'type');

    res.status(200).json(groupTickets);
  })
);

router.get(
  "/count",
  asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const count = await knex("vouchers")
      .count("_id as total")
      .where("category", id)
      .first();
    const totalCount = count.total;

    res.status(200).json(totalCount);
  })
);

router.get(
  "/bus/available/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    if (!isValidUUID2(id)) {
      return res.status(400).json("Invalid ID!");
    }

    const vouchers = await knex("vouchers").select("details", "active").where({
      category: id,
      active: true,
    });

    const modifiedVouchers = vouchers.map(({ details, active }) => {
      return {
        seatNo: JSON.parse(details)?.seatNo,
        active,
      };
    });

    res.status(200).json(_.orderBy(modifiedVouchers, "seatNo", "asc"));
  })
);

router.post(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const newVouchers = req.body;

    if (_.isEmpty(newVouchers)) {
      return res.status(400).json("Invalid Input Request!");
    }

    const modifiedVouchers = newVouchers.map((voucher) => {
      return {
        _id: generateId(),
        category: voucher?.category,
        type: voucher?.type,
        serial: voucher?.serial,
        pin: voucher?.pin,
        details: JSON.stringify(voucher?.details),
      };
    });

    const savedVoucher = await knex("vouchers").select("pin", "serial").where({
      category: modifiedVouchers[0]?.category,
    });

    if (!_.isEmpty(savedVoucher)) {
      const arr1 = modifiedVouchers.map(({ pin, serial }) => {
        return {
          pin,
          serial,
        };
      });
      const arr2 = savedVoucher.map(({ pin, serial }) => {
        return {
          pin,
          serial,
        };
      });
      const duplicates = findDuplicates(arr1, arr2);

      if (!_.isEmpty(duplicates)) {
        return res
          .status(400)
          .json("Error! Matching Pins and Serials already loaded.");
      }
    }

    const vouchers = await knex("vouchers").insert(modifiedVouchers);
    // const vouchers = await Voucher.insertMany(modifiedVouchers);

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Loaded serials and pins.",
      severity: "info",
    });

    if (!vouchers) {
      res.status(400).json("Error saving pins!");
    }

    res.status(200).json("Pins and Serials Saved!");
  })
);

router.put(
  "/remove",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;

    if (_.isEmpty(req.body)) {
      return res.status(400).json("Invalid Input Request!");
    }

    const { id } = req.body;

    const deletedVouchers = await knex("vouchers").whereIn("_id", id).del();

    if (!deletedVouchers >= 1) {
      return res.status(404).json("Error removing vouchers!");
    }

    //logs
    await knex("activity_logs").insert({
      employee_id: _id,
      title: "Deleted multiple serials and pins.",
      severity: "error",
    });

    res.status(200).json("Vouchers removed!");
  })
);

module.exports = router;
