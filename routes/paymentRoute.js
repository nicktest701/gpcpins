const router = require("express").Router();
const { randomUUID, randomBytes } = require("crypto");
const pLimit = require("p-limit");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const _ = require("lodash");
const moment = require("moment");
const { rateLimit } = require("express-rate-limit");
const processVouchers = require("../config/processVouchers");
const asyncHandler = require("express-async-handler");
const puppeteer = require("puppeteer");
//functons
const {
  sendMoney,
  topUpStatus,
  accountBalance,
  getBundleList,
  sendBundle,
  sendAirtime,
} = require("../config/sendMoney");
const sendEMail = require("../config/sendEmail");
const {
  sendTicketMail,
  resendReceiptMail,
  sendReportMail,
} = require("../config/mail");
const { sendSMS } = require("../config/sms");
const generateQRCode = require("../config/qrcode");
const currencyFormatter = require("../config/currencyFormatter");
const sendElectricityMail = require("../config/ecgMail");
const {
  generatePrepaidReceipt,
  generateAgentTransactionRport,
} = require("../config/generatePDF");
const {
  generatePrepaidTemplate,
  generateAgentTransactionTemplate,
} = require("../config/generateVoucherTemplate");
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
const { sendWhatsappMessage } = require("../config/sendWhatsapp");
const { getInternationalMobileFormat } = require("../config/PhoneCode");
const { sendBirthdayWishes } = require("../config/cronMessages");
const { Body } = require("twilio/lib/twiml/MessagingResponse");

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
  max: 15, // 5 requests per windowMs
  message: "Too many requests!. please try again later.",
});

const limit = pLimit(3);

router.get(
  "/vouchers",
  verifyToken,
  rlimit,
  asyncHandler(async (req, res) => {
    const { id: userID } = req.user;
    const { id } = req?.query;

    if (!id || !isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }

    //let

    const trans = await knex("voucher_transactions")
      .where("_id", id)
      .select("*")
      .limit(1);

    if (_.isEmpty(trans)) {
      return res.status(404).json("Invalid request.Try again later");
    }

    let { _id, email, info, vouchers, status, createdAt, updatedAt } = trans[0];

    //Check if voucher pdf already exists
    if (fs.existsSync(path.join(process.cwd(), "/vouchers/", `${id}.pdf`))) {
      await sendTicketMail(id, email, "GPC Vouchers");

      return res.status(200).json({ id: id });
    }

    if (status === "pending" || status == "failed") {
      return res.status(404).json("Payment not completed!");
    }

    const userInfo = JSON.parse(info);
    const userVoucher = JSON.parse(vouchers);

    let soldVouchers = [];

    if (userVoucher?.length > 0) {
      soldVouchers = await knex("vouchers")
        .join("categories", "vouchers.category", "=", "categories._id")
        .whereIn("vouchers._id", userVoucher)
        .select(
          "vouchers._id as _id",
          "vouchers.pin as pin",
          "vouchers.serial as serial",
          "categories._id as categoryId",
          "categories.voucherType as voucherType",
          "categories.price as price",
          "categories.details as details"
        );
    } else {
      soldVouchers = await knex("vouchers")
        .join("categories", "vouchers.category", "=", "categories._id")
        .where({
          "vouchers.category": userInfo?.categoryId,
          "vouchers.status": "new",
          "vouchers.active": 1,
        })
        .select(
          "vouchers._id as _id",
          "vouchers.pin as pin",
          "vouchers.serial as serial",
          "categories._id as categoryId",
          "categories.voucherType as voucherType",
          "categories.price as price",
          "categories.details as details"
        )
        .limit(userInfo?.quantity);
    }

    //if creating new transaction fails
    if (_.isEmpty(soldVouchers)) {
      return res.status(404).json("Error Processing your request!!!");
    }

    const modifiedVoucher = soldVouchers.map(
      ({ voucherType, price, details, serial, pin, _id }) => {
        const detailsInfo = JSON.parse(details);
        return {
          _id,
          voucherType: voucherType,
          formType: detailsInfo?.formType || "",
          price: currencyFormatter(
            userInfo?.type === "waec" ? detailsInfo?.price : price
          ),
          serial,
          pin,
          status: "sold",
          agentName: userInfo?.agentName,
          agentPhoneNumber: userInfo?.agentPhoneNumber,
          agentEmail: userInfo?.agentEmail,
          dataURL: detailsInfo?.voucherURL,
          logo: detailsInfo?.logo,
        };
      }
    );

    const generatedTransaction = {
      info: userInfo,
      _id,
      createdAt,
      updatedAt,
      formattedDate: moment(createdAt).format("Do MMMM YYYY,h:mm a"),
      vouchers: modifiedVoucher,
      status,
    };

    try {
      const result = await processVouchers(generatedTransaction);
      if (result === "done") {
        //Get ids of selected Vouchers
        const soldVouchers_ids = _.map(soldVouchers, "_id");
        //Update Selected Vouchers as SOLD
        await knex("vouchers").whereIn("_id", soldVouchers_ids).update({
          active: 0,
          status: "sold",
        });

        //Update transaction
        await knex("voucher_transactions")
          .where("_id", _id)
          .update({ vouchers: JSON.stringify(soldVouchers_ids) });
        const downloadLink = await uploadVoucherFile(`${_id}.pdf`);

        const result = await knex("voucher_transactions")
          .where("_id", _id)
          .update({
            info: JSON.stringify({
              ...userInfo,
              downloadLink,
            }),
            status: "completed",
          });

        await knex("user_notifications").insert({
          _id: randomUUID(),
          user_id: userID,
          type: "voucher",
          title: modifiedVoucher[0].voucherType + " Voucher",
          message: "Voucher Processing completed!",
          link: downloadLink,
        });

        await sendTicketMail(
          _id,
          userInfo?.agentEmail,
          modifiedVoucher[0]?.voucherType
        );
        const smsData = modifiedVoucher.map((voucher) => {
          return `[${voucher?.pin}---${voucher?.serial}]`;
        });

        await sendSMS(
          `Thank you for your purchase! 
    
${modifiedVoucher[0]?.voucherType}
${modifiedVoucher[0]?.dataURL}
    
[Pin--- Serial]
${smsData.join(" ")}
    
${userInfo?.agentEmail}
${userInfo?.agentPhoneNumber}

Download Voucher here: ${downloadLink}
          `,
          userInfo?.agentPhoneNumber
        );

        // await sendWhatsappMessage({
        //   user: getInternationalMobileFormat(userInfo?.agentPhoneNumber),
        //   message: "Thank you for your purchase!",
        //   media: downloadLink,
        // });
        return res.status(200).json({ id: _id });
      }
    } catch (error) {
      return res.status(500).json("Error processing your vouchers!");
    }
  })
);

