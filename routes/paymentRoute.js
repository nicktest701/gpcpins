const router = require("express").Router();
const { randomBytes } = require("crypto");
const pLimit = require("p-limit");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const _ = require("lodash");
const moment = require("moment");
const { rateLimit } = require("express-rate-limit");
const processVouchers = require("../config/processVouchers");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
//functons
const {
  sendMoney,
  topUpStatus,
  accountBalance,
  getBundleList,
  sendBundle,
  sendAirtime,
  POS_Balance,
  PREPAID_Balance,
} = require("../config/sendMoney");
const sendEMail = require("../config/sendEmail");
const { sendTicketMail, resendReceiptMail } = require("../config/mail");
const { sendSMS } = require("../config/sms");
const generateQRCode = require("../config/qrcode");
const currencyFormatter = require("../config/currencyFormatter");
const sendElectricityMail = require("../config/ecgMail");
const verifyAdmin = require("../middlewares/verifyAdmin");
const {
  uploadVoucherFile,
  uploadReceiptFile,
} = require("../config/uploadFile");

const { isValidUUID2 } = require("../config/validation");
const knex = require("../db/knex");
const { verifyToken } = require("../middlewares/verifyToken");
const { mailTextShell } = require("../config/mailText");
const { MTN, VODAFONE, AIRTELTIGO } = require("../config/bundleList");
const generateId = require("../config/generateId");
const { safeJSON } = require("../config/helpers");

// ===============================
// 1. Configuration & Constants
// ===============================
const NETWORK_MAP = {
  "mtn-gh": 4,
  "vodafone-gh": 6,
  "tigo-gh": 1,
  // add others as needed
};

const SUCCESS_CODES = ["00", "09"]; // from external APIs
const ALLOWED_TYPES = ["voucher", "ticket", "prepaid", "airtime", "bundle"];

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./receipts/");
  },
  filename: function (req, file, cb) {
    const ext = file?.mimetype?.split("/")[1];

    cb(null, `${req.body?.id}-prepaid.${ext}`);
  },
});

const Upload = multer({ storage: Storage });

const corsOptions = {
  methods: "POST",
  origin: process.env.CLIENT_URL,
};

const ALLOWED_CATEGORIES = [
  "waec",
  "stadium",
  "university",
  "cinema",
  "security",
  "bus",
];

const rlimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per windowMs
  message: "Too many requests! Please try again later.",
});

const limit = pLimit(3);

router.get(
  "/vouchers",
  verifyToken,
  rlimit,
  asyncHandler(async (req, res) => {
    const { id: userID } = req.user;
    const { id: queryId } = req?.query;

    if (!queryId || !isValidUUID2(queryId)) {
      return res.status(400).json("Invalid Request!");
    }

    //let

    const trans = await knex("payments")
      .join(
        "voucher_transactions",
        "voucher_transactions.payment_id",
        "=",
        "payments.id",
      )
      .where("voucher_transactions.id", queryId)
      .select(
        "payments.id as paymentId",
        "payments.service",
        "payments.provider",
        "payments.partner",
        "payments.amount",
        "payments.status",
        "payments.created_at as createdAt",
        "payments.updated_at as updatedAt",
        "payments.is_processed",
        "payments.mode",
        "voucher_transactions.*",
        "voucher_transactions.id as id",
      )
      .first();

    if (_.isEmpty(trans)) {
      return res.status(404).json("Invalid request.Try again later");
    }

    let {
      paymentId,
      id,
      info,
      email,
      phonenumber,
      vouchers,
      status,
      createdAt,
      updatedAt,
    } = trans;

    if (["pending", "failed"].includes(status)) {
      return res.status(404).json("Payment not completed!");
    }

    const userInfo = JSON.parse(info);
    const userVoucher = JSON.parse(vouchers);

    //Check if voucher pdf already exists
    if (userInfo?.downloadLink) {
      if (email) {
        await sendTicketMail(id, email, "GPC Tickets");
      }

      return res.status(200).json({ id, downloadLink: userInfo?.downloadLink });
    }

    if (userVoucher?.length <= 0) {
      return res.status(404).json("Payment not completed!");
    }

    const soldVouchers = await knex("vouchers")
      .join("categories", "vouchers.category_id", "=", "categories.id")
      .whereIn("vouchers.id", userVoucher)
      .select(
        "vouchers.id as id",
        "vouchers.pin as pin",
        "vouchers.serial as serial",
        "categories.id as categoryId",
        "categories.name as voucherType",
        "categories.price as price",
        "categories.details as details",
      );

    //if creating new transaction fails
    if (_.isEmpty(soldVouchers)) {
      return res.status(404).json("Error Processing your request!!!");
    }

    const modifiedVoucher = soldVouchers.map(
      ({ voucherType, price, details, serial, pin, id }) => {
        const detailsInfo = JSON.parse(details);
        return {
          id,
          voucherType: voucherType,
          formType: detailsInfo?.formType || "",
          price: currencyFormatter(
            userInfo?.category === "waec" ? detailsInfo?.price : price,
          ),
          serial,
          pin,
          status: "sold",
          agentName: userInfo?.agentName || "GPC Customer",
          agentPhoneNumber: phonenumber,
          agentEmail: email,
          dataURL: detailsInfo?.voucherURL,
          logo: detailsInfo?.logo,
        };
      },
    );

    const generatedTransaction = {
      info: userInfo,
      id,
      createdAt,
      updatedAt,
      formattedDate: moment(createdAt).format("Do MMMM YYYY,h:mm a"),
      vouchers: modifiedVoucher,
      status,
    };

    try {
      const result = await processVouchers(generatedTransaction);

      if (result === "done") {
        const downloadLink = await uploadVoucherFile(`${id}.pdf`);

        await knex("voucher_transactions")
          .where("id", id)
          .update({
            info: JSON.stringify({
              ...userInfo,
              downloadLink,
            }),
          });
        await knex("payments").where("id", paymentId).update({
          status: "completed",
          is_processed: true,
        });
        await knex("notifications").insert({
          id: generateId(),
          user_id: userID,
          type: "voucher",
          title: modifiedVoucher[0].voucherType + " Voucher",
          body: `Voucher Processing completed!`,
          link: downloadLink,
        });

        res.status(200).json({ id: id, downloadLink });

        if (email) {
          setImmediate(async () => {
            await sendTicketMail(id, email, modifiedVoucher[0]?.voucherType);
          });
        }

        // await sendWhatsappMessage({
        //   user: getInternationalMobileFormat(userInfo?.agentPhoneNumber),
        //   message: "Thank you for your purchase!",
        //   media: downloadLink,
        // });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json("Error processing your vouchers!");
    }
  }),
);

router.get(
  "/tickets",
  rlimit,
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id: userID } = req.user;

    const { id: queryId } = req?.query;

    if (!queryId || !isValidUUID2(queryId)) {
      return res.status(400).json("Invalid Request!");
    }

    const trans = await knex("payments")
      .join(
        "voucher_transactions",
        "voucher_transactions.payment_id",
        "=",
        "payments.id",
      )
      .where("voucher_transactions.id", queryId)
      .select(
        "payments.id as paymentId",
        "payments.service",
        "payments.provider",
        "payments.partner",
        "payments.amount",
        "payments.status",
        "payments.created_at as createdAt",
        "payments.updated_at as updatedAt",
        "payments.is_processed",
        "payments.mode",
        "voucher_transactions.*",
        "voucher_transactions.id as id",
      )
      .first();

    if (_.isEmpty(trans)) {
      return res.status(404).json("Invalid request.Try again later");
    }

    const {
      paymentId,
      id,
      info,
      email,
      phonenumber,
      vouchers,
      status,
      createdAt,
      updatedAt,
    } = trans;

    if (["pending", "failed"].includes(status)) {
      return res.status(404).json("Payment not completed.!");
    }

    const userInfo = JSON.parse(info);
    const userVoucher = JSON.parse(vouchers);

    //Check if voucher pdf already exists
    if (userInfo?.downloadLink) {
      if (email) {
        await sendTicketMail(id, email, "GPC Tickets");
      }

      return res.status(200).json({ id, downloadLink: userInfo?.downloadLink });
    }

    if (userVoucher?.length <= 0) {
      return res.status(404).json("Payment not completed!");
    }

    const { categoryType, categoryId, paymentDetails } = userInfo;

    let tickets = [];
    let soldVouchers = [];

    if (["stadium", "cinema"].includes(categoryType)) {
      const vouchers = await Promise.all(
        paymentDetails.tickets.flatMap(async (ticket) => {
          return await knex("vouchers")
            .join("categories", "vouchers.category_id", "=", "categories.id")
            .whereIn("vouchers.id", userVoucher)
            .andWhere("vouchers.type", ticket?.type)
            .select(
              "vouchers.id as id",
              "vouchers.pin as pin",
              "vouchers.serial as serial",
              "vouchers.type as type",
              "categories.id as categoryId",
              "categories.name as voucherType",
              "categories.price as price",
              "categories.details as details",
              "categories.year as year",
            )
            .limit(ticket?.quantity);
        }),
      );

      soldVouchers = _.flatMap(vouchers);
    }
    //Check if tickets are bus
    if (["bus"].includes(categoryType)) {
      soldVouchers = await knex("vouchers")
        .join("categories", "vouchers.category_id", "=", "categories.id")
        .whereIn("vouchers.type", paymentDetails?.tickets)
        .andWhere({
          "vouchers.category_id": categoryId,
        })
        .select(
          "vouchers.id as id",
          "vouchers.pin as pin",
          "vouchers.serial as serial",
          "vouchers.type as type",
          "categories.id as categoryId",
          "categories.name as voucherType",
          "categories.price as price",
          "categories.details as details",
          "categories.year as year",
        );
    }

    if (["stadium", "cinema"].includes(categoryType)) {
      const generatedTickets = _.map(
        soldVouchers,
        async ({
          id,
          voucherType,
          pin,
          serial,
          type: vType,
          details,
          year,
        }) => {
          const detailsInfo = JSON.parse(details);

          const item = _.find(
            detailsInfo?.pricing,
            (item) => item.type === vType,
          );

          const code = await generateQRCode(id, id);

          if (categoryType === "cinema") {
            return {
              id,
              category: "cinema",
              movie: voucherType || detailsInfo?.movie,
              theatre: detailsInfo?.theatre,
              location: detailsInfo?.location,
              price: currencyFormatter(item?.price),
              date: moment(new Date(detailsInfo?.date)).format("dddd,LL"),
              time: moment(new Date(detailsInfo?.time)).format("hh:mm a"),
              message: detailsInfo?.message,
              year: year,
              type: vType || detailsInfo?.type,
              serial: serial || pin,
              qrCode: code,
              poster: detailsInfo?.cinema,
              companyName: detailsInfo?.companyName || "Gab Powerful Consult",
              status: "sold",
            };
          } else {
            return {
              id,
              category: "stadium",
              match:
                voucherType ||
                `${detailsInfo?.home} Vs ${detailsInfo?.away}(${detailsInfo?.matchType})`,
              home: detailsInfo?.home,
              away: detailsInfo?.away,
              matchType: detailsInfo?.matchType,
              venue: detailsInfo?.venue,
              price: currencyFormatter(item?.price),
              date: moment(new Date(detailsInfo?.date)).format("dddd,LL"),
              time: moment(new Date(detailsInfo?.time)).format("hh:mm a"),
              message: detailsInfo?.message,
              year: year,
              type: vType || detailsInfo?.type,
              serial: serial || pin,
              qrCode: code,
              status: "sold",
              homeImage: detailsInfo?.homeImage,
              awayImage: detailsInfo?.awayImage,
              companyName: detailsInfo?.companyName || "Gab Powerful Consult",
            };
          }
        },
      );
      tickets = await Promise.all(generatedTickets);
    }

    if (categoryType === "bus") {
      const generatedTickets = _.map(
        soldVouchers,
        async ({
          id,
          voucherType,
          price,
          pin,
          serial,
          type,
          details,
          year,
        }) => {
          const detailsInfo = JSON.parse(details);

          const code = await generateQRCode(id, id);
          return {
            id,
            category: "bus",
            route: voucherType,
            origin: detailsInfo?.origin,
            destination: detailsInfo?.destination,
            vehicleNo: detailsInfo?.vehicleNo,
            seatNo: type || detailsInfo?.seatNo,
            price: currencyFormatter(price),
            logo: detailsInfo?.logo,
            arrivalTime: moment(new Date(detailsInfo?.report)).format(
              "hh:mm a",
            ),
            departureDate: moment(new Date(detailsInfo?.date)).format(
              "dddd,LL",
            ),
            departureTime: moment(new Date(detailsInfo?.time)).format(
              "hh:mm a",
            ),
            serial: serial || pin,
            qrCode: code,
            year: year,
            status: "sold",
            companyName: detailsInfo?.companyName || "Gab Powerful Consult",
          };
        },
      );

      tickets = await Promise.all(generatedTickets);
    }

    const generatedTransaction = {
      info: userInfo,
      id,
      phonenumber,
      email,
      createdAt,
      updatedAt,
      formattedDate: moment(createdAt).format("Do MMMM YYYY,h:mm a"),
      vouchers: tickets,
    };

    try {
      const result = await processVouchers(generatedTransaction);

      if (result === "done") {
        const downloadLink = await uploadVoucherFile(`${id}.pdf`);

        await knex("voucher_transactions")
          .where("id", id)
          .update({
            info: JSON.stringify({
              ...userInfo,
              downloadLink,
            }),
          });

        await knex("payments").where("id", paymentId).update({
          status: "completed",
          is_processed: true,
        });

        await knex("notifications").insert({
          id: generateId(),
          user_id: userID,
          type: "ticket",
          title: "ticket",
          body: "Tickets have been generated successfully!",
          link: downloadLink,
        });

        res.status(200).json({ id: id, downloadLink, phonenumber, email });

        setImmediate(async () => {
          try {
            if (email) {
              await sendTicketMail(id, email, "GPC Tickets");
            }

            if (phonenumber && downloadLink) {
            }
            await sendSMS(
              `${email} ${phonenumber}
        Download Ticket here: ${downloadLink}`,
              phonenumber,
            );
          } catch (error) {
            console.log(error);
          }
        });

        // await sendWhatsappMessage({
        //   user: getInternationalMobileFormat(userInfo?.agentPhoneNumber),
        //   message: "Thank you for your purchase!",
        //   media: downloadLink,
        // })
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json("Error processing your tickets!");
    }
  }),
);

