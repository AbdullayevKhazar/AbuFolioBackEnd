import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserSchema from "../modules/UserSchema";
import { AuthenticatedRequest } from "../middleware/auth";

const ACCESS_TOKEN_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN ||
  "15m") as jwt.SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN ||
  "7d") as jwt.SignOptions["expiresIn"];

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || getJwtSecret();

const signAccessToken = (userId: string, role: string) =>
  jwt.sign({ id: userId, role }, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

const signRefreshToken = (userId: string, role: string) =>
  jwt.sign(
    { id: userId, role, type: "refresh" },
    getRefreshSecret(),
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );

export const register = async (req: Request, res: Response) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const signupKey = String(req.body.signupKey || "");

    if (!username || !email || !password || !signupKey) {
      return res.status(400).json({
        message: "Username, email, password and signup key are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    if (username.length < 3 || username.length > 40) {
      return res
        .status(400)
        .json({ message: "Username must be between 3 and 40 characters" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (
      !process.env.ADMIN_SIGNUP_KEY ||
      signupKey !== process.env.ADMIN_SIGNUP_KEY
    ) {
      return res.status(403).json({ message: "Invalid admin signup key" });
    }

    const existingUser = await UserSchema.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email or username is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserSchema({
      username,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newUser.save();

    const accessToken = signAccessToken(String(newUser._id), newUser.role);
    const refreshToken = signRefreshToken(String(newUser._id), newUser.role);

    return res.status(201).json({
      message: "Admin account created successfully",
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create account" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await UserSchema.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = signAccessToken(String(user._id), user.role);
    const refreshToken = signRefreshToken(String(user._id), user.role);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in" });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      getRefreshSecret(),
    ) as { id: string; role: string; type?: string };

    if (decoded.type !== "refresh") {
      return res.status(403).json({ message: "Invalid token type" });
    }

    const user = await UserSchema.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = signAccessToken(String(user._id), user.role);

    return res.status(200).json({ accessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const user = await UserSchema.findById(req.user?.id).select(
      "_id username email role",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return res.status(500).json({ message: "Unable to load user" });
  }
};
