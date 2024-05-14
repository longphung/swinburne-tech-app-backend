import express from "express";
import passport from "passport";
import { USERS_ROLE } from "#models/users.js";
import Joi from "joi";
import { deleteTicket, getTicket, getTicketsList, updateTicket } from "#src/services/tickets.js";
import logger from "#src/logger.js"; // Import the Ticket model

const router = express.Router();

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get a list of tickets
 *     tags: [Tickets]
 *     description: Retrieve a list of tickets. If the user is an admin, all tickets will be retrieved. Otherwise, only tickets related to the user will be retrieved.
 *     parameters:
 *       - in: query
 *         name: _start
 *         schema:
 *           type: integer
 *         required: true
 *         description: The starting index of the tickets to return
 *       - in: query
 *         name: _end
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ending index of the tickets to return
 *       - in: query
 *         name: _sort
 *         schema:
 *           type: string
 *         description: The field to sort the tickets by
 *       - in: query
 *         name: _order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: The order in which to sort the tickets (ASC for ascending, DESC for descending)
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: The ID of the customer associated with the tickets
 *       - in: query
 *         name: customerName
 *         schema:
 *           type: string
 *         description: The name of the customer associated with the tickets
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *         description: The urgency level of the tickets
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: The location of the tickets
 *     responses:
 *       200:
 *         description: A list of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/",
  passport.authenticate("bearer", {
    session: false,
  }),
  async (req, res) => {
    if (req.user.role.includes(USERS_ROLE.ADMIN)) {
      // Admin can update any ticket
    } else if (req.user.role.includes(USERS_ROLE.TECHNICIAN)) {
      req.query.assignedTo = req.user.id;
    } else if (req.user.role.includes(USERS_ROLE.CUSTOMER)) {
      req.query.customerId = req.user.id;
    }

    const schema = {
      // pagination
      _start: Joi.number().required(),
      _end: Joi.number().required(),
      _sort: Joi.string(),
      _order: Joi.string(),
      // filter
      customerId: Joi.string(),
      customerName: Joi.string(),
      assignedTo: Joi.string(),
      urgency: Joi.string(),
      location: Joi.string(),
    };
    const { error } = Joi.object(schema).validate(req.query);
    if (error) {
      return res.status(400).send("Bad Request");
    }
    try {
      const tickets = await getTicketsList(req.query);
      res.set("x-total-count", tickets.totalDocs);
      res.status(200).json(tickets.docs);
    } catch (error) {
      logger.error(error.message);
      res.status(500).send("Error retrieving tickets");
    }
  },
);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get a ticket by ID
 *     tags: [Tickets]
 *     description: Retrieve a ticket by its ID. If the user is an admin, they can retrieve any ticket. Otherwise, they can only retrieve tickets related to them.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: A ticket object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  const query = { _id: req.params.id };

  if (req.user.role.includes(USERS_ROLE.ADMIN)) {
    // Admin can update any ticket
  } else if (req.user.role.includes(USERS_ROLE.TECHNICIAN)) {
    query.assignedTo = req.user._id;
  } else if (req.user.role.includes(USERS_ROLE.CUSTOMER)) {
    query.customerId = req.user._id;
  }

  try {
    const ticket = await getTicket(query);
    res.status(200).json(ticket);
  } catch (error) {
    if (error.message === "Forbidden") {
      return res.status(403).send("Forbidden");
    }
    if (error.message === "Ticket not found") {
      return res.status(404).send("Ticket not found");
    }
    logger.error(error.message);
    res.status(500).send("Error retrieving ticket");
  }
});

/**
 * @swagger
 * /tickets/{id}:
 *   patch:
 *     summary: Update a ticket by ID
 *     tags: [Tickets]
 *     description: Update a ticket by its ID. Admins can update any ticket, technicians can update tickets assigned to them, and customers can update their own tickets.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *     responses:
 *       200:
 *         description: Updated ticket object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal Server Error
 */
router.patch("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  const query = { _id: req.params.id };

  if (req.user.role.includes(USERS_ROLE.ADMIN)) {
    // Admin can update any ticket
  } else if (req.user.role.includes(USERS_ROLE.TECHNICIAN)) {
    query.assignedTo = req.user._id;
  } else if (req.user.role.includes(USERS_ROLE.CUSTOMER)) {
    query.customerId = req.user._id;
  }

  try {
    const updatedTicket = await updateTicket(query, req.body, req.user);
    res.status(200).json(updatedTicket);
  } catch (error) {
    if (error.message === "Forbidden") {
      return res.status(403).send(error.message);
    }
    if (
      error.message === "Ticket not found" ||
      error.message === "Assigned user not found" ||
      error.message === "Customer not found"
    ) {
      return res.status(404).send(error.message);
    }
    if (error.message === "Assigned user cannot be null" || error.message === "Customer cannot be null") {
      return res.status(400).send(error.message);
    }
    console.error("Error updating ticket:", error);
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete a ticket by ID
 *     tags: [Tickets]
 *     description: Delete a ticket by its ID. Only admins can delete tickets.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Deleted ticket object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.user.role.includes(USERS_ROLE.ADMIN)) {
    return res.status(403).send("Forbidden");
  }
  const query = { _id: req.params.id };
  try {
    const deletedTicket = await deleteTicket(query);
    res.status(200).json(deletedTicket);
  } catch (error) {
    if (error.message === "Ticket not found") {
      return res.status(404).send("Ticket not found");
    }
    console.error("Error deleting ticket:", error);
    res.status(500).send("Error deleting ticket");
  }
});

export default router;
