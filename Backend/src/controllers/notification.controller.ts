import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export const NotificationController = {
  getNotifications: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const roleName = user?.role?.name || user?.roleName || user?.role;
      
      const { page = 1, limit = 50, search, filterType, severity, unreadOnly } = req.query;

      const result = await NotificationService.getNotifications({
        userId,
        roleName,
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        filterType: filterType as string,
        severity: severity as string,
        unreadOnly: unreadOnly === 'true',
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications', details: error.message, stack: error.stack });
    }
  },

  getUnreadCount: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const roleName = user?.role?.name || user?.roleName || user?.role;

      const count = await NotificationService.getUnreadCount({ userId, roleName });
      res.status(200).json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  },

  markAsRead: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const roleName = user?.role?.name || user?.roleName || user?.role;

      await NotificationService.markAsRead(id, { userId, roleName });
      res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
      console.error('Error marking as read:', error);
      res.status(500).json({ error: 'Failed to mark as read' });
    }
  },

  markAllRead: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const roleName = user?.role?.name || user?.roleName || user?.role;

      await NotificationService.markAllRead({ userId, roleName });
      res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      res.status(500).json({ error: 'Failed to mark all as read' });
    }
  },

  deleteNotification: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const roleName = user?.role?.name || user?.roleName || user?.role;

      await NotificationService.deleteNotification(id, { userId, roleName });
      res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  },

  streamNotifications: (req: Request, res: Response) => {
    // SSE endpoint
    const user = (req as any).user;
    const userId = user?.id || user?.userId;
    const roleName = user?.role?.name || user?.roleName || user?.role;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Send a comment to keep connection alive immediately
    res.write(': connected\n\n');

    // Add this client to the service's SSE connections
    NotificationService.addSSEClient(res, { userId, roleName });

    req.on('close', () => {
      NotificationService.removeSSEClient(res);
    });
  }
};