router.get(
  "/tickets",
  verifyToken,
  rlimit,
  asyncHandler(async (req, res) => {
    const { id: userID } = req.user;
    const { id } = req?.query;

    if (!id || !isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }

    const trans = await knex("voucher_transactions")
      .where("_id", id)
      .select("*")
      .limit(1);

    if (_.isEmpty(trans)) {
      return res.status(404).json("Invalid request.Try again later");
    }

    let { _id, email, info, vouchers, status, createdAt, updatedAt } = trans[0];

    //Check if voucher pdf already exists
    if (fs.existsSync(path.join(process.cwd(), "/vouchers/", `${id}.pdf`))) {
      await sendTicketMail(id, email, "GPC Tickets");

      return res.status(200).json({ id });
    }

    if (status === "pending" || status == "failed") {
      return res.status(404).json("Payment not completed.!");
    }

    const userInfo = JSON.parse(info);
    const userVoucher = JSON.parse(vouchers);

    const { type, orderNo, categoryId, paymentDetails } = userInfo;

    let tickets = [];

    let soldVouchers = [];
    if (userVoucher?.length > 0) {
      soldVouchers = await knex("vouchers")
        .join("categories", "vouchers.category", "=", "categories._id")
        .whereIn("vouchers._id", userVoucher)
        .select(
          "vouchers._id as _id",
          "vouchers.pin as pin",
          "vouchers.serial as serial",
          "vouchers.type as type",
          "categories._id as categoryId",
          "categories.voucherType as voucherType",
          "categories.price as price",
          "categories.details as details",
          "categories.year as year"
        );
    } else {
      if (["stadium", "cinema"].includes(type)) {
        const vouchers = await Promise.all(
          paymentDetails.tickets.flatMap(async (ticket) => {
            return await knex("vouchers")
              .join("categories", "vouchers.category", "=", "categories._id")
              .where({
                "vouchers.category": categoryId,
                "vouchers.type": ticket?.type,
                "vouchers.status": "new",
                "vouchers.active": 1,
              })
              .select(
                "vouchers._id as _id",
                "vouchers.pin as pin",
                "vouchers.serial as serial",
                "vouchers.type as type",
                "categories._id as categoryId",
                "categories.voucherType as voucherType",
                "categories.price as price",
                "categories.details as details",
                "categories.year as year"
              )
              .limit(ticket?.quantity);
          })
        );

        soldVouchers = _.flatMap(vouchers);
      }
      //Check if tickets are bus
      if (["bus"].includes(type)) {
        soldVouchers = await knex("vouchers")
          .join("categories", "vouchers.category", "=", "categories._id")
          .whereIn("vouchers.type", paymentDetails?.tickets)
          .andWhere({
            "vouchers.category": categoryId,
            "vouchers.status": "new",
            "vouchers.active": 1,
          })
          .select(
            "vouchers._id as _id",
            "vouchers.pin as pin",
            "vouchers.serial as serial",
            "vouchers.type as type",
            "categories._id as categoryId",
            "categories.voucherType as voucherType",
            "categories.price as price",
            "categories.details as details",
            "categories.year as year"
          );
      }
    }

    if (["stadium", "cinema"].includes(type)) {
      const generatedTickets = _.map(
        soldVouchers,
        async ({
          _id,
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
            (item) => item.type === vType
          );

          const code = await generateQRCode(orderNo, _id, pin || serial);

          if (type === "cinema") {
            return {
              _id,
              category: "cinema",
              movie: voucherType || detailsInfo?.movie,
              theatre: detailsInfo?.theatre,
              location: detailsInfo?.location,
              price: currencyFormatter(item?.price),
              date: moment(new Date(detailsInfo?.date)).format("dddd,LL"),
              time: moment(new Date(detailsInfo?.time)).format("hh:mm a"),
              message: detailsInfo?.message,
              year: year,
              type: type || detailsInfo?.type,
              qrCode: code,
              poster: detailsInfo?.cinema,
              companyName: detailsInfo?.companyName || "Gab Powerful Consult",
              status: "sold",
            };
          } else {
            return {
              _id,
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
              type: type || detailsInfo?.type,
              qrCode: code,
              status: "sold",
              homeImage: detailsInfo?.homeImage,
              awayImage: detailsInfo?.awayImage,
              companyName: detailsInfo?.companyName || "Gab Powerful Consult",
            };
          }
        }
      );
      tickets = await Promise.all(generatedTickets);
    }

    if (type === "bus") {
      const generatedTickets = _.map(
        soldVouchers,
        async ({
          _id,
          voucherType,
          price,
          pin,
          serial,
          type,
          details,
          year,
        }) => {
          const detailsInfo = JSON.parse(details);

          const code = await generateQRCode(orderNo, _id, pin || serial);
          return {
            _id,
            category: "bus",
            route: voucherType,
            origin: detailsInfo?.origin,
            destination: detailsInfo?.destination,
            vehicleNo: detailsInfo?.vehicleNo,
            seatNo: type || detailsInfo?.seatNo,
            price: currencyFormatter(price),
            logo: detailsInfo?.logo,
            arrivalTime: moment(new Date(detailsInfo?.report)).format(
              "hh:mm a"
            ),
            departureDate: moment(new Date(detailsInfo?.date)).format(
              "dddd,LL"
            ),
            departureTime: moment(new Date(detailsInfo?.time)).format(
              "hh:mm a"
            ),
            qrCode: code,
            year: year,
            status: "sold",
            companyName: detailsInfo?.companyName || "Gab Powerful Consult",
          };
        }
      );

      tickets = await Promise.all(generatedTickets);
    }

    const generatedTransaction = {
      info: userInfo,
      _id,
      createdAt,
      updatedAt,
      formattedDate: moment(createdAt).format("Do MMMM YYYY,h:mm a"),
      vouchers: tickets,
    };

    try {
      const result = await processVouchers(generatedTransaction);

      if (result === "done") {
        //Get ids of selected Vouchers
        const soldVouchers_ids = _.map(soldVouchers, "_id");

        //Update Selected Vouchers as SOLD
        await knex("vouchers").whereIn("_id", soldVouchers_ids).update({
          active: 0,
          status: "sold",
        });

        //Update transaction
        await knex("voucher_transactions")
          .where("_id", _id)
          .update({ vouchers: JSON.stringify(soldVouchers_ids) });

        const downloadLink = await uploadVoucherFile(`${_id}.pdf`);

        await knex("voucher_transactions")
          .where("_id", _id)
          .update({
            info: JSON.stringify({
              ...userInfo,
              downloadLink,
            }),
            // status: 'completed',
          });

        await knex("user_notifications").insert({
          _id: randomUUID(),
          user_id: userID,
          type: "ticket",
          title: "ticket",
          message: "Tickets have been generated successfully!",
          link: downloadLink,
        });

        await sendTicketMail(_id, userInfo?.agentEmail, "GPC Tickets");

        await sendSMS(
          `Thank you for your purchase! 
    
${userInfo?.agentEmail}
${userInfo?.agentPhoneNumber}

Download Ticket here: ${downloadLink}
          `,
          userInfo?.agentPhoneNumber
        );

        // await sendWhatsappMessage({
        //   user: getInternationalMobileFormat(userInfo?.agentPhoneNumber),
        //   message: "Thank you for your purchase!",
        //   media: downloadLink,
        // });

        return res.status(200).json({ id: _id });
      }
    } catch (error) {
      return res.status(500).json("Error processing your tickets!");
    }
  })
);

