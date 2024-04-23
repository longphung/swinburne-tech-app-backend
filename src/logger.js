import winston from "winston";
import "winston-daily-rotate-file";
import fs from "fs";
import path from "path";

const logDir = "logs";
// Create if not exists log directory
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    fileRotateTransport,
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
    }),
  );
}

/**
 * Log pretty request method and url along with response status code
 *
 * Log debug information which is headers, body, and query parameters
 * @param {Request} req
 * @param {Response} res
 * @param next
 */
export const loggerMiddleware = (req, res, next) => {
  const { method, url } = req;

  logger.http(`${method} ${url}`);

  next();
};

export default logger;
