import express from "express";
import Joi from "joi";
import logger from "../logger.js";
import mailer from "#src/mailer.js";
import { USERS_ROLE } from "#models/users.js";

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
    role: Joi.string().valid(USERS_ROLE.ADMIN, USERS_ROLE.CUSTOMER, USERS_ROLE.TECHNICIAN).required(),
    name: Joi.string().required(),
    address: Joi.string(),
    phone: Joi.string().pattern(/[0-9]+/),
  });
});

router.post("/login", async (req, res) => {
  logger.info("User login");
  res.send("User login");
});

export default router;
