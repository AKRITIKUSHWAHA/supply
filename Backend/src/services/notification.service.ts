import { PrismaClient, NotificationType, Severity, Prisma } from '@prisma/client';
import { Response } from 'express';
import prisma from '../utils/prisma';

export interface SSEClient {
  res: Response;
  userId?: string;
  roleName?: string;
}

export class NotificationService {
  private static sseClients: SSEClient[] = [];

  // --- SSE Management ---
  static addSSEClient(res: Response, user: { userId?: string; roleName?: string }) {
    this.sseClients.push({ res, ...user });
  }

  static removeSSEClient(res: Response) {
    this.sseClients = this.sseClients.filter((c) => c.res !== res);
  }

  private static broadcast(notification: any) {
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    
    this.sseClients.forEach((client) => {
      if (this.canViewNotification(notification, client.roleName)) {
        client.res.write(data);
      }
    });
  }

  // --- RBAC Check ---
  private static canViewNotification(notification: any, roleName?: string): boolean {
    if (!roleName) return false;
    const role = roleName.toLowerCase().replace(/ /g, '_');

    if (role === 'platform_owner' || role === 'administrator') return true;

    if (role === 'catalog_manager') {
      const allowed = ['NEW_PRODUCT', 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED', 
        'VALIDATION_REQUIRED', 'VALIDATION_PASSED', 'VALIDATION_FAILED', 'PRICE_CHANGE', 
        'PRICE_MISSING', 'INVENTORY_WARNING', 'INVENTORY_UPDATED', 'INVENTORY_MISSING', 
        'MISSING_IMAGES', 'DUPLICATE_SKU', 'DUPLICATE_UPC'];
      return allowed.includes(notification.type);
    }

    if (role === 'integration_manager') {
      const allowed = ['FAILED_SYNC', 'SUPPLIER_OFFLINE', 'API_ERROR', 'FTP_ERROR', 
        'SUPPLIER_ADDED', 'SUPPLIER_UPDATED', 'SUPPLIER_ONLINE', 'SYNC_STARTED', 
        'SYNC_COMPLETED', 'SFTP_ERROR', 'SOAP_ERROR', 'STORE_CONNECTED', 'STORE_DISCONNECTED', 
        'IMPORT_STARTED', 'IMPORT_COMPLETED', 'IMPORT_FAILED', 'QUEUE_STARTED', 
        'QUEUE_PAUSED', 'QUEUE_RESUMED', 'QUEUE_CANCELLED', 'PUBLISHING_STARTED', 
        'PUBLISHING_COMPLETED', 'PUBLISHING_FAILED'];
      return allowed.includes(notification.type);
    }

    if (role === 'operations_staff') {
      const allowed = ['INVENTORY_WARNING', 'INVENTORY_UPDATED', 'INVENTORY_MISSING', 
        'VALIDATION_REQUIRED', 'VALIDATION_PASSED', 'VALIDATION_FAILED'];
      return allowed.includes(notification.type);
    }

    return false;
  }