router.get(
  "/confirm/:id/:categoryType",
  verifyToken,
  asyncHandler(async (req, res) => {
    const trx = await knex.transaction();

    try {
      const { id, categoryType } = req.params;
      const { confirm } = req.query;

      if (!isValidUUID2(id)) {
        return res.status(400).json("Invalid request");
      }

      // ---------------- FETCH TRANSACTION + PAYMENT ----------------

      const transaction = await getTransaction(categoryType, id, trx);

      if (!transaction) {
        await trx.rollback();
        return res.status(404).json("Transaction not found");
      }

      // ---------------- STATE VALIDATION ----------------
      if (transaction.status === "failed") {
        await trx.rollback();
        return res.status(400).json("Payment failed");
      }

      if (transaction.status !== "completed") {
        await trx.rollback();
        return res.status(400).json("Payment not completed");
      }

      // ---------------- IDEMPOTENCY ----------------
      if (transaction.isProcessed && confirm) {
        await trx.commit();
        return res.status(200).json({
          message: "Already processed",
          id: transaction.id,
        });
      }

      const info = transaction.info ? JSON.parse(transaction.info) : {};

      let selectedVouchers = [];

      // ---------------- PROCESS SERVICES ----------------
      if (confirm) {
        // console.log(transaction);

        switch (transaction.service) {
          case "voucher":
          case "ticket":
            selectedVouchers = await processVoucher(trx, transaction);
            break;

          case "bundle":
            await markProcessed(trx, transaction);
            break;

          case "airtime":
            await markProcessed(trx, transaction);
            break;

          case "prepaid":
            await processPrepaid(trx, transaction, info);
            break;
        }
      }

      await trx.commit();

      // ---------------- ASYNC EXTERNAL CALLS ----------------
      if (confirm) {
        triggerAsyncProcessing(transaction, categoryType, selectedVouchers); // 🔥 non-blocking
      }

      return res.status(200).json(formatResponse(transaction, info));
    } catch (error) {
      await trx.rollback();
      console.error(error);
      return res.status(500).json("Transaction failed");
    }
  }),
);

// Cancel Payment @route   GET api/transaction/:id
router.get(
  "/cancel/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const type = req.query.type;

    await knex("payments").where({ id: id }).update({
      status: "failed",
    });

    res.status(200).json("Payment Cancelled!");
  }),
);

router.get(
  "/download/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const filePath = path.join(process.cwd(), "/vouchers/", `${id}.pdf`);

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      return res
        .status(400)
        .json("We couldnt find a transaction which match your transaction id");
    }
  }),
);

// Make Voucher / Ticket Payment @route   POST payment/momo

