import type { Request, Response } from "express";
import { AppError, asyncHandler } from "../../middlewares/error-middleware";
import type {
  AuthenticatedRequest,
} from "../../middlewares/auth-middleware";
import type { LoginUserInput, UpdateMeInput } from "./auth.types.ts";
import {
  authMeServices,
  loginUserServices,
  logoutUserServices,
  refreshTokenServices,
  registerUserService,
  updateMeServices,
} from "./auth-services.ts";
import {
  addRefreshTokenCookie,
  removeRefreshTokenCookie,
} from "../../utils/cookies.ts";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, phone, dateOfBirth, occupation } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      throw new AppError("Name, email and password are required", 400);
    }

    const newUser = await registerUserService({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      occupation,
      profilepic: req.file?.path || "",
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
  const { email, password } = req.body as LoginUserInput;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const { user, accessToken, refreshToken } = await loginUserServices({
    email,
    password,
  });

  addRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      occupation: user.occupation ?? "",
      profilepic: user.profilepic,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    removeRefreshTokenCookie(res);

    res.status(404).json({
      success: false,
      message: "No refresh token found",
    });
    return;
  }

  await logoutUserServices(refreshToken);

  removeRefreshTokenCookie(res);

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

    const { accessToken } = await refreshTokenServices(refreshTokenFromCookie);

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

    const { user, accessToken, newRefreshToken } = await authMeServices(
      refreshTokenFromCookies
    );

    addRefreshTokenCookie(res, newRefreshToken);

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

    const updatedUser = await updateMeServices(userId, {
      name,
      email,
      phone,
      dateOfBirth,
      occupation,
      profilepic: req.file?.path,
    } satisfies UpdateMeInput);

    res.status(200).json({
      success: true,
      message: "User Updated successfully",
      data: updatedUser,
    });
  }
);
