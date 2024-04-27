import mongoose from "mongoose";

import logger from "#src/logger.js";
import Users from "#models/users.js";
import RefreshToken from "#models/refresh-token.js";
import Services from "#models/services.js";
import Tickets from "#models/tickets.js";
import Notifications from "#models/notifications.js";
import PriorityType from "#models/priorityType.js";
import Urgency from "#models/urgency.js";
import UserNotification from "#models/userNotification.js";

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
    await Services.init();
    await RefreshToken.init();
    await Tickets.init();
    await Notifications.init();
    await PriorityType.init();
    await Urgency.init();
    await UserNotification.init();

    // Create indexes
    await Users.collection.createIndex({
      name: "text",
      address: "text",
      phone: "text",
      email: "text",
      username: "text",
    });
    await Services.collection.createIndex({
      title: "text",
      label: "text",
    });
    logger.info("Database initialized successfully");
  } catch (e) {
    logger.error(e.message);
    process.exit(1);
  }
};
