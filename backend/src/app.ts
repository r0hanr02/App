import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.ts";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger.ts";
import { errorHandler, notFound } from "./middlewares/error-middleware.ts";
import cookieParser from "cookie-parser";
import {
  OrgRouter,
  ProjectRouter,
  TaskRouter,
  UserRouter,
} from "./modules/index.ts";

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? [
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(
  pinoHttp({
    logger,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(socketAuthMiddleware)
app.use("/api/v1/auth", UserRouter);
app.use("/api/v1", OrgRouter);
app.use("/api/v1", ProjectRouter);
app.use("/api/v1", TaskRouter);

app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

app.use(notFound);
app.use(errorHandler);