// @route   GET api/payment/confirm/:id/:type - Confirm Payment
router.get(
  "/confirm/:id/:type",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id: userID } = req.user;
    const { id, type } = req.params;
    const confirm = req.query?.confirm;

    if (!isValidUUID2(id) || !type) {
      return res.status(402).send("Invalid Request");
    }

    let transaction = [];

    if (type === "voucher" || type === "ticket") {
      transaction = await knex("voucher_transactions")
        .select("_id", "info", "mode", "createdAt", "status")
        .where("_id", id)
        .limit(1);
    }

    if (type === "prepaid") {
      transaction = await knex("prepaid_transactions")
        .select(
          "prepaid_transactions._id as _id",
          "info",
          "meter",
          "mode",
          "email",
          "mobileNo",
          "prepaid_transactions.createdAt as CreatedAt",
          "status",
          "meters.number as number"
        )
        .join("meters", "prepaid_transactions.meter", "=", "meters._id")
        .where("prepaid_transactions._id", id)
        .limit(1);
    }

    if (type === "airtime") {
      transaction = await knex("airtime_transactions")
        .select(
          "_id",
          "type",
          "recipient",
          "phonenumber",
          "amount",
          "mode",
          "provider as network",
          "createdAt",
          "isProcessed",
          "status"
        )
        .where("_id", id)
        .limit(1);
    }

    if (type === "bundle") {
      transaction = await knex("bundle_transactions")
        .select(
          "_id",
          "recipient",
          "phonenumber",
          "amount",
          "mode",
          "bundle_id as data_code",
          "provider as network",
          "createdAt",
          "isProcessed",
          "status"
        )
        .where("_id", id)
        .limit(1);
    }

    //if creating new transaction fails
    if (_.isEmpty(transaction)) {
      return res.status(402).json("Error Processing your request!");
    }

    if (transaction[0].status === "failed") {
      return res.status(402).json("Payment Cancelled!");
    }

    if (transaction[0].status !== "completed") {
      return res.status(402).json("Payment not completed!");
    }

    const info = transaction[0]?.info ? JSON.parse(transaction[0]?.info) : "";
    if (
      ["airtime"].includes(type) &&
      transaction[0].type === "bulk" &&
      Boolean(transaction[0].isProcessed) === false &&
      confirm
    ) {
      await sendSMS(
        `${_.capitalize(type)}
      Your request to buy ${type} has been received.Thank you for purchasing from us!Your transaction id is ${
          transaction[0]?._id
        }`,
        transaction[0]?.phonenumber
      );
    }

    if (
      transaction[0].status === "completed" &&
      type === "bundle" &&
      Boolean(transaction[0].isProcessed) === false &&
      confirm
    ) {
      const transaction_reference = randomBytes(24).toString("hex");
      const bundleInfo = {
        recipient: transaction[0]?.recipient,
        data_code: transaction[0]?.data_code,
        network:
          transaction[0]?.network === "mtn-gh"
            ? 4
            : transaction[0]?.network === "vodafone-gh"
            ? 6
            : transaction[0]?.network === "tigo-gh"
            ? 1
            : 0,
        transaction_reference,
      };

      try {
        const response = await sendBundle(bundleInfo);

        if (response["status-code"] === "00") {
          await knex("bundle_transactions").where("_id", id).update({
            isProcessed: 1,
          });

          await knex("user_notifications").insert({
            _id: randomUUID(),
            user_id: userID,
            type: "bundle",
            title: "Data Bundle Transfer",
            message: `You have successfully recharged ${bundleInfo.recipient} with ${bundleInfo.data_code}, you were charged GHS ${transaction[0]?.amount}`,
          });

          const balance = Number(response?.balance_after);
          if (balance < 1000) {
            const body = `
      Your one-4-all top up account balance is running low.Your remaining balance is GHS ${balance}.
      Please recharge to avoid any inconveniences.
      Thank you.
            `;
            await sendEMail(
              process.env.MAIL_CLIENT_USER,
              mailTextShell(`<p>${body}</p>`),
              "LOW TOP UP ACCOUNT BALANCE"
            );
            await sendSMS(body, process.env.CLIENT_PHONENUMBER);
          }
        }
      } catch (error) {
        // console.log(error?.response?.data);
        return res.status(401).json("An error has occured");
      }
    }

    //Send airtime to customer if transaction is completed!
    if (
      transaction[0].status === "completed" &&
      type === "airtime" &&
      transaction[0].type === "single" &&
      confirm
    ) {
      const transaction_reference = randomBytes(24).toString("hex");
      const airtimeInfo = {
        recipient: transaction[0]?.recipient,
        amount: transaction[0]?.amount,
        network:
          transaction[0]?.network === "mtn-gh"
            ? 4
            : transaction[0]?.network === "vodafone-gh"
            ? 6
            : transaction[0]?.network === "tigo-gh"
            ? 1
            : 0,
        transaction_reference,
      };
      try {
        const response = await sendAirtime(airtimeInfo);
        // res.status(200).json(response);
        // console.log(response);
        if (response["status-code"] === "00") {
          await knex("airtime_transactions").where("_id", id).update({
            isProcessed: 1,
          });

          await knex("user_notifications").insert({
            _id: randomUUID(),
            user_id: userID,
            type: "airtime",
            title: "Airtime Transfer",
            message: `You have successfully recharged ${airtimeInfo.recipient} with GHS ${airtimeInfo.amount} of airtime, you were charged GHS ${airtimeInfo.amount}`,
          });

          const balance = Number(response?.balance_after);
          if (balance < 1000) {
            const body = `
      Your one-4-all top up account balance is running low.Your remaining balance is GHS ${balance}.
      Please recharge to avoid any inconveniences.
      Thank you.
            `;
            await sendEMail(
              process.env.MAIL_CLIENT_USER,
              mailTextShell(`<p>${body}</p>`),
              "LOW TOP UP ACCOUNT BALANCE"
            );
            await sendSMS(body, process.env.CLIENT_PHONENUMBER);
          }
        }
      } catch (error) {
        return res.status(401).json("An error has occurred");
      }
    }

    if (type === "prepaid" && confirm) {
      const message = `The number ${transaction[0]?.mobileNo} with METER NO. '${
        transaction[0]?.number
      }' has successfully made payment to buy PREPAID UNITS at an amount of ${currencyFormatter(
        info?.amount
      )}

  .`;

      await knex("notifications").insert({
        _id: randomUUID(),
        title: "Prepaid Units",
        message,
      });

      const userMail = await sendElectricityMail(
        transaction[0]?._id,
        transaction[0]?.email,
        "pending"
      );
      // Send Mail and SMS to the User
      const userSMS = await sendSMS(
        `Prepaid Units
Thank you for your purchase! You will be notified shortly after your transaction is complete.Your transaction id is ${transaction[0]?._id}`,
        transaction[0]?.mobileNo
      );

      const agentMail = await sendEMail(
        process.env.MAIL_CLIENT_USER,
        mailTextShell(message),
        "Prepaid Units"
      );

      // await sendWhatsappMessage({
      //   user: getInternationalMobileFormat(transaction[0]?.mobileNo),
      //   message:
      //     "Thank you for your purchase!You will be notified shortly after your transaction is complete",
      // });
      limit(() => Promise.all([userMail, userSMS, agentMail]));
    }

    const successfulTransaction = {
      _id: transaction[0]?._id,
      info,
      paymentMode: transaction[0]?.mode,
      createdAt: transaction[0]?.createdAt,
      formattedDate: moment(transaction[0].createdAt).format(
        "Do MMMM YYYY,h:mm a"
      ),
      status: transaction[0].status,
    };

    res.status(200).json(successfulTransaction);
  })
);

