import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error-middleware.ts";
import {
  CAPTCHA_COOKIE,
  type CaptchaPayload,
  isCaptchaAnswerValid,
} from "../utils/captcha.ts";

const getCaptchaSecret = (): string =>
  process.env.CAPTCHA_TOKEN_KEY ?? process.env.SECRET_KEY ?? "";

/**
 * Validates the captcha answer sent by the client against the answer hash
 * stored inside the signed `captchaToken` cookie.
 *
 * The cookie is set by GET /api/v1/auth/captcha, so the answer never leaves
 * the server.
 */
export const captchaMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const captchaToken = req.cookies?.[CAPTCHA_COOKIE];
  const answer = req.body?.captcha;

  if (!captchaToken) {
    return next(
      new AppError("Captcha expired, please refresh the captcha", 400),
    );
  }

  if (typeof answer !== "string" || !answer.trim()) {
    return next(new AppError("Captcha answer is required", 400));
  }

  let decoded: CaptchaPayload;

  try {
    decoded = jwt.verify(captchaToken, getCaptchaSecret()) as CaptchaPayload;
  } catch {
    return next(
      new AppError("Captcha expired, please refresh the captcha", 400),
    );
  }

  if (!isCaptchaAnswerValid(answer, decoded?.answerHash)) {
    return next(new AppError("Incorrect captcha answer", 400));
  }

  next();
};

export default captchaMiddleware;
