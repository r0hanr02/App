import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./src/db/db.ts";
import { OrgRouter, ProjectRouter, UserRouter } from "./src/routes/index.ts";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/docs/swagger.ts";
import pinoHttp from "pino-http";
import { logger } from "./src/utils/logger.ts";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//pino serializer
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          userAgent: req.headers?.["user-agent"],
          remoteAddress: req.remoteAddress,
          remotePort: req.remotePort,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", UserRouter);
app.use("/api/v1", OrgRouter);
app.use("/api/v1", ProjectRouter);

app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Hello World");
});

connectDb().then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
    console.log(`For Documentation : http://localhost:8000/api/v1/docs`);
  });
});
