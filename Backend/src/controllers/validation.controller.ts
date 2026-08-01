import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getValidationItems = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.validationLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const data = logs.map(l => ({
      id: l.id,
      productName: l.entityId ? `Product #${l.entityId.slice(0, 8)}` : 'Validation Record',
      supplierSku: `SKU-${l.entityId ? l.entityId.slice(0, 6).toUpperCase() : 'VAL'}`,
      supplierName: 'System Engine',
      status: l.status === 'resolved' ? 'approved' : 'pending',
      errors: l.status === 'resolved' ? [] : [
        {
          id: `err_${l.id.slice(0, 4)}`,
          type: 'invalid_category',
          message: l.issue || 'Validation issue detected',
          severity: 'error',
        }
      ],
      warnings: [],
      reviewedBy: null,
      reviewedAt: l.resolvedAt || null,
      lastCheckedAt: l.createdAt,
    }));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Validation Items' });
  }
};

export const createValidationCheck = async (req: Request, res: Response) => {
  try {
    const { entityId, entityType, issue } = req.body;
    const log = await prisma.validationLog.create({
      data: {
        entityId: entityId || `ent_${Date.now()}`,
        entityType: entityType || 'Product',
        issue: issue || 'Validation Audit Check Triggered',
        status: 'open',
      }
    });
    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to trigger validation check' });
  }
};

export const resolveValidationItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.validationLog.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
      }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to resolve validation item' });
  }
};

export const deleteValidationItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.validationLog.delete({ where: { id } });
    res.json({ message: 'Validation Log deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete validation log' });
  }
};