router.post(
  "/",
  verifyToken,
  rlimit,
  asyncHandler(async (req, res) => {
    const trx = await knex.transaction();

    try {
      const { id: userId, name } = req.user;

      const {
        category,
        service,
        categoryId,
        voucherName,
        totalAmount,
        quantity,
        paymentDetails,
        user,
        isWallet,
        token,
      } = req.body;

      // ---------------- VALIDATION ----------------
      if (!category || !ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json("Invalid category");
      }

      if (!totalAmount || Number(totalAmount) <= 0) {
        return res.status(400).json("Invalid amount");
      }

      // ---------------- GENERATE IDS ----------------
      const paymentId = generateId();
      const transactionId = generateId();
      const reference = randomBytes(24).toString("hex");
      const orderNo = randomBytes(20).toString("hex");

      // ---------------- SELECT VOUCHERS ----------------
      const selectedVouchers = await selectVouchers({
        trx,
        category,
        categoryId,
        quantity,
        paymentDetails,
      });

      if (!selectedVouchers || selectedVouchers.length < quantity) {
        return res.status(404).json("Voucher/Ticket not available");
      }

      // ---------------- CREATE PAYMENT ----------------
      let paymentStatus = "pending";
      let providerResponse = null;

      if (isWallet) {
        // ---- WALLET VALIDATION ----
        const wallet = await trx("wallets").where({ user_id: userId }).first();

        if (!wallet) {
          return res.status(401).json("Wallet not found");
        }

        const isPinValid = await bcrypt.compare(token, wallet.user_key);
        if (!isPinValid) {
          return res.status(401).json("Invalid PIN!");
        }

        if (Number(wallet.amount) < Number(totalAmount)) {
          return res.status(400).json("Insufficient funds");
        }

        // ---- DEDUCT WALLET ----
        await trx("wallets")
          .where({ user_id: userId })
          .decrement("amount", totalAmount);

        await trx("wallet_transactions").insert({
          id: generateId(),
          user_id: userId,
          wallet_id: wallet.id,
          wallet_amount: wallet.amount,
          issuer: name || "GPC Customer",
          type: "debit",
          comment: `${voucherName} ${service} purchase`,
          amount: totalAmount,
          status: "completed",
          reference,
        });

        paymentStatus = "completed";
        providerResponse = { code: "WALLET_SUCCESS" };
      } else {
        // ---- MOBILE MONEY ----
        const paymentPayload = {
          name: user?.name || "GPC Customer",
          phonenumber: user?.phoneNumber,
          email: user?.email,
          amount: Number(totalAmount).toFixed(2),
          provider: user?.provider,
          transaction_reference: reference,
        };

        const response = await sendMoney(paymentPayload, "v");

        providerResponse = response;

        paymentStatus =
          response?.ResponseCode === "0000"
            ? "completed"
            : response?.ResponseCode === "0001"
              ? "pending"
              : "failed";
      }

      // ---------------- INSERT PAYMENT ----------------
      await trx("payments").insert({
        id: paymentId,
        user_id: userId,
        reference,
        service,
        amount: totalAmount,
        year: moment().year(),
        provider: isWallet ? "wallet" : user?.provider,
        mode: isWallet ? "Wallet" : "Mobile Money",
        status: paymentStatus,
        externalTransactionId: null,
        partner: JSON.stringify(providerResponse),
      });

      const sVouchers = selectedVouchers.map((v) => v.id);

      // ---------------- INSERT SERVICE TRANSACTION ----------------
      await trx("voucher_transactions").insert({
        id: transactionId,
        payment_id: paymentId,
        email: user?.email || "",
        phonenumber: user?.phoneNumber || "",
        vouchers: JSON.stringify(sVouchers),
        info: JSON.stringify({
          orderNo,
          categoryType: category,
          categoryId,
          quantity,
          amount: totalAmount,
          paymentDetails,
        }),
      });

      // ---------------- UPDATE VOUCHERS ----------------
      await trx("vouchers").whereIn("id", sVouchers).update({
        status: "sold",
        updated_at: knex.fn.now(),
      });

      await trx.commit();

      console.log({
        paymentId,
        transactionId,
        categoryType: service,
        status: paymentStatus,
      });

      return res.status(200).json({
        paymentId,
        transactionId,
        status: paymentStatus,
        categoryType: service,
      });
    } catch (error) {
      await trx.rollback();
      console.error(error);
      return res.status(500).json("Transaction failed");
    }
  }),
);

router.post(
  "/resend",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id: transactionId, downloadLink } = req.body;

    const transaction = await knex("voucher_transactions")
      .select("*")
      .where("id", transactionId)
      .limit(1)
      .first();

    if (_.isEmpty(transaction)) {
      return res.status(402).json("Transaction not found!");
    }

    const { id, info } = transaction;

    const userInfo = JSON.parse(info);

    let selectedVouchers = [];

    //Check if tickets are Stadium tickets or cinema

    if (["stadium", "cinema"].includes(userInfo?.type)) {
      const vouchers = await Promise.all(
        userInfo?.paymentDetails.tickets.flatMap(async (ticket) => {
          return await knex("vouchers")
            .join("categories", "vouchers.category_id", "=", "categories.id")
            .where({
              "vouchers.category_id": userInfo?.categoryId,
              "vouchers.type": ticket?.type,
              "vouchers.status": "new",
              "vouchers.active": 1,
            })
            .select(
              "vouchers.id",
              "vouchers.serial",
              "vouchers.pin",
              "vouchers.type",
              "categories.details as details",
              "categories.name as voucherType",
            )
            .limit(ticket?.quantity);
        }),
      );

      selectedVouchers = _.flatMap(vouchers);
    }
    //Check if tickets are bus
    else if (["bus"].includes(userInfo?.type)) {
      selectedVouchers = await knex("vouchers")
        .join("categories", "vouchers.category_id", "=", "categories.id")
        .whereIn("vouchers.type", userInfo?.paymentDetails?.tickets)
        .andWhere({
          "vouchers.category_id": userInfo?.categoryId,
          "vouchers.status": "new",
          "vouchers.active": 1,
        })
        .select(
          "vouchers.id",
          "vouchers.serial",
          "vouchers.pin",
          "vouchers.type",
          "categories.details as details",
          "categories.name as voucherType",
        );
    }
    //Check if vouchers are waec,university or security
    else {
      selectedVouchers = await knex("vouchers")
        .join("categories", "vouchers.category_id", "=", "categories.id")
        .where({
          "vouchers.category_id": userInfo?.categoryId,
          "vouchers.status": "new",
          "vouchers.active": 1,
        })
        .select(
          "vouchers.id",
          "vouchers.serial",
          "vouchers.pin",
          "vouchers.type",
          "categories.name as voucherType",
          "categories.details as details",
        )
        .limit(userInfo?.quantity);
    }

    try {
      if (["waec", "security", "university"].includes(userInfo?.type)) {
        const detailsInfo = JSON.parse(selectedVouchers[0]?.details ?? {});

        const smsInfo = selectedVouchers.map((voucher) => {
          return `[${voucher?.pin}--${voucher?.serial}]`;
        });
        const smsData = await Promise.all([smsInfo]);

        await sendSMS(
          `${selectedVouchers[0]?.voucherType}  ${detailsInfo?.voucherURL}   
[Pin--Serial]
${smsData.join(" ")},download voucher here: ${userInfo?.downloadLink}`,
          userInfo?.agentPhoneNumber,
        );
      }

      if (["bus", "cinema", "stadium"].includes(userInfo?.type)) {
        const d = _.isEmpty(selectedVouchers)
          ? "{}"
          : selectedVouchers[0]?.details;

        const detailsInfo = JSON.parse(_.isUndefined(d) ? {} : d);

        const smsInfo = selectedVouchers.map((voucher) => {
          return `[${voucher?.type}--${voucher?.serial || voucher?.pin}]`;
        });
        const smsData = await Promise.all([smsInfo]);

        await sendSMS(
          `${selectedVouchers[0]?.voucherType}   
[Seat No./Type--Serial]
${smsData.join(" ")},  

${moment(detailsInfo?.date)?.format("dddd,Do MMMM,YYYY")},${moment(
            detailsInfo?.time,
          ).format("hh:mm a")},  
${userInfo?.agentEmail || ""},${
            userInfo?.agentPhoneNumber
          }.Please visit https://www.gpcpins.com/evoucher to print your tickets.,download voucher here: ${
            userInfo?.downloadLink
          }
`,
          userInfo?.agentPhoneNumber,
        );
      }

      await resendReceiptMail(id, userInfo?.agentEmail, downloadLink);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json("Error Processing your request! Please try again later.");
    }

    res.sendStatus(200);
  }),
);

/**.................Airtime....................... */

router.get(
  "/airtime",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const transactions = await knex("vw_payments_airtime_transactions")
      .select(
        "id",
        "orderId",
        "recipient",
        " email",
        " phonenumber",
        " info",
        " year",
        " amount",
        " isProcessed",
        " active",
        " createdAt",
        " updatedAt",
        " status",
        " issuerId",
      )
      .where({ status: "completed", kind: "bulk" });

    const modifiedTransactions = transactions.map(
      async ({ recipient, issuerId, info, isProcessed, ...rest }) => {
        const employee = await knex("vw_users_with_roles")
          .where("id", issuerId)
          .select("id", "name")
          .first();

        return {
          ...rest,
          isProcessed: Boolean(isProcessed),
          recipient: safeJSON(recipient),
          info: safeJSON(info),
          issuer: employee?.name,
        };
      },
    );

    const sDate = moment(startDate);
    const eDate = moment(endDate);

    const availableTransactions = await Promise.all(modifiedTransactions);

    const modifiedPayments = availableTransactions?.filter(({ updatedAt }) => {
      return moment(updatedAt).isBetween(sDate, eDate, "days", "[]");
    });

    const sortedPayments = _.orderBy(modifiedPayments, ["updatedAt"], ["desc"]);

    res.status(200).json(sortedPayments);
  }),
);

