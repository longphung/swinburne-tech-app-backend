import express from "express";
import passport from "passport";
import Joi from "joi";
import { createService, deleteService, getService, getServicesList, updateService } from "#src/services/services.js";
import logger from "#src/logger.js";

const router = express.Router();

// Public route to display services listing.
/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get list of services
 *     tags: [Services]
 *     description: Retrieve a list of services
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
 *         description: Sort field
 *       - in: query
 *         name: _order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Filter query
 *     responses:
 *       200:
 *         description: List of services
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get("/", async (req, res) => {
  const schema = Joi.object({
    // pagination
    _start: Joi.number().required(),
    _end: Joi.number().required(),
    // sorters
    _sort: Joi.string().custom((value, helper) => {
      if (!req.query._order) {
        return helper.error("Order is required when sorting");
      }
    }),
    _order: Joi.string()
      .valid("asc", "desc")
      .custom((value, helper) => {
        if (!req.query._sort) {
          return helper.error("Sort is required when ordering");
        }
      }),
    // filter
    q: Joi.string().default(""),
  });
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).send({
      message: error.details[0].message,
    });
  }
  try {
    const services = await getServicesList(req.query);
    res.set("x-total-count", services.totalDocs);
    res.status(200).send(services.docs);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Public route to get an individual and detailed service listing
/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID
 *     description: Retrieve a service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send("Service ID is required");
  }
  try {
    const service = await getService(id);
    res.status(200).send(service);
  } catch (error) {
    if (error.message === "Service not found") {
      return res.status(404).send("Service not found");
    }
    logger.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Protected route, for admin to get all services
/**
 * @swagger
 * /services/admin:
 *   get:
 *     summary: Get list of services
 *     tags: [Services]
 *     description: Retrieve a list of services
 *     security:
 *       - bearerAuth: []
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
 *         description: Sort field
 *       - in: query
 *         name: _order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Filter query
 *     responses:
 *       200:
 *         description: List of services
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get("/admin", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.user.role.includes("admin")) {
    return res.status(403).send();
  }
  const schema = Joi.object({
    // pagination
    _start: Joi.number().required(),
    _end: Joi.number().required(),
    // sorters
    _sort: Joi.string().custom((value, helper) => {
      if (!req.query._order) {
        return helper.error("Order is required when sorting");
      }
    }),
    _order: Joi.string()
      .valid("asc", "desc")
      .custom((value, helper) => {
        if (!req.query._sort) {
          return helper.error("Sort is required when ordering");
        }
      }),
    // filter
    q: Joi.string().default(""),
  });
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).send({
      message: error.details[0].message,
    });
  }
  try {
    const services = await getServicesList(req.query);
    res.set("x-total-count", services.totalDocs);
    res.status(200).send(services.docs);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Protected route, for admin to get an individual and detailed service listing
/**
 * @swagger
 * /services/admin/{id}:
 *   get:
 *     summary: Get service by ID
 *     description: Retrieve a service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/admin/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.user.role.includes("admin")) {
    return res.status(403).send();
  }
  const { id } = req.params;
  if (!id) {
    return res.status(400).send("Service ID is required");
  }
  try {
    const service = await getService(id);
    res.status(200).send(service);
  } catch (error) {
    if (error.message === "Service not found") {
      return res.status(404).send("Service not found");
    }
    logger.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Protected route, requires user to be logged in and only admin should be able to access.
// Endpoint to create a new service
/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     description: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post("/", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.user.role.includes("admin")) {
    return res.status(403).send();
  }
  const schema = Joi.object({
    title: Joi.string().required(),
    label: Joi.string().required(),
    price: Joi.number().required(),
    category: Joi.number().valid(1, 2, 3, 4, 5, 6).required(),
    serviceType: Joi.string().valid("onsite", "remote", "both").required(),
    description: Joi.string().required(),
    imageUrl: Joi.string(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({
      message: error.details[0].message,
    });
  }
  try {
    const service = await createService(req.body);
    res.status(201).send(service);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Protected route, requires user to be logged in and only admin should be able to access.
// Endpoint to update an existing service
/**
 * @swagger
 * /services/{id}:
 *   patch:
 *     summary: Update an existing service
 *     description: Update an existing service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal Server Error
 */
router.patch("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.user.role.includes("admin")) {
    return res.status(403).send();
  }
  const schema = Joi.object({
    title: Joi.string(),
    label: Joi.string(),
    price: Joi.number(),
    category: Joi.number().valid(1, 2, 3, 4, 5, 6),
    serviceType: Joi.string().valid("onsite", "remote", "both"),
    description: Joi.string(),
    imageUrl: Joi.string(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({
      message: error.details[0].message,
    });
  }
  try {
    const service = await updateService(req.params.id, req.body);
    res.status(200).send(service);
  } catch (error) {
    if (error.message === "Service not found") {
      return res.status(404).send("Service not found");
    }
    logger.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Protected route, requires user to be logged in and only admin should be able to access.
// Endpoint to delete an existing service
/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete an existing service
 *     tags: [Services]
 *     description: Delete an existing service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     responses:
 *       204:
 *         description: Service deleted successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.user.role.includes("admin")) {
    return res.status(403).send();
  }
  if (!req.params.id) {
    return res.status(400).send("Service ID is required");
  }
  try {
    await deleteService(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === "Service not found") {
      return res.status(404).send("Service not found");
    }
    logger.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
