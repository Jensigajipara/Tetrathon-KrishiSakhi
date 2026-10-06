import express from 'express';
import { getUserFarms, getFarmDetails, createFarm, updateFarm, deleteFarm } from '../controllers/farmController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getUserFarms);
router.get('/:id', getFarmDetails);
router.post('/', createFarm);
router.put('/:id', updateFarm);
router.delete('/:id', deleteFarm);

export default router;