// Cancel Payment @route   GET api/transaction/:id
router.get(
  "/cancel/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const type = req.query.type;

    const db =
      type === "airtime"
        ? "airtime_transactions"
        : type === "bundle"
        ? "bundle_transactions"
        : "voucher_transactions";

    await knex(db).where({ _id: id }).update({
      status: "failed",
    });

    res.status(200).json("Payment Cancelled!");
  })
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
  })
);

// Make Voucher / Ticket Payment @route   POST payment/momo

router.post(
  "/momo",
  verifyToken,
  rlimit,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    const {
      category,
      categoryId,
      totalAmount,
      quantity,
      paymentDetails,
      user,
      isWallet,
      token,
    } = req.body;

    if (isWallet) {
      const userWallet = await knex("user_wallets")
        .select("_id", "user_key", "active")
        .where({
          user_id: id,
          user_key: token,
        })
        .limit(1);

      if (_.isEmpty(userWallet)) {
        return res.status(401).json("Invalid pin!");
      }
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json("An unknown error has occurred");
    }

    let selectedVouchers = [];

    //Check if tickets are Stadium tickets or cinema

    if (["stadium", "cinema"].includes(category)) {
      const vouchers = await Promise.all(
        paymentDetails.tickets.flatMap(async (ticket) => {
          return await knex("vouchers")
            .join("categories", "vouchers.category", "=", "categories._id")
            .where({
              "vouchers.category": categoryId,
              "vouchers.type": ticket?.type,
              "vouchers.status": "new",
              "vouchers.active": 1,
            })
            .select("vouchers._id")
            .limit(ticket?.quantity);
        })
      );

      selectedVouchers = _.flatMap(vouchers);
    }
    //Check if tickets are bus
    else if (["bus"].includes(category)) {
      selectedVouchers = await knex("vouchers")
        .join("categories", "vouchers.category", "=", "categories._id")
        .whereIn("vouchers.type", paymentDetails?.tickets)
        .andWhere({
          "vouchers.category": categoryId,
          "vouchers.status": "new",
          "vouchers.active": 1,
        })
        .select("vouchers._id");
    }
    //Check if vouchers are waec,university or security
    else {
      selectedVouchers = await knex("vouchers")
        .join("categories", "vouchers.category", "=", "categories._id")
        .where({
          "vouchers.category": categoryId,
          "vouchers.status": "new",
          "vouchers.active": 1,
        })
        .select("vouchers._id")
        .limit(quantity);
    }

    if (_.isEmpty(selectedVouchers) || selectedVouchers.length < quantity) {
      return res
        .status(404)
        .json("Requested Item not available!.Try again later.");
    }

    const transx = await knex.transaction();

    try {
      const transaction_id = randomUUID();
      const transaction_reference = randomBytes(24).toString("hex");
      const orderNo = randomBytes(20).toString("hex");
      let transactionInfo = {};

      if (isWallet) {
        // Check wallet remaining balance
        const user_balance = await transx("user_wallets")
          .where("user_id", id)
          .select("amount")
          .limit(1);

        if (
          _.isEmpty(user_balance) ||
          Number(user_balance[0]?.amount) < Number(totalAmount)
        ) {
          return res.status(401).json("Error Processing your request!");
        }

        const user_deduction = await transx("user_wallets")
          .where("user_id", id)
          .decrement({
            amount: totalAmount,
          });

        transactionInfo = {
          _id: transaction_id,
          user: id,
          phonenumber: user?.phoneNumber || "",
          email: user?.email || "",
          info: JSON.stringify({
            orderNo,
            categoryId,
            quantity,
            amount: totalAmount,
            agentName: user.name || "",
            agentPhoneNumber: user?.phoneNumber || "",
            agentEmail: user?.email || "",
            type: category,
            domain: ["stadium", "cinema", "bus"].includes(category)
              ? "Ticket"
              : "Voucher",
            paymentDetails: paymentDetails || {},
          }),
          provider: "wallet",
          mode: "Wallet",
          partner: JSON.stringify({
            ResponseCode: user_deduction === 1 ? "0000" : "2000",
            Data: {
              ref: transaction_reference,
            },
          }),
          vouchers: JSON.stringify([]),
          status: user_deduction === 1 ? "completed" : "failed",
          reference: transaction_reference,
        };
      } else {
        const payment = {
          name: user?.name,
          phonenumber: user?.phoneNumber,
          email: user?.email,
          amount: Number(totalAmount).toFixed(2),
          provider: user?.provider,
          transaction_reference,
        };

        const sendMoneyReponse = await sendMoney(payment, "v");

        const status =
          sendMoneyReponse?.ResponseCode === "0000"
            ? "completed"
            : sendMoneyReponse?.ResponseCode === "0001"
            ? "pending"
            : "failed";

        transactionInfo = {
          _id: transaction_id,
          user: id,
          phonenumber: user?.phoneNumber || "",
          email: user?.email || "",
          info: JSON.stringify({
            orderNo,
            categoryId,
            quantity,
            amount: totalAmount,
            agentName: user.name || "",
            agentPhoneNumber: user?.phoneNumber || "",
            agentEmail: user?.email || "",
            provider: user?.provider,
            mode: "Mobile Money",
            type: category,
            domain: ["stadium", "cinema", "bus"].includes(category)
              ? "Ticket"
              : "Voucher",
            paymentDetails: paymentDetails || {},
          }),
          partner: JSON.stringify(sendMoneyReponse?.Data),
          vouchers: JSON.stringify([]),
          status,
          reference: transaction_reference,
        };
      }

      const transaction = await transx("voucher_transactions").insert(
        transactionInfo
      );

      // //if creating new transaction fails
      if (_.isEmpty(transaction)) {
        await transx.rollback();
        return res
          .status(404)
          .json("Error Processing your request!Please try again later.");
      }

      await transx.commit();

      res.status(200).json({ _id: transaction_id });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.log(error);
      }
      await transx.rollback();
      return res.status(500).json("Transaction Failed!Please try again later.");
    }
  })
);

router.post(
  "/resend",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id, email, downloadLink } = req.body;
    await resendReceiptMail(id, email, downloadLink);
    res.sendStatus(200);
  })
);

/**.................Airtime....................... */

router.get(
  "/airtime",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const transactions = await knex("airtime_transactions")
      .select(
        "airtime_transactions._id as _id",
        "airtime_transactions.recipient as recipient",
        "airtime_transactions.email as email",
        "airtime_transactions.phonenumber as phonenumber",
        "airtime_transactions.info as info",
        "airtime_transactions.year as year",
        "airtime_transactions.amount as amount",
        "airtime_transactions.isProcessed as isProcessed",
        "airtime_transactions.active as active",
        "airtime_transactions.createdAt as createdAt",
        "airtime_transactions.status as status"
      )
      .where({ "airtime_transactions.status": "completed", type: "bulk" });

    const modifiedTransactions = transactions.map(
      ({ recipient, info, isProcessed, ...rest }) => {
        return {
          isProcessed: Boolean(isProcessed),
          recipient: JSON.parse(recipient),
          info: JSON.parse(info),
          ...rest,
        };
      }
    );

    const sDate = moment(startDate);
    const eDate = moment(endDate);

    const modifiedPayments = modifiedTransactions.filter(({ createdAt }) => {
      return moment(createdAt).isBetween(sDate, eDate, "days", "[]");
    });

    const sortedPayments = _.orderBy(modifiedPayments, ["createdAt"], ["desc"]);

    res.status(200).json(sortedPayments);
  })
);

// Make Airtime Payment @route   POST payment/airtime
router.post(
  "/airtime",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    if (_.isEmpty(req.body)) {
      return res.status(401).json("Error Processing your request!");
    }

    const {
      type,
      amount,
      recipient,
      phonenumber,
      provider,
      pricing,
      email,
      isWallet,
      token,
    } = req.body;

    if (!type || !["Airtime", "Bulk"].includes(type)) {
      return res.status(401).json("Invalid Request");
    }

    if (isWallet) {
      const userWallet = await knex("user_wallets")
        .select("_id", "user_key", "active")
        .where({
          user_id: id,
          user_key: token,
        })
        .limit(1);

      if (_.isEmpty(userWallet)) {
        return res.status(401).json("Invalid pin!");
      }
    }

    const tranx = await knex.transaction();

    try {
      const transaction_reference = randomBytes(24).toString("hex");
      const transaction_id = randomUUID();
      let transactionInfo = {};

      // Check if the user has a wallet account
      if (isWallet) {
        // Check wallet remaining balance
        const user_balance = await tranx("user_wallets")
          .where("user_id", id)
          .select("amount")
          .limit(1);

        if (
          _.isEmpty(user_balance) ||
          Number(user_balance[0]?.amount) < Number(amount)
        ) {
          return res.status(401).json("Error Processing your request!");
        }

        const user_deduction = await tranx("user_wallets")
          .where("user_id", id)
          .decrement({
            amount: amount,
          });

        transactionInfo = {
          _id: transaction_id,
          user: id,
          type: type === "Airtime" ? "single" : "bulk",
          recipient: recipient || pricing,
          phonenumber,
          email: email,
          amount,
          provider: "wallet",
          mode: "Wallet",
          info: JSON.stringify({
            phonenumber,
            amount,
            pricing: pricing ?? [],
          }),
          partner: JSON.stringify({
            ResponseCode: user_deduction === 1 ? "0000" : "2000",
            Data: {
              ref: transaction_reference,
            },
          }),
          status: user_deduction === 1 ? "completed" : "failed",
          isProcessed: type === "Airtime",
          reference: transaction_reference,
        };
      } else {
        const payment = {
          phonenumber,
          amount: Number(amount).toFixed(2),
          provider,
          transaction_reference,
        };

        const sendMoneyReponse = await sendMoney(payment, "a");

        const status =
          sendMoneyReponse?.ResponseCode === "0000"
            ? "completed"
            : sendMoneyReponse?.ResponseCode === "0001"
            ? "pending"
            : "failed";

        transactionInfo = {
          _id: transaction_id,
          user: id,
          type: type === "Airtime" ? "single" : "bulk",
          recipient: recipient || pricing,
          phonenumber,
          email: email,
          amount,
          provider,
          mode: "Mobile Money",
          info: JSON.stringify({
            phonenumber,
            amount,
            pricing: pricing ?? [],
          }),
          partner: JSON.stringify(sendMoneyReponse?.Data),
          status,
          isProcessed: type === "Airtime",
          reference: transaction_reference,
        };
      }

      const transaction = await tranx("airtime_transactions").insert(
        transactionInfo
      );

      // //if creating new transaction fails
      if (_.isEmpty(transaction)) {
        await tranx.rollback();
        return res.status(404).json("Error Processing your request!");
      }

      await tranx.commit();

      res.status(200).json({ _id: transaction_id });
    } catch (error) {
      await tranx.rollback();
      // console.log(error);
      return res.status(500).json("Transaction Failed!");
    }
  })
);

