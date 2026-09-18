import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/index.ts";

export type AuthenticatedRequest<TParams = ParamsDictionary> = Request<TParams> & {
  user?: any;
  organizationMember?: any;
};
export type decodedPayload = JwtPayload & { id: string };

const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token Not Found",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token!,
      process.env.SECRET_KEY!
    ) as decodedPayload;

    if (typeof decoded === "string" || !decoded.id) {
      return res.status(401).json({
        message: "Session Expired",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User Not Found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Session Expired",
    });
  }
};

export default authMiddleware;
