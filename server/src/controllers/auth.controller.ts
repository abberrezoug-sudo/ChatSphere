import { Request, Response } from "express";
import { ZodError } from "zod";
import { AuthService } from "../services/auth.service.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.validator.js";

const authService = new AuthService();

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues
      .map((issue) => issue.message)
      .join(", ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
};

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const data = registerSchema.parse(req.body);

    const result = await authService.register(data);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      ...result,
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await authService.login(data);

    res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
) => {
  try {
    const data = refreshTokenSchema.parse(req.body);

    const result =
      await authService.refreshAccessToken(
        data.refreshToken
      );

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      ...result,
    });
  } catch (error: unknown) {
    res.status(401).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getMe = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await authService.getCurrentUser(
      req.user.id
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    res.status(404).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const logout = (
  _req: Request,
  res: Response
) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
