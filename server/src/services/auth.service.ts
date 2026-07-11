import bcrypt from "bcrypt";
import { User } from "../models/User.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { IUser } from "../models/User.js";

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

const toAuthUser = (user: IUser) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
});

export class AuthService {

  async register(
    payload: RegisterPayload
  ) {

    const exists = await User.findOne({
      $or: [
        { email: payload.email },
        { username: payload.username },
      ],
    });

    if (exists) {
      throw new Error(
        exists.email === payload.email
          ? "Email already exists"
          : "Username already exists"
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

    const accessToken =
      generateAccessToken(
        user.id
      );

    const refreshToken =
      generateRefreshToken(
        user.id
      );

    return {
      user: toAuthUser(user),
      accessToken,
      refreshToken,
    };
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
      user: toAuthUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ) {
    const payload =
      verifyRefreshToken(refreshToken);

    const user = await User.findById(
      payload.userId
    );

    if (!user) {
      throw new Error(
        "Invalid refresh token"
      );
    }

    return {
      user: toAuthUser(user),
      accessToken: generateAccessToken(user.id),
    };
  }
}