//Proccess bulk airtime for agents
router.put(
  "/airtime",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id: _id } = req.user;
    // const recipient = req.body;
    const id = req.query.id;

    if (_.isEmpty(id) || !isValidUUID2(id)) {
      return res.status(401).json("Error Processing your request!");
    }

    const transaction = await knex("airtime_transactions")
      .select("recipient")
      .where("_id", id)
      .limit(1);

    if (_.isEmpty(transaction)) {
      return res.status(401).json("Error Processing your request!");
    }

    const recipient = JSON.parse(transaction[0].recipient);

    const list = recipient.map(async (item) => {
      const transaction_reference = randomBytes(24).toString("hex");
      const info = {
        recipient: item?.recipient,
        amount: item?.price,
        network:
          item?.type === "MTN"
            ? 4
            : item?.type === "Vodafone"
            ? 6
            : item?.type === "AirtelTigo"
            ? 1
            : 0,
        transaction_reference,
      };

      return sendAirtime(info);
    });

    Promise.all(list)
      .then(async (data) => {
        await knex("airtime_transactions").where("_id", id).update({
          isProcessed: 1,
        });

        // await knex("user_notifications").insert({
        //   _id: randomUUID(),
        //   user_id: userID,
        //   type: "airtime",
        //   title: "Airtime Transfer",
        //   message: `You have successfully recharged ${airtimeInfo.recipient} with GHS ${airtimeInfo.amount} of airtime, you were charged GHS ${airtimeInfo.amount}`,
        // });

        //logs
        await knex("activity_logs").insert({
          employee_id: _id,
          title: "Processed bulk airtime transaction!",
          severity: "info",
        });

        res.status(200).json(data);

        const balance = await accountBalance();
        if (Number(balance) < 1000) {
          const body = `
Your one-4-all top up account balance is running low.Your remaining balance is GHS ${balance}.
Please recharge to avoid any inconveniences.
Thank you.
          `;
          await sendEMail(
            process.env.MAIL_CLIENT_USER,
            mailTextShell(`<p>${body}</p>`),
            "LOW TOP UP ACCOUNT BALANCE"
          );
        }
      })
      .catch((error) => {
        return res.status(500).json("Transaction Failed!");
      });
  })
);

// Make Bundle Payment @route   POST payment/bundle
router.post(
  "/bundle",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.user;

    if (_.isEmpty(req.body)) {
      return res.status(401).json("Error Processing your request!");
    }

    const {
      type,
      amount,
      recipient,
      phonenumber,
      provider,
      email,
      plan,
      isWallet,
      token,
    } = req.body;

    if (!type || type !== "Bundle") {
      return res.status(401).json("Invalid Request");
    }

    if (isWallet) {
      const userWallet = await knex("user_wallets")
        .select("_id", "user_key", "active")
        .where({
          user_id: id,
          user_key: token,
        })
        .limit(1);

      if (_.isEmpty(userWallet)) {
        return res.status(401).json("Invalid pin!");
      }
    }

    const tranx = await knex.transaction();

    try {
      const transaction_reference = randomBytes(24).toString("hex");
      const transaction_id = randomUUID();
      let transactionInfo = {};

      // Check if the user has a wallet account
      if (isWallet) {
        // Check wallet remaining balance
        const user_balance = await tranx("user_wallets")
          .where("user_id", id)
          .select("amount")
          .limit(1);

        if (
          _.isEmpty(user_balance) ||
          Number(user_balance[0]?.amount) < Number(amount)
        ) {
          return res.status(401).json("Error Processing your request!");
        }

        const user_deduction = await tranx("user_wallets")
          .where("user_id", id)
          .decrement({
            amount: amount,
          });

        transactionInfo = {
          _id: transaction_id,
          user: id,
          recipient,
          email,
          phonenumber,
          reference: transaction_reference,
          bundle_id: plan?.id,
          bundle_name: plan?.name,
          bundle_volume: plan?.volume,
          amount,
          provider: "wallet",
          mode: "Wallet",
          info: JSON.stringify({
            phonenumber,
            amount,
            plan,
          }),
          partner: JSON.stringify({
            ResponseCode: user_deduction === 1 ? "0000" : "2000",
            Data: {
              ref: transaction_reference,
            },
          }),
          status: user_deduction === 1 ? "completed" : "failed",
        };
      } else {
        const payment = {
          phonenumber,
          amount: Number(amount).toFixed(2),
          provider,
          transaction_reference,
        };

        const sendMoneyReponse = await sendMoney(payment, "b");

        const status =
          sendMoneyReponse?.ResponseCode === "0000"
            ? "completed"
            : sendMoneyReponse?.ResponseCode === "0001"
            ? "pending"
            : "failed";

        transactionInfo = {
          _id: transaction_id,
          user: id,
          recipient,
          email,
          phonenumber,
          reference: transaction_reference,
          bundle_id: plan?.id,
          bundle_name: plan?.name,
          bundle_volume: plan?.volume,
          amount,
          provider,
          mode: "Mobile Money",
          info: JSON.stringify({
            phonenumber,
            amount,
            plan,
          }),
          partner: JSON.stringify(sendMoneyReponse?.Data),
          status,
        };
      }

      const transaction = await tranx("bundle_transactions").insert(
        transactionInfo
      );

      //if creating new transaction fails
      if (_.isEmpty(transaction)) {
        await tranx.rollback();
        return res.status(404).json("Error Processing your request!");
      }

      await tranx.commit();
      res.status(200).json({ _id: transaction_id });
    } catch (error) {
      return res.status(500).json("Transaction Failed!");
    }
  })
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
  })
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
  })
);

