import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });

    res.status(200).json({ status: 'success', data: { roles } });
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const existingRole = await prisma.role.findUnique({ where: { name } });
    if (existingRole) {
      return next(new AppError('Role name already exists', 400));
    }

    const role = await prisma.role.create({
      data: { name },
    });

    res.status(201).json({ status: 'success', data: { role } });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const role = await prisma.role.update({
      where: { id },
      data: { name },
    });

    res.status(200).json({ status: 'success', data: { role } });
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Optional: Check if users exist with this role
    const usersWithRole = await prisma.user.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      return next(new AppError('Cannot delete role as it is assigned to users', 400));
    }

    await prisma.role.delete({ where: { id } });

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};
