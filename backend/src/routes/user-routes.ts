import express from "express";
import {
  authMe,
  loginUser,
  logout,
  refreshToken,
  registerUser,
  updateMe,
} from "../controllers/user-auth-controller.ts";

const router = express.Router();

router.route("/register").post(registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", authMe);
router.post("/me", updateMe);

export default router;
