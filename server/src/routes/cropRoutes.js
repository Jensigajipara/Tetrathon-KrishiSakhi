import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUserCrops, getFarmCrops, getCropDetails, registerCrop, updateCrop, deleteCrop, addCropImage } from '../controllers/cropController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Multer storage setup
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
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, PNG, and WEBP image uploads are supported.'));
  }
});

router.use(verifyToken);

router.get('/', getUserCrops);
router.get('/farm/:farmId', getFarmCrops);
router.get('/:id', getCropDetails);
router.post('/', registerCrop);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);
router.post('/:cropId/image', upload.single('image'), addCropImage);

export default router;
