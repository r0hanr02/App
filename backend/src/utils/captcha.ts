import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { createCaptcha } from "captcha-canvas";

export const CAPTCHA_COOKIE = "captchaToken";

export const CAPTCHA_TTL = "5m";

export const CAPTCHA_TTL_MS = 5 * 60 * 1000;

export const CAPTCHA_WIDTH = 400;

export const CAPTCHA_HEIGHT = 64;

export const CAPTCHA_CHARACTERS = 5;

export type CaptchaPayload = {
  id: string;
  answerHash: string;
};

const getCaptchaSecret = (): string => {
  const secret = process.env.CAPTCHA_TOKEN_KEY ?? process.env.SECRET_KEY;

  if (!secret) {
    throw new Error(
      "CAPTCHA_TOKEN_KEY is not defined. Please set it in your .env file",
    );
  }

  return secret;
};

export const hashCaptchaAnswer = (answer: string): string =>
  createHash("sha256")
    .update(answer.trim().toLowerCase())
    .digest("hex");

/**
 * Renders a distorted captcha image and keeps only the hash of the answer
 * inside a signed short lived token. The plaintext answer never leaves the
 * server.
 */
export const generateCaptcha = async () => {
  const { image, text } = createCaptcha(CAPTCHA_WIDTH, CAPTCHA_HEIGHT, {
    captcha: { characters: CAPTCHA_CHARACTERS, size: 40 },
  });

  const buffer = await image;
  const id = randomUUID();

  const token = jwt.sign(
    { id, answerHash: hashCaptchaAnswer(text) },
    getCaptchaSecret(),
    { expiresIn: CAPTCHA_TTL },
  );

  return {
    id,
    // data url so the client can render it without another request
    image: `data:image/png;base64,${buffer.toString("base64")}`,
    token,
  };
};

export const isCaptchaAnswerValid = (
  answer: string | undefined | null,
  answerHash: string | undefined | null,
): boolean => {
  if (!answer || !answerHash) return false;

  const expected = Buffer.from(answerHash);
  const actual = Buffer.from(hashCaptchaAnswer(answer));

  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
};
