import mongoose from "mongoose";
import logger from "#src/logger.js";
import Users from "#models/users.js";

export const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI, {
      dbName: process.env.DB_NAME,
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
    });
    logger.info("Database Connected Successfully");
    // Init collections
    await Users.init();
  } catch (e) {
    logger.error(e.message);
    process.exit(1);
  }
};
