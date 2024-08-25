require("dotenv").config({ path: ".env" });
const path = require("path");
const compression = require("compression");
const express = require("express");
// const cluster = require('cluster');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const helmet = require("helmet");
const createError = require("http-errors");

// const numCPUs = require('os').cpus().length;

//

//Default server port
const port = process.env.PORT || 5000;

//initialize express
const app = express();

const logRoute = require("./routes/logRoute");
const userRoute = require("./routes/userRoute");
const ticketRoute = require("./routes/ticketRoute");
const verifierRoute = require("./routes/verifierRoute");
const adminRoute = require("./routes/adminRoute");
const agentRoute = require("./routes/agentRoute");
const employeeRoute = require("./routes/employeeRoute");
const meterRoute = require("./routes/meterRoute");
const categoryRoute = require("./routes/categoryRoute");
const voucherRoute = require("./routes/voucherRoute");
const paymentRoute = require("./routes/paymentRoute");
const transactionRoute = require("./routes/transactionRoute");
const messageRoute = require("./routes/messageRoute");
const broadcastMessageRoute = require("./routes/broadcastMessageRoute");
const notificationRoute = require("./routes/notificationRoute");
const { verifyToken } = require("./middlewares/verifyToken");
const verifyReferer = require("./middlewares/verifyReferer");

const whitelist = [
  "https://gpcpins.com",
  "https://www.gpcpins.com",
  "https://admin.gpcpins.com",
  "https://agent.gpcpins.com",
  "https://verification.gpcpins.com",
  "http://192.168.0.175:5000",
  "http://192.168.0.175:5001",
  "http://192.168.0.175:5003",
  "http://192.168.0.175:5004",
  "http://localhost:5001",
  "http://localhost:5002",
  "http://localhost:5003",
  "http://localhost:5004",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5001",
  "http://127.0.0.1:5002",
  "http://127.0.0.1:5003",
  "http://127.0.0.1:5004",
  "https://154.160.23.99:5000",
  "https://154.160.23.99:5001",
  "https://154.160.23.99:5002",
  "https://154.160.23.99:5003",
  "https://154.160.23.99:5004",
  "http://172.20.10.4:5000",
  process.env.CLIENT_URL,
];
const corsOptions = {
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-PINGOTHER",
    "Referer",
    // "x-token",
  ],
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(createError.NotFound("Not available"));
    }
  },
};

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`);
//     cluster.fork();
//   });
// } else {

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.use(cookieParser());
// app.use(cookieParser(process.env.SESSION_ID));

// miiddlewares
if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}

// if (process.env.NODE_ENV !== 'development') {
//  app.use(verifyReferer);
// }

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          "'self'",
          "https://gpcpins.com/",
          "https://www.gpcpins.com/",
          "https://admin.gpcpins.com/",
          "https://agent.gpcpins.com",
          "https://verification.gpcpins.com",
          "https://*.gpcpins.com",
        ],
        scriptSrc: [
          "'self'",
          "https://gpcpins.com/",
          "https://www.gpcpins.com/",
          "https://admin.gpcpins.com/",
          "https://agent.gpcpins.com",
          "https://verification.gpcpins.com",
          "https://*.gpcpins.com",
        ],
        connectSrc: [
          "'self'",
          "https://gpcpins.com/",
          "https://www.gpcpins.com/",
          "https://admin.gpcpins.com/",
          "https://agent.gpcpins.com",
          "https://verification.gpcpins.com",
          "https://*.gpcpins.com",
        ],
        frameSrc: [
          "'self'",
          "https://gpcpins.com/",
          "https://www.gpcpins.com/",
          "https://admin.gpcpins.com/",
          "https://agent.gpcpins.com",
          "https://verification.gpcpins.com",
          "https://*.gpcpins.com",
        ],
        objectSrc: ["'none'"],
        imgSrc: [
          "'self'",
          "https://gpcpins.com/",
          "https://www.gpcpins.com/",
          "https://admin.gpcpins.com/",
          "https://agent.gpcpins.com",
          "https://*.gpcpins.com",
          "https://verification.gpcpins.com",
          "https://cdnjs.cloudflare.com/",
        ],
        styleSrc: [
          "'self'",
          "https://gpcpins.com/",
          "https://fonts.googleapis.com",
          "https://www.gpcpins.com/",
          "https://admin.gpcpins.com/",
          "https://agent.gpcpins.com",
          "https://verification.gpcpins.com",
          "https://*.gpcpins.com",
        ],
        fontSrc: [
          "'self'",
          "https://gpcpins.com/",
          "https://www.gpcpins.com/",
          "https://admin.gpcpins.com/",
          "https://*.gpcpins.com",
          "https://agent.gpcpins.com",
          "https://verification.gpcpins.com",
          "https://fonts.gstatic.com",
        ],
        mediaSrc: [
          "'self'",
          "https://gpcpins.com/",
          "https://www.gpcpins.com/",
          "https://admin.gpcpins.com/",
          "https://agent.gpcpins.com",
          "https://verification.gpcpins.com",
          "https://*.gpcpins.com",
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// app.use(
//   helmet.crossOriginResourcePolicy({
//     policy: 'cross-origin',
//   })
// );

app.use(cors(corsOptions));
app.disable("x-powered-by");

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: false, parameterLimit: 10000 })
);

app.use(compression());

//static folders
app.use("/api/gabs/v1/views", express.static(path.join(__dirname, "views")));
app.use(
  "/api/gabs/v1/receipts",
  express.static(path.join(__dirname, "receipts"))
);
app.use(
  "/api/gabs/v1/reports",
  express.static(path.join(__dirname, "reports"))
);
app.use(
  "/api/gabs/v1/vouchers",
  express.static(path.join(__dirname, "vouchers"))
);
app.use("/api/gabs/v1/images", express.static(path.join(__dirname, "images")));
app.use("/api/gabs/v1/downloads", express.static(path.join(__dirname, "downloads")));

app.use("/", express.static(path.join(__dirname, "public")));

//routes
app.use("/api/gabs/v1/users", userRoute);
app.use("/api/gabs/v1/logs", logRoute);
app.use("/api/gabs/v1/tickets", ticketRoute);
app.use("/api/gabs/v1/verifiers", verifierRoute);
app.use("/api/gabs/v1/admin", adminRoute);
app.use("/api/gabs/v1/agents", agentRoute);
app.use("/api/gabs/v1/category", categoryRoute);
app.use("/api/gabs/v1/voucher", voucherRoute);
app.use("/api/gabs/v1/employees", employeeRoute);

app.use("/api/gabs/v1/meters", verifyToken, meterRoute);
app.use("/api/gabs/v1/payment", paymentRoute);
app.use("/api/gabs/v1/transaction", transactionRoute);
app.use("/api/gabs/v1/notifications", notificationRoute);
app.use("/api/gabs/v1/messages", messageRoute);
app.use("/api/gabs/v1/broadcast-messages",verifyToken, broadcastMessageRoute);

// app.use('/api/gabs/v1/clients', clientRoute);
// app.use('/api/gabs/v1/clients-category', clientCategoryRoute);

if (process.env.NODE_ENV === "production") {
  app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

//error handlers
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  // res.send({
  //   message: err.message,
  // });
  console.log({
    status: err?.status || 500,
    message: err?.message,
    stack: err?.stack,
  });


  if (process.env.NODE_ENV === 'production') {

    res.json('An error has occurred.Try again later');
  } else {


    res.send({
      error: {
        status: err?.status || 500,
        message: err?.message,
        stack: err?.stack,
      },
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);

  // const host = server.address();
  // console.log(host);
});
// }
