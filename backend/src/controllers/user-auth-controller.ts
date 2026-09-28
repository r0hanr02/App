import type { Request, Response } from "express";
import { User } from "../models/index.ts";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.ts";
import type {
  AuthenticatedRequest,
  decodedPayload,
} from "../middlewares/auth-middleware.ts";
import { AppError, asyncHandler } from "../middlewares/error-middleware.ts";
import jwt from "jsonwebtoken";

const saltRound = process.env.SALT_ROUND
  ? parseInt(process.env.SALT_ROUND)
  : 10;

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, phone, dateOfBirth } = req.body;

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
      phone,
      dateOfBirth,
      profilepic: profilePicUrl,
    });

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        dateOfBirth: newUser.dateOfBirth,
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
  });

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    user: {
      id: isUserExist.id,
      name: isUserExist.name,
      email: isUserExist.email,
      profilepic: isUserExist.profilepic,
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
    });

    res.status(200).json({
      success: true,
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

    const user = await User.findOne({ refreshToken: refreshTokenFromCookie });

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

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Authenticated User",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilepic: user.profilepic,
      },
    });
  }
);

export const updateMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.userId;
    const { name, email, phone, dateOfBirth } = req.body;

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
