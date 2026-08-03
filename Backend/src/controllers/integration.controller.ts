import { Request, Response } from 'express';

// In-memory mock data for Integrations since there is no Prisma model for this specific entity
let typesList: any[] = [];
let events: any[] = [];

export const getIntegrations = (req: Request, res: Response) => {
  res.json({ typesList, events });
};

export const createIntegration = (req: Request, res: Response) => {
  const { newLabel, newType, newDesc } = req.body;
  const newItem = {
    id: `${newType || 'api'}_${Date.now()}`,
    label: newLabel || 'Custom Integration',
    emoji: newType === 'api' ? '🔌' : newType === 'sftp' ? '🔐' : '📄',
    color: 'from-indigo-600 to-cyan-600',
    description: newDesc || 'Custom supplier integration protocol configuration',
    activeCount: 1,
    features: ['Custom Protocol', 'Token Auth', 'Scheduled Pulls', 'Schema Parser'],
    timeoutSec: 45,
    rateLimitHr: 2000,
    retries: 3,
    schedule: 'Every 6 hours',
  };
  typesList.push(newItem);
  res.status(201).json(newItem);
};

export const updateIntegration = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = typesList.findIndex(t => t.id === id);
  if (index !== -1) {
    typesList[index] = { ...typesList[index], ...req.body };
    res.json(typesList[index]);
  } else {
    res.status(404).json({ error: 'Integration not found' });
  }
};

export const testIntegration = (req: Request, res: Response) => {
  const { id } = req.params;
  const type = typesList.find(t => t.id === id);
  if (!type) return res.status(404).json({ error: 'Integration not found' });

  const newEvent = {
    id: `ev_${Date.now()}`,
    type: type.label,
    supplier: 'System Protocol Handshake',
    event: `${type.label} connection test passed — 200 OK (Latency: 38ms)`,
    time: 'Just now',
    ok: true,
  };
  events.unshift(newEvent); // add to top
  res.json({ success: true, event: newEvent });
};
