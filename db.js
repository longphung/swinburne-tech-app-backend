import mongoose from "mongoose";
import logger from "#src/logger.js";
import Users from "#models/users.js";
import RefreshToken from "#models/refresh-token.js";

export const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI, {
      dbName: process.env.DB_NAME,
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
    });
    // Init collections
    await Users.init();
    await RefreshToken.init();
    logger.info("Database Connected Successfully");
  } catch (e) {
    logger.error(e.message);
    process.exit(1);
  }
};
