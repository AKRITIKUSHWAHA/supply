import { Router } from 'express';
import { getMedia, createMedia, deleteMedia } from '../controllers/media.controller';

const router = Router();

router.get('/', getMedia);
router.post('/', createMedia);
router.delete('/:id', deleteMedia);

export default router;
