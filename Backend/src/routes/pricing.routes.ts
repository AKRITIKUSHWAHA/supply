import express from 'express';
import { getRules, createRule, updateRule, deleteRule, getAudits } from '../controllers/pricing.controller';

const router = express.Router();

router.get('/rules', getRules);
router.post('/rules', createRule);
router.put('/rules/:id', updateRule);
router.delete('/rules/:id', deleteRule);

router.get('/audits', getAudits);

export default router;
