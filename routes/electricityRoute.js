const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const _ = require("lodash");
const moment = require("moment");
const { rateLimit } = require("express-rate-limit");
const multer = require("multer");
const {
  verifyToken,
  verifyOptionalToken,
} = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const knex = require("../db/knex");
const { safeJSON } = require("../config/helpers");
const { isValidUUID2 } = require("../config/validation");
const logger = require("../utils/logger");
const { brassicaPost } = require("../services/brassicaClient");
const generateId = require("../config/generateId");
const sendElectricityMail = require("../config/ecgMail");
const { sendSMS } = require("../config/sms");
const { sendPrepaidEmail } = require("../config/mail");
const currencyFormatter = require("../config/currencyFormatter");

const limit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

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

router.get(
  "/",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    // 1. Build the base query with SQL-level filtering and sorting
    let query = knex("vw_meter_payment_prepaid_transaction_view").orderBy(
      "createdAt",
      "desc",
    );

    // 2. Apply database-level date filtering if dates are provided
    if (startDate && endDate) {
      // Formats to 'YYYY-MM-DD 00:00:00' and 'YYYY-MM-DD 23:59:59' to match your inclusive '[]' logic
      const sDate = moment(startDate).startOf("day").toDate();
      const eDate = moment(endDate).endOf("day").toDate();

      query = query.whereBetween("createdAt", [sDate, eDate]);
    }

    const transactions = await query;
    // console.log(transactions)

    // 3. Map the database results into your desired JSON structure
    const sortedPayments = transactions.map((transaction) => {
      // Safe JSON parsing helper
      let parsedInfo = null;
      try {
        parsedInfo = transaction.info ? safeJSON(transaction.info) : null;
      } catch (e) {
        parsedInfo = transaction.info;
      }

      return {
        id: transaction.id,
        paymentId: transaction.paymentId,
        active: transaction.active,
        email: transaction.email,
        phonenumber: transaction.phonenumber,
        year: transaction.year,
        amount: transaction.amount,
        status: transaction.status,
        topup: transaction.topup,
        charges: transaction.charges,
        isProcessed: Boolean(transaction.isProcessed),
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        info: parsedInfo,
        meterId: transaction.meterId,
        meter: {
          id: transaction.meterId,
          number: transaction.number,
          providerName: transaction.providerName,
          name: transaction.name,
          type: transaction.type,
          district: transaction.district,
          address: transaction.address,
          geoCode: transaction.geoCode,
          accountNumber: transaction.accountNumber,
        },
      };
    });

    res.status(200).json(sortedPayments);
  }),
);

