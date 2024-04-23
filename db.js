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
    logger.info("Database connected successfully");
    logger.info("Initializing database");
    // Init collections
    await Users.init();
    await RefreshToken.init();

    // Create indexes
    await Users.collection.createIndex({
      name: "text",
      address: "text",
      phone: "text",
      email: "text",
      username: "text",
    });
    logger.info("Database initialized successfully");
  } catch (e) {
    logger.error(e.message);
    process.exit(1);
  }
};