// Make Airtime Payment @route   POST payment/airtime
router.post(
  "/airtime",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id: userId, name } = req.user;

    if (_.isEmpty(req.body)) {
      return res.status(401).json("Error Processing your request!");
    }

    const {
      type,
      service,
      amount,
      recipient,
      phonenumber,
      provider,
      pricing,
      email,
      isWallet,
      token,
    } = req.body;

    const trx = await knex.transaction();
    try {
      const response = await accountBalance();
      const balance = Number(response?.balance);
      if (Number(response?.balance) < Number(amount)) {
        if (balance < 1000) {
          await notifyLowBalance(balance);
        }
        return res.status(401).json("Service Not Available.Try again later");
      }

      if (!type || !["Airtime", "Bulk"].includes(type)) {
        return res.status(401).json("Invalid Request");
      }

      // ---------------- GENERATE IDS ----------------
      const paymentId = generateId();
      const transactionId = generateId();
      const reference = randomBytes(24).toString("hex");
      const orderNo = randomBytes(20).toString("hex");

      // ---------------- CREATE PAYMENT ----------------
      let paymentStatus = "pending";
      let partnerResponse = null;

      if (isWallet) {
        // ---- WALLET VALIDATION ----
        const wallet = await trx("wallets").where({ user_id: userId }).first();

        if (!wallet) {
          return res.status(401).json("Wallet not found");
        }

        const isPinValid = await bcrypt.compare(token, wallet.user_key);
        if (!isPinValid) {
          return res.status(401).json("Invalid PIN!");
        }

        if (Number(wallet.amount) < Number(amount)) {
          return res.status(400).json("Insufficient funds");
        }

        // ---- DEDUCT WALLET ----
        await trx("wallets")
          .where({ user_id: userId })
          .decrement("amount", amount);

        await trx("wallet_transactions").insert({
          id: generateId(),
          user_id: userId,
          wallet_id: wallet.id,
          wallet_amount: wallet.amount,
          issuer: userId || "GPC Customer",
          type: "debit",
          comment: "Airtime purchase ",
          attachment: null,
          amount: amount,
          status: "completed",
          reference,
        });

        paymentStatus = "completed";
        partnerResponse = { code: "WALLET_SUCCESS" };
      } else {
        const payment = {
          name: name || "GPC Customer",
          email: email,
          phonenumber,
          amount: Number(amount).toFixed(2),
          provider,
          transaction_reference: reference,
        };

        partnerResponse = await sendMoney(payment, "a");

        // Save the Transaction to DB and Send Email

        paymentStatus =
          partnerResponse?.ResponseCode === "0000"
            ? "completed"
            : partnerResponse?.ResponseCode === "0001"
              ? "pending"
              : "failed";
      }

      // ---------------- INSERT PAYMENT ----------------
      await trx("payments").insert({
        id: paymentId,
        user_id: userId,
        reference: reference,
        service,
        amount: amount,
        provider: provider,
        mode: isWallet ? "Wallet" : "Mobile Money",
        year: moment().year(),
        status: paymentStatus,
        externalTransactionId: null,
        partner: JSON.stringify(partnerResponse.Data),
      });

      const transaction = await trx("airtime_transactions").insert({
        id: transactionId,
        payment_id: paymentId,
        order_id: orderNo,
        airtime_type: type === "Airtime" ? "single" : "bulk",
        recipient: recipient || JSON.stringify(pricing),
        domain: service,
        info: JSON.stringify({
          phonenumber,
          amount,
          pricing: pricing ?? [],
          domain: service,
        }),

        email: email,
        phonenumber: phonenumber,
        partner: JSON.stringify(partnerResponse.Data),
      });

      // //if creating new transaction fails
      if (_.isEmpty(transaction)) {
        await trx.rollback();
        return res.status(404).json("Error Processing your request!");
      }

      await trx.commit();

      res.status(201).json({ id: transactionId });
    } catch (error) {
      await trx.rollback();
      console.log(error);
      return res.status(500).json("Transaction Failed!");
    }

    //  transactionInfo = {
    //   id: transaction_id,
    //   user: id,
    //   recipient,
    //   email,
    //   phonenumber,
    //   reference: transaction_reference,
    //   bundle_id: plan?.id,
    //   bundle_name: plan?.name,
    //   bundle_volume: plan?.volume,
    //   amount,
    //   provider,
    //   mode: "Mobile Money",
    //   info: JSON.stringify({
    //     phonenumber,
    //     amount,
    //     plan,
    //   }),
    //   partner: JSON.stringify(sendMoneyReponse?.Data),
    //   status,
    // };
  }),
);

//Proccess bulk airtime
router.put(
  "/airtime",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: userId, name } = req.user;
    const { id, orderId } = req.query;

    if (_.isEmpty(id) || !isValidUUID2(id)) {
      return res.status(401).json("Error Processing your request!");
    }

    const transaction = await knex("airtime_transactions")
      .select("id", "phonenumber")
      .where("id", id)
      .limit(1);

    if (_.isEmpty(transaction)) {
      return res.status(401).json("Error Processing your request!");
    }

    await knex("airtime_transactions").where("id", id).update({
      orderId,
      is_processed: 1,
      issuer: id,
      issuerName: name,
    });

    //logs
    await knex("activity_logs").insert({
      employee_id: id,
      title: "Processed bulk airtime transaction!",
      severity: "info",
    });

    res.status(200).json("Transaction Completed!");

    await sendSMS(
      `Your request to buy bulk airtime has been completed.Thank you for purchasing from us!Your transaction id is ${transaction[0]?.id}`,
      transaction[0]?.phonenumber,
    );

    // const recipient = JSON.parse(transaction[0].recipient);

    // const list = recipient.map(async (item) => {
    //   const transaction_reference = randomBytes(24).toString("hex");
    //   const info = {
    //     recipient: item?.recipient,
    //     amount: item?.price,
    //     network:
    //       item?.type === "MTN"
    //         ? 4
    //         : item?.type === "Vodafone"
    //           ? 6
    //           : item?.type === "AirtelTigo"
    //             ? 1
    //             : 0,
    //     transaction_reference,
    //   };

    //   return sendAirtime(info);
    // });

    //     Promise.all(list)
    //       .then(async (data) => {
    //         await knex("airtime_transactions").where("id", id).update({
    //           is_processed: 1,
    //           issuer: name
    //         });

    //         await knex("user_notifications").insert({
    //           id: generateId(),
    //           user_id: userID,
    //           type: "airtime",
    //           title: "Airtime Transfer",
    //           message: `You have successfully recharged ${airtimeInfo.recipient} with GHS ${airtimeInfo.amount} of airtime, you were charged GHS ${airtimeInfo.amount}`,
    //         });

    //         if (process.env.NODE_ENV === 'production') {

    //           const balance = await accountBalance();
    //           if (Number(balance) < 1000) {
    //             const body = `
    // Your one-4-all top up account balance is running low.Your remaining balance is GHS ${balance}.
    // Please recharge to avoid any inconveniences.
    // Thank you.
    //           `;
    //             await sendEMail(
    //               process.env.MAIL_CLIENT_USER,
    //               mailTextShell(`<p>${body}</p>`),
    //               "LOW TOP UP ACCOUNT BALANCE"
    //             );
    //           }

    //         }
    //       })
    //       .catch((error) => {
    //         return res.status(500).json("Transaction Failed!");
    //       });
  }),
);

