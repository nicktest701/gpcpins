const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const generateId = require("../config/generateId");

//model
const verifyAdmin = require("../middlewares/verifyAdmin");
const { verifyToken } = require("../middlewares/verifyToken");
const { rateLimit } = require("express-rate-limit");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 requests per windowMs
  ticket: "Too many requests!. please try again later.",
});

const knex = require("../db/knex");


router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { verifier, category } = req.query
    let tickets = [];

    if (verifier) {
      tickets = await knex("tickets_view")
        .select("*")
        .where("verifierId", verifier)
        .orderBy("createdAt", "desc");


    } else if (category) {
      tickets = await knex("tickets_view")
        .select("*")
        .where("categoryId", category)
        .orderBy("createdAt", "desc");

    } else {

      tickets = await knex("tickets_view")
        .select("*")
        .orderBy("createdAt", "desc");

    }

    if (_.isEmpty(tickets)) {
      return res.status(200).json([])
    }
    const modifiedTickets = tickets.map(({ type, ...rest }) => {
      return {
        ...rest,
        type: JSON.parse(type)
      }
    })

    res.status(200).json(modifiedTickets);
  })
);


router.get(
  "/scanned_tickets",
  asyncHandler(async (req, res) => {

    let tickets = [];


    tickets = await knex("scanned_tickets")
      .select("*")
      .orderBy("createdAt", "desc");



    if (_.isEmpty(tickets)) {
      return res.status(200).json([])
    }
    const modifiedTickets = tickets.map(({ type, ...rest }) => {
      return {
        ...rest,
        type: JSON.parse(type)
      }
    })

    res.status(200).json(modifiedTickets);
  })
);















router.get(
  "/:id",

  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ticket = await knex("tickets_view")
      .select("*")
      .where("_id", id)
      .limit(1);

    if (_.isEmpty(ticket)) res.status(200).json({});

    const { type, ...rest } = ticket[0]
    const modifiedTicket = {
      ...rest,
      type: JSON.parse(type)
    }

    res.status(200).json(modifiedTicket);
  })
);


router.get(
  "/:id/recent",

  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const scannedTickets = await knex("scanned_tickets_vouchers_view")
      .select("createdAt", 'voucherType', 'type', 'verifierName')
      .where({ caetgoryId: id })
      .limit(5)
      .orderBy("createdAt", "desc");


    if (_.isEmpty(scannedTickets)) {
      return res.status(200).json({
        total: 0,
        scanned: _.repeat('0', ticketTypes?.length),
      })
    }

    res.status(200).json(modifiedTicket);
  })
);

router.get(
  "/:id/scanned_tickets",
  asyncHandler(async (req, res) => {
    const { id } = req.params

    let tickets = [];

    const ticket = await knex("tickets")
      .select("type")
      .where({ _id: id }).limit(1)

    if (_.isEmpty(ticket)) {
      return res.status(200).json({
        total: 0,
        scanned: [],
      })
    }

    const ticketTypes = JSON.parse(ticket[0].type)



    const scannedTickets = await knex("scanned_tickets_vouchers_view")
      .select("*")
      .where({ ticketId: id })
      .orderBy("createdAt", "desc");


    if (_.isEmpty(scannedTickets)) {
      return res.status(200).json({
        total: 0,
        scanned: _.repeat('0', ticketTypes?.length),
      })
    }


    const groupedTickets = ticketTypes.map(ticket => {
      return {
        value: scannedTickets.filter(scannedTicket => scannedTicket?.type === ticket?.type).length

      }
    })

    const data = _.map(groupedTickets, "value")



    res.status(200).json({
      total: scannedTickets?.length,
      scanned: data
    });
  })
);











router.post(
  "/",
  // limit,
  asyncHandler(async (req, res) => {
    const newTicket = req.body;
    console.log(newTicket?.category,
      newTicket?.verifier)
    const isTicketExisting = await knex("tickets")
      .select("_id", 'verifier', 'category')
      .where({
        category: newTicket?.category,
        verifier: newTicket?.verifier,
      })
      .limit(1);



    if (!_.isEmpty(isTicketExisting)) {
      return res.status(404).json("Ticket already assigned to verifier.");
    }

    const ticket = await knex("tickets").insert({
      _id: generateId(),
      ...newTicket,
    });

    if (_.isEmpty(ticket)) {
      return res.status(404).json("Failed! An unknown error has occurred.");
    }



    res.status(201).json("Completed!");
  })
);








module.exports = router;
