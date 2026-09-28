import express from "express";
import {
  authMe,
  loginUser,
  logout,
  refreshToken,
  registerUser,
  updateMe,
} from "../controllers/user-auth-controller.ts";
import { upload } from "../middlewares/upload-middleware.ts";
import authMiddleware from "../middlewares/auth-middleware.ts";

const router = express.Router();

// router.route("/register").post(registerUser);
router.post("/register", upload.single("profilepic"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", authMe);
router.patch("/me", authMiddleware, upload.single("profilepic"), updateMe);

export default router;
