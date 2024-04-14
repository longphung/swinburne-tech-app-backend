import express from "express";
import logger from "../logger.js";
import mailer from "#src/mailer.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  logger.info("User signup");
  const result = await mailer.sendMail({
    from: process.env.SMTP_USER,
    to: req.body.email,
    subject: "Welcome to TechAway",
    html: "<h1>Welcome to TechAway</h1>",
  });
  logger.info(result);
  res.send("User signup");
});

router.post("/login", async (req, res) => {
  logger.info("User login");
  res.send("User login");
});

export default router;
