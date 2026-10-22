import bcrypt from "bcryptjs";

const saltRound = (process.env.SALT_ROUND ?? process.env.SALT_ROUNDS)
  ? parseInt((process.env.SALT_ROUND ?? process.env.SALT_ROUNDS)!, 10)
  : 10;

export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_RESET_COOKIE = "passwordResetToken";

export const PASSWORD_RESET_TOKEN_TTL = 15 * 60 * 1000;

export const passwordResetCookieOptions = () => ({
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: PASSWORD_RESET_TOKEN_TTL,
  path: "/api/v1/auth",
});

export const hashPassword = (password: string) =>
  bcrypt.hash(password, saltRound);

export const comparePassword = (password: string, hashedPassword: string) =>
  bcrypt.compare(password, hashedPassword);

export const isPasswordValid = (password: unknown): password is string =>
  typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;

export const INVALID_TOKEN_MESSAGE = "Reset link is invalid or has expired";

