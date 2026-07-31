import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const rawSuppliers = await prisma.supplier.findMany({
      include: {
        products: true
      }
    });

    const data = rawSuppliers.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      contactName: s.contactName || 'N/A',
      contactEmail: s.contactEmail || 'N/A',
      contactPhone: s.contactPhone || '',
      website: s.website || '',
      country: s.country || 'USA',
      connectionType: s.connectionType || 'api',
      status: s.status === 'active' ? 'active' : 'inactive',
      productCount: s.products?.length || 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      rating: 5,
      performance: {
        fulfillmentRate: 99,
        defectRate: 0.1,
        onTimeDelivery: 98
      }
    }));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Suppliers' });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const data = await prisma.supplier.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Supplier' });
  }
};