// Make Bundle Payment @route   POST payment/bundle
router.post(
  "/bundle",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id: userId, name } = req.user;

    if (_.isEmpty(req.body)) {
      return res.status(401).json("Error Processing your request!");
    }

    const {
      type,
      amount,
      service,
      recipient,
      phonenumber,
      provider,
      email,
      plan,
      isWallet,
      token,
    } = req.body;

    const trx = await knex.transaction();

    try {
      const response = await accountBalance();
      const balance = Number(response?.balance);
      if (Number(response?.balance) < Number(amount)) {
        if (balance < 1000) {
          await notifyLowBalance(balance);
        }
        return res.status(401).json("Service Not Available.Try again later");
      }

      if (!type || type !== "Bundle") {
        return res.status(401).json("Invalid Request");
      }

      // ---------------- GENERATE IDS ----------------
      const paymentId = generateId();
      const transactionId = generateId();
      const reference = randomBytes(24).toString("hex");

      if (isWallet) {
        // ---- WALLET VALIDATION ----
        const wallet = await trx("wallets").where({ user_id: userId }).first();

        if (!wallet) {
          return res.status(401).json("Wallet not found");
        }

        const isPinValid = await bcrypt.compare(token, wallet.user_key);
        if (!isPinValid) {
          return res.status(401).json("Invalid PIN!");
        }

        if (Number(wallet.amount) < Number(amount)) {
          return res.status(400).json("Insufficient funds");
        }

        // ---- DEDUCT WALLET ----
        await trx("wallets")
          .where({ user_id: userId })
          .decrement("amount", amount);

        await trx("wallet_transactions").insert({
          id: generateId(),
          user_id: userId,
          wallet_id: wallet.id,
          wallet_amount: wallet.amount,
          issuer: userId || "GPC Customer",
          type: "debit",
          comment: "Data Bundle purchase ",
          attachment: null,
          amount: amount,
          status: "completed",
          reference,
        });

        paymentStatus = "completed";
        partnerResponse = { code: "WALLET_SUCCESS" };
      } else {
        const payment = {
          name: name || "GPC Customer",
          email: email,
          phonenumber,
          amount: Number(amount).toFixed(2),
          provider,
          transaction_reference: reference,
        };

        partnerResponse = await sendMoney(payment, "b");

        // Save the Transaction to DB and Send Email

        paymentStatus =
          partnerResponse?.ResponseCode === "0000"
            ? "completed"
            : partnerResponse?.ResponseCode === "0001"
              ? "pending"
              : "failed";
      }

      // ---------------- INSERT PAYMENT ----------------
      await trx("payments").insert({
        id: paymentId,
        user_id: userId,
        reference: reference,
        service,
        amount: amount,
        provider: provider,
        mode: isWallet ? "Wallet" : "Mobile Money",
        year: moment().year(),
        status: paymentStatus,
        externalTransactionId: null,
        partner: JSON.stringify(partnerResponse.Data),
      });

      const transaction = await trx("bundle_transactions").insert({
        id: transactionId,
        payment_id: paymentId,
        recipient: recipient,
        email: email,
        phonenumber: phonenumber,
        domain: service,
        bundle_id: plan?.id,
        bundle_name: plan?.name,
        bundle_volume: plan?.volume,
        info: JSON.stringify({
          phonenumber,
          amount,
          plan,
        }),
      });

      // //if creating new transaction fails
      if (_.isEmpty(transaction)) {
        await trx.rollback();
        return res.status(404).json("Error Processing your request!");
      }

      await trx.commit();

      res.status(201).json({ id: transactionId });
    } catch (error) {
      await trx.rollback();
      console.log(error);
      return res.status(500).json("Transaction Failed!");
    }
  }),
);

//Check Balance Status
router.get(
  "/balances",
  // verifyToken,
  // verifyAdmin,
  asyncHandler(async (req, res) => {
    try {
      const [posResponse, preResponse, accResponse] = await Promise.all([
        POS_Balance(),
        PREPAID_Balance(),
        accountBalance(),
      ]);

      res.status(200).json({
        pos: posResponse?.amount || 0,
        pre: preResponse?.amount || 0,
        balance: accResponse?.balance || 0,
      });
    } catch (error) {
      console.log(error);
      res.status(401).json("Am unknown error has occurred!");
    }
  }),
);
//Check Balance Status
router.get(
  "/hb/pos",
  // verifyToken,
  // verifyAdmin,
  asyncHandler(async (req, res) => {
    try {
      const response = await POS_Balance();

      res.status(200).json(response?.amount);
    } catch (error) {
      console.log(error);
      res.status(401).json("Am unknown error has occurred!");
    }
  }),
);

//Check Balance Status
router.get(
  "/hb/prepaid",
  // verifyToken,
  // verifyAdmin,
  asyncHandler(async (req, res) => {
    try {
      const response = await PREPAID_Balance();

      res.status(200).json(response?.amount);
    } catch (error) {
      console.log(error);
      res.status(401).json("Am unknown error has occurred!");
    }
  }),
);

//Check Balance Status
router.get(
  "/top-up/balance",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    try {
      const response = await accountBalance();

      res.status(200).json(response?.balance);
    } catch (error) {
      res.status(401).json("Am unknown error has occurred!");
    }
  }),
);

//Check Transaction Status
router.post(
  "/top-up/status",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const reference_id = req.body?.id;

    try {
      const response = await topUpStatus(reference_id);

      res.status(200).json(response);
    } catch (error) {
      res.status(401).json(error?.response?.data);
    }
  }),
);

//Get List of all bundles
router.get(
  "/top-up/bundlelist",
  // verifyToken,
  asyncHandler(async (req, res) => {
    const network = req.query?.network;
    let response = [];
    try {
      if (process.env.NODE_ENV === "production") {
        response = await getBundleList(network);
      } else {
        if (network === "4") {
          response = MTN;
        }
        if (network === "6") {
          response = VODAFONE;
        }
        if (network === "1") {
          response = AIRTELTIGO;
        }
      }

      const bundles = response?.bundles?.map((bundle) => {
        const { meta, network, ...rest } = bundle;
        if (Number(rest.price) === 0) return;
        return rest;
      });

      // console.log(_.groupBy(bundles, 'category'))

      res.status(200).json(_.compact(bundles));
    } catch (error) {
      console.log(error);
      res.status(401).json("An unknown error has occurred");
    }
  }),
);

//Send bundle to recipient
router.post(
  "/top-up/bundle",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const info = req.body;

    try {
      const response = await sendBundle(info);

      res.status(200).json(response);
    } catch (error) {
      res.status(401).json("An unknown error has occurred");
    }
  }),
);

//Send airtime to recipient
router.post(
  "/top-up/airtime",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const info = req.body;

    try {
      const response = await sendAirtime(info);

      res.status(200).json(response);
    } catch (error) {
      res.status(401).json("An unknown error has occurred");
    }
  }),
);

/**.................Electricity....................... */

router.get(
  "/electricity",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const transactions = await knex(
      "vw_meter_payment_prepaid_transaction_view",
    ).where("status", "completed");

    const modifiedTransactions = transactions.map((transaction) => {
      return {
        id: transaction?.id,
        paymentId: transaction?.paymentId,
        active: transaction?.active,
        spn: transaction?.spn,
        email: transaction?.email,
        phonenumber: transaction?.phonenumber,
        year: transaction?.year,
        amount: transaction?.amount,
        status: transaction?.status,
        topup: transaction?.topup,
        charges: transaction?.charges,
        isProcessed: Boolean(transaction?.isProcessed),
        createdAt: transaction?.createdAt,
        updatedAt: transaction?.updatedAt,
        info: JSON.parse(transaction?.info),
        meterId: transaction?.meterId,
        meter: {
          id: transaction?.meterId,
          number: transaction?.number,
          name: transaction?.name,
          type: transaction?.type,
          district: transaction?.district,
          address: transaction?.address,
          geoCode: transaction?.geoCode,
          accountNumber: transaction?.accountNumber,
        },
      };
    });

    const sDate = moment(startDate);
    const eDate = moment(endDate);

    const modifiedPayments = modifiedTransactions.filter(({ createdAt }) => {
      return moment(createdAt).isBetween(sDate, eDate, "days", "[]");
    });

    const sortedPayments = _.orderBy(modifiedPayments, ["createdAt"], ["desc"]);

    res.status(200).json(sortedPayments);
  }),
);

router.get(
  "/electricity/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }

    const transaction = await knex("vw_meter_payment_prepaid_transaction_view")
      .select("*")
      .where("id", id)
      .first();

    if (_.isEmpty(transaction)) {
      return res.status(404).json({});
    }

    res.status(200).json({
      ...transaction,
      info: safeJSON(transaction?.info),
    });
  }),
);
router.get(
  "/electricity/meter/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transactions = await knex("meter_prepaid_transaction_view")
      .where({
        meter: id,
        status: "completed",
      })
      .select("*")
      .orderBy("createdAt", "desc");

    const modifiedTransactions = transactions.map((transaction) => {
      return {
        id: transaction?.id,
        paymentId: transaction?.paymentId,
        active: transaction?.active,
        email: transaction?.email,
        mobileNo: transaction?.mobileNo,
        year: transaction?.year,
        topup: transaction?.topup,
        charges: transaction?.charges,
        amount: transaction?.amount,
        status: transaction?.status,
        is_processed: Boolean(transaction?.processed),
        createdAt: transaction?.createdAt,
        updatedAt: transaction?.updatedAt,
        issuerName: transaction?.issuerName,
        info: JSON.parse(transaction?.info),
        meter: {
          id: transaction?.meterId,
          number: transaction?.number,
          name: transaction?.name,
          type: transaction?.type,
          district: transaction?.district,
          address: transaction?.address,
          geoCode: transaction?.geoCode,
          accountNumber: transaction?.accountNumber,
        },
      };
    });

    res.status(200).json(modifiedTransactions);
  }),
);

router.get(
  "/electricity/user/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transactions = await knex("vw_meter_payment_prepaid_transaction_view")
      .where({
        userId: id,
        active: 1,
        status: "completed",
      })
      .select("*")
      .orderBy("createdAt", "desc");

    const modifiedTransactions = transactions.map((transaction) => {
      return {
        id: transaction?.id,
        paymentId: transaction?.paymentId,
        active: transaction?.active,
        email: transaction?.email,
        mobileNo: transaction?.mobileNo,
        year: transaction?.year,
        mode: transaction?.mode,
        charges: transaction?.charges,
        topup: transaction?.topup,
        amount: transaction?.amount,
        status: transaction?.status,
        issuerName: transaction?.issuerName,
        isProcessed: Boolean(transaction?.isProcessed),
        createdAt: transaction?.createdAt,
        updatedAt: transaction?.updatedAt,
        info: JSON.parse(transaction?.info),
        meter: {
          id: transaction?.meterId,
          number: transaction?.number,
          name: transaction?.name,
          type: transaction?.type,
          district: transaction?.district,
          address: transaction?.address,
          spn: transaction?.spn,
        },
      };
    });

    res.status(200).json(modifiedTransactions);
  }),
);

