import express from 'express';
import { getEquipmentList, rentEquipment, getRentedEquipment } from '../controllers/equipmentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getEquipmentList);
router.post('/rent', rentEquipment);
router.get('/rented', getRentedEquipment);

export default router;
