import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

const services = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    price: {
      type: Schema.Types.Decimal128,
      required: true,
      get: function(value) {
        if (typeof value !== "undefined") {
          return parseFloat(value.toString());
        }
        return value;
      },
    },
    category: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5, 6],
    },
    serviceType: {
      type: String,
      required: true,
      enum: ["onsite", "remote", "both"],
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

services.plugin(paginate);

services.set("toJSON", { getters: true, virtuals: true });
services.set("toObject", { getters: true, virtuals: true });

const Services = mongoose.model("Services", services);

export default Services;
