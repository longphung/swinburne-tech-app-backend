import express from "express";
import Joi from "joi";
import logger from "../logger.js";
import { USERS_ROLE } from "#models/users.js";
import { confirmEmail, processLogin, signUp } from "#src/services/auth.js";
import passport from "passport";

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
      .min(8)
      .pattern(/[A-Z]+/, "uppercase")
      .pattern(/[a-z]+/, "lowercase")
      .pattern(/[0-9]+/, "number")
      .pattern(/[^A-Za-z0-9]+/, "special")
      .required(),
    // Only allow CUSTOMER and TECHNICIAN roles
    role: Joi.string().valid(USERS_ROLE.CUSTOMER, USERS_ROLE.TECHNICIAN).required(),
    name: Joi.string(),
    address: Joi.string(),
    phone: Joi.string().pattern(/[0-9]+/),
  });
  const result = reqSchema.validate(req.body);
  if (result.error) {
    logger.error(result.error);
    return res.status(400).send(result.error);
  }
  try {
    const user = await signUp(req.body);
    return res.status(201).send(user);
  } catch (e) {
    logger.error(e.message);
    if (e.code === 11000) {
      return res.status(400).send(e.message);
    }
    return res.status(500).send("Internal server error");
  }
});

router.get("/confirm", async (req, res) => {
  // If query param doesn't have token then return 400
  if (!req.query.token) {
    return res.status(400).send("Token is required");
  }
  try {
    const user = await confirmEmail(req.query.token);
    // Redirect to login page of the React app
    const redirectURL = new URL("/login", process.env.FRONTEND_URL);
    redirectURL.searchParams.append("username", user.username);
    return res.redirect(redirectURL.toString());
  } catch (e) {
    logger.error(e.message);
    return res.status(500).send("Internal server error");
  }
});

router.post("/login/password", passport.authenticate("local", { session: false }), async (req, res) => {
  try {
    const tokens = await processLogin(req.user);
    res.send(tokens);
  } catch (e) {
    logger.error(e.message);
    return res.status(500).send("Internal server error");
  }
});

export default router;
