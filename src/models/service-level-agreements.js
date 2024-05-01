import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

const serviceLevelAgreementSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["completion", "response"],
      required: true,
    },
    dueWithinDays: {
      type: Number,
      required: true,
    },
    priceModifier: {
      type: Number,
    },
    fixedPrice: {
      type: mongoose.Decimal128,
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

serviceLevelAgreementSchema.plugin(paginate);

serviceLevelAgreementSchema.set("toJSON", { getters: true, virtuals: true });
serviceLevelAgreementSchema.set("toObject", { getters: true, virtuals: true });

// Getters for fixedPrice
serviceLevelAgreementSchema.path("fixedPrice").get(function (value) {
  return value ? value.toString() : null;
});

const ServiceLevelAgreement = mongoose.model("ServiceLevelAgreements", serviceLevelAgreementSchema);

export default ServiceLevelAgreement;
