import express from "express";
import helmet from "helmet";
import cors from "cors";

import { loggerMiddleware } from "./src/logger.js";
import auth from "./src/routes/auth.js";
import rateLimiter from "#src/rate-limiter.js";
import { initDatabase } from "#db.js";

await initDatabase();

const app = express();
const port = process.env.PORT || 5000;

app.use(rateLimiter);
app.use(
  cors({
    origin: [process.env.APP_URL, process.env.FRONTEND_URL],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(helmet());
app.use(loggerMiddleware);

app.get("/healthcheck", (req, res) => {
  return res.status(204).send("Ok");
});
app.use("/auth", auth);

app.listen(port, () => {
  console.log(`🚀🚀🚀 TechAway Backend app listening on port ${port}! 🚀🚀🚀`);
});
