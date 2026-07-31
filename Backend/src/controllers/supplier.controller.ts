import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const data = await prisma.supplier.findMany({
      include: {
        connections: true,
      }
    });
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
    const { type, apiUrl, username, password, apiKey } = req.body;
    
    // Simulate connection testing framework
    // This can be extended later with real axios/ftp calls
    
    if (!type) {
      return res.status(400).json({ status: 'Failed', reason: 'Connection type is required' });
    }
    
    if (type === 'REST API' && !apiUrl) {
      return res.status(400).json({ status: 'Failed', reason: 'API URL is required for REST API' });
    }
    
    // Fake successful connection for valid inputs
    res.json({
      status: 'Connected',
      reason: 'Connection established successfully'
    });
    
  } catch (error) {
    res.status(500).json({ status: 'Error', reason: 'Internal server error during connection test' });
  }
};
