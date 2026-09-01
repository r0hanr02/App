import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./src/db/db.ts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDb().then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
  });
});
