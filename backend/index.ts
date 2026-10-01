import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDb } from "./src/db/db.ts";
import { OrgRouter, ProjectRouter, TaskRouter, UserRouter } from "./src/routes/index.ts";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/docs/swagger.ts";
import pinoHttp from "pino-http";
import { logger } from "./src/utils/logger.ts";
import { errorHandler, notFound } from "./src/middlewares/error-middleware.ts";


const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
    console.log(`For Documentation : http://localhost:8000/api/v1/docs`);
  });
});
