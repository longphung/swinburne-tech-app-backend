import mongoose from "mongoose";
import Tickets from "#models/tickets.js";
import { USERS_ROLE } from "#models/users.js";

export const saveCartToTickets = async (currUser, cart) => {
  const tickets = cart.map((item) => ({
    serviceId: new mongoose.Types.ObjectId(item.serviceId),
    customerId: currUser._id,
    assignedTo: null,
    modifiers: item.modifiers?.map((modifier) => new mongoose.Types.ObjectId(modifier.id)),
    note: item.note,
    urgency: "low",
    location: item.location || "",
  }));

  return await Tickets.insertMany(tickets);
};

/**
 * @param {
 *   _start: number,
 *   _end: number,
 *   _sort: string,
 *   _order: string,
 *   customerId: string,
 *   customerName: string,
 *   urgency: string,
 *   location: string,
 *   assignedTo: string
 * } pagination The pagination object
 * @returns {Promise<*>}
 */
export const getTicketsList = async (pagination) => {
  const { _start, _end, _sort, _order, customerId, customerName, urgency, location, assignedTo } = pagination;
  const query = {};
  if (assignedTo) {
    query.assignedTo = assignedTo;
  }
  if (customerId) {
    query.customerId = customerId;
  }
  if (urgency) {
    query.urgency = urgency;
  }
  if (location) {
    query.location = location;
  }
  const sort = {};
  if (_sort && _order) {
    sort[_sort] = _order?.toLowerCase();
  }
  return await Tickets.paginate(query, {
    sort,
    populate: [
      {
        path: "customerId",
        select: "name _id",
        ...(customerName && {
          match: {
            name: { $regex: customerName, $options: "i" },
          },
        }),
      },
      {
        path: "serviceId",
        select: "title _id",
      },
      {
        path: "assignedTo",
        select: "name _id",
      },
      {
        path: "modifiers",
        select: "type description _id",
      },
    ],
    limit: _end - _start,
    offset: _start,
  });
};

export const getTicket = async (query) => {
  const ticket = await Tickets.findOne(query)
    .populate({
      path: "customerId",
      select: "name _id",
    })
    .populate({
      path: "serviceId",
      select: "title _id",
    })
    .populate({
      path: "assignedTo",
      select: "name _id",
    })
    .populate({
      path: "modifiers",
      select: "type description _id",
    });
  if (!ticket) {
    throw new Error("Ticket not found");
  }
  return ticket;
};

export const updateTicket = async (query, ticketData, currUser) => {
  const technicianFields = ["assignedTo", "status", "note", "urgency", "location"];
  const customerFields = ["note", "location"];

  if (currUser.role.includes(USERS_ROLE.TECHNICIAN)) {
    const isAllowed = Object.keys(ticketData).every((key) => technicianFields.includes(key));
    if (!isAllowed) {
      throw new Error("Forbidden");
    }
  }

  if (currUser.role.includes(USERS_ROLE.CUSTOMER)) {
    const isAllowed = Object.keys(ticketData).every((key) => customerFields.includes(key));
    if (!isAllowed) {
      throw new Error("Forbidden");
    }
  }

  const ticket = await Tickets.findOneAndUpdate(query, ticketData, { new: true });
  if (!ticket) {
    throw new Error("Ticket not found");
  }
  return ticket;
};

export const deleteTicket = async (query) => {
  const ticket = await Tickets.findOneAndDelete(query);
  if (!ticket) {
    throw new Error("Ticket not found");
  }
  return ticket;
};
