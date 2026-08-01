import { Request, Response } from 'express';

// Note: PricingRule and PricingAudit models are not yet in the Prisma schema.
// These endpoints return stub data until the schema is migrated with these models.

const mockRules: any[] = [];
const mockAudits: any[] = [];

export const getRules = async (req: Request, res: Response) => {
  try {
    res.json(mockRules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

export const createRule = async (req: Request, res: Response) => {
  try {
    const { name, formula, applies } = req.body;
    const rule = {
      id: Date.now().toString(),
      name,
      formula,
      applies,
      products: 0,
      active: true,
      createdAt: new Date(),
    };
    mockRules.push(rule);
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

export const updateRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, formula, applies, active } = req.body;
    const idx = mockRules.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
    mockRules[idx] = { ...mockRules[idx], name, formula, applies, active };
    res.json(mockRules[idx]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = mockRules.findIndex(r => r.id === id);
    if (idx !== -1) mockRules.splice(idx, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};

export const getAudits = async (req: Request, res: Response) => {
  try {
    res.json(mockAudits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audits' });
  }
};
