import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { logger } from "../utils/logger.ts";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default to 500 if no statusCode
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  let errors: any = undefined;

  // Mongoose ValidationError (e.g., organization_name required, enum fail)
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose CastError (invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Duplicate key - MongoServerError code 11000
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || "field";
    message = `Duplicate value for ${field}`;
    errors = err.keyValue;
  }

  // JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Zod validation (if used)
  else if (err.name === "ZodError" && err.issues) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.issues;
  }

  // Operational AppError vs programming error
  // const isOperational = err.isOperational ?? statusCode < 500;

  // Log: use req.log from pino-http if available, else global logger
  const log = (req as any).log || logger;
  if (statusCode >= 500) {
    log.error({ err, statusCode, path: req.originalUrl, method: req.method }, message);
  } else {
    log.warn({ err, statusCode, path: req.originalUrl }, message);
  }

  // Do not leak stack in production for 500
  // const isProd = process.env.NODE_ENV === "production";

  // Standardized error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    // ...(!isOperational || !isProd ? { stack: err.stack } : {}),
  });
};
