import type { Request, Response } from "express";
import { User } from "../models/index.ts";
import bcrypt from "bcryptjs";
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
import { crypto } from "crypto.js";

const saltRound = process.env.SALT_ROUND
  ? parseInt(process.env.SALT_ROUND)
  : 10;

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

    const hashPassword = await bcrypt.hash(password, saltRound);
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashPassword,
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

  const isMatch = await bcrypt.compare(password, isUserExist.password);

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
  async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req.body;
    const isUserExists = await User.findOne({ email });
    if (!isUserExists) {
      throw new AppError("User Not Found", 404);
    }
    const passwordToken = generatePasswordResetToken(
      isUserExists._id!.toString()
    );

    const hex = crypto.createHash("sha256").update(passwordToken).digest("hex");

    isUserExists.passwordResetToken = hex;
    await isUserExists.save();

    res.cookie("passwordResetToken", passwordToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
      path: "/api/v1/auth",
    });
    return res.status(200).json({
      message: "Password reset Link has been sent to your email",
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next) => {
    const { password } = req.body;
    const passwordResetToken = req.cookies?.passwordResetToken;

    if (!passwordResetToken) {
      throw new AppError("Token Not Found", 404);
    }

    const decoded = jwt.verify(
      passwordResetToken!,
      process.env.PASSWORD_RESET_TOKEN_KEY!
    ) as decodedPayload;

    if (typeof decoded === "string" || !decoded.id) {
      return next(new AppError("Session Expired", 401));
    }

    const hashPassword = await bcrypt.hash(password, saltRound);
    const user = await User.findById(decoded.id);
    console.log(user);

    if (user) {
      user.password = hashPassword;
      user.passwordResetToken = "";
      await user.save();
    }

    res.clearCookie("passwordResetToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/api/v1/auth",
    });

    return res.status(200).json({
      message: "your password has been changed! try login again",
    });
  }
);

export const captchaGenerator= asyncHandler((req,res)=>{})
