import express from 'express';
import {
  getValidationItems,
  createValidationCheck,
  resolveValidationItem,
  deleteValidationItem
} from '../controllers/validation.controller';

const router = express.Router();

router.get('/', getValidationItems);
router.post('/', createValidationCheck);
router.put('/:id/resolve', resolveValidationItem);
router.delete('/:id', deleteValidationItem);

export default router;
