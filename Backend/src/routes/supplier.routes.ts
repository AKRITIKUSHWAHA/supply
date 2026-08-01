import express from 'express';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  syncSupplier,
  syncAllSuppliers,
  testSupplierConnection
} from '../controllers/supplier.controller';

const router = express.Router();

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);
router.post('/:id/sync', syncSupplier);
router.post('/sync-all', syncAllSuppliers);
router.post('/:id/test', testSupplierConnection);

export default router;
