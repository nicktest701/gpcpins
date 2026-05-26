// import knex from "../db/knex";
// const redisClient = require("./redisClient");

// export const paymentWorker = new Worker(
//   "payment-events",
//   async (job) => {
//     const { reference, status } = job.data;

//     const events = await knex("payment_outbox_events")
//       .where({ aggregate_id: reference })
//       .andWhere({ status: "pending" });

//     for (const event of events) {
//       const payload =
//         typeof event.payload === "string"
//           ? JSON.parse(event.payload)
//           : event.payload;

//       switch (event.event_type) {
//         case "payment.success":
//           await handlePaymentSuccess(payload);
//           break;

//         case "payment.failed":
//           await handlePaymentFailure(payload);
//           break;

//         case "payment.audit":
//           await logPaymentAudit(payload);
//           break;
//       }

//       // mark processed
//       await knex("payment_outbox_events")
//         .where({ id: event.id })
//         .update({ status: "processed" });
//     }
//   },
//   {
//     connection: redisClient,
//     concurrency: 10,
//   },
// );
