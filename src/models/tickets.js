import mongoose from "mongoose";
const ticketSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ["planned", "low", "medium", "high", "critical"],
      required: true,
    },
    refundFlag: {
      type: Date,
    },
    location: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Tickets", ticketSchema);
