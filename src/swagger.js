import swaggerJsdoc from "swagger-jsdoc";
import { readFileSync } from "node:fs";

const packageJsonFile = readFileSync("./package.json", "utf8");
const packageJson = JSON.parse(packageJsonFile);

const options = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Techaway API",
      version: packageJson.version,
    },
  },
  apis: ["./index.js", "./src/routes/*.js"],
};

export default swaggerJsdoc(options);
