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
      summary: packageJson.description,
    },
    externalDocs: {
      description: "swagger.json",
      url: "/swagger.json",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "JWT token",
          name: "Authorization",
          in: "header",
        },
      },
      schemas: {
        Service: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            label: {
              type: "string",
            },
            price: {
              type: "number",
            },
            category: {
              type: "number",
            },
            serviceType: {
              type: "string",
            },
            description: {
              type: "string",
            },
            imageUrl: {
              type: "string",
            },
          },
        },
        ServiceLevelAgreement: {
          type: "object",
          properties: {
            type: {
              type: "string",
            },
            dueWithinDays: {
              type: "number",
            },
            priceModifier: {
              type: "number",
            },
            fixedPrice: {
              type: "number",
            },
            description: {
              type: "string",
            },
          },
        },
        Order: {
          type: "object",
          properties: {
            customerId: {
              type: "string",
            },
            tickets: {
              type: "array",
              items: {
                type: "string",
              },
            },
            processed: {
              type: "boolean",
            },
            grandTotal: {
              type: "number",
            },
          },
        },
        Ticket: {
          type: "object",
          properties: {
            customerId: {
              type: "string",
            },
            serviceId: {
              type: "string",
            },
            urgency: {
              type: "string",
            },
            location: {
              type: "string",
            },
            assignedTo: {
              type: "string",
            },
            modifiers: {
              type: "array",
              items: {
                type: "string",
              },
            },
            note: {
              type: "string",
            },
            refundFlag: {
              type: "string",
            },
            cancelled: {
              type: "boolean",
            },
          },
        },
      },
    },
  },
  apis: ["./index.js", "./src/routes/*.js"],
};

export default swaggerJsdoc(options);