  private static getRBACFilter(roleName?: string): Prisma.NotificationWhereInput {
    if (!roleName) return { id: 'none' };
    const role = roleName.toLowerCase().replace(/ /g, '_');

    if (role === 'platform_owner' || role === 'administrator') return {};

    if (role === 'catalog_manager') {
      return { type: { in: ['NEW_PRODUCT', 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED', 'VALIDATION_REQUIRED', 'VALIDATION_PASSED', 'VALIDATION_FAILED', 'PRICE_CHANGE', 'PRICE_MISSING', 'INVENTORY_WARNING', 'INVENTORY_UPDATED', 'INVENTORY_MISSING', 'MISSING_IMAGES', 'DUPLICATE_SKU', 'DUPLICATE_UPC'] } };
    }

    if (role === 'integration_manager') {
      return { type: { in: ['FAILED_SYNC', 'SUPPLIER_OFFLINE', 'API_ERROR', 'FTP_ERROR', 'SUPPLIER_ADDED', 'SUPPLIER_UPDATED', 'SUPPLIER_ONLINE', 'SYNC_STARTED', 'SYNC_COMPLETED', 'SFTP_ERROR', 'SOAP_ERROR', 'STORE_CONNECTED', 'STORE_DISCONNECTED', 'IMPORT_STARTED', 'IMPORT_COMPLETED', 'IMPORT_FAILED', 'QUEUE_STARTED', 'QUEUE_PAUSED', 'QUEUE_RESUMED', 'QUEUE_CANCELLED', 'PUBLISHING_STARTED', 'PUBLISHING_COMPLETED', 'PUBLISHING_FAILED'] } };
    }

    if (role === 'operations_staff') {
      return { type: { in: ['INVENTORY_WARNING', 'INVENTORY_UPDATED', 'INVENTORY_MISSING', 'VALIDATION_REQUIRED', 'VALIDATION_PASSED', 'VALIDATION_FAILED'] } };
    }

    return { id: 'none' };
  }

  // --- Core CRUD ---
  static async getNotifications(params: {
    userId?: string;
    roleName?: string;
    page: number;
    limit: number;
    search?: string;
    filterType?: string;
    severity?: string;
    unreadOnly?: boolean;
  }) {
    const { userId, roleName, page, limit, search, filterType, severity, unreadOnly } = params;
    
    const rbacFilter = this.getRBACFilter(roleName);
    
    let where: Prisma.NotificationWhereInput = {
      AND: [rbacFilter]
    };

    if (search) {
      where.AND = [
        ...(where.AND as any[]),
        {
          OR: [
            { title: { contains: search } },
            { message: { contains: search } }
          ]
        }
      ];
    }

    if (filterType && filterType !== 'all') {
      if (['error', 'warning', 'success', 'info'].includes(filterType.toLowerCase())) {
         const sevMap: Record<string, Severity> = {
            'error': Severity.ERROR,
            'warning': Severity.WARNING,
            'success': Severity.INFO,
            'info': Severity.INFO
         };
         where.severity = sevMap[filterType.toLowerCase()];
      } else {
        try {
          where.type = filterType.toUpperCase() as NotificationType;
        } catch(e) {}
      }
    }

    if (severity) {
      where.severity = severity as Severity;
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUnreadCount(params: { userId?: string; roleName?: string }) {
    const { userId, roleName } = params;
    const rbacFilter = this.getRBACFilter(roleName);

    return prisma.notification.count({
      where: {
        AND: [rbacFilter],
        isRead: false,
      },
    });
  }

  static async markAsRead(id: string, params: { userId?: string; roleName?: string }) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllRead(params: { userId?: string; roleName?: string }) {
    const { userId, roleName } = params;
    const rbacFilter = this.getRBACFilter(roleName);

    return prisma.notification.updateMany({
      where: {
        AND: [rbacFilter],
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  static async deleteNotification(id: string, params: { userId?: string; roleName?: string }) {
    return prisma.notification.delete({
      where: { id },
    });
  }

  // --- Automated Generation Methods ---
  
  private static async logActivity(action: string, details: string) {
    try {
      await prisma.activityLog.create({
         data: {
            action,
            details,
         }
      });
    } catch(e) {
      console.error('Failed to create activity log for notification', e);
    }
  }

  static async createNotification(data: {
    title: string;
    message: string;
    type: NotificationType;
    severity: Severity;
    module?: string;
    referenceId?: string;
    actionUrl?: string;
    metadata?: string;
  }) {
    const notification = await prisma.notification.create({
      data,
    });

    await this.logActivity('NOTIFICATION_CREATED', `Type: ${data.type}, Title: ${data.title}`);
    this.broadcast(notification);
    return notification;
  }

  // Generic Trigger Helper
  static async triggerEvent(type: NotificationType, title: string, message: string, severity: Severity = Severity.INFO, metadata?: any) {
    return this.createNotification({
      title,
      message,
      type,
      severity,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    });
  }

  // Old specific triggers for compatibility
  static async triggerFailedSync(supplierName: string, time: string, reason: string, retryCount: number) {
    return this.triggerEvent(NotificationType.FAILED_SYNC, 'Failed Sync', `Sync failed for supplier ${supplierName} at ${time}. Reason: ${reason}. Retry count: ${retryCount}.`, Severity.ERROR);
  }

  static async triggerSupplierOffline(supplierName: string) {
    return this.triggerEvent(NotificationType.SUPPLIER_OFFLINE, 'Supplier Offline', `Supplier ${supplierName} API/FTP cannot connect.`, Severity.CRITICAL);
  }

  static async triggerApiError(apiName: string, errorMessage: string) {
    return this.triggerEvent(NotificationType.API_ERROR, 'API Error', `API ${apiName} returned error: ${errorMessage}.`, Severity.ERROR);
  }

  static async triggerFtpError(connectionName: string, errorMessage: string) {
    return this.triggerEvent(NotificationType.FTP_ERROR, 'FTP Error', `FTP/SFTP connection ${connectionName} failed: ${errorMessage}.`, Severity.ERROR);
  }

  static async triggerInventoryWarning(productName: string, sku: string, currentStock: number) {
    return this.triggerEvent(NotificationType.INVENTORY_WARNING, 'Inventory Warning', `Inventory for ${productName} (SKU: ${sku}) is running low. Current stock: ${currentStock}.`, Severity.WARNING);
  }

  static async triggerNewProduct(supplierName: string, productCount: number) {
    return this.triggerEvent(NotificationType.NEW_PRODUCT, 'New Product Imported', `Supplier ${supplierName} imported ${productCount} new products.`, Severity.INFO);
  }

  static async triggerPriceChange(supplierName: string, productName: string, oldPrice: number, newPrice: number) {
    return this.triggerEvent(NotificationType.PRICE_CHANGE, 'Price Change', `Price changed for ${productName} (Supplier: ${supplierName}). Old: $${oldPrice}, New: $${newPrice}.`, Severity.INFO);
  }

  static async triggerValidationRequired(issue: string) {
    return this.triggerEvent(NotificationType.VALIDATION_REQUIRED, 'Validation Required', `Validation Center detected an issue: ${issue}.`, Severity.WARNING);
  }
}

