
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStores = async (req: Request, res: Response) => {
  try {
    const data = await prisma.store.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Stores' });
  }
};

export const createStore = async (req: Request, res: Response) => {
  try {
    const data = await prisma.store.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Store' });
  }
};
