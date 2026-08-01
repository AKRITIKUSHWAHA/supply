import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMedia = async (req: Request, res: Response) => {
  try {
    const rawMedia = await prisma.media.findMany();

    const data = rawMedia.map(m => ({
      id: m.id,
      name: m.filename || 'Unnamed',
      sku: 'SKU-' + m.id.substring(0, 4).toUpperCase(),
      type: m.type || 'Image (PNG)',
      imageUrl: m.url || 'https://via.placeholder.com/150',
      status: 'active'
    }));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Media' });
  }
};

export const createMedia = async (req: Request, res: Response) => {
  try {
    const { url, filename, folder } = req.body;
    const newMedia = await prisma.media.create({ 
      data: {
        url,
        filename,
        type: 'image',
        folder,
        size: 1024
      }
    });
    res.status(201).json(newMedia);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create Media' });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.media.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete Media' });
  }
};
