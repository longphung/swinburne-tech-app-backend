import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tickets",
        required: true,
      },
    ],
    processed: {
      type: Boolean,
      default: false,
    },
    grandTotal: {
      type: mongoose.Decimal128,
      required: true,
      get: function (value) {
        if (typeof value !== "undefined") {
          return parseFloat(value.toString());
        }
        return value;
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Orders", orderSchema);
