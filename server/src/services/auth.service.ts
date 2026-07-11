import bcrypt from "bcrypt";
import { User } from "../models/User.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export class AuthService {

  async register(
    payload: RegisterPayload
  ) {

    const exists = await User.findOne({
      email: payload.email,
    });

    if (exists) {
      throw new Error(
        "Email already exists"
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        payload.password,
        10
      );

    const user =
      await User.create({
        username: payload.username,
        email: payload.email,
        password: hashedPassword,
      });

    return user;
  }

  async login(
    payload: LoginPayload
  ) {

    const user =
      await User.findOne({
        email: payload.email,
      });

    if (!user) {
      throw new Error(
        "Invalid credentials"
      );
    }

    const valid =
      await bcrypt.compare(
        payload.password,
        user.password
      );

    if (!valid) {
      throw new Error(
        "Invalid credentials"
      );
    }

    const accessToken =
      generateAccessToken(
        user.id
      );

    const refreshToken =
      generateRefreshToken(
        user.id
      );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}