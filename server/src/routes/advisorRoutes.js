import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getDailyRecommendations, 
  predictLeafDisease, 
  getDiseaseHistory, 
  getFertilizerPlan, 
  getPestAlerts,
  generateCropPlan,
  getEquipmentRecommendations,
  getHistoryList,
  getRecommendationDetail,
  getCropCatalogDetails
} from '../controllers/advisorController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'leaf-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(verifyToken);

router.get('/recommendation/:cropId', getDailyRecommendations);
router.post('/disease/scan', upload.single('image'), predictLeafDisease);
router.post('/disease/:cropId/scan', upload.single('image'), predictLeafDisease);
router.get('/disease/history', getDiseaseHistory);
router.get('/disease/:cropId/history', getDiseaseHistory);
router.get('/fertilizer/:cropId', getFertilizerPlan);
router.get('/pest/:cropId', getPestAlerts);
router.get('/crop-plan/:farmId', generateCropPlan);
router.get('/crop-catalog-details', getCropCatalogDetails);
router.get('/equipment/recommend', getEquipmentRecommendations);

router.get('/history/:type', getHistoryList);
router.get('/recommendation-detail/:id', getRecommendationDetail);

export default router;
