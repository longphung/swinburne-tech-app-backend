import express from "express";
import Joi from "joi";
import logger from "../logger.js";
import { USERS_ROLE } from "#models/users.js";
import {
  confirmEmail,
  forgotPassword,
  login,
  refreshAccessToken,
  resendConfirmationEmail,
  resetPassword,
  signUp,
} from "#src/services/auth.js";
import passport from "passport";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const reqSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string()
      .pattern(/^[\w-.]+(\+\w+)*@([\w-]+\.)+[\w-]{2,4}$/)
      .required(),
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
    return res.status(400).send("Invalid request body");
  }
  try {
    const userId = await signUp(req.body);
    return res.status(201).send({ userId });
  } catch (e) {
    logger.error(e.message);
    if (e.code === 11000) {
      return res.status(400).send("Email already exists");
    }
    return res.status(500).send("Internal server error");
  }
});

router.post("/resend-confirmation-email", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).send("Username is required");
  }
  try {
    await resendConfirmationEmail(username);
    return res.status(200).send("Email sent");
  } catch (e) {
    logger.error(e.message);
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
    const tokens = await login(req.user);
    res.send(tokens);
  } catch (e) {
    logger.error(e.message);
    if (e.message.includes('"exp" claim timestamp check failed')) {
      // TODO: Redirect to resend confirmation email page
      return res.status(401).send("Token expired");
    }
    if (e.message === "Email not verified") {
      return res.status(401).send("Email not verified");
    }
    return res.status(500).send("Internal server error");
  }
});

router.post("/token", async (req, res) => {
  try {
    // Get the refresh token from the body
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).send("Refresh token is required");
    }
    const { refreshTokenExpiresIn: _rt, ...tokens } = await refreshAccessToken(refreshToken);
    res.send(tokens);
  } catch (e) {
    logger.error(e.message);
    if (e.message.includes('"exp" claim timestamp check failed')) {
      return res.status(401).send("Token expired");
    }
    if (e.message === "Refresh token is already used") {
      return res.status(401).send(e.message);
    }
    return res.status(500).send("Internal server error");
  }
});

router.put("/token", async (req, res) => {
  try {
    // Get the refresh token from the body
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).send("Refresh token is required");
    }
    return res.send({ status: "success" });
  } catch (e) {
    logger.error(e.message);
    return res.status(500).send("Internal server error");
  }
});

router.post("/forgot-password", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).send("Username is required");
  }
  try {
    await forgotPassword(username);
    return res.status(200).send("Email sent");
  } catch (e) {
    logger.error(e.message);
    return res.status(500).send("Internal server error");
  }
});

router.post("/reset-password", async (req, res) => {
  const reqSchema = Joi.object({
    password: Joi.string()
      .min(8)
      .pattern(/[A-Z]+/, "uppercase")
      .pattern(/[a-z]+/, "lowercase")
      .pattern(/[0-9]+/, "number")
      .pattern(/[^A-Za-z0-9]+/, "special")
      .required(),
    token: Joi.string().required(),
  });
  const result = reqSchema.validate(req.body);
  if (result.error) {
    logger.error(result.error);
    return res.status(400).send("Invalid request body");
  }
  try {
    const { token, password } = req.body;
    const user = await resetPassword(token, password);
    return res.status(200).send({ username: user.username });
  } catch (e) {
    console.error(e);
    logger.error(e.message);
    if (e.message.includes('"exp" claim timestamp check failed')) {
      // TODO: Redirect to resend forgot password email page
      return res.status(401).send("Token expired");
    }
    return res.status(500).send("Internal server error");
  }
});

export default router;
