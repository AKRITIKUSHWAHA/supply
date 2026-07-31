import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone, roleId, departmentId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        roleId,
        departmentId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (user.status !== 'active') {
      return next(new AppError('User account is deactivated', 403));
    }

    const accessToken = generateAccessToken(user.id, user.role.name);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    
    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'Login',
        details: 'User logged into the system',
        ipAddress: req.ip,
      }
    });

    res.cookie('jwt', accessToken, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'Logout',
          details: 'User logged out of the system',
          ipAddress: req.ip,
        }
      });
    }

    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    
    if (!token) return next(new AppError('Refresh token required', 400));
    
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { role: true } } }
    });
    
    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }
    
    const decoded = verifyRefreshToken(token);
    
    const newAccessToken = generateAccessToken(tokenRecord.userId, tokenRecord.user.role.name);
    
    res.status(200).json({
      status: 'success',
      accessToken: newAccessToken
    });
  } catch (error) {
    next(new AppError('Invalid refresh token', 401));
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ status: 'success', message: 'Forgot password endpoint placeholder' });
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ status: 'success', message: 'Reset password endpoint placeholder' });
};
