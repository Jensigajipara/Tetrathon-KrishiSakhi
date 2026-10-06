import express from 'express';
import { 
  getMarketPrices, 
  getPriceAlerts, 
  createPriceAlert, 
  getDecisionBreakdown, 
  updateMandiPrice 
} from '../controllers/marketController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/prices', getMarketPrices);
router.get('/alerts', getPriceAlerts);
router.post('/alerts', createPriceAlert);
router.get('/decision/:cropId', getDecisionBreakdown);

// Admin-only price setting trigger
router.post('/prices', isAdmin, updateMandiPrice);

export default router;
