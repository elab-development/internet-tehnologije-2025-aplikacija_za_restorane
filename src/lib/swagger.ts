import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Restoran App API",
      version: "1.0.0",
      description: "API dokumentacija za aplikaciju za restorane i rezervacije",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            ime: { type: "string" },
            email: { type: "string" },
            uloga: { type: "string", enum: ["GUEST", "MANAGER", "ADMIN"] },
          },
        },
        Restaurant: {
          type: "object",
          properties: {
            id: { type: "integer" },
            naziv: { type: "string" },
            adresa: { type: "string" },
            opis: { type: "string", nullable: true },
            radnoVreme: { type: "string" },
            administratorId: { type: "integer" },
          },
        },
        Table: {
          type: "object",
          properties: {
            id: { type: "integer" },
            restoranId: { type: "integer" },
            brojStola: { type: "integer" },
            kapacitet: { type: "integer" },
          },
        },
        Reservation: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            tableId: { type: "integer" },
            dateTime: { type: "string", format: "date-time" },
            brojOsoba: { type: "integer" },
            status: {
              type: "string",
              enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
            },
          },
        },
      },
    },
  },
  apis: [path.join(process.cwd(), "src/app/api/**/route.ts")],
};

export const swaggerSpec = swaggerJSDoc(options);