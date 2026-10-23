import type { Request, Response } from "express";
import { AppError, asyncHandler } from "../../middlewares/error-middleware.ts";
import { resetPasswordServices } from "./auth-services.ts";
import { removePasswordResetCookie } from "../../utils/cookies.ts";
import { PASSWORD_RESET_COOKIE } from "../../utils/password.ts";

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

    await resetPasswordServices(password, passwordResetToken);

    removePasswordResetCookie(res);

    return res.status(200).json({
      success: true,
      message: "Your password has been changed, please login again",
    });
  },
);
