import express from "express";
import logger from "../logger.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  logger.info("User signup");
  res.send("User signup");
});

router.post("/login", async (req, res) => {
  logger.info("User login");
  res.send("User login");
});

export default router;
