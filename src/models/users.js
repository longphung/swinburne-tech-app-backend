import mongoose from "mongoose";
import bcrypt from "bcrypt";
import paginate from "mongoose-paginate-v2";

export const USERS_ROLE = {
  ADMIN: "admin",
  TECHNICIAN: "technician",
  CUSTOMER: "customer",
};

/**
 * @typedef {{
 *  _id: mongoose.Schema.Types.ObjectId;
 *  username: string;
 *  password: string;
 *  role: string;
 *  name?: string;
 *  address?: string;
 *  phone?: string;
 *  email: string;
 *  emailVerified: boolean;
 *  createdAt: Date;
 *  updatedAt: Date;
 *  checkPassword: (password: string) => Promise<boolean>;
 *   }} User
 */

/**
 * @typedef {{
 *   checkPassword: (password: string) => Promise<boolean>;
 * }} UserMethods
 */

/**
 * @typedef {import("mongoose").Model<User, {}, UserMethods>} UserModel
 */

/**
 *
 * @type {Schema<User, UserModel, UserMethods>}
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: [
        {
          type: String,
          enum: Object.values(USERS_ROLE),
        },
      ],
      required: true,
    },
    name: String,
    address: String,
    phone: {
      type: String,
      match: /[0-9]+/,
    },
    email: {
      type: String,
      required: true,
      match: /^[\w-_.]+(\+\w+)*@([\w-]+\.)+[\w-]{2,4}$/,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    virtuals: true,
  },
);

userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre(
  ["save", "updateOne"],
  {
    document: true,
    query: false,
  },
  async function () {
    // Hash the password before saving the user model or updating the password
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  },
);

userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  if (!update.password) return;
  // Hash the password before updating the user model
  const hashedPassword = await bcrypt.hash(update.password, 10);
  this.setUpdate({
    password: hashedPassword,
  });
});

userSchema.plugin(paginate);

/**
 * @type {Model<User, UserModel>}
 */
const User = mongoose.model("User", userSchema);

export default User;
