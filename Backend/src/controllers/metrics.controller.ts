import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getCachedOrFetch } from '../services/redis.service';

const prisma = new PrismaClient();

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const fetchMetrics = async () => {
      const [
        totalUsers,
        activeUsers,
        totalSuppliers,
        connectedSuppliers,
        totalStores,
        connectedStores,
        totalProducts,
        activeProducts,
        publishedProducts,
        missingImages,
        missingCategories,
        duplicateProducts, // simplistic simulation for duplicate SKUs 
        runningJobs,
        waitingJobs,
        failedJobs,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'active' } }),
        prisma.supplier.count(),
        prisma.supplierConnection.count({ where: { status: 'connected' } }),
        prisma.store.count(),
        prisma.store.count({ where: { connectionStatus: 'connected' } }),
        prisma.product.count(),
        prisma.product.count({ where: { status: { not: 'archived' } } }),
        prisma.product.count({ where: { status: 'published' } }),
        prisma.product.count({ where: { images: { none: {} } } }),
        prisma.product.count({ where: { categoryId: null } }),
        prisma.validationLog.count({ where: { issue: { contains: 'Duplicate' } } }),
        prisma.jobLog.count({ where: { status: 'running' } }),
        prisma.jobLog.count({ where: { status: 'pending' } }),
        prisma.jobLog.count({ where: { status: 'failed' } }),
      ]);

      return {
        totalUsers,
        activeUsers,
        totalSuppliers,
        disconnectedSuppliers: totalSuppliers - connectedSuppliers,
        connectedSuppliers,
        totalStores,
        connectedStores,
        totalProducts,
        activeProducts,
        publishedProducts,
        missingImages,
        missingCategories,
        missingPricing: 0, // Implement pricing check later
        duplicateProducts,
        productsImportedToday: 0,
        productsReadyToPublish: 0,
        runningJobs,
        waitingJobs,
        completedJobs: 0,
        failedJobs,
        syncStatus: 'Optimal',
        lastUpdated: new Date().toISOString()
      };
    };

    // Cache for 60 seconds as per requirements
    const metrics = await getCachedOrFetch('dashboard:platform_owner:stats', fetchMetrics, 60);

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};
