import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Password reset tokens are stored hashed (never in plain text) so a database
 * leak cannot be replayed against the reset endpoint.
 */
export const hashPasswordResetToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const isPasswordResetTokenValid = (
  token: string | undefined | null,
  storedHash: string | undefined | null,
): boolean => {
  if (!token || !storedHash) return false;

  const expected = Buffer.from(hashPasswordResetToken(token));
  const actual = Buffer.from(storedHash);

  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
};
