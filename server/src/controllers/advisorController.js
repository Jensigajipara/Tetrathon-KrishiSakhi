import fs from 'fs';
import { query, isMock } from '../config/db.js';
import { cropRepository } from '../repositories/cropRepository.js';
import { farmRepository } from '../repositories/farmRepository.js';
import { advisorRepository } from '../repositories/advisorRepository.js';
import { alertRepository } from '../repositories/alertRepository.js';
import { recommendationService } from '../services/recommendationService.js';

export const getDailyRecommendations = async (req, res) => {
  const { cropId } = req.params;
  const forceRefresh = req.query.refresh === 'true';
  try {
    const crop = await cropRepository.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found.' });
    }

    const farm = await farmRepository.findById(crop.farm_id);

    const result = await recommendationService.getOrCreateRecommendation({
      userId: req.user.id,
      farmId: farm.id,
      cropId: Number(cropId),
      type: 'daily_crop_health',
      inputs: {
        cropName: crop.crop_name,
        growthStage: crop.growth_stage,
        soilType: farm.soil_type
      },
      forceRefresh
    });

    // Sync to older db tables for historical analytics continuity
    await advisorRepository.addRecommendation(cropId, {
      recommendation_type: 'daily_crop_health',
      recommendation: result.recommendation || '',
      confidence_score: result.confidence || 90.0,
      explanation: `${result.reasoning || ''} Expected outcome: ${result.expectedOutcome || ''}`
    });

    return res.json(result);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ message: 'Server error retrieving recommendations.' });
  }
};

export const predictLeafDisease = async (req, res) => {
  const { cropId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'Crop leaf image file is required.' });
  }

  try {
    let crop = null;
    if (cropId) {
      crop = await cropRepository.findById(cropId);
    }

    // Convert file to base64
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Data = fileBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const base64ImageString = `data:${mimeType};base64,${base64Data}`;

    const imageUrl = `/uploads/${req.file.filename}`;
    // Store both base64 string in image_data and local file path in image_url
    const cropImage = await advisorRepository.addGlobalCropImage(
      req.user.id,
      cropId ? Number(cropId) : null,
      imageUrl,
      base64ImageString
    );

    // Call Centralized Recommendation Service with base64 image data
    const result = await recommendationService.getOrCreateRecommendation({
      userId: req.user.id,
      farmId: crop ? crop.farm_id : null,
      cropId: cropId ? Number(cropId) : null,
      type: 'disease_scanner',
      inputs: {
        cropName: crop ? crop.crop_name : 'Detected Crop',
        originalFileName: req.file.originalname,
        imageUrl: imageUrl
      },
      image: {
        mimeType,
        data: base64Data
      },
      forceRefresh: true // Scanner should run fresh diagnostic predictions for every uploaded image
    });

    const savedPred = await advisorRepository.addDiseasePrediction(cropImage.id, {
      disease_name: result.title || 'Disease Detected',
      confidence: result.confidence || 90.0,
      severity: result.riskLevel || 'Medium',
      treatment: `${result.recommendation || ''}. Actions: ${(result.nextActions || []).join(', ')}`
    });

    // Create notifications based on severity and crop
    const severity = result.riskLevel || 'Medium';
    const cropLabel = crop ? crop.crop_name : (result.title || 'Crop Scan');
    if (severity === 'High') {
      await alertRepository.createNotification(req.user.id, {
        title: `🚨 CRITICAL Crop Disease Alert: ${cropLabel}`,
        message: `High severity disease detected. Recommendation: ${result.recommendation || ''}`,
        type: 'disease'
      });
    } else {
      await alertRepository.createNotification(req.user.id, {
        title: `Disease Scan Completed: ${cropLabel}`,
        message: `Scan result: "${result.title}" (Severity: ${severity}).`,
        type: 'disease'
      });
    }

    return res.status(201).json({
      ...savedPred,
      ...result,
      image_url: imageUrl,
      image_data: base64ImageString,
      uploaded_at: cropImage.uploaded_at
    });
  } catch (error) {
    console.error('Error classifying leaf disease:', error);
    return res.status(500).json({ message: 'Server error analyzing disease image.' });
  }
};

