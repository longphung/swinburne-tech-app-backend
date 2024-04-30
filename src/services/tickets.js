import mongoose from "mongoose";
import Tickets from "#models/tickets.js";

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
