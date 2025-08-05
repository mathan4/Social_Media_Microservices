require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const searchRoutes = require("./routes/search-routes");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./eventHandlers/search-event-handlers");

const app = express();
const PORT = process.env.PORT || 3004;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((e) => logger.error("Mongo connection error", e));

// Redis Client
const redisClient = new Redis(process.env.REDIS_URL);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
  }
  next();
});

// ✅ Rate limiting (per IP) for sensitive endpoints
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/search", (req, res, next) => {
  req.redisClient = redisClient; // ✅ pass Redis client to all /api/search routes
  next();
});

// ✅ Apply rate limiter to search endpoint (as example of sensitive endpoint)
app.use("/api/search", sensitiveLimiter);

// Routes
app.use("/api/search", searchRoutes);

// Global Error Handler
app.use(errorHandler);

// Start the server
async function startServer() {
  try {
    await connectToRabbitMQ();

    // Subscribe to events
    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Search service is running on port: ${PORT}`);
    });
  } catch (e) {
    logger.error("Failed to start Search Service", e);
    process.exit(1);
  }
}

startServer();
