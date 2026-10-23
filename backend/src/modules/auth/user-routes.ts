import express from "express";
import {
  authMe,
  loginUser,
  logout,
  refreshToken,
  registerUser,
  updateMe,
} from "./user-auth-controller.ts";
import { forgetPassword } from "./forget-password-controller.ts";
import { resetPassword } from "./reset-password-controller.ts";
import { captchaGenerator } from "./captcha-controller.ts";
import { upload } from "../../middlewares/upload-middleware.ts";
import authMiddleware from "../../middlewares/auth-middleware.ts";
import { captchaMiddleware } from "../../middlewares/captcha-middleware.ts";

const router = express.Router();

// router.route("/register").post(registerUser);
router.post(
  "/register",
  upload.single("profilepic"),
  captchaMiddleware,
  registerUser,
);
router.post("/login", captchaMiddleware, loginUser);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", authMe);
router.patch("/me", authMiddleware, upload.single("profilepic"), updateMe);
router.get("/captcha", captchaGenerator);
router.post("/forgot-password", captchaMiddleware, forgetPassword);
router.patch("/reset-password", resetPassword);

export default router;
