import mongoose from "mongoose";
import express from "express";
import logger, { loggerMiddleware } from "./src/logger.js";
import helmet from "helmet";
import auth from "./src/routes/auth.js";
import rateLimiter from "#src/rate-limiter.js";

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI, {
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  })
  .then(() => {
    logger.info("Database Connected Successfully");
  })
  .catch(() => {
    logger.error("Database cannot be Connected");
  });

const app = express();
const port = process.env.PORT || 5000;

app.use(rateLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(helmet());
app.use(loggerMiddleware);

app.use("/auth", auth);

app.listen(port, () => {
  console.log(`🚀🚀🚀 TechAway Backend app listening on port ${port}! 🚀🚀🚀`);
});
