import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    expiresIn: {
      type: Date,
      expires: 60*60*24*365, // 1 year
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

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
