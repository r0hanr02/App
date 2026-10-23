import type { Response } from "express";

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TOKEN_TTL = 15 * 60 * 1000;

export const addRefreshTokenCookie = (res: Response, refreshToken: String) => {
  return res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/api/v1/auth",
  });
};

export const removeRefreshTokenCookie = (res: Response) => {
 return res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth",
  });
};

export const addPasswordResetTokenCookie = (
  res: Response,
  passwordResetToken: string
) => {
  return res.cookie("passwordResetToken", passwordResetToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: PASSWORD_RESET_TOKEN_TTL,
    path: "/api/v1/auth",
  });
};
export const removePasswordResetCookie = (res: Response) => {
  return res.clearCookie("passwordResetToken", {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    // maxAge: PASSWORD_RESET_TOKEN_TTL,
    path: "/api/v1/auth",
  });
};
