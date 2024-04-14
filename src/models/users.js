import mongoose from "mongoose";

export const USERS_ROLE = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer',
}

const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
  },
  password:{
    type: String,
    required: true,
  },
  role:{
    type: String,
    enum: [USERS_ROLE.ADMIN, USERS_ROLE.TECHNICIAN, USERS_ROLE.CUSTOMER],
    required: true,
  },
  name: String,
  address: String,
  phone: {
    type: String,
  },
  email:{
    type: String,
    required: true,
    match: /^[\w-_.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;
