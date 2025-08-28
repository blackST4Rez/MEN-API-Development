import express from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import taskRoutes from "../routes/taskRoutes";
import authRoutes from "../routes/authRoutes";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger configuration (minimal for tests)
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Tasks CRUD API",
        version: "1.0.0",
        description: "A simple Tasks CRUD API with Express, TypeScript, and MongoDB",
      },
      servers: [
        {
          url: `http://localhost:3000`,
          description: "Test server",
        },
      ],
    },
    apis: ["./src/routes/*.ts"],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  // API Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/tasks", taskRoutes);

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  return app;
};

export default createTestApp;
