import { Request, Response } from 'express';
import { PrismaClient, NotificationType, Severity } from '@prisma/client';
import { NotificationService } from '../services/notification.service';

const prisma = new PrismaClient();

function formatStore(s: any) {
  const urlConfig = s.configurations?.find((c: any) => c.key === 'url')?.value;
  const regionConfig = s.configurations?.find((c: any) => c.key === 'region')?.value || 'North America';
  return {
    id: s.id,
    name: s.name,
    url: urlConfig || 'https://store.myshopify.com',
    platform: s.type || 'Shift4Shop',
    region: regionConfig,
    status: s.connectionStatus || 'active',
    syncStatus: s.syncStatus || 'synced',
    productCount: 0,
    lastSync: s.lastSync || s.createdAt,
    createdAt: s.createdAt,
  };
}

export const getStores = async (req: Request, res: Response) => {
  try {
    const rawStores = await prisma.store.findMany({
      include: { configurations: true },
      orderBy: { createdAt: 'desc' },
    });
    const data = rawStores.map(formatStore);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Stores' });
  }
};

export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, url, platform, region, apiKey } = req.body;
    const newStore = await prisma.store.create({
      data: {
        name: name || 'New Store',
        type: platform || 'Shift4Shop',
        connectionStatus: 'active',
        syncStatus: 'synced',
        lastSync: new Date(),
        configurations: {
          create: [
            { key: 'url', value: url || 'https://store.myshopify.com' },
            { key: 'region', value: region || 'North America' },
          ]
        },
        credentials: apiKey ? {
          create: {
            apiKey: apiKey,
          }
        } : undefined
      },
      include: { configurations: true }
    });

    NotificationService.triggerEvent(
      NotificationType.STORE_CONNECTED,
      'Store Connected',
      `Store ${newStore.name} (${newStore.type}) was connected successfully.`,
      Severity.INFO,
      { storeId: newStore.id }
    ).catch(console.error);

    res.status(201).json(formatStore(newStore));
  } catch (error: any) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: error.message || 'Failed to create Store' });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, url, platform, region } = req.body;

    await prisma.store.update({
      where: { id },
      data: {
        name: name || undefined,
        type: platform || undefined,
      },
    });

    if (url) {
      await prisma.storeConfiguration.deleteMany({ where: { storeId: id, key: 'url' } });
      await prisma.storeConfiguration.create({ data: { storeId: id, key: 'url', value: url } });
    }
    if (region) {
      await prisma.storeConfiguration.deleteMany({ where: { storeId: id, key: 'region' } });
      await prisma.storeConfiguration.create({ data: { storeId: id, key: 'region', value: region } });
    }

    const refreshed = await prisma.store.findUnique({
      where: { id },
      include: { configurations: true }
    });

    res.json(formatStore(refreshed));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update Store' });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = await prisma.store.findUnique({ where: { id } });

    await prisma.store.delete({ where: { id } });

    if (store) {
      NotificationService.triggerEvent(
        NotificationType.STORE_DISCONNECTED,
        'Store Disconnected',
        `Store ${store.name} was disconnected and deleted.`,
        Severity.WARNING,
        { storeId: store.id }
      ).catch(console.error);
    }

    res.json({ message: 'Store deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete Store' });
  }
};

export const syncStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.store.update({
      where: { id },
      data: {
        syncStatus: 'synced',
        connectionStatus: 'active',
        lastSync: new Date(),
      },
      include: { configurations: true }
    });
    res.json(formatStore(updated));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to sync Store' });
  }
};
