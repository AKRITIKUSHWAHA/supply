import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRules = async (req: Request, res: Response) => {
  try {
    const rules = await prisma.pricingRule.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

export const createRule = async (req: Request, res: Response) => {
  try {
    const { name, formula, applies } = req.body;
    const rule = await prisma.pricingRule.create({
      data: { name, formula, applies, products: 0, active: true },
    });
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

export const updateRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, formula, applies, active } = req.body;
    const rule = await prisma.pricingRule.update({
      where: { id },
      data: { name, formula, applies, active },
    });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.pricingRule.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};

export const getAudits = async (req: Request, res: Response) => {
  try {
    const audits = await prisma.pricingAudit.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(audits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audits' });
  }
};
