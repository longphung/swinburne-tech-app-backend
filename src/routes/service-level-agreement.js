import express from "express";
import passport from "passport";
import {
  createServiceLevelAgreement,
  deleteServiceLevelAgreement,
  getServiceLevelAgreement,
  getServicesLevelAgreementList,
  updateServiceLevelAgreement,
} from "#src/services/service-level-agreement.js";
import logger from "#src/logger.js";
import Joi from "joi";

const router = express.Router();
/**
 * @swagger
 * /service-level-agreements/{id}:
 *   get:
 *     summary: Get service level agreement by ID
 *     tags: [Service Level Agreements]
 *     description: Retrieve a service level agreement by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service Level Agreement ID
 *     responses:
 *       200:
 *         description: Service level agreement details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceLevelAgreement'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Service Level Agreement not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "Id is required" });
  }
  try {
    const serviceLevelAgreement = await getServiceLevelAgreement(req.params.id);
    res.json(serviceLevelAgreement);
  } catch (e) {
    if (e.message === "Service Level Agreement not found") {
      return res.status(404).json({ message: e.message });
    }
    logger.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /service-level-agreements:
 *   get:
 *     summary: Get list of service level agreements
 *     tags: [Service Level Agreements]
 *     description: Retrieve a list of service level agreements
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [completion, response]
 *         required: true
 *         description: Type of service level agreement
 *     responses:
 *       200:
 *         description: List of service level agreements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceLevelAgreement'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get("/", async (req, res) => {
  const schema = Joi.object({
    _start: Joi.number().required(),
    _end: Joi.number().required(),
    _sort: Joi.string(),
    _order: Joi.string(),
    q: Joi.string().allow("").default(""),
    type: Joi.string().valid("completion", "response").required(),
  });
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: "Invalid request" });
  }
  try {
    const serviceLevelAgreement = await getServicesLevelAgreementList(req.query);
    res.json(serviceLevelAgreement.docs);
  } catch (e) {
    logger.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /service-level-agreements:
 *   post:
 *     summary: Create a new service level agreement
 *     tags: [Service Level Agreements]
 *     description: Create a new service level agreement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewServiceLevelAgreement'
 *     responses:
 *       200:
 *         description: Service level agreement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceLevelAgreement'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post("/", passport.authenticate("bearer", { session: false }), async (req, res) => {
  const schema = Joi.object({
    type: Joi.string().valid("completion", "response").required(),
    dueWithinDays: Joi.number().required(),
    priceModifier: Joi.number(),
    fixedPrice: Joi.number(),
    description: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Invalid request" });
  }
  try {
    const serviceLevelAgreement = await createServiceLevelAgreement(req.body);
    res.json(serviceLevelAgreement);
  } catch (e) {
    logger.error(e.message);
    res.status(500).json({ message: e.message });
  }
});
/**
 * @swagger
 * /service-level-agreements/{id}:
 *   patch:
 *     summary: Update an existing service level agreement
 *     description: Update an existing service level agreement
 *     tags: [Service Level Agreements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service Level Agreement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServiceLevelAgreement'
 *     responses:
 *       200:
 *         description: Service level agreement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceLevelAgreement'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.patch("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "Id is required" });
  }
  const schema = Joi.object({
    type: Joi.string().valid("completion", "response").required(),
    dueWithinDays: Joi.number().required(),
    priceModifier: Joi.number(),
    fixedPrice: Joi.number(),
    description: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Invalid request" });
  }
  try {
    const serviceLevelAgreement = await updateServiceLevelAgreement(req.params.id, req.body);
    res.json(serviceLevelAgreement);
  } catch (e) {
    logger.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

/**
 * @swagger
 * /service-level-agreements/{id}:
 *   delete:
 *     summary: Delete an existing service level agreement
 *     description: Delete an existing service level agreement
 *     tags: [Service Level Agreements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service Level Agreement ID
 *     responses:
 *       204:
 *         description: Service level agreement deleted successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", passport.authenticate("bearer", { session: false }), async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "Id is required" });
  }
  try {
    await deleteServiceLevelAgreement(req.params.id);
    res.status(204).send("Service Level Agreement deleted successfully");
  } catch (e) {
    logger.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

export default router;
