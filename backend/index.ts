import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./src/db/db.ts";
import { UserRouter } from "./src/routes/index.ts";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", UserRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

connectDb().then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
  });
});
