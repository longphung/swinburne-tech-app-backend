import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

export const TICKET_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  OPEN: "OPEN",
  QUERIES_CLIENT: "QUERIES_CLIENT",
  QUERIES_EXTERNAL: "QUERIES_EXTERNAL",
  COMPLETE: "COMPLETE",
};

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
    noteTechnician: {
      type: String,
    },
    noteCustomer: {
      type: String,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
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
    cancelled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.NOT_STARTED,
    },
    cost: {
      type: Schema.Types.Decimal128,
      get: function (value) {
        if (typeof value !== "undefined") {
          return parseFloat(value.toString());
        }
        return value;
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
    },
    toObject: {
      virtuals: true,
      getters: true,
    },
  },
);

ticketSchema.plugin(paginate);

export default mongoose.model("Tickets", ticketSchema);
