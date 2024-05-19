import express from "express";
import passport from "passport";
import {getTechnicianReport} from "#src/services/users.js";
import logger from "#src/logger.js";

const router = express.Router()

router.get('/technicians', passport.authenticate('bearer', { session: false }), async (req, res) => {
  try {
    const technicians = await getTechnicianReport();
    res.status(200).json(technicians);
  } catch (e) {
    console.error(e);
    logger.error(e.message);
    res.status(500).json({ error: e.message });
  }
})
export default router;
