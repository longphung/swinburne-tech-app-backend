import nodemailer from "nodemailer";
import logger from "#src/logger.js";

let transporter = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "1", // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

if (!transporter.auth.user || !transporter.auth.pass) {
  if (process.env.NODE_ENV !== "production") {
    logger.info("Creating test account for development environment nodemailer");
    try {
      const account = await nodemailer.createTestAccount();
      logger.info("Test account created user:");
      logger.info(account.user);
      logger.info("Test account created pass:");
      logger.info(account.pass);
      transporter = {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      };
    } catch (e) {
      logger.error("Error creating test account for development environment nodemailer", e);
    }
  } else {
    logger.error("Production environment requires SMTP to be configured");
    process.exit(1);
  }
}

const mailer = nodemailer.createTransport(transporter);

export default mailer;
