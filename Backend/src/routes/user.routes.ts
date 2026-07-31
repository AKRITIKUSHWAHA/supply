import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, updateUserStatus } from '../controllers/user.controller';
import { authenticate, authorize, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all user routes
router.use(authenticate);

// Only authorized roles or users with 'manage_users' permission
router.get('/', authorize('Administrator'), checkPermission('manage_users'), getUsers);
router.get('/:id', authorize('Administrator'), checkPermission('manage_users'), getUserById);
router.post('/', authorize('Administrator'), checkPermission('manage_users'), createUser);
router.put('/:id', authorize('Administrator'), checkPermission('manage_users'), updateUser);
router.delete('/:id', authorize('Administrator'), checkPermission('manage_users'), deleteUser);
router.patch('/:id/status', authorize('Administrator'), checkPermission('manage_users'), updateUserStatus);

export default router;
