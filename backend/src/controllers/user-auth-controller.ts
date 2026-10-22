import type { Request, Response } from "express";
import { User } from "../models/index.ts";
import {
  generateAccessToken,
  generatePasswordResetToken,
  generateRefreshToken,
} from "../utils/jwt.ts";
import type {
  AuthenticatedRequest,
  decodedPayload,
} from "../middlewares/auth-middleware.ts";
import { AppError, asyncHandler } from "../middlewares/error-middleware.ts";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword, INVALID_TOKEN_MESSAGE, isPasswordValid, MIN_PASSWORD_LENGTH, PASSWORD_RESET_COOKIE, passwordResetCookieOptions } from "../utils/password.ts";
import { hashPasswordResetToken, isPasswordResetTokenValid } from "../utils/crypto.ts";
import { sendEmail } from "../services/email.service.ts";
import { CaptchaGenerator, createCaptcha } from "captcha-canvas";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, phone, dateOfBirth, occupation } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      throw new AppError("Name, email and password are required", 400);
    }

    const profilePicUrl = req.file ? req.file.path : "";

    const isUserExist = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (isUserExist) {
      throw new AppError("User Already Exists", 409);
    }

    const hashPasswordValue = await hashPassword(password);
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashPasswordValue,
      phone:
        typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
      dateOfBirth,
      occupation: typeof occupation === "string" ? occupation.trim() : "",
      profilepic: profilePicUrl,
    });

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        occupation: newUser.occupation ?? "",
        profilepic: newUser.profilepic,
      },
    });
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const isUserExist = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!isUserExist) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await comparePassword(password, isUserExist.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = generateAccessToken(isUserExist.id);
  const refreshToken = generateRefreshToken(isUserExist.id);

  isUserExist.refreshToken = refreshToken;
  await isUserExist.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  });

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    user: {
      id: isUserExist.id,
      name: isUserExist.name,
      email: isUserExist.email,
      occupation: isUserExist.occupation ?? "",
      profilepic: isUserExist.profilepic,
      phone: isUserExist.phone,
      dateOfBirth: isUserExist.dateOfBirth,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/api/v1/auth",
    });

    res.status(404).json({
      success: false,
      message: "No refresh token found",
    });
    return;
  }

  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = "";
    await user.save();
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const refreshToken = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const refreshTokenFromCookie = req.cookies?.refreshToken;

    if (!refreshTokenFromCookie) {
      throw new AppError("Refresh token missing", 401);
    }

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

    const accessToken = generateAccessToken(user.id);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
    });
  }
);

export const authMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const refreshTokenFromCookies = req.cookies?.refreshToken;

    if (!refreshTokenFromCookies) {
      throw new AppError("Token not found", 401);
    }

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

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    res.status(200).json({
      success: true,
      message: "Authenticated User",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
        occupation: user.occupation ?? "",
        profilepic: user.profilepic,
      },
    });
  }
);

export const updateMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.userId;
    const { name, email, phone, dateOfBirth, occupation } = req.body;

    const updateData: Record<string, unknown> = {};

    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const emailTaken = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });
      if (emailTaken) {
        throw new AppError("Email already in use", 409);
      }
      updateData.email = normalizedEmail;
    }

    if (typeof phone === "string" && phone.trim()) {
      updateData.phone = phone.trim();
    }

    if (typeof dateOfBirth === "string" && dateOfBirth.trim()) {
      updateData.dateOfBirth = dateOfBirth.trim();
    }

    if (typeof occupation === "string") {
      updateData.occupation = occupation.trim();
    }

    if (req.file?.path) {
      updateData.profilepic = req.file.path;
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

    res.status(200).json({
      success: true,
      message: "User Updated successfully",
      data: updatedUser,
    });
  }
);

export const forgetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
      throw new AppError("Email is required", 400);
    }

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

    // Same browser convenience: the raw token also travels in an httpOnly
    // cookie so the reset page can work without the emailed link.
    res.cookie(
      PASSWORD_RESET_COOKIE,
      passwordResetToken,
      passwordResetCookieOptions(),
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  },
);


const readToken = (req: Request): string | undefined => {
  const fromBody = req.body?.token;
  if (typeof fromBody === "string" && fromBody.trim()) return fromBody.trim();

  const fromQuery = req.query?.token;
  if (typeof fromQuery === "string" && fromQuery.trim()) return fromQuery.trim();

  const fromCookie = req.cookies?.[PASSWORD_RESET_COOKIE];
  if (typeof fromCookie === "string" && fromCookie.trim()) return fromCookie.trim();

  return undefined;
};


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
export const captchaGenerator= asyncHandler(async(req,res)=>{
  
  const captcha = new CaptchaGenerator()
    .setDimension(150, 400)
    .setCaptcha({ characters: 6, size: 60 })
    .setTrace({ color: "#ff0000" });

  const buffer = captcha.generateSync();

  console.log(buffer)
})
