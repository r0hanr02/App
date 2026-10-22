import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/index.ts";
import { AppError, asyncHandler } from "../middlewares/error-middleware.ts";
import type { decodedPayload } from "../middlewares/auth-middleware.ts";
import { isPasswordResetTokenValid } from "../utils/crypto.ts";
import {
  hashPassword,
  isPasswordValid,
  MIN_PASSWORD_LENGTH,
  PASSWORD_RESET_COOKIE,
  passwordResetCookieOptions,
} from "../utils/password.ts";

const INVALID_TOKEN_MESSAGE = "Reset link is invalid or has expired";

const readToken = (req: Request): string | undefined => {
  const fromBody = req.body?.token;
  if (typeof fromBody === "string" && fromBody.trim()) return fromBody.trim();

  const fromQuery = req.query?.token;
  if (typeof fromQuery === "string" && fromQuery.trim()) return fromQuery.trim();

  const fromCookie = req.cookies?.[PASSWORD_RESET_COOKIE];
  if (typeof fromCookie === "string" && fromCookie.trim()) return fromCookie.trim();

  return undefined;
};

/**
 * PATCH /api/v1/auth/reset-password
 * Consumes a reset token (body, query string or the httpOnly cookie) and
 * sets a new password for the matching user.
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { password } = req.body ?? {};
    const passwordResetToken = readToken(req);

    if (!passwordResetToken) {
      throw new AppError("Reset token not found", 400);
    }

    if (!isPasswordValid(password)) {
      throw new AppError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        400,
      );
    }

    let decoded: decodedPayload;

    try {
      decoded = jwt.verify(
        passwordResetToken,
        process.env.PASSWORD_RESET_TOKEN_KEY!,
      ) as decodedPayload;
    } catch {
      throw new AppError(INVALID_TOKEN_MESSAGE, 401);
    }

    if (typeof decoded === "string" || !decoded.id) {
      throw new AppError(INVALID_TOKEN_MESSAGE, 401);
    }

    const user = await User.findById(decoded.id).select("+passwordResetToken");

    if (!user) {
      throw new AppError("User Not Found", 404);
    }

    // The token is single use: it must still match the hash stored on the user.
    if (
      !isPasswordResetTokenValid(passwordResetToken, user.passwordResetToken)
    ) {
      throw new AppError(
        "Reset link is invalid or has already been used",
        400,
      );
    }

    user.password = await hashPassword(password);
    user.passwordResetToken = "";
    // Force a fresh login with the new credentials.
    user.refreshToken = "";
    await user.save();

    res.clearCookie(PASSWORD_RESET_COOKIE, passwordResetCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Your password has been changed, please login again",
    });
  },
);
