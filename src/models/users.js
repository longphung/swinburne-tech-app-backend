import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const USERS_ROLE = {
  ADMIN: "admin",
  TECHNICIAN: "technician",
  CUSTOMER: "customer",
};

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
  },
  {
    timestamps: true,
    methods: {
      async isValidPassword(password) {
        return await bcrypt.compare(password, this.password);
      },
    },
  },
);

userSchema.pre(["save", "updateOne", "findOneAndUpdate"], async function () {
  // Hash the password before saving the user model or updating the password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
