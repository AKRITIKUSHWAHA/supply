
import express from 'express';
import { getCategorys, createCategory } from '../controllers/category.controller';

const router = express.Router();

router.get('/', getCategorys);
router.post('/', createCategory);

export default router;
