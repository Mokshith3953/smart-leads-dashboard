import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ApiResponse, JwtPayload } from '../types';

const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  });

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, message: 'Email already registered' });
    return;
  }

  const user = await User.create({ name, email, password, role });
  const token = signToken({ id: user._id.toString(), role: user.role });

  const response: ApiResponse<{ token: string; user: { id: string; name: string; email: string; role: string } }> = {
    success: true,
    message: 'Account created successfully',
    data: {
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    },
  };
  res.status(201).json(response);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const token = signToken({ id: user._id.toString(), role: user.role });

  const response: ApiResponse<{ token: string; user: { id: string; name: string; email: string; role: string } }> = {
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    },
  };
  res.status(200).json(response);
};

export const getMe = async (req: Request & { user?: { id: string; role: string } }, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
};