export const getDiseaseHistory = async (req, res) => {
  const { cropId } = req.params;
  try {
    let history;
    if (cropId) {
      history = await advisorRepository.getDiseasePredictionsByCropId(cropId);
    } else {
      history = await advisorRepository.getDiseasePredictionsByUserId(req.user.id);
    }
    return res.json(history);
  } catch (error) {
    console.error('Error fetching disease history:', error);
    return res.status(500).json({ message: 'Server error retrieving disease scans.' });
  }
};

export const getFertilizerPlan = async (req, res) => {
  const { cropId } = req.params;
  const forceRefresh = req.query.refresh === 'true';
  try {
    const crop = await cropRepository.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found.' });
    }

    const farm = await farmRepository.findById(crop.farm_id);

    const result = await recommendationService.getOrCreateRecommendation({
      userId: req.user.id,
      farmId: farm.id,
      cropId: Number(cropId),
      type: 'fertilizer_planner',
      inputs: {
        cropName: crop.crop_name,
        growthStage: crop.growth_stage,
        soilType: farm.soil_type
      },
      forceRefresh
    });

    const fertilizerName = result.title || 'NPK Complex';
    const quantityMatch = (result.summary || '').match(/\d+/);
    const quantity = quantityMatch ? Number(quantityMatch[0]) : 60;
    const schedule = result.recommendation || '';

    // Clear old fertilizer records to avoid duplicates
    await query('DELETE FROM fertilizer_recommendations WHERE crop_id = $1', [cropId]);

    // Insert new AI recommendation
    await advisorRepository.addFertilizerRecommendation(cropId, {
      fertilizer_name: fertilizerName,
      quantity,
      schedule
    });

    const recommendations = await advisorRepository.getFertilizerRecommendations(cropId);

    const fertilizerRates = {
      'urea (nitrogen)': 6.0,
      'single super phosphate (ssp)': 11.0,
      'muriate of potash (mop)': 22.0,
      'dap (diammonium phosphate)': 27.0,
      'npk complex (15:15:15)': 29.0
    };

    const pricedRecommendations = recommendations.map(rec => {
      const key = rec.fertilizer_name.toLowerCase();
      const rate = fertilizerRates[key] || 15.0;
      const estimatedCost = Number((rec.quantity * rate).toFixed(2));
      return {
        ...rec,
        estimated_cost: estimatedCost,
        unit_rate: rate
      };
    });

    return res.json({
      recommendations: pricedRecommendations,
      ai_response: result
    });
  } catch (error) {
    console.error('Error fetching fertilizer plan:', error);
    return res.status(500).json({ message: 'Server error retrieving fertilizer plan.' });
  }
};

export const getPestAlerts = async (req, res) => {
  const { cropId } = req.params;
  const forceRefresh = req.query.refresh === 'true';
  try {
    const crop = await cropRepository.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found.' });
    }

    const result = await recommendationService.getOrCreateRecommendation({
      userId: req.user.id,
      farmId: crop.farm_id,
      cropId: Number(cropId),
      type: 'pest_alerts',
      inputs: {
        cropName: crop.crop_name,
        growthStage: crop.growth_stage
      },
      forceRefresh
    });

    // Clear old alerts to avoid duplicates
    await query('DELETE FROM pest_alerts WHERE crop_id = $1', [cropId]);

    await advisorRepository.addPestAlert(cropId, {
      pest_name: result.title || 'Regional Pests',
      risk_level: result.riskLevel || 'Medium',
      recommendation: result.recommendation || ''
    });

    const alerts = await advisorRepository.getPestAlerts(cropId);
    return res.json({
      alerts,
      ai_response: result
    });
  } catch (error) {
    console.error('Error fetching pest alerts:', error);
    return res.status(500).json({ message: 'Server error retrieving pest alerts.' });
  }
};

