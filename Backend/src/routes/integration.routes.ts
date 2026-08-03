import express from 'express';
import { getIntegrations, createIntegration, updateIntegration, testIntegration } from '../controllers/integration.controller';

const router = express.Router();
router.get('/', getIntegrations);
router.post('/', createIntegration);
router.put('/:id', updateIntegration);
router.post('/:id/test', testIntegration);

export default router;
