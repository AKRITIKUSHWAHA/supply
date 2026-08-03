import { Request, Response } from 'express';

const mockJobs: any[] = [];

export const getImports = (req: Request, res: Response) => {
  res.json(mockJobs);
};

export const createImport = (req: Request, res: Response) => {
  const job = {
    id: `job_${Date.now()}`,
    supplierId: 's1',
    supplierName: req.body.supplierName || 'TechParts International',
    connectionType: req.body.fileFormat === 'CSV' ? 'csv' : req.body.fileFormat === 'XML' ? 'xml' : 'excel',
    fileName: req.body.fileName || `feed_${Date.now()}.${(req.body.fileFormat || 'csv').toLowerCase()}`,
    totalRecords: 1250,
    processedRecords: 450,
    failedRecords: 0,
    status: 'processing',
    createdAt: new Date().toISOString(),
  };
  mockJobs.unshift(job);
  res.status(201).json(job);
};

export const updateImport = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = mockJobs.findIndex(j => j.id === id);
  if (index !== -1) {
    mockJobs[index] = { ...mockJobs[index], ...req.body };
    res.json(mockJobs[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
};
