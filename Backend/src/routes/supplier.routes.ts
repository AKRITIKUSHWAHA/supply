import express from 'express';
import { getSuppliers, createSupplier, testSupplierConnection } from '../controllers/supplier.controller';

const router = express.Router();

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.post('/:id/test', testSupplierConnection);

export default router;
