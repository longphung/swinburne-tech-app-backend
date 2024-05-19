import express from "express";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import cors from "cors";

import { loggerMiddleware } from "./src/logger.js";
import auth from "./src/routes/auth.js";
import rateLimiter from "#src/rate-limiter.js";
import { initDatabase } from "#db.js";
import users from "#routes/users.js";
import swagger from "#src/swagger.js";
import services from "#routes/services.js";
import checkout from "#routes/checkout.js";
import serviceLevelAgreement from "#routes/service-level-agreement.js";
import orders from "#routes/orders.js";
import tickets from "#routes/tickets.js";

await initDatabase();

const app = express();
const port = process.env.PORT || 5000;

app.use(rateLimiter);
app.use(
  cors({
    origin: [process.env.APP_URL, process.env.FRONTEND_URL],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
  }),
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

app.use(helmet());
app.use(loggerMiddleware);

app.get("/healthcheck", (req, res) => {
  return res.status(204).send("Ok");
});
app.use(
  "/api-docs",

  swaggerUi.serve,
  swaggerUi.setup(swagger, {
    explorer: true,
  }),
);
app.use("/auth", auth);
app.use("/users", users);
app.use("/services", services);
app.use("/checkout", checkout);
app.use("/service-level-agreements", serviceLevelAgreement);
app.use("/orders", orders);
app.use("/tickets", tickets);

app.listen(port, () => {
  console.log(`🚀🚀🚀 TechAway Backend app listening on port ${port}! 🚀🚀🚀`);
});
