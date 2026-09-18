import express from "express";
import { loginUser, logout, refreshToken, registerUser } from "../controllers/user-auth-controller.ts";

const router = express.Router();

router.route("/register").post(registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/refresh",refreshToken)

export default router;