//Get List of all bundles
router.get(
  "/top-up/bundlelist",
  verifyToken,
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

      res.status(200).json(_.compact(bundles));
    } catch (error) {
      res.status(401).json("An unknown error has occurred");
    }
  })
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
  })
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
  })
);

/**.................Electricity....................... */

router.get(
  "/electricity",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const transactions = await knex("meter_prepaid_transaction_view").where(
      "status",
      "completed"
    );

    const modifiedTransactions = transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        active: transaction?.active,
        email: transaction?.email,
        mobileNo: transaction?.mobileNo,
        year: transaction?.year,
        status: transaction?.status,
        topup: transaction?.topup,
        charges: transaction?.charges,
        isProcessed: Boolean(transaction?.processed),
        createdAt: transaction?.createdAt,
        updatedAt: transaction?.updatedAt,
        info: JSON.parse(transaction?.info),
        meterId: transaction?.meterId,
        meter: {
          _id: transaction?.meterId,
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
  })
);

router.get(
  "/electricity/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !isValidUUID2(id)) {
      return res.status(400).json("Invalid Request!");
    }

    const transaction = await knex("meter_prepaid_transaction_view")
      .select("*")
      .where("_id", id)
      .limit(1);

    if (_.isEmpty(transaction)) {
      return res.status(404).json({});
    }

    res.status(200).json({
      ...transaction[0],
      info: JSON.parse(transaction[0]?.info),
    });
  })
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
        _id: transaction?._id,
        active: transaction?.active,
        email: transaction?.email,
        mobileNo: transaction?.mobileNo,
        year: transaction?.year,
        topup: transaction?.topup,
        charges: transaction?.charges,
        status: transaction?.status,
        isProcessed: Boolean(transaction?.processed),
        createdAt: transaction?.createdAt,
        updatedAt: transaction?.updatedAt,
        info: JSON.parse(transaction?.info),
        meter: {
          _id: transaction?.meterId,
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
  })
);

router.get(
  "/electricity/user/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transactions = await knex("meter_prepaid_transaction_view")
      .where({
        user: id,
        active: 1,
        status: "completed",
      })
      .select("*")
      .orderBy("createdAt", "desc");

    const modifiedTransactions = transactions.map((transaction) => {
      return {
        _id: transaction?._id,
        active: transaction?.active,
        email: transaction?.email,
        mobileNo: transaction?.mobileNo,
        year: transaction?.year,
        mode: transaction?.mode,
        charges: transaction?.charges,
        topup: transaction?.topup,
        status: transaction?.status,
        isProcessed: Boolean(transaction?.processed),
        createdAt: transaction?.createdAt,
        updatedAt: transaction?.updatedAt,
        info: JSON.parse(transaction?.info),
        meter: {
          _id: transaction?.meterId,
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
  })
);

router.post(
  "/electricity",
  verifyToken,
  rlimit,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { meter, info, charges, topup, amount, isWallet, token } = req.body;

    if (isWallet) {
      const userWallet = await knex("user_wallets")
        .select("_id", "user_key", "active")
        .where({
          user_id: id,
          user_key: token,
        })
        .limit(1);

      if (_.isEmpty(userWallet)) {
        return res.status(401).json("Invalid pin!");
      }
    }

    const transx = await knex.transaction();

    let meterId = randomUUID();
    let newMeter;
    if (!isValidUUID2(meter)) {
      newMeter = {
        _id: meterId,
        ...meter,
        user: id ?? randomUUID(),
      };
      await transx("meters").insert(newMeter);
    } else {
      meterId = meter;
    }

    try {
      // Call the API to create a transaction
      const transaction_id = randomUUID();
      const transaction_reference = randomBytes(24).toString("hex");
      let transactionInfo = {};

      if (isWallet) {
        // Check wallet remaining balance
        const user_balance = await transx("user_wallets")
          .where("user_id", id)
          .select("amount")
          .limit(1);

        if (
          _.isEmpty(user_balance) ||
          Number(user_balance[0]?.amount) < Number(amount)
        ) {
          return res.status(401).json("Error Processing your request!");
        }

        const user_deduction = await transx("user_wallets")
          .where("user_id", id)
          .decrement({
            amount,
          });

        transactionInfo = {
          _id: transaction_id,
          user: id,
          meter: meterId,
          email: info?.email,
          mobileNo: info?.mobileNo,
          info: JSON.stringify({
            ...info,
            domain: "Prepaid",
            provider: "wallet",
          }),
          amount,
          charges,
          topup,
          provider: "wallet",
          mode: "Wallet",
          status: user_deduction === 1 ? "completed" : "failed",
          partner: JSON.stringify({
            ResponseCode: user_deduction === 1 ? "0000" : "2000",
            Data: {
              ref: transaction_reference,
            },
          }),
          reference: transaction_reference,
        };
      } else {
        const payment = {
          name: info?.name,
          phonenumber: info?.mobileNo,
          email: info?.email,
          amount: Number(info?.amount).toFixed(2),
          provider: info?.provider,
          transaction_reference,
        };

        const sendMoneyReponse = await sendMoney(payment, "p");

        // Save the Transaction to DB and Send Email
        const status =
          sendMoneyReponse?.ResponseCode === "0000"
            ? "completed"
            : sendMoneyReponse?.ResponseCode === "0001"
            ? "pending"
            : "failed";

        transactionInfo = {
          _id: transaction_id,
          user: id,
          meter: meterId,
          email: info?.email,
          mobileNo: info?.mobileNo,
          info: JSON.stringify({
            ...info,
            domain: "Prepaid",
          }),
          charges,
          topup,
          amount,
          partner: JSON.stringify(sendMoneyReponse?.Data),
          mode: "Mobile Money",
          status,
          reference: transaction_reference,
        };
      }

      const transaction = await transx("prepaid_transactions").insert(
        transactionInfo
      );

      // //if creating new transaction fails
      if (_.isEmpty(transaction)) {
        await transx.rollback();
        return res.status(404).json("Error Processing your request!");
      }

      await transx.commit();

      res.status(201).json({ _id: transactionInfo?._id });
    } catch (error) {
      await transx.rollback();
      return res.status(500).json("Transaction Failed!");
    }
  })
);