router.post(
  "/electricity",
  verifyToken,
  rlimit,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { meter, info, charges, topup, amount, isWallet, token } = req.body;

    const transx = await knex.transaction();
    let meterId = generateId();
    let newMeter;
    const userID = id ?? generateId();

    if (typeof meter === "object") {
      newMeter = {
        id: meterId,
        ...meter,
        user_id: userID,
      };
      await transx("meters").insert(newMeter);
    } else {
      meterId = meter;
    }

    try {
      // Call the API to create a transaction
      const paymentId = generateId();
      const transaction_id = generateId(6);
      const transaction_reference = randomBytes(24).toString("hex");
      const orderNo = randomBytes(20).toString("hex");

      // ---------------- CREATE PAYMENT ----------------
      let paymentStatus = "pending";
      let partnerResponse = null;

      if (isWallet) {
        // ---- WALLET VALIDATION ----
        const wallet = await transx("wallets")
          .where({ user_id: userID })
          .first();

        if (!wallet) {
          return res.status(401).json("Wallet not found");
        }

        const isPinValid = await bcrypt.compare(token, wallet.user_key);
        if (!isPinValid) {
          return res.status(401).json("Invalid PIN!");
        }

        if (Number(wallet.amount) < Number(amount)) {
          return res.status(400).json("Insufficient funds");
        }

        // ---- DEDUCT WALLET ----
        await transx("wallets")
          .where({ user_id: userID })
          .decrement("amount", amount);

        await transx("wallet_transactions").insert({
          id: generateId(),
          user_id: userID,
          wallet_id: wallet.id,
          wallet_amount: wallet.amount,
          issuer: userID,
          type: "debit",
          comment: `Prepaid purchase of ${topup} for meter ${meterId}`,
          amount: amount,
          status: "completed",
          reference: transaction_reference,
        });

        paymentStatus = "completed";
        providerResponse = { code: "WALLET_SUCCESS" };
      } else {
        const payment = {
          name: info?.name || "GPC Customer",
          phonenumber: info?.phonenumber,
          email: info?.email,
          amount: Number(info?.amount).toFixed(2),
          provider: info?.provider,
          transaction_reference,
        };

        const partnerResponse = await sendMoney(payment, "p");

        // Save the Transaction to DB and Send Email

        paymentStatus =
          partnerResponse?.ResponseCode === "0000"
            ? "completed"
            : partnerResponse?.ResponseCode === "0001"
              ? "pending"
              : "failed";
      }

      // ---------------- INSERT PAYMENT ----------------
      await transx("payments").insert({
        id: paymentId,
        user_id: userID,
        reference: transaction_reference,
        service: "prepaid",
        amount: amount,
        charges,
        provider: isWallet ? "wallet" : info?.provider,
        mode: isWallet ? "Wallet" : "Mobile Money",
        year: moment().year(),
        status: paymentStatus,
        externalTransactionId: null,
        partner: JSON.stringify(partnerResponse),
      });

      const transaction = await transx("electricity_transactions").insert({
        id: transaction_id,
        payment_id: paymentId,
        meter_id: meterId,
        info: JSON.stringify({
          ...info,
          domain: "Prepaid",
          orderNo,
        }),
        charges,
        topup,
        email: info?.email,
        phonenumber: info?.phonenumber,
      });

      // //if creating new transaction fails
      if (_.isEmpty(transaction)) {
        await transx.rollback();
        return res.status(404).json("Error Processing your request!");
      }

      await transx.commit();

      res.status(201).json({ id: transaction_id });
    } catch (error) {
      console.log(error);
      await transx.rollback();
      return res.status(500).json("Transaction Failed!");
    }
  }),
);

//@ Payment callback
router.post(
  "/feedback/callback/:type/:id",
  cors(corsOptions),
  rlimit,
  asyncHandler(async (req, res) => {
    const trx = await knex.transaction();

    try {
      const { id, type } = req.params;
      const payload = req.body;

      // ---------------- VALIDATION ----------------
      if (!id || !type || !isValidUUID2(id) || !payload) {
        return res.sendStatus(204);
      }

      const { ResponseCode, Data } = payload;

      if (!Data?.ClientReference) {
        return res.sendStatus(204);
      }

      const reference = Data.ClientReference;

      // ---------------- NORMALIZE STATUS ----------------
      const statusMap = {
        "0000": "completed",
        "0001": "pending",
      };

      const newStatus = statusMap[ResponseCode] || "failed";

      // ---------------- FETCH PAYMENT ----------------
      const payment = await trx("payments").where({ reference }).first();

      if (!payment) {
        await trx.rollback();
        return res.sendStatus(204);
      }

      // ---------------- IDEMPOTENCY CHECK ----------------
      // Prevent duplicate updates (important for webhook retries)
      if (payment.status === "completed") {
        await trx.commit();
        return res.sendStatus(200);
      }

      // ---------------- UPDATE PAYMENT ----------------
      await trx("payments").where({ id: payment.id }).update({
        status: newStatus,
        externalTransactionId: Data?.ExternalTransactionId,
        updated_at: knex.fn.now(),
      });

      // ---------------- LOG CALLBACK ----------------
      // await trx("payment_logs").insert({
      //   id: generateId(),
      //   payment_id: payment.id,
      //   reference,
      //   payload: JSON.stringify(payload),
      //   status: newStatus,
      // });

      await trx.commit();

      return res.sendStatus(200);
    } catch (error) {
      console.error("Webhook Error:", error);
      await trx.rollback();
      return res.sendStatus(500);
    }
  }),
);

//Process prepaid transaction
router.put(
  "/electricity",
  verifyToken,
  verifyAdmin,
  Upload.single("receipt"),
  asyncHandler(async (req, res) => {
    const { id: userId, name } = req.user;
    const { id, data } = req.body;
    const { meter, meterId, paymentId, info } = data;

    const transx = await knex.transaction();

    try {
      await transx("meters")
        .where("id", meterId)
        .update({
          ...meter,
        });

      await transx("payments").where("id", paymentId).update({
        is_processed: true,
        issuer_id: userId,
        issuer_name: name,
      });

      const updateTransactionDetails = await transx("electricity_transactions")
        .where("id", id)
        .update({
          info: JSON.stringify({
            ...info,
            domain: "Prepaid",
          }),
        });

      if (updateTransactionDetails !== 1) {
        return res.status(404).json("Error updating request");
      }

      const transaction = await transx(
        "vw_meter_payment_prepaid_transaction_view",
      )
        .where({
          id: id,
          status: "completed",
        })
        .select(
          "id",
          "number",
          "name",
          "paymentId",
          "spn",
          "email",
          "phonenumber",
          "topup",
          "charges",
          "amount",
          "userId",
        )
        .first();

      if (!transaction) {
        await transx.rollback();
        return res.status(404).json("Error updating request");
      }

      const meterInfo = {
        id: transaction.id,
        number: transaction?.number,
        name: transaction?.name,
        paymentId: paymentId,
        email: transaction?.email,
        mobileNo: transaction?.phonenumber,
        spn: transaction?.spn,
        orderNo: transaction?.orderNo,
        topup: currencyFormatter(transaction?.topup),
        charges: currencyFormatter(transaction?.charges),
        amount: currencyFormatter(transaction?.amount),
      };

      //logs
      await transx("activity_logs").insert({
        user_id: userId,
        title: "Processed prepaid transaction!",
        severity: "info",
      });

      await transx("notifications").insert({
        id: generateId(),
        user_id: transaction?.userId,
        type: "prepaid",
        title: "Prepaid Units",
        body: `You request to buy prepaid units has being completed.Click on the button below to download your receipt.In case units do not load automatically,Please enter the token on your meter to load your units.Thank you!`,
        link: info?.downloadLink,
      });

      await transx.commit();

      res
        .status(201)
        .json("Your request is being processed.You will be notified shortly!!");

      limit(async () => {
        await sendSMS(
          `You request to buy prepaid units has being completed.Transaction Details:Transaction ID: ${meterInfo.id},Order No.:${meterInfo?.paymentId},-Token:${meterInfo?.orderNo},Meter No:${meterInfo?.number},Meter Name:${meterInfo?.name}-Amount Paid: ${meterInfo?.amount}.In case units do not load automatically,Please enter the token on your meter to load your units.Thank you`,
          transaction?.phonenumber,
        );
        await sendElectricityMail(
          id,
          transaction?.email,
          transaction?.status,
          info?.downloadLink,
          meterInfo,
        );
      });
    } catch (error) {
      console.log(error);
      await transx.rollback();
      return res.status(500).json("Transaction Failed!");
    }

    // await sendWhatsappMessage({
    //   user: getInternationalMobileFormat(paymentInfo?.mobileNo),
    //   message: "Thank you for your purchase!",
    //   media: downloadLink,
    // });

    // const template = await generatePrepaidTemplate(meterInfo);
    // const result = limit(() => generatePrepaidReceipt(template, id));

    //       result
    //       .then(async (data) => {
    //         if (data === "done") {    }
    // })
    // .catch((error) => {
    //   console.log(error);
    //   return res.status(404).json("Error updating request");
    // });

    // const data = await sendSMS(
    //   `You request to buy prepaid units has being completed.
    //   Thank you for your purchase!
    //   `,
    //   updateTransactionDetails?.info?.mobileNo
    // );
  }),
);

