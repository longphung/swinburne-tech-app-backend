import mongoose from "mongoose";

/**
 * @typedef {{
 * _id: mongoose.Schema.Types.ObjectId;
 * token: string;
 * userId: mongoose.Schema.Types.ObjectId;
 * expiresIn: Date;
 * invalid: boolean;
 * createdAt: Date;
 * updatedAt: Date;
 * }} RefreshToken
 */

/**
 * @typedef {{
 * isValid: (token: string) => boolean;
 * }} RefreshTokenMethods
 */

/**
 * interface extends mongoose.Model<RefreshToken, {}, RefreshTokenMethods>
 * @typedef {object} RefreshTokenModel
 * @extends mongoose.Model<RefreshToken, {}, RefreshTokenMethods>
 * @property {function(userId: string): Promise<void>} invalidateUser
 */

/**
 * @type {Schema<RefreshToken, RefreshTokenModel, RefreshTokenMethods>}
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invalid: {
      type: Boolean,
      default: false,
    },
    deletedIn: {
      type: Date,
      expires: 60 * 60 * 24 * 365, // 1 year
      default: Date.now(),
    },
  },
  {
    timestamps: true,
    statics: {
      async invalidateUser(userId) {
        // Invalidate all refresh tokens for the user
        await this.updateMany({ userId }, { invalid: true });
      },
    },
  },
);

refreshTokenSchema.methods.isValid = function () {
  return !this.invalid;
};

/**
 * @type {Model<RefreshToken, RefreshTokenModel>}
 */
const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
