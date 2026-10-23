import type { Request, Response } from "express";
import { AppError, asyncHandler } from "../../middlewares/error-middleware.ts";
import { forgetPasswordServices } from "./auth-services.ts";
import { addPasswordResetTokenCookie } from "../../utils/cookies.ts";

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

    const { passwordResetToken } = await forgetPasswordServices(email);

    // Same browser convenience: the raw token also travels in an httpOnly
    // cookie so the reset page can work without the emailed link.
    addPasswordResetTokenCookie(res, passwordResetToken);

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  },
);
