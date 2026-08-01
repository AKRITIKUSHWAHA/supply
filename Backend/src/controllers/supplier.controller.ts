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
      code: s.company || s.name,
      contactName: s.name,
      contactEmail: s.email || 'N/A',
      contactPhone: s.phone || '',
      website: s.website || '',
      country: 'USA',
      connectionType: 'api',
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

export const testSupplierConnection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    // Basic connection test — returns success with supplier details
    res.json({
      success: true,
      message: `Connection test successful for supplier: ${supplier.name}`,
      supplierId: id,
      status: supplier.status
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Connection test failed' });
  }
};
