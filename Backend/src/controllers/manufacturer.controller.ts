import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getManufacturers = async (req: Request, res: Response) => {
  try {
    const rawManufacturers = await prisma.manufacturer.findMany();

    const data = rawManufacturers.map(m => ({
      id: m.id,
      name: m.company, // mapped to name
      description: m.country ? `Based in ${m.country}` : '', // mapped to description
      status: m.status === 'active' ? 'active' : 'inactive',
    }));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Manufacturers' });
  }
};

export const createManufacturer = async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body;
    const newManufacturer = await prisma.manufacturer.create({ 
      data: {
        company: name,
        country: description,
        status
      }
    });
    res.status(201).json(newManufacturer);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create Manufacturer' });
  }
};

export const updateManufacturer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const updated = await prisma.manufacturer.update({
      where: { id },
      data: { company: name, country: description, status }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update Manufacturer' });
  }
};

export const deleteManufacturer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.manufacturer.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete Manufacturer' });
  }
};
