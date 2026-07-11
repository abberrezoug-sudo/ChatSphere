import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

export const generateAccessToken = (
  userId: string
): string => {
  return jwt.sign(
    { userId },
    env.jwtSecret,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (
  userId: string
): string => {
  return jwt.sign(
    { userId },
    env.jwtRefreshSecret,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyAccessToken = (
  token: string
) : AuthTokenPayload => {
  const payload = jwt.verify(
    token,
    env.jwtSecret
  );

  if (
    typeof payload === "string" ||
    typeof payload.userId !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return payload as AuthTokenPayload;
};

export const verifyRefreshToken = (
  token: string
) : AuthTokenPayload => {
  const payload = jwt.verify(
    token,
    env.jwtRefreshSecret
  );

  if (
    typeof payload === "string" ||
    typeof payload.userId !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return payload as AuthTokenPayload;
};
