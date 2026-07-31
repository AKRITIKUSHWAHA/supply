
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategorys = async (req: Request, res: Response) => {
  try {
    const data = await prisma.category.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Categorys' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const data = await prisma.category.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Category' });
  }
};
