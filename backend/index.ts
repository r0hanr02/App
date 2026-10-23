import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDb } from "./src/db/db.ts";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/docs/swagger.ts";
import pinoHttp from "pino-http";
import { logger } from "./src/utils/logger.ts";
import { errorHandler, notFound } from "./src/middlewares/error-middleware.ts";
import cookieParser from "cookie-parser";
import {
  OrgRouter,
  ProjectRouter,
  TaskRouter,
  UserRouter,
} from "./src/modules/index.ts";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? [
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    //  Access-Control-Allow-Origin: *
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

connectDb().then(() => {
  app.listen(Number(process.env.PORT) || 8000, process.env.HOST ?? "localhost", () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
    console.log(
      `For Documentation : http://${process.env.HOST || "localhost"}:8000/api/v1/docs`
    );
  });
});