router.put(
  "/electricity/delete",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { ids } = req.body;

    const removedTransactions = await knex("prepaid_transactions")
      .whereIn("id", ids)
      .update({
        active: 0,
      });

    if (removedTransactions !== 1) {
      return res.status(200).json("An error has occurred!");
    }

    res.status(200).json("Transactions removed!");
  }),
);

router.delete(
  "/electricity/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }

    const removedTransaction = await knex("prepaid_transactions")
      .where("id", id)
      .update({
        active: 0,
      });

    if (removedTransaction !== 1) {
      return res.status(200).json("An error has occurred!");
    }

    res.status(200).json("Transaction removed!");
  }),
);

// router.get(
//   "/test/puppeteer",

//   asyncHandler(async (req, res) => {
//     // await sendBirthdayWishes();

//     const transactions = await knex("agent_transactions")
//       .where("agent_id", "d9bc3351-d703-45a5-9b8b-b9ec5d74268c")
//       .select("*", knex.raw("DATE_FORMAT(createdAt,'%M %d %Y 🔸 %r') AS date"))
//       .orderBy("createdAt", "desc");

//     const template = await generateAgentTransactionTemplate({ transactions });

//     const result = limit(() => generateAgentTransactionRport(template, "134"));
//     if (result) {
//       const body = ` <div class="container">
// <h1>Transactional Report</h1>
// <p>Dear [Customer Name],</p>
// <p>Attached is your transactional report for the period [Period]. Please review the details below:</p>
// <p>If you have any questions or concerns regarding this report, please feel free to contact us.</p>
// <p>Thank you for your business!</p>
// <p>Sincerely,<br>Gab Powerful Consults</p>
// </div>`;

//       await sendReportMail(
//         "nicktest701@gmail.com",
//         mailTextShell(body),
//         "134",
//         " Transaction Report"
//       );
//     }

//     res.status(200).json("Transaction removed!");
//   })
// );

module.exports = router;

const selectVouchers = async ({
  trx,
  category,
  categoryId,
  quantity,
  paymentDetails,
}) => {
  if (["stadium", "cinema"].includes(category)) {
    const vouchers = await Promise.all(
      paymentDetails.tickets.map((ticket) =>
        trx("vouchers")
          .where({
            category_id: categoryId,
            type: ticket.type,
            status: "new",
            active: 1,
          })
          .limit(ticket.quantity)
          .select("id"),
      ),
    );

    return vouchers.flat();
  }

  if (category === "bus") {
    return trx("vouchers")
      .whereIn("type", paymentDetails.tickets)
      .andWhere({
        category_id: categoryId,
        status: "new",
        active: 1,
      })
      .select("id");
  }

  return trx("vouchers")
    .where({
      category_id: categoryId,
      status: "new",
      active: 1,
    })
    .limit(quantity)
    .select("id");
};

const selectVouchersForConfirmation = async (trx, info) => {
  if (!info || !info.categoryId) {
    throw new Error("Invalid transaction info");
  }

  const {
    categoryId,
    quantity,
    categoryType, // stadium | cinema | bus | others
    paymentDetails,
  } = info;

  let selected = [];

  // ---------------- STADIUM / CINEMA ----------------

  if (["stadium", "cinema"].includes(categoryType)) {
    const results = await Promise.all(
      paymentDetails?.tickets.map(async (ticket) => {
        return trx("vouchers as v")
          .join("categories as c", "v.category_id", "c.id")
          .where({
            "v.category_id": categoryId,
            "v.type": ticket.type,
            "v.status": "sold", // 🔥 IMPORTANT (not "new")
            "v.active": 1,
          })
          .limit(ticket.quantity)
          .select(
            "v.id",
            "v.serial",
            "v.pin",
            "v.type",
            "c.name as voucherType",
            "c.details",
          )
          .forUpdate(); // 🔒 LOCK ROWS
      }),
    );

    selected = results.flat();
  }

  // ---------------- BUS ----------------
  else if (categoryType === "bus") {
    selected = await trx("vouchers as v")
      .join("categories as c", "v.category_id", "c.id")
      .whereIn("v.type", paymentDetails?.tickets || [])
      .andWhere({
        "v.category_id": categoryId,
        "v.status": "sold",
        "v.active": 1,
      })
      .select(
        "v.id",
        "v.serial",
        "v.pin",
        "v.type",
        "c.name as voucherType",
        "c.details",
      )
      .forUpdate();
  }

  // ---------------- DEFAULT (WAEC, etc.) ----------------
  else {
    selected = await trx("vouchers as v")
      .join("categories as c", "v.category_id", "c.id")
      .where({
        "v.category_id": categoryId,
        "v.status": "sold",
        "v.active": 1,
      })
      .limit(quantity)
      .select(
        "v.id",
        "v.serial",
        "v.pin",
        "v.type",
        "c.name as voucherType",
        "c.details",
      )
      .forUpdate();
  }

  // ---------------- VALIDATION ----------------
  if (!selected.length) {
    throw new Error("No vouchers available");
  }

  // Optional strict validation (recommended)
  if (categoryType !== "bus" && selected.length < Number(quantity)) {
    throw new Error("Insufficient vouchers");
  }

  return selected;
};

async function processVoucher(trx, transaction) {
  const userInfo = transaction?.info ? JSON.parse(transaction?.info) : "";

  const vouchers = await selectVouchersForConfirmation(trx, userInfo);

  if (!vouchers.length) {
    throw new Error("No vouchers available");
  }

  const ids = vouchers.map((v) => v.id);

  await trx("voucher_transactions")
    .where({ id: transaction.id })
    .update({
      vouchers: JSON.stringify(ids),
    });

  await trx("vouchers").whereIn("id", ids).update({
    status: "sold",
    active: 0,
  });

  return vouchers;
}

async function markProcessed(trx, transaction) {
  if (transaction.service === "airtime" && transaction.type === "single") {
    const airtimeInfo = {
      recipient: transaction?.recipient,
      amount: transaction?.amount,
      network:
        transaction?.network === "mtn-gh"
          ? 4
          : transaction?.network === "vodafone-gh"
            ? 6
            : transaction?.network === "tigo-gh"
              ? 1
              : 0,
      transaction_reference: transaction.paymentReference,
    };
    try {
      const response = await sendAirtime(airtimeInfo);

      if (["00", "09"].includes(response["status-code"])) {
        await trx("payments")
          .where({ id: transaction.paymentId })
          .update({ is_processed: 1 });

        if (
          transaction.service === "airtime" &&
          transaction.type === "single"
        ) {
          await trx("notifications").insert({
            id: generateId(),
            user_id: transaction.userId,
            type: "airtime",
            title: "Airtime Transfer",
            body: `You have successfully recharged ${transaction.recipient} with GHS ${transaction.amount} of airtime, you were charged GHS ${transaction.amount}.Transaction ID :${transaction?.id},`,
            link: "/transactions",
          });
        }

        const balance = Number(response?.balance_after);
        if (balance < 1000) {
          await notifyLowBalance(balance);
        }
      }
    } catch (error) {
      await trx.rollback();

      console.log(error);
      throw new Error("An error has occurred");
    }
  }

  if (
    ["airtime"].includes(transaction.service) &&
    transaction.type === "bulk" &&
    Boolean(transaction.isProcessed) === false
  ) {
    await trx("notifications").insert({
      id: generateId(),
      user_id: transaction.userId,
      type: "airtime",
      title: "Bulk Airtime Transfer",
      body: `Your request to buy bulk ${transaction.service} has been received.Your transaction id is ${transaction?.id}.Thank you for your business with us!`,
      link: "/notifications",
    });
  }

  if (
    transaction?.status === "completed" &&
    transaction.service === "bundle" &&
    Boolean(transaction?.isProcessed) === false
  ) {
    const bundleInfo = {
      recipient: transaction?.recipient,
      data_code: transaction?.data_code,
      network:
        transaction?.network === "mtn-gh"
          ? 4
          : transaction?.network === "vodafone-gh"
            ? 6
            : transaction?.network === "tigo-gh"
              ? 1
              : 0,
      transaction_reference: transaction.paymentReference,
    };

    try {
      const response = await sendBundle(bundleInfo);

      if (["00", "09"].includes(response["status-code"])) {
        await trx("payments")
          .where({ id: transaction.paymentId })
          .update({ is_processed: 1 });

        await trx("notifications").insert({
          id: generateId(),
          user_id: transaction.userId,
          type: "bundle",
          title: "Data Bundle Transfer",
          body: `You have successfully recharged ${transaction.recipient} with data bundle, "${transaction.data_code}","${transaction.volume}", you were charged GHS ${transaction?.amount} .Transaction ID :${transaction?.id}`,
        });

        const balance = Number(response?.balance_after);
        if (balance < 1000) {
          await notifyLowBalance(balance);
        }
      }
    } catch (error) {
      await transx.rollback();

      console.log(error);
      throw new Error("An error has occurred");
    }
  }
}

