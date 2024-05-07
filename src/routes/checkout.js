import express from "express";
import Joi from "joi";
import passport from "passport";

import { createPaymentIntent, handleSuccessfulPayment, verifyWebhookSignature } from "#src/services/checkout.js";
import logger from "#src/logger.js";

const router = express.Router();
/**
 * @swagger
 * /checkout/create-payment-intent:
 *   post:
 *     summary: Create payment intent
 *     tags: [Checkout]
 *     description: Create payment intent for checkout
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     serviceId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     label:
 *                       type: string
 *                     modifiers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                     category:
 *                       type: number
 *                     serviceType:
 *                       type: string
 *                       enum: [onsite, remote, both]
 *                     description:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     note:
 *                       type: string
 *                     location:
 *                       type: string
 *             required:
 *               - items
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/create-payment-intent",
  express.json(),
  passport.authenticate("bearer", { session: false }),
  async (req, res) => {
    const schema = Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            id: Joi.string().required(),
            serviceId: Joi.string().required(),
            title: Joi.string().required(),
            label: Joi.string().required(),
            modifiers: Joi.array().items(
              Joi.object({
                id: Joi.string().required(),
              }).unknown(true),
            ),
            category: Joi.number().required(),
            serviceType: Joi.string().valid("onsite", "remote", "both").required(),
            description: Joi.string().required(),
            imageUrl: Joi.string(),
          }).unknown(true),
        )
        .min(1),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error)
      return res.status(400).send("Invalid request body");
    }
    try {
      const { paymentIntent, orderResult } = await createPaymentIntent(req.user, req.body.items);
      res.send({
        clientSecret: paymentIntent.client_secret,
        orderResult,
      });
    } catch (e) {
      console.error(e);
      logger.error(e.message);
      return res.status(500).send("Error creating payment intent");
    }
  },
);

/**
 * @swagger
 * /checkout/payment-success:
 *   post:
 *     tags: [Checkout]
 *     summary: Handle successful payment webhook
 *     description: Handle successful payment webhook from Stripe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the payment event
 *               object:
 *                 type: string
 *                 description: The type of object (e.g., "event")
 *             required:
 *               - id
 *               - object
 *     responses:
 *       200:
 *         description: Successful payment event handled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The result of the payment event handling
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post("/payment-success", express.raw({ type: "application/json " }), async (req, res) => {
  try {
    const event = verifyWebhookSignature(req.rawBody, req.headers["stripe-signature"]);
    let result = {};
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        result = await handleSuccessfulPayment(paymentIntent);
        break;
      }
      default:
        return res.status(400).send("Invalid event type");
    }
    res.status(200).send(result);
  } catch (e) {
    console.error(e);
    logger.error(e.message);
    return res.status(400).send("Error saving payment intent");
  }
});

export default router;
