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
      get: function (value) {
        if (typeof value !== "undefined") {
          return parseFloat(value.toString());
        }
        return value;
      },
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