async function processPrepaid(trx, transaction, info) {
  await trx("notifications").insert({
    id: generateId(),
    user_id: transaction.userId,
    type: "prepaid",
    title: "Prepaid Units",
    body: `Payment made for prepaid meter: ${transaction.number} is being processed. Transaction ID: ${transaction.id}`,
    info: JSON.stringify({ info }),
  });
}

function triggerAsyncProcessing(transaction, categoryType, selectedVouchers) {
  setImmediate(async () => {
    try {
      switch (transaction.service) {
        case "bundle":
          await sendBundleLogic(transaction);
          break;

        case "airtime":
          await sendAirtimeLogic(transaction);
          break;

        case "voucher":
        case "ticket":
          await sendVoucherSMS(
            selectedVouchers,
            transaction,
            transaction.service,
          );
          break;

        case "prepaid":
          await sendElectricityMessage(transaction, transaction.service);
          break;
      }
    } catch (err) {
      console.error("Async processing failed:", err);
    }
  });
}

async function sendBundleLogic(transaction) {
  if (
    transaction.status === "completed" &&
    Boolean(transaction.isProcessed) === true
  ) {
    const message = `You have successfully recharged ${transaction.recipient} with data bundle, "${transaction.data_code}","${transaction.volume}", you were charged GHS ${transaction?.amount} .Transaction ID :${transaction?.id}`;

    const emailPrompt = await sendEMail(
      transaction.email,
      mailTextShell(`<p>${message}</p>`),
      "DATA BUNDLE TRANSFER SUCCESSFUL",
    );

    const SMSPrompt = await sendSMS(message, transaction?.phonenumber);
    await Promise.all([SMSPrompt, emailPrompt]);
  }
}

async function sendAirtimeLogic(transaction) {
  if (transaction.status === "completed") {
    if (Boolean(transaction.isProcessed) === true) {
      if (transaction.type === "single") {
        const message = `You have successfully recharged ${transaction.recipient} with GHS ${transaction.amount} of airtime, you were charged GHS ${transaction.amount}.Transaction ID :${transaction?.id},`;

        const emailPrompt = await sendEMail(
          transaction.email,
          mailTextShell(`<p>${message}</p>`),
          "AIRTIME TRANSFER SUCCESSFUL",
        );

        const SMSPrompt = await sendSMS(message, transaction?.phonenumber);
        await Promise.all([SMSPrompt, emailPrompt]);
      }
    }
    if (transaction.type === "bulk") {
      const recipients = JSON.parse(transaction?.recipient);
      const recipientList = recipients?.map((recipient) => {
        return `${recipient?.type}(${
          recipient?.recipient
        }) at an amount of ${currencyFormatter(recipient?.price)}`;
      });

      const formatter = new Intl.ListFormat("en", {
        style: "long",
        type: "conjunction",
      });
      const formattedList = formatter.format(recipientList);

      await sendSMS(
        `Your request to buy bulk ${transaction.service} has been received.Your transaction id is ${transaction?.id}.Thank you for your business with us!`,
        transaction?.phonenumber,
      );

      const message = `The number ${
        transaction?.phonenumber
      } with Email Address ${
        transaction?.email || ""
      } has successfully made payment to transfer bulk airtime to:
    ${formattedList}.`;
      // console.log(message)

      if (process.env.NODE_ENV === "production") {
        const emailPrompt = await sendEMail(
          process.env.MAIL_CLIENT_USER,
          mailTextShell(`<p>${message}</p>`),
          "REQUEST FOR BULK AIRTIME TRANSFER",
        );

        const SMSPrompt = await sendSMS(
          message,
          process.env.CLIENT_PHONENUMBER,
        );

        await Promise.all([emailPrompt, SMSPrompt]);
      }
    }
  }
}

async function sendVoucherSMS(selectedVouchers, transaction, categoryType) {
  const { phonenumber, email } = transaction;
  if (transaction.status === "completed") {
    if (categoryType === "voucher") {
      const detailsInfo = JSON.parse(selectedVouchers[0]?.details ?? {});
      // console.log(detailsInfo);

      const smsInfo = selectedVouchers.map((voucher) => {
        return `[${voucher?.pin}--${voucher?.serial}]`;
      });
      const smsData = await Promise.all([smsInfo]);

      await sendSMS(
        `${selectedVouchers[0]?.voucherType} ${detailsInfo?.voucherURL}   
[Pin--Serial]
${smsData.join(" ")}.`,
        phonenumber,
      );
    }

    if (categoryType === "ticket") {
      const detailsInfo = JSON.parse(selectedVouchers[0]?.details ?? {});

      const smsInfo = selectedVouchers.map((voucher) => {
        return `[${voucher?.type}--${voucher?.serial || voucher?.pin}]`;
      });
      const smsData = await Promise.all([smsInfo]);

      await sendSMS(
        `${selectedVouchers[0]?.voucherType}   
[Seat No./Type--Serial]
${smsData.join(" ")},  

${moment(detailsInfo?.date)?.format("dddd,Do MMMM,YYYY")},${moment(
          detailsInfo?.time,
        ).format("hh:mm a")},  
${email || ""},${
          phonenumber
        }.Please visit https://www.gpcpins.com/evoucher to print your tickets.
`,
        phonenumber,
      );
    }
  }
}

async function sendElectricityMessage(transaction, type) {
  if (transaction.status === "completed") {
    const message = `The number ${transaction?.phonenumber} with METER NO. '${
      transaction?.number
    }' has successfully made payment to buy PREPAID UNITS at an amount of ${currencyFormatter(
      transaction?.topup,
    )}.`;

    // Send Mail and SMS to the User
    if (transaction?.email) {
      await sendElectricityMail(transaction?.id, transaction?.email, "pending");
    }

    if (transaction?.phonenumber) {
      await sendSMS(
        `Thank you for your purchase! You will be notified shortly after your transaction is complete.Your transaction id is ${transaction?.id}`,
        transaction?.phonenumber,
      );
    }

    const agentMail = await sendEMail(
      process.env.MAIL_CLIENT_USER,
      mailTextShell(message),
      "Prepaid Units",
    );

    limit(() => Promise.all([agentMail]));
  }
}

function formatResponse(transaction, info) {
  return {
    id: transaction.id,
    status: transaction.status,
    email: transaction.email,
    phonenumber: transaction.phonenumber,
    paymentMode: transaction.mode,
    createdAt: transaction.createdAt,
    info,
  };
}

// Fetch transaction based on type and ensure it belongs to the user
async function getTransaction(type, transactionId, transx) {
  let query;
  switch (type) {
    case "voucher":
    case "ticket":
      query = await transx("vw_payments_voucher_transactions")
        .where("id", transactionId)
        .select("*")
        .first();
      break;
    case "prepaid":
      query = await transx("vw_meter_payment_prepaid_transaction_view")
        .select("*")
        .where({
          id: transactionId,
        })
        .first();
      break;
    case "airtime":
      query = await transx("vw_payments_airtime_transactions")
        .select(
          "id",
          "userId",
          "paymentReference",
          "paymentId",
          "kind as type",
          "recipient",
          "email",
          "phonenumber",
          "amount",
          "mode",
          "service",
          "provider as network",
          "createdAt",
          "isProcessed",
          "status",
        )
        .where({ id: transactionId })
        .first();
      break;
    case "bundle":
      query = await transx("vw_payments_bundle_transactions")
        .select(
          "id",
          "userId",
          "paymentReference",
          "paymentId",
          "recipient",
          "phonenumber",
          "amount",
          "mode",
          "volume",
          "service",
          "bundleId as data_code",
          "provider as network",
          "createdAt",
          "isProcessed",
          "status",
        )
        .where({ id: transactionId })
        .first();
      break;
    default:
      return null;
  }
  return query;
}

async function notifyLowBalance(balance) {
  const body = `Your one-4-all top up account balance is running low. Remaining balance: GHS ${balance}. Please recharge.`;

  if (process.env.NODE_ENV === "production") {
    Promise.all([
      sendEMail(
        process.env.MAIL_CLIENT_USER,
        mailTextShell(`<p>${body}</p>`),
        "LOW TOP UP ACCOUNT BALANCE",
      ),
      sendSMS(body, process.env.CLIENT_PHONENUMBER),
    ]).catch((err) =>
      this.logger.error("Low balance notification failed", err),
    );
  }
}
