import { Router } from 'express';
import { getPermissions, createPermission, updatePermission, deletePermission, assignPermissionToRole, removePermissionFromRole } from '../controllers/permission.controller';
import { authenticate, checkPermission } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', checkPermission('manage_permissions'), getPermissions);
router.post('/', checkPermission('manage_permissions'), createPermission);
router.put('/:id', checkPermission('manage_permissions'), updatePermission);
router.delete('/:id', checkPermission('manage_permissions'), deletePermission);

router.post('/assign', checkPermission('manage_permissions'), assignPermissionToRole);
router.post('/remove', checkPermission('manage_permissions'), removePermissionFromRole);

export default router;
