import express from 'express';
import {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  clearAllNotifications
} from '../controllers/notification.controller';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/:id/read', markAsRead);
router.delete('/clear-all', clearAllNotifications);
router.delete('/:id', deleteNotification);

export default router;
