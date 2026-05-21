require("dotenv").config({ path: ".env" });
const path = require("path");
const compression = require("compression");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const helmet = require("helmet");
const createError = require("http-errors");
const cron = require("node-cron");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const toobusy = require("toobusy-js");

// Route imports
const logRoute = require("./routes/logRoute");
const walletRoute = require("./routes/walletRoute");
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
const sendEMail = require("./config/sendEmail");
const knex = require("./db/knex");

// Default server port
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
console.log(`Starting server in ${NODE_ENV} mode...`);

// Initialize express
const app = express();

// Security middleware setup
app.set("trust proxy", 1);
app.set("view engine", "ejs");

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Additional security middleware
app.use(hpp()); // Protect against HTTP Parameter Pollution attacks
// app.use(mongoSanitize()); // Prevent MongoDB operator injection

// CORS configuration
const whitelist = [
  "https://gpcpins.com",
  "https://www.gpcpins.com",
  "https://admin.gpcpins.com",
  "https://agent.gpcpins.com",
  "https://verification.gpcpins.com",
  process.env.CLIENT_URL,
  // Add other domains only if absolutely necessary
];

// In development, allow localhost and local IPs
if (NODE_ENV === "development") {
  whitelist.push(
    "http://localhost:5000",
    "http://localhost:5001",
    "http://localhost:5002",
    "http://localhost:5003",
    "http://localhost:5004",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5001",
    "http://127.0.0.1:5002",
    "http://127.0.0.1:5003",
    "http://127.0.0.1:5004",
    "http://192.168.0.155:5000",
    "http://192.168.0.155:5001",
    "http://192.168.0.155:5003",
    "http://192.168.0.155:5004",
    "http://172.20.10.4:5000"
  );
}

const corsOptions = {
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-PINGOTHER",
    "Referer",
  ],
  credentials: true,
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(createError.Forbidden("Not allowed by CORS"));
    }
  },
};

// Cookie parser with secret
app.use(
  cookieParser(process.env.COOKIE_SECRET || "fallbackSecretChangeInProduction")
);

// Middlewares
if (NODE_ENV === "development") {
  app.use(logger("dev"));
} else {
  app.use(logger("combined")); // More detailed logging in production
}

// Security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

// Prevent the server from being too busy
app.use((req, res, next) => {
  if (toobusy()) {
    res.status(503).send("Server too busy. Please try again later.");
  } else {
    next();
  }
});

app.use(cors(corsOptions));
app.disable("x-powered-by");

// Body parsing middleware with limits
app.use(
  express.json({
    limit: "10mb", // Reduced from 50mb to prevent DoS attacks
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        throw createError.BadRequest("Invalid JSON");
      }
    },
  })
);

app.use(
  express.urlencoded({
    limit: "10mb", // Reduced from 50mb
    extended: true,
    parameterLimit: 50, // Reduced from 10000
  })
);

app.use(compression());

// Static files with security considerations
const staticOptions = {
  dotfiles: "ignore",
  etag: true,
  index: false,
  maxAge: "1d",
  redirect: false,
  setHeaders: (res, path) => {
    // Set security headers for static files
    res.set("x-timestamp", Date.now());
  },
};

app.use(
  "/api/gabs/v1/views",
  express.static(path.join(__dirname, "views"), staticOptions)
);
app.use(
  "/api/gabs/v1/receipts",
  express.static(path.join(__dirname, "receipts"), staticOptions)
);
app.use(
  "/api/gabs/v1/reports",
  express.static(path.join(__dirname, "reports"), staticOptions)
);
app.use(
  "/api/gabs/v1/vouchers",
  express.static(path.join(__dirname, "vouchers"), staticOptions)
);
app.use(
  "/api/gabs/v1/images",
  express.static(path.join(__dirname, "images"), staticOptions)
);
app.use(
  "/api/gabs/v1/downloads",
  express.static(path.join(__dirname, "downloads"), staticOptions)
);
app.use("/", express.static(path.join(__dirname, "public"), staticOptions));

// Cron job for server health checks
if (NODE_ENV === "production") {
  cron.schedule("0 6,9,12,15,18,21 * * *", () => {
    sendEMail(
      "nicktest701@gmail.com",
      `Server health check at ${new Date().toUTCString()}`,
      "GPC Server Update"
    ).catch((err) => console.error("Cron job email error:", err.message));
  });
}

// Routes
app.use("/api/gabs/v1/users", userRoute);
app.use("/api/gabs/v1/wallet", walletRoute);
app.use("/api/gabs/v1/logs", logRoute);
app.use("/api/gabs/v1/tickets", ticketRoute);
app.use("/api/gabs/v1/verifiers", verifierRoute);
app.use("/api/gabs/v1/admin", adminRoute);
app.use("/api/gabs/v1/agents", agentRoute);
app.use("/api/gabs/v1/category", categoryRoute);
app.use("/api/gabs/v1/voucher", voucherRoute);
app.use("/api/gabs/v1/employees", employeeRoute);
app.use("/api/gabs/v1/meters", meterRoute);
app.use("/api/gabs/v1/payment", paymentRoute);
app.use("/api/gabs/v1/transaction", transactionRoute);
app.use("/api/gabs/v1/notifications", notificationRoute);
app.use("/api/gabs/v1/messages", messageRoute);
app.use("/api/gabs/v1/broadcast-messages", verifyToken, broadcastMessageRoute);

// Health check endpoint
app.get("/api/gabs/v1/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve frontend in production
if (NODE_ENV === "production") {
  app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

// 404 handler
app.use((req, res, next) => {
  next(createError.NotFound());
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;

  console.log(err);
  // Log error
  console.error({
    status,
    message: err.message,
    stack: NODE_ENV === "development" ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Don't expose internal errors in production
  const message =
    status === 500 && NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again later."
      : err.message;

  res.status(status).json({
    error: {
      status,
      message,
    },
  });
});

// Process event handlers for graceful shutdown
process.on("uncaughtException", (err) => {
  console.error("Unhandled Exception:", err);
  // In production, we might want to restart the process here
  if (NODE_ENV === "production") {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  try {
    await knex.destroy();
    console.log("Database connection closed.");

    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);
  } catch (err) {
    console.error("Error during shutdown:", err.message);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Set timeout
server.setTimeout(120000); // 2 minutes
