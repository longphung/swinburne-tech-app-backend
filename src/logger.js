import winston from "winston";
import "winston-daily-rotate-file";

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    fileRotateTransport,
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
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
  console.time();
  const { method, url } = req;

  logger.http(`${method} ${url} ${res.statusCode}`);
  logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
  logger.debug(`Body: ${JSON.stringify(req.body)}`);
  logger.debug(`Query: ${JSON.stringify(req.query)}`);

  const defaultWrite = res.write;
  const defaultEnd = res.end;
  const chunks = [];

  res.write = (...restArgs) => {
    chunks.push(new Buffer(restArgs[0]));
    defaultWrite.apply(res, restArgs);
  };

  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(new Buffer(restArgs[0]));
    }
    const body = Buffer.concat(chunks).toString('utf8');

    logger.debug(`Response: ${body}`);

    defaultEnd.apply(res, restArgs);
  };

  next();
};

export default logger;
