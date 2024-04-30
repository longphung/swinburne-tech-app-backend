import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

const serviceLevelAgreementSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["completion", "response"],
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priceModifier: {
      type: Number,
      required: true,
    },
    fixedPrice: {
      type: mongoose.Decimal128,
      required: true,
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

const ServiceLevelAgreement = mongoose.model("ServiceLevelAgreements", serviceLevelAgreementSchema);

export default ServiceLevelAgreement;
