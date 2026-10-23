import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../modules/auth/user-model.ts";
import { AppError } from "./error-middleware.ts";

export type AuthenticatedRequest<TParams = ParamsDictionary> = Request<TParams> & {
  userId?: any;
  user?: any;
  organizationMember?: any;
  projectMember?: any;
};
export type decodedPayload = JwtPayload & { id: string };

const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Token Not Found", 401));
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token!, process.env.SECRET_KEY!) as decodedPayload;

    if (typeof decoded === "string" || !decoded.id) {
      return next(new AppError("Session Expired", 401));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User Not Found", 401));
    }

    req.userId = user._id;
    (req as any).user = {
      _id: user._id,
      id: user._id.toString(),
      email: (user as any).email,
      name: (user as any).name,
      occupation: (user as any).occupation ?? "",
      profilepic:(user as any).profilepic
    };

    next();
  } catch (error: any) {
    // jwt errors -> 401, others -> 500 via errorHandler
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Session Expired", 401));
    }
    next(error);
  }
};

export default authMiddleware;
