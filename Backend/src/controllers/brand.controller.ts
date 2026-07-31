
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBrands = async (req: Request, res: Response) => {
  try {
    const data = await prisma.brand.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Brands' });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const data = await prisma.brand.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Brand' });
  }
};
