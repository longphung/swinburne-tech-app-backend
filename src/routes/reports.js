import express from "express";
import passport from "passport";

import {getTechnicianReport} from "#src/services/users.js";
import logger from "#src/logger.js";
import {USERS_ROLE} from "#models/users.js";
import {getRevenueReport} from "#src/services/orders.js";

const router = express.Router()

/**
 * @swagger
 * /technicians:
 *   get:
 *     summary: Get Technicians Report
 *     tags: [Reports]
 *     security:
 *        - bearerAuth: []
 *     description: Retrieve a report of all technicians. Only accessible to admin users.
 *     responses:
 *       200:
 *         description: Successfully retrieved technicians report
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/technicians', passport.authenticate('bearer', { session: false }), async (req, res) => {
  if (!req.user.role.includes(USERS_ROLE.ADMIN)) {
    return res.status(403).send("Forbidden");
  }
  try {
    const technicians = await getTechnicianReport();
    res.status(200).json(technicians);
  } catch (e) {
    console.error(e);
    logger.error(e.message);
    res.status(500).json({ error: e.message });
  }
})
/**
 * @swagger
 * /revenue:
 *   get:
 *     summary: Get Revenue Report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a revenue report. Only accessible to admin users.
 *     responses:
 *       200:
 *         description: Successfully retrieved revenue report
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/revenue', passport.authenticate('bearer', { session: false }), async (req, res) => {
  if (!req.user.role.includes(USERS_ROLE.ADMIN)) {
    return res.status(403).send("Forbidden");
  }
  try {
    const revenue = await getRevenueReport();
    res.status(200).json(revenue);
  } catch (e) {
    console.error(e);
    logger.error(e.message);
    res.status(500).json({ error: e.message });
  }
})
export default router;
