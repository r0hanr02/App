import jwt from "jsonwebtoken";
import { AppError } from "../../middlewares/error-middleware";
import type { decodedPayload } from "../../middlewares/auth-middleware.ts";
import { sendEmail } from "../../services/email.service.ts";
import { hashPasswordResetToken, isPasswordResetTokenValid } from "../../utils/crypto.ts";
import {
  generateAccessToken,
  generatePasswordResetToken,
  generateRefreshToken,
} from "../../utils/jwt.ts";
import {
  comparePassword,
  hashPassword,
  INVALID_TOKEN_MESSAGE,
  isPasswordValid,
  MIN_PASSWORD_LENGTH,
} from "../../utils/password.ts";
import type {
  LoginUserInput,
  RegisterUserInput,
  UpdateMeInput,
} from "./auth.types.ts";
import { User } from "./user-model.ts";

export const registerUserService = async (input:RegisterUserInput) =>{
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User Already Exists", 409);
  }

  const hashedPassword = await hashPassword(input.password);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    phone: input.phone?.trim() || undefined,
    dateOfBirth: input.dateOfBirth,
    occupation: input.occupation?.trim() || "",
    profilepic: input.profilepic || "",
  });

  return newUser;
}


export const loginUserServices = async ({ email, password }: LoginUserInput) => {
  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const logoutUserServices = async (refreshToken: string) => {
  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = "";
    await user.save();
  }

  return Boolean(user);
};

export const refreshTokenServices = async (refreshTokenFromCookie: string) => {
  const decoded = jwt.verify(
    refreshTokenFromCookie,
    process.env.REFRESH_TOKEN_KEY!
  ) as decodedPayload;

  const user = await User.findOne({
    _id: decoded.id,
    refreshToken: refreshTokenFromCookie,
  });

  if (!user) {
    throw new AppError("Invalid refresh token", 403);
  }

  return { accessToken: generateAccessToken(user.id) };
};

export const authMeServices = async (refreshTokenFromCookies: string) => {
  const decoded = jwt.verify(
    refreshTokenFromCookies,
    process.env.REFRESH_TOKEN_KEY!
  ) as decodedPayload;

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.refreshToken !== refreshTokenFromCookies) {
    throw new AppError("Invalid refresh token", 403);
  }

  const accessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  user.refreshToken = newRefreshToken;
  await user.save();

  return { user, accessToken, newRefreshToken };
};

export const updateMeServices = async (
  userId: unknown,
  input: UpdateMeInput
) => {
  const updateData: Record<string, unknown> = {};

  if (typeof input.name === "string" && input.name.trim()) {
    updateData.name = input.name.trim();
  }

  if (typeof input.email === "string" && input.email.trim()) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const emailTaken = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });
    if (emailTaken) {
      throw new AppError("Email already in use", 409);
    }
    updateData.email = normalizedEmail;
  }

  if (typeof input.phone === "string" && input.phone.trim()) {
    updateData.phone = input.phone.trim();
  }

  if (typeof input.dateOfBirth === "string" && input.dateOfBirth.trim()) {
    updateData.dateOfBirth = input.dateOfBirth.trim();
  }

  if (typeof input.occupation === "string") {
    updateData.occupation = input.occupation.trim();
  }

  if (typeof input.profilepic === "string" && input.profilepic) {
    updateData.profilepic = input.profilepic;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError("No valid fields provided for update", 400);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError("User not found", 404);
  }

  return updatedUser;
};

export const forgetPasswordServices = async (email: string) => {
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

  return { email: user.email, passwordResetToken };
};

export const resetPasswordServices = async (
  password: unknown,
  passwordResetToken: string | undefined
) => {
  if (!passwordResetToken) {
    throw new AppError("Reset token not found", 400);
  }

  if (!isPasswordValid(password)) {
    throw new AppError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      400
    );
  }

  let decoded: decodedPayload;

  try {
    decoded = jwt.verify(
      passwordResetToken,
      process.env.PASSWORD_RESET_TOKEN_KEY!
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
    throw new AppError("Reset link is invalid or has already been used", 400);
  }

  user.password = await hashPassword(password);
  user.passwordResetToken = "";
  // Force a fresh login with the new credentials.
  user.refreshToken = "";
  await user.save();
};
