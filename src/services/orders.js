import mongoose from "mongoose";
import { PDFInvoice } from "@longphung/pdf-invoice";

import Orders from "#models/orders.js";
import Tickets from "#models/tickets.js";

const COMPANY_INFO = {
  name: "Techaway",
  address: "1234 Techaway St, Tech City",
  phone: "123-456-7890",
  email: "noreply@techaway.com",
  taxId: "ABN 123456789",
};

export const getOrdersList = async (pagination) => {
  const { _start, _end, _sort, _order, customerId } = pagination;
  const query = {};
  if (customerId) {
    query.customerId = customerId;
  }
  const sort = {};
  if (_sort && _order) {
    sort[_sort] = _order?.toLowerCase();
  }
  return await Orders.paginate(query, {
    sort,
    populate: [
      {
        path: "customerId",
        select: "name",
      },
      {
        path: "tickets",
        select: "serviceId",
        populate: {
          path: "serviceId",
          select: "title",
        },
        transform: (ticket) => ({
          _id: ticket._id,
          service: ticket.serviceId.title,
        }),
      },
    ],
    limit: _end - _start,
    offset: _start,
  });
};

export const getOrder = async (query) => {
  const order = await Orders.findOne(query).populate({
    path: "customerId",
    select: "name",
  });
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};

export const updateOrder = async (query, orderData) => {
  const order = await Orders.findOneAndUpdate(query, orderData, { new: true });
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};

export const cancelOrder = async (query) => {
  const session = await mongoose.startSession();
  return await session.withTransaction(async () => {
    const order = await Orders.findOneAndUpdate(query, { status: "cancelled" }, { new: true });
    const ticketQuery = {
      id: {
        $in: order.tickets,
      },
    };
    await Tickets.updateMany(ticketQuery, { cancelled: true });
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  });
};

export const createPDFPayload = (order) => {
  return {
    company: COMPANY_INFO,
    customer: {
      name: order.customerId.name,
      address: order.customerId.address,
      phone: order.customerId.phone,
      email: order.customerId.email,
    },
    invoice: {
      number: order.id,
      date: order.updatedAt,
      dueDate: new Date(),
      status: "Paid",
      currency: "AU$ ",
      path: "./logs/invoice.pdf",
    },
    items: order.tickets.map((ticket) => ({
      name: ticket.service,
      quantity: 1,
      price: ticket.cost,
    })),
    note: {
      text:
        "This is a system generated invoice. If you have any questions, contact us at sales@techaway.com\n" +
        order.tickets.reduce((acc, ticket) => {
          if (!ticket.noteCustomer) return acc;
          return `${acc}\n${ticket.noteCustomer}`;
        }, ""),
    },
  };
};

/**
 * @param {{
 *   customerId?: string,
 *   _id: string,
 * }} query
 * @returns {Promise<string>} Path to the generated PDF
 */
export const createPDF = async (query) => {
  const order = await Orders.findOne(query)
    .populate({
      path: "customerId",
      select: "name address phone email",
    })
    .populate({
      path: "tickets",
      select: "serviceId cost noteCustomer",
      populate: {
        path: "serviceId",
        select: "title",
      },
      transform: (ticket) => ({
        cost: ticket.cost,
        service: ticket.serviceId.title,
        noteCustomer: ticket.noteCustomer,
      }),
    });
  if (!order) {
    throw new Error("Order not found");
  }
  const payload = createPDFPayload(order);
  const invoice = new PDFInvoice(payload);
  const { path, stream } = await invoice.create();
  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      resolve(path);
    });
    stream.on("error", (error) => {
      reject(error);
    });
  });
};

export const getRevenueReport = async () => {
  // Returns services, and each tickets associated with the service, with the cost of each ticket, and the total cost of the service
  return (
    Orders.aggregate()
      .lookup({
        from: "tickets",
        localField: "tickets",
        foreignField: "_id",
        as: "tickets",
      })
      // only show ticket with cost field
      .match({
        "tickets.cost": { $exists: true },
      })
      .lookup({
        from: "services",
        localField: "tickets.serviceId",
        foreignField: "_id",
        as: "services",
      })
      .unwind("$services")
      // return unique services
      .group({
        _id: "$services.title",
        total: {
          $sum: {
            $sum: "$tickets.cost",
          },
        },
        tickets: { $push: "$tickets" },
      })
  );
};
