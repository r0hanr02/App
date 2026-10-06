import jwt from "jsonwebtoken";

export const generateAccessToken = (id: string) => {
  if (!process.env.SECRET_KEY) {
    throw new Error(
      "JWT_SECRET is not defined. Please set ACCESS_TOKEN_PRIVATE_KEY in your .env file"
    );
  }
  return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: "15m" });
};

export const generateRefreshToken = (id: string) => {
  if (!process.env.REFRESH_TOKEN_KEY) {
    throw new Error(
      "JWT_SECRET is not defined. Please set REFRESH_TOKEN_PRIVATE_KEY in your .env file"
    );
  }
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "20d" });
};
