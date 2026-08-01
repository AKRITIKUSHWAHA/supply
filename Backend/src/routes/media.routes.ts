import { Router } from 'express';
import { getMedia, createMedia, updateMedia, deleteMedia } from '../controllers/media.controller';

const router = Router();

router.get('/', getMedia);
router.post('/', createMedia);
router.put('/:id', updateMedia);
router.delete('/:id', deleteMedia);

export default router;
