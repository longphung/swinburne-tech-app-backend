import express from "express";
import Joi from "joi";
import logger from "../logger.js";
import mailer from "#src/mailer.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const reqSchema = Joi.object({
    email: Joi.string().email().required(),
    /**
     * Password must be at least 8 characters long
     * and contain at least one uppercase letter,
     * and one lowercase letter,
     * and one number,
     * and one special character
     */
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
      .required(),
  });
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
