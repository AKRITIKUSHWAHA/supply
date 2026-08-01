import { Request, Response } from 'express';

let notificationsList: any[] = [];

export const getNotifications = async (req: Request, res: Response) => {
  try {
    res.json(notificationsList);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, type, details } = req.body;
    const newNotif = {
      id: `n_${Date.now()}`,
      title: title || 'Notification Alert',
      message: message || '',
      type: type || 'info',
      timestamp: new Date().toISOString(),
      read: false,
      details: details || '',
    };
    notificationsList.unshift(newNotif);
    res.status(201).json(newNotif);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create notification' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    notificationsList = notificationsList.map(n => n.id === id ? { ...n, read: true } : n);
    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to mark notification as read' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    notificationsList = notificationsList.filter(n => n.id !== id);
    res.json({ message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete notification' });
  }
};

export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    notificationsList = [];
    res.json({ message: 'All notifications cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to clear notifications' });
  }
};
