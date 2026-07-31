import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const rawProducts = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        supplier: true,
        prices: true,
        images: true,
        inventory: true
      }
    });

    const data = rawProducts.map(p => ({
      id: p.id,
      sku: p.sku,
      masterSku: p.sku,
      name: p.title || 'Untitled',
      description: p.description || '',
      brand: p.brand?.name || 'Generic',
      categoryName: p.category?.name || 'General',
      supplierId: p.supplierId || 's1',
      supplierName: p.supplier?.name || 'Local Supplier',
      supplierSku: p.sku,
      status: p.status === 'draft' ? 'draft' : 'published',
      validationStatus: 'passed',
      pricing: {
        supplierPrice: p.prices?.[0]?.cost || 0,
        costPrice: p.prices?.[0]?.cost || 0,
        retailPrice: p.prices?.[0]?.price || 0,
        currency: p.prices?.[0]?.currency || 'USD',
      },
      inventory: {
        totalStock: p.inventory?.[0]?.quantity || 0,
        availableStock: p.inventory?.[0]?.quantity || 0,
        status: (p.inventory?.[0]?.quantity || 0) > 0 ? 'in_stock' : 'out_of_stock'
      },
      images: p.images?.map(img => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary,
        syncStatus: 'synced'
      })) || [],
      variants: [],
      attributes: [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Products' });
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
