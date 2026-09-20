import type { Request, Response } from "express";
import { User } from "../models/index.ts";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.ts";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";

const saltRound = process.env.SALT_ROUND
  ? parseInt(process.env.SALT_ROUND)
  : 10;

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, dateOfBirth } = req.body;
    const isUserExist = await User.findOne({ email });
    if (!isUserExist) {
      const hashPassword = await bcrypt.hash(password, saltRound);
      const newUser = await User.create({
        name,
        email,
        password: hashPassword,
        phone,
        dateOfBirth,
      });

      return res.status(200).json({
        message: "User Created Successfully",
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          dateOfBirth: newUser.dateOfBirth,
        },
      });
    }

    return res.status(403).json({
      message: "User Already Exists",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const isUserExist = await User.findOne({ email }).select("+password");

    if (!isUserExist) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, isUserExist.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
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

    return res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      user: {
        id: isUserExist.id,
        name: isUserExist.name,
        email: isUserExist.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      return res.status(200).json({
        message: "No refresh token found",
      });
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

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const refreshTokenFromCookie = req.cookies?.refreshToken;

    if (!refreshTokenFromCookie) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const user = await User.findOne({ refreshToken: refreshTokenFromCookie });

    if (!user) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken = generateAccessToken(user.id);

    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
