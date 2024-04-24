import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const services = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  price: {
    type: mongoose.Decimal128,
    required: true,
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
});

services.plugin(paginate);

const Services = mongoose.model("Services", services);

export default Services;
