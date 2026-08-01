import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settingsList = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settingsList.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    res.json({
      platformName: settingsMap['platformName'] || 'SupplyBridge Enterprise PIM',
      currency: settingsMap['currency'] || 'USD',
      timezone: settingsMap['timezone'] || 'UTC',
      dateFormat: settingsMap['dateFormat'] || 'MM/DD/YYYY',
      maintenanceMode: settingsMap['maintenanceMode'] === 'true',
      apiKey: settingsMap['apiKey'] || 'sb_live_k3y_99482710384',
      ftpHost: settingsMap['ftpHost'] || 'ftp.supplybridge.io',
      cronSchedule: settingsMap['cronSchedule'] || '0 * * * *',
      smtpEmail: settingsMap['smtpEmail'] || 'notifications@supplybridge.io',
      securityMfa: settingsMap['securityMfa'] !== 'false',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch system settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settingsData = req.body;
    for (const [key, value] of Object.entries(settingsData)) {
      const valStr = typeof value === 'boolean' ? String(value) : String(value || '');
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: valStr },
        create: { key, value: valStr },
      });
    }

    res.json({ message: 'Settings saved successfully', settings: settingsData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update system settings' });
  }
};
