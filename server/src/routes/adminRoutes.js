import express from 'express';
import { 
  getDashboardStats, 
  getAllFarmers, 
  deleteFarmer, 
  getAllFarms, 
  getAllCrops, 
  getSystemLogs 
} from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

router.get('/stats', getDashboardStats);
router.get('/farmers', getAllFarmers);
router.delete('/farmers/:id', deleteFarmer);
router.get('/farms', getAllFarms);
router.get('/crops', getAllCrops);
router.get('/logs', getSystemLogs);

export default router;
