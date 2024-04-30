import express from "express";
import Joi from "joi";
import passport from "passport";

import { createPaymentIntent } from "#src/services/checkout.js";
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
router.post("/create-payment-intent", passport.authenticate("bearer", { session: false }), async (req, res) => {
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
          note: Joi.string(),
          location: Joi.string(),
        }).unknown(true),
      )
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send("Invalid request body");
  }
  try {
    const paymentIntent = await createPaymentIntent(req.user, req.body.items);
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send("Error creating payment intent");
  }
});

export default router;
