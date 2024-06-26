import mongoose from "mongoose";
import Stripe from "stripe";

import Tickets from "#models/tickets.js";
import { saveCartToTickets } from "#src/services/tickets.js";
import Orders from "#models/orders.js";
import { addStripeCustomerId } from "#src/services/users.js";
import { createPDF } from "#src/services/orders.js";
import mailer from "#src/mailer.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// eslint-disable-next-line max-lines-per-function
export const calculateOrder = async (currUser, ticketsIds) => {
  // Mongo aggregate query to calculate the total price of the tickets
  // with the given ids
  const aggregate = await Tickets.aggregate()
    .match({
      _id: { $in: ticketsIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
    .lookup({
      from: "services",
      localField: "serviceId",
      foreignField: "_id",
      as: "service",
    })
    .lookup({
      from: "servicelevelagreements",
      localField: "modifiers",
      foreignField: "_id",
      as: "modifiers_info",
    })
    .addFields({
      service: { $arrayElemAt: ["$service", 0] },
    })
    .addFields({
      // Formula: price + foreach modifier (price * modifier)
      ticketTotal: {
        $reduce: {
          input: "$modifiers_info",
          initialValue: "$service.price",
          in: {
            $sum: [
              "$$value",
              {
                $multiply: ["$service.price", "$$this.priceModifier"],
              },
            ],
          },
        },
      },
    })
    .project({
      _id: 1,
      service: 1,
      modifiers_info: 1,
      ticketTotal: 1,
      customerId: 1,
      note: 1,
      location: 1,
    })
    .group({
      // Grouping requires the group by field, but we're not grouping, we're just creating a single document
      _id: null,
      grandTotal: { $sum: "$ticketTotal" },
      tickets: { $push: "$$ROOT" },
    });
  const order = await Orders.create({
    customerId: currUser._id,
    tickets: aggregate[0].tickets.map((_id) => _id),
    grandTotal: aggregate[0].grandTotal,
  });
  aggregate[0].tickets.forEach(async (ticket) => {
    await Tickets.findByIdAndUpdate(ticket._id, { cost: ticket.ticketTotal, orderId: order.id });
  });
  return {
    orderId: order.id,
    orderSummary: aggregate[0],
  };
};

/**
 * Saves user's cart to tickets
 * Calculates the order total
 * Upsert customer details in Stripe
 * Creates a PaymentIntent with the user details
 * @param currUser
 * @param cart
 */
export const createPaymentIntent = async (currUser, cart) => {
  const session = await mongoose.startSession();
  return await session.withTransaction(async () => {
    const ticketsIds = await saveCartToTickets(currUser, cart);
    const result = await calculateOrder(
      currUser,
      ticketsIds.map((x) => x.id),
    );
    // Handle retrieving or creating a customer in Stripe
    let customerInStripe = {};
    if (currUser.stripeCustomerId) {
      customerInStripe = await stripeInstance.customers.retrieve(currUser.stripeCustomerId || "");
    }
    if (!customerInStripe?.id || customerInStripe?.deleted) {
      customerInStripe = await stripeInstance.customers.create({
        email: currUser.email,
        name: currUser.name,
        phone: currUser.phone,
        metadata: {
          userId: currUser.id,
        },
      });
      await addStripeCustomerId(currUser._id, customerInStripe.id);
    }
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: result.orderSummary.grandTotal * 100, // aud to cents
      currency: "aud",
      customer: customerInStripe.id,
      receipt_email: currUser.email,
      metadata: {
        orderId: result.orderId,
      },
    });

    return {
      orderResult: result,
      paymentIntent: paymentIntent,
    };
  });
};

export const verifyWebhookSignature = (payload, sig) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  return stripeInstance.webhooks.constructEvent(payload, sig, secret);
};

export const handleSuccessfulPayment = async (paymentIntent) => {
  const result = await Orders.findByIdAndUpdate(
    paymentIntent.metadata.orderId,
    { status: "completed", paymentIntentId: paymentIntent.id },
    { new: true },
  ).populate({
    path: "customerId",
    select: "email",
  });
  // TODO: NOT PRODUCTION TESTED: We don't have a domain deployed to send emails
  const orderInvoicePath = await createPDF({
    _id: paymentIntent.metadata.orderId,
  });
  await mailer.sendMail({
    from: process.env.SMTP_USER,
    to: result.customerId.email,
    subject: "Order Confirmation",
    html: `<h1>Order Confirmation</h1><p>Your order has been confirmed. Please find your invoice attached.</p>`,
    attachments: [{
      filename: "invoice.pdf",
      path: orderInvoicePath,
      contentType: "application/pdf",
    }]
  })
  // TODO: NOT PRODUCTION TESTED: We don't have a domain deployed to send emails
  return result
};
