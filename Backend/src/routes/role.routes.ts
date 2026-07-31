import { Router } from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller';
import { authenticate, checkPermission } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', checkPermission('manage_roles'), getRoles);
router.post('/', checkPermission('manage_roles'), createRole);
router.put('/:id', checkPermission('manage_roles'), updateRole);
router.delete('/:id', checkPermission('manage_roles'), deleteRole);

export default router;
