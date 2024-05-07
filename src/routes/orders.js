import express from "express";
import Joi from "joi";
import passport from "passport";

import { cancelOrder, getOrder, getOrdersList, updateOrder } from "#src/services/orders.js";
import logger from "#src/logger.js";
import { USERS_ROLE } from "#models/users.js";

const router = express.Router();
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get list of orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a list of orders with pagination and sorting options
 *     parameters:
 *       - in: query
 *         name: _start
 *         schema:
 *           type: integer
 *         required: true
 *         description: Start index for pagination
 *       - in: query
 *         name: _end
 *         schema:
 *           type: integer
 *         required: true
 *         description: End index for pagination
 *       - in: query
 *         name: _sort
 *         schema:
 *           type: string
 *         description: Sorting field
 *       - in: query
 *         name: _order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sorting order
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get("/", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.user.role.includes(USERS_ROLE.ADMIN)) {
    req.query.customerId = req.user.id;
  }
  const schema = Joi.object({
    // pagination
    _start: Joi.number().required(),
    _end: Joi.number().required(),
    _sort: Joi.string(),
    _order: Joi.string(),
  });
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: "Invalid body" });
  }
  try {
    const orders = await getOrdersList(req.query);
    res.set("x-total-count", orders.totalDocs);
    res.status(200).send(orders.docs);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send("Error retrieving orders");
  }
});
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve an order by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  const query = { _id: req.params.id };
  if (!req.user.role.includes(USERS_ROLE.ADMIN)) {
    query.customerId = req.user.id;
  }
  if (!req.params.id) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  try {
    const order = await getOrder(query);
    res.status(200).send(order);
  } catch (error) {
    if (error.message === "Order not found") {
      return res.status(404).json({ error: error.message });
    }
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Update an existing order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     description: Update an existing order by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Updated order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal Server Error
 */
router.patch("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  const query = { _id: req.params.id };
  if (!req.user.role.includes(USERS_ROLE.ADMIN)) {
    query.customerId = req.user.id;
  }
  if (!req.params.id) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  try {
    const order = await updateOrder(query, req.body);
    res.status(200).send(order);
  } catch (e) {
    if (e.message === "Order not found") {
      return res.status(404).json({ error: e.message });
    }
    logger.error(e.message);
    res.status(500).json({ error: e.message });
  }
});
/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Cancel an order
 *     description: Cancel an order by its ID, setting the status to "cancelled" and cancelling all associated tickets
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  const query = { _id: req.params.id };
  if (!req.user.role.includes(USERS_ROLE.ADMIN)) {
    query.customerId = req.user.id;
  }
  if (!req.params.id) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  try {
    const order = await cancelOrder(query);
    res.status(200).send(order);
  } catch (e) {
    if (e.message === "Order not found") {
      return res.status(404).json({ error: e.message });
    }
    logger.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
