import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
 * isValid: (token: string) => Promise<boolean>;
 * }} RefreshTokenMethods
 */

/**
 * interface extends mongoose.Model<RefreshToken, {}, RefreshTokenMethods>
 * @typedef {object} RefreshTokenModel
 * @extends mongoose.Model<RefreshToken, {}, RefreshTokenMethods>
 * @property {function(token: string): Promise<void>} invalidateUser
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
    static: {
      async invalidateUser(token) {
        // Invalidate all refresh tokens for the user
        await RefreshToken.deleteMany({ userId: token.userId });
      },
    },
    methods: {
      async isValid(token) {
        return await bcrypt.compare(token, this.token);
      },
    },
  },
);

refreshTokenSchema.pre(["save", "updateOne", "findOneAndUpdate"], async function () {
  // Hash the token before saving the refresh token model or updating the token
  if (this.isModified("token")) {
    this.token = await bcrypt.hash(this.token, 10);
  }
});

/**
 * @type {Model<RefreshToken, RefreshTokenModel>}
 */
const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
