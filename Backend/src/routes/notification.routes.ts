import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// SSE endpoint (Should be placed before param routes if they share path structure)
router.get('/stream', authenticate, NotificationController.streamNotifications);

// REST API
router.get('/', authenticate, NotificationController.getNotifications);
router.get('/unread-count', authenticate, NotificationController.getUnreadCount);
router.patch('/read-all', authenticate, NotificationController.markAllRead);
router.patch('/:id/read', authenticate, NotificationController.markAsRead);
router.delete('/:id', authenticate, NotificationController.deleteNotification);

// Debug endpoints to trigger notifications manually for testing
router.post('/trigger/failed-sync', authenticate, async (req, res) => {
    await import('../services/notification.service').then(m => m.NotificationService.triggerFailedSync('TestSupplier', new Date().toISOString(), 'Network timeout', 3));
    res.json({ success: true });
});
router.post('/trigger/supplier-offline', authenticate, async (req, res) => {
    await import('../services/notification.service').then(m => m.NotificationService.triggerSupplierOffline('TestSupplier'));
    res.json({ success: true });
});
router.post('/trigger/api-error', authenticate, async (req, res) => {
    await import('../services/notification.service').then(m => m.NotificationService.triggerApiError('StripeAPI', 'Invalid token'));
    res.json({ success: true });
});
router.post('/trigger/ftp-error', authenticate, async (req, res) => {
    await import('../services/notification.service').then(m => m.NotificationService.triggerFtpError('AcmeFTP', 'Auth failed'));
    res.json({ success: true });
});
router.post('/trigger/inventory', authenticate, async (req, res) => {
    await import('../services/notification.service').then(m => m.NotificationService.triggerInventoryWarning('RTX 4090', 'GPU-4090', 2));
    res.json({ success: true });
});
router.post('/trigger/new-product', authenticate, async (req, res) => {
    await import('../services/notification.service').then(m => m.NotificationService.triggerNewProduct('TestSupplier', 150));
    res.json({ success: true });
});
router.post('/trigger/price-change', authenticate, async (req, res) => {
    await import('../services/notification.service').then(m => m.NotificationService.triggerPriceChange('TestSupplier', 'RTX 4090', 1599, 1499));
    res.json({ success: true });
});
router.post('/trigger/validation', authenticate, async (req, res) => {
    await import('../services/notification.service').then(m => m.NotificationService.triggerValidationRequired('Missing images on 5 products'));
    res.json({ success: true });
});

export default router;
