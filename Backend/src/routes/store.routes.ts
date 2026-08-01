import express from 'express';
import { getStores, createStore, updateStore, deleteStore, syncStore } from '../controllers/store.controller';

const router = express.Router();

router.get('/', getStores);
router.post('/', createStore);
router.put('/:id', updateStore);
router.delete('/:id', deleteStore);
router.post('/:id/sync', syncStore);

export default router;
