import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/error-middleware.ts";
import {
  CAPTCHA_COOKIE,
  CAPTCHA_TTL_MS,
  generateCaptcha,
} from "../utils/captcha.ts";

/**
 * GET /api/v1/auth/captcha
 * Returns a captcha image and sets the signed answer as an httpOnly cookie.
 */
export const captchaGenerator = asyncHandler(
  async (_req: Request, res: Response) => {
    const { id, image, token } = await generateCaptcha();

    res.cookie(CAPTCHA_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: CAPTCHA_TTL_MS,
      path: "/api/v1/auth",
    });

    return res.status(200).json({
      success: true,
      message: "Captcha generated",
      data: {
        id,
        image,
      },
    });
  },
);
