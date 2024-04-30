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
    },
    modifiers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceLevelAgreements",
        default: [],
      },
    ],
    note: {
      type: String,
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
    },
  },
  { timestamps: true },
);

export default mongoose.model("Tickets", ticketSchema);
