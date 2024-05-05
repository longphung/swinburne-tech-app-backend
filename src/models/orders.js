import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

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
    status: {
      type: String,
      enum: ["pending", "cancelled", "completed"],
      default: "pending",
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

orderSchema.plugin(paginate);

orderSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

orderSchema.set("toObject", {
  getters: true,
  virtuals: true,
});

export default mongoose.model("Orders", orderSchema);
