import express from "express";
import { loginUser, logout, registerUser } from "../controllers/user-auth-controller.ts";

const router = express.Router();

router.route("/register").post(registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);

export default router;
