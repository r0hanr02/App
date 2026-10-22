import type { Request, Response } from "express";
import { User } from "../models/index.ts";
import { AppError, asyncHandler } from "../middlewares/error-middleware.ts";
import { generatePasswordResetToken } from "../utils/jwt.ts";
import { hashPasswordResetToken } from "../utils/crypto.ts";
import {
  PASSWORD_RESET_COOKIE,
  passwordResetCookieOptions,
} from "../utils/password.ts";
import { sendEmail } from "../services/email.service.ts";

/**
 * POST /api/v1/auth/forgot-password
 * Generates a short lived reset token, stores its hash on the user and mails
 * the raw token to the account owner.
 */
export const forgetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
      throw new AppError("Email is required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new AppError("User Not Found", 404);
    }

    const passwordResetToken = generatePasswordResetToken(user.id);

    user.passwordResetToken = hashPasswordResetToken(passwordResetToken);
    await user.save();

    // Awaited so a mail failure surfaces as an error instead of an unhandled
    // rejection while the user is told the email is on its way.
    await sendEmail(user.email, passwordResetToken);

    // Same browser convenience: the raw token also travels in an httpOnly
    // cookie so the reset page can work without the emailed link.
    res.cookie(
      PASSWORD_RESET_COOKIE,
      passwordResetToken,
      passwordResetCookieOptions(),
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  },
);