//@ Payment callback
router.post(
  "/feedback/callback/:type/:id",
  cors(corsOptions),
  rlimit,
  asyncHandler(async (req, res) => {
    const { id, type } = req.params;

    if (!id || !type || !isValidUUID2(id) || _.isEmpty(req.body)) {
      return res.sendStatus(204);
    }
    const { ResponseCode, Data } = req.body;

    const status =
      ResponseCode === "0000"
        ? "completed"
        : ResponseCode === "0001"
        ? "pending"
        : "failed";

    if (type === "p") {
      await knex("prepaid_transactions")
        .where("reference", Data?.ClientReference)
        .update({
          partner: JSON.stringify(Data),
          status,
        });
    }

    if (type === "v") {
      await knex("voucher_transactions")
        .where("reference", Data?.ClientReference)
        .update({
          partner: JSON.stringify(Data),
          status,
        });
    }

    if (type === "a") {
      await knex("airtime_transactions")
        .where("reference", Data?.ClientReference)
        .update({
          partner: JSON.stringify(Data),
          status,
        });
    }

    if (type === "b") {
      await knex("bundle_transactions")
        .where("reference", Data?.ClientReference)
        .update({
          partner: JSON.stringify(Data),
          status,
        });
    }

    res.sendStatus(201);
  })
);

//Process prepaid transaction
router.put(
  "/electricity",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { _id, meter, meterId, info } = req.body;

    const transx = await knex.transaction();

    await transx("meters")
      .where("_id", meterId)
      .update({
        ...meter,
      });

    const updateTransactionDetails = await transx("prepaid_transactions")
      .where("_id", _id)
      .update({
        info: JSON.stringify({
          ...info,
          domain: "Prepaid",
        }),
        processed: 1,
        issuer: id,
      });

    if (updateTransactionDetails !== 1) {
      return res.status(404).json("Error updating request");
    }

    const transactions = await transx("meter_prepaid_transaction_view")
      .where({
        _id: _id,
        status: "completed",
      })
      .limit(1);

    if (!transactions[0]) {
      return res.status(404).json("Error updating request");
    }

    const issuer = await transx("employees")
      .where("_id", id)
      .select("_id", knex.raw("CONCAT(firstname,' ',lastname) as name"));

    const paymentInfo = JSON.parse(transactions[0]?.info);
    const meterInfo = {
      id: transactions[0]?._id,
      number: transactions[0]?.number,
      name: transactions[0]?.name,
      district: transactions[0]?.district,
      address: transactions[0]?.address,
      topup: currencyFormatter(transactions[0]?.topup),
      charges: currencyFormatter(transactions[0]?.charges),
      amount: currencyFormatter(paymentInfo?.amount),
      paymentMethod: transactions[0]?.mode,
      orderNo: paymentInfo?.orderNo,
      email: paymentInfo?.email,
      mobileNo: paymentInfo?.mobileNo,
      lastCharge: paymentInfo?.lastCharge,
      lastMonthConsumption: paymentInfo?.lastMonthConsumption,
      createdAt: moment(transactions[0].createdAt).format("lll"),
      issuer: issuer[0]?.name || "N/A",
    };

    const template = await generatePrepaidTemplate(meterInfo);
    const result = limit(() => generatePrepaidReceipt(template, _id));

    result
      .then(async (data) => {
        if (data === "done") {
          const downloadLink = await uploadReceiptFile(`${_id}-prepaid.pdf`);

          await transx("prepaid_transactions")
            .where("_id", _id)
            .update({
              info: JSON.stringify({
                ...paymentInfo,
                downloadLink,
              }),
            });

          await transx("user_notifications").insert({
            _id: randomUUID(),
            user_id: transactions[0]?.userID,
            type: "prepaid",
            title: "Prepaid Units",
            message: `You request to buy prepaid units has being completed.Click on the button below to download your receipt.`,
            link: downloadLink,
          });

          await transx.commit();

          //logs
          await knex("activity_logs").insert({
            employee_id: id,
            title: "Processed prepaid transaction!",
            severity: "info",
          });

          // await sendWhatsappMessage({
          //   user: getInternationalMobileFormat(paymentInfo?.mobileNo),
          //   message: "Thank you for your purchase!",
          //   media: downloadLink,
          // });

          limit(() =>
            sendElectricityMail(_id, paymentInfo.email, transactions[0]?.status)
          );

          await sendSMS(
            `Prepaid Units

You request to buy prepaid units has being completed.Thank you for your purchase!
Click on the link below to download your receipt:
${downloadLink}
`,
            paymentInfo?.mobileNo
          );

          return res
            .status(201)
            .json(
              "Your request is being processed.You will be notified shortly!!"
            );
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(404).json("Error updating request");
      });

    // const data = await sendSMS(
    //   `You request to buy prepaid units has being completed.
    //   Thank you for your purchase!
    //   `,
    //   updateTransactionDetails?.info?.mobileNo
    // );
  })
);

router.put(
  "/electricity/delete",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { ids } = req.body;

    const removedTransactions = await knex("prepaid_transactions")
      .whereIn("_id", ids)
      .update({
        active: 0,
      });

    if (removedTransactions !== 1) {
      return res.status(200).json("An error has occurred!");
    }

    res.status(200).json("Transactions removed!");
  })
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
      .where("_id", id)
      .update({
        active: 0,
      });

    if (removedTransaction !== 1) {
      return res.status(200).json("An error has occurred!");
    }

    res.status(200).json("Transaction removed!");
  })
);

router.get(
  "/test/puppeteer",

  asyncHandler(async (req, res) => {
    // await sendBirthdayWishes();

    const transactions = await knex("agent_transactions")
      .where("agent_id", "d9bc3351-d703-45a5-9b8b-b9ec5d74268c")
      .select("*", knex.raw("DATE_FORMAT(createdAt,'%M %d %Y 🔸 %r') AS date"))
      .orderBy("createdAt", "desc");

    const template = await generateAgentTransactionTemplate({ transactions });

    const result = limit(() => generateAgentTransactionRport(template, "134"));
    if (result) {
      const body = ` <div class="container">
<h1>Transactional Report</h1>
<p>Dear [Customer Name],</p>
<p>Attached is your transactional report for the period [Period]. Please review the details below:</p>
<p>If you have any questions or concerns regarding this report, please feel free to contact us.</p>
<p>Thank you for your business!</p>
<p>Sincerely,<br>Gab Powerful Consults</p>
</div>`;

      await sendReportMail(
        "nicktest701@gmail.com",
        mailTextShell(body),
        "134",
        " Transaction Report"
      );
    }

    res.status(200).json("Transaction removed!");
  })
);

module.exports = router;