router.get(
  "/payment/status/:id",
  verifyOptionalToken,
  asyncHandler(async (req, res) => {
    const { id: transactionId } = req.query;
    const { id } = req.params;

    // 1. Strict Validation Check
    if (!id || !transactionId) {
      return res
        .status(400)
        .json({ message: "Invalid payment identifier format." });
    }

    // 2. Fetch payment record
    const payment = await knex("payments").select("*").where("id", id).first();

    // 3. Proper Existence Validation
    if (!payment) {
      return res
        .status(404)
        .json({ message: "Payment transaction record not found." });
    }

    // 4. Return early for non-success statuses to save database and network load
    if (payment.status === "pending") {
      return res.status(200).json({
        statusCode: "200",
        status: "pending",
        message: "Payment transaction is still processing.",
      });
    }

    if (payment.status === "failed") {
      return res.status(200).json({
        statusCode: "200",
        status: "failed",
        message: "Payment transaction processing failed.",
      });
    }

    // 5. Check if already processed locally to serve instantly
    if (Boolean(payment.is_processed)) {
      const transactionDetails = await knex("electricity_transactions")
        .select("info")
        .where("payment_id", id)
        .first();

      const responseDetails = safeJSON(transactionDetails?.info);

      return res.status(200).json({
        statusCode: "200",
        status: "success",
        message: "Bill Payment processed successfully.",
        paymentResponseDetails: {
          rechargeToken: responseDetails?.rechargeToken || "N/A",
          receipt: responseDetails?.receipt || responseDetails?.receiptNumber || "N/A",
          amount: Number(responseDetails?.amount || 0),
          openingBalance: Number(responseDetails?.openingBalance || 0),
          closingBalance: Number(responseDetails?.closingBalance || 0),
          receiptUrl: responseDetails?.receiptUrl || "",
        },
      });
    }

    // 6. Execute External Network Call for Unprocessed, non-pending records
    const paymentPayload = safeJSON(payment?.partner);

    logger.info(
      `[ECGPay] meter=${paymentPayload?.billRequest?.accountNumber} category=PREPAID amount=${paymentPayload?.paymentDetails?.amount} by=${paymentPayload?.paymentDetails?.accountName}`,
    );

    try {
      const paymentResponse = await brassicaPost("/billerPayment", paymentPayload);

      if (
        paymentResponse?.status !== "Success" ||
        paymentResponse?.statusCode !== "200"
      ) {
        return res.status(422).json({ message: "Provider transaction failed" });
      }

      const responseDetails = paymentResponse?.paymentResponseDetails || {};

      // 7. Atomically finalize database status using a transaction block
      let transactionDetails;
      await knex.transaction(async (trx) => {
        await trx("payments")
          .update({ is_processed: true })
          .where("id", id);

        await trx("electricity_transactions")
          .update({
            info: JSON.stringify({
              domain: "Prepaid",
              downloadLink: responseDetails?.receiptUrl,
              ...responseDetails,
            }),
          })
          .where("id", transactionId);

        // Fetch details within transaction context to ensure consistency
        transactionDetails = await trx("electricity_transactions")
          .select("email", "phonenumber")
          .where("payment_id", id)
          .first();

        if (payment?.user_id) {
          await trx("notifications").insert({
            id: generateId(),
            user_id: payment?.user_id,
            type: "prepaid",
            title: "Prepaid Units",
            body: `Payment made for prepaid meter: ${paymentPayload?.billRequest?.accountNumber} is completed. Recharge Token: ${responseDetails?.rechargeToken || "N/A"}. Receipt: ${responseDetails?.receiptUrl || "N/A"}`,
            link: responseDetails?.receiptUrl,
            info: JSON.stringify({ downloadLink: responseDetails?.receiptUrl }),
          });
        }
      });

      // 8. Send Immediate Response
      res.status(200).json({
        statusCode: "200",
        status: "success",
        message: "Bill Payment processed successfully.",
        paymentResponseDetails: {
          rechargeToken: responseDetails?.rechargeToken || "N/A",
          receipt: responseDetails?.receipt || responseDetails?.receiptNumber || "N/A",
          amount: Number(responseDetails?.amount || 0),
          openingBalance: Number(responseDetails?.openingBalance || 0),
          closingBalance: Number(responseDetails?.closingBalance || 0),
          receiptUrl: responseDetails?.receiptUrl || "",
        },
      });

      // 9. Fire Asynchronous Messaging Tasks
      setImmediate(async () => {
        try {
          const transaction = {
            transactionId: paymentPayload?.billRequest?.transactionId,
            number: paymentPayload?.billRequest?.accountNumber,
            name: paymentPayload?.paymentDetails?.accountName,
            amount: responseDetails?.amount,
            token: responseDetails?.rechargeToken,
            email: transactionDetails?.email,
            phonenumber: paymentPayload?.billRequest?.phoneNumber || transactionDetails?.phonenumber,
            userId: payment?.user_id,
            status: "completed",
          };

          await sendElectricityMessage(transaction);
        } catch (bgError) {
          logger.error("[ECGPay Background Notification Error]:", bgError);
        }
      });

    } catch (apiError) {
      logger.error("[ECGPay API Error]:", apiError);
      return res.status(422).json({ message: "Provider transaction failed" });
    }
  }),
);


router.get(
  "/:id",
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
  "/meter/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transactions = await knex("vw_meter_payment_prepaid_transaction_view")
      .where({
        meterId: id,
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
        mobileNo: transaction?.phonenumber,
        year: transaction?.year,
        topup: transaction?.topup,
        charges: transaction?.charges,
        amount: transaction?.amount,
        status: transaction?.status,
        is_processed: Boolean(transaction?.isProcessed),
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
  "/user/:id",
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

// Process prepaid transaction
router.put(
  "/",
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
      logger.error(error);
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
    //   logger.error(error);
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
  "/delete",
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
  "/:id",
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

async function sendElectricityMessage(transaction) {
  if (transaction.status === "completed") {
    const message = `Thank you for your purchase! ID: ${transaction?.transactionId}. METER NO: ${transaction?.number} (${transaction?.name}) has successfully purchased PREPAID UNITS at an amount of ${currencyFormatter(transaction?.amount)}. Your TOKEN is: ${transaction?.token}.`;

    // Send Mail and SMS to the User
    if (transaction?.email) {
      await sendPrepaidEmail(transaction);
    }

    if (transaction?.phonenumber) {
      await sendSMS(message, transaction?.phonenumber);
    }
  }
}

module.exports = router;
