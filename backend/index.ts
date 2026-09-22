import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./src/db/db.ts";
import { OrgRouter, ProjectRouter, UserRouter } from "./src/routes/index.ts";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/docs/swagger.ts";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders:["Content-Type","Authorization"]
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
  });
});
