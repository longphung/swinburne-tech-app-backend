import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { loggerMiddleware } from "./src/logger.js";
import auth from "./src/routes/auth.js";
import rateLimiter from "#src/rate-limiter.js";
import { initDatabase } from "#db.js";

await initDatabase();

const app = express();
const port = process.env.PORT || 5000;

app.use(rateLimiter);
app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(helmet());
app.use(loggerMiddleware);

app.use("/auth", auth);

app.listen(port, () => {
  console.log(`🚀🚀🚀 TechAway Backend app listening on port ${port}! 🚀🚀🚀`);
});
