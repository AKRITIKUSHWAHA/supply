
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const data = await prisma.product.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = await prisma.product.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Product' });
  }
};