export const generateCropPlan = async (req, res) => {
  const { farmId } = req.params;
  const forceRefresh = req.query.refresh === 'true';
  try {
    const farm = await farmRepository.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found.' });
    }

    const result = await recommendationService.getOrCreateRecommendation({
      userId: req.user.id,
      farmId: Number(farmId),
      cropId: null,
      type: 'crop_planner',
      inputs: {
        soilType: farm.soil_type,
        soilPh: farm.soil_ph || 6.5,
        district: farm.district,
        state: farm.state,
        irrigationSource: farm.irrigation_source || 'Tube Well',
        waterAvailability: farm.water_availability || 'High',
        nitrogen: farm.nitrogen || 120,
        phosphorus: farm.phosphorus || 50,
        potassium: farm.potassium || 60
      },
      forceRefresh
    });

    // Save plan to crop_plans database if not mock
    if (!isMock) {
      await query('DELETE FROM crop_plans WHERE farm_id = $1', [farmId]);
      const sql = `
        INSERT INTO crop_plans (farm_id, recommended_crop, rotation_advice, expected_profit, water_requirement, fertilizer_requirement, timeline, tasks)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const planRes = await query(sql, [
        farmId,
        result.title || 'Rotational Crop Plan',
        result.recommendation || '',
        result.expectedOutcome?.match(/\d+/) ? Number(result.expectedOutcome.match(/\d+/)[0]) : 35000,
        result.water_requirement || 'Medium',
        result.reasoning || '',
        JSON.stringify(result.timeline || []),
        JSON.stringify(result.tasks || [])
      ]);
      return res.json({ ...result, id: planRes.rows[0].id });
    } else {
      return res.json({ ...result, id: 999 });
    }
  } catch (error) {
    console.error('Error generating crop plan:', error);
    return res.status(500).json({ message: 'Server error generating crop plan.' });
  }
};

export const getEquipmentRecommendations = async (req, res) => {
  const { cropName, farmSize, stage } = req.query;
  const forceRefresh = req.query.refresh === 'true';

  try {
    const result = await recommendationService.getOrCreateRecommendation({
      userId: req.user.id,
      farmId: null,
      cropId: null,
      type: 'equipment_recommendation',
      inputs: {
        cropName: cropName || 'General Crop',
        farmSize: farmSize || '5',
        stage: stage || 'Harvesting'
      },
      forceRefresh
    });

    return res.json(result);
  } catch (error) {
    console.error('Error generating equipment advice:', error);
    return res.status(500).json({ message: 'Server error retrieving equipment recommendations.' });
  }
};

// History log retrieval endpoint
export const getHistoryList = async (req, res) => {
  const { type } = req.params;
  const cropId = req.query.cropId ? Number(req.query.cropId) : null;
  const farmId = req.query.farmId ? Number(req.query.farmId) : null;
  
  try {
    const list = await recommendationService.getHistoryList(req.user.id, farmId, cropId, type);
    return res.json(list);
  } catch (error) {
    console.error('Error fetching recommendation history:', error);
    return res.status(500).json({ message: 'Server error retrieving recommendation history.' });
  }
};

// Retrieve a specific historic entry detail
export const getRecommendationDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const detail = await recommendationService.getRecommendationDetail(id);
    if (!detail) {
      return res.status(404).json({ message: 'Saved recommendation record not found.' });
    }
    return res.json(detail);
  } catch (error) {
    console.error('Error fetching recommendation details:', error);
    return res.status(500).json({ message: 'Server error retrieving saved recommendation details.' });
  }
};

export const getCropCatalogDetails = async (req, res) => {
  const { cropName } = req.query;
  if (!cropName) {
    return res.status(400).json({ message: 'cropName parameter is required.' });
  }

  try {
    const result = await recommendationService.getOrCreateRecommendation({
      userId: req.user.id,
      farmId: null,
      cropId: null,
      type: 'crop_catalog_details',
      inputs: {
        cropName
      },
      forceRefresh: false // Cache results for 7 days
    });

    return res.json(result);
  } catch (error) {
    console.error('Error retrieving crop catalog details:', error);
    return res.status(500).json({ message: 'Server error retrieving crop catalog agronomy details.' });
  }
};
