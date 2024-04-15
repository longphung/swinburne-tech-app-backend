import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const USERS_ROLE = {
  ADMIN: "admin",
  TECHNICIAN: "technician",
  CUSTOMER: "customer",
};

/**
 * @typedef {{
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
      type: String,
      enum: [USERS_ROLE.ADMIN, USERS_ROLE.TECHNICIAN, USERS_ROLE.CUSTOMER],
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
      match: /^[\w-_.]+@([\w-]+\.)+[\w-]{2,4}$/,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre(
  ["save", "updateOne", "findOneAndUpdate"],
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

/**
 * @type {Model<User, UserModel>}
 */
const User = mongoose.model("User", userSchema);

export default User;
