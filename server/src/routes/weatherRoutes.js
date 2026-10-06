import express from 'express';
import { getWeatherReport, refreshWeatherReport, getWeatherHistory } from '../controllers/weatherController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/:farmId', getWeatherReport);
router.post('/:farmId/refresh', refreshWeatherReport);
router.get('/:farmId/history', getWeatherHistory);

export default router;
