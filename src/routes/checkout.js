import express from "express";
import Stripe from "stripe";
import Joi from "joi";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/create-payment-intent", async (req, res) => {
  const { total } = req.body;

  // const schema = Joi.object({
  //   items: Joi.array()
  //     .items(
  //       Joi.object({
  //         // id: string;
  //         // serviceId: string;
  //         // title: string;
  //         // label: string;
  //         // price: number;
  //         // category: number;
  //         // serviceType: "onsite" | "remote" | "both";
  //         // description: string;
  //         // imageUrl?: string;
  //         // note?: string;
  //         // priorityDueDate: Date;
  //         // location: string;
  //         id: Joi.string().required(),
  //         serviceId: Joi.string().required(),
  //         title: Joi.string().required(),
  //         label: Joi.string().required(),
  //         price: Joi.number().required(),
  //         category: Joi.number().required(),
  //         serviceType: Joi.string().valid("onsite", "remote", "both").required(),
  //         description: Joi.string().required(),
  //         imageUrl: Joi.string().optional(),
  //         note: Joi.string().optional(),
  //         priorityDueDate: Joi.date().required(),
  //         location: Joi.string().required(),
  //       }),
  //     )
  //     .required(),
  //   total: Joi.number().required(),
  // });

  // const { error } = schema.validate(req.body);
  // if (error) {
  //   return res.status(400).send("Invalid request body");
  // }

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: total || 5000,
    currency: "aud",
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

export default router;
