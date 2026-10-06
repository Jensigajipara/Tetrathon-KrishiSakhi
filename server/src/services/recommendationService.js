import crypto from 'crypto';
import { recommendationRepository } from '../repositories/recommendationRepository.js';

const TTL_HOURS = {
  daily_crop_health: 6,
  market_recommendation: 12,
  crop_planner: 24,
  storage_planner: 24,
  fertilizer_planner: 24,
  equipment_recommendation: 24,
  pest_alerts: 24,
  disease_scanner: 999999, // Never automatically expires
  crop_catalog_details: 168 // 7 Days cache for crop handbook details
};

const mapTypeToTemplate = (type) => {
  const mapping = {
    crop_planner: 'cropPlanner',
    daily_crop_health: 'precisionAdvisory',
    fertilizer_planner: 'fertilizerPlan',
    pest_alerts: 'pestAlert',
    storage_planner: 'postHarvestSolver',
    disease_scanner: 'diseaseScanner',
    equipment_recommendation: 'equipmentRecommendation',
    crop_catalog_details: 'cropCatalogDetails'
  };
  return mapping[type] || 'precisionAdvisory';
};

const computeHash = (obj) => {
  const str = JSON.stringify(obj);
  return crypto.createHash('sha256').update(str).digest('hex');
};

const computeStatusMetadata = (rec, ttlHours) => {
  const now = new Date();
  const created = new Date(rec.created_at);
  const expires = new Date(rec.expires_at);
  const diffMs = expires - now;
  const expiresInHours = diffMs > 0 ? (diffMs / (60 * 60 * 1000)).toFixed(1) : 0;
  
  let status = 'Fresh';
  if (diffMs <= 0) {
    status = 'Expired';
  } else if (diffMs < 2 * 60 * 60 * 1000) { // Less than 2 hours left
    status = 'Expiring Soon';
  }
  
  return {
    id: rec.id,
    generatedAt: created.toISOString(),
    lastUpdated: new Date(rec.updated_at).toISOString(),
    expiresIn: `${expiresInHours} Hours`,
    modelUsed: rec.model,
    recommendationStatus: status,
    showOfflineWarning: false
  };
};

export const recommendationService = {
  async getOrCreateRecommendation({ userId, farmId, cropId, type, inputs, image = null, forceRefresh = false }) {
    const inputHash = computeHash(inputs);
    
    // Find if we have an active recommendation
    let activeRec = await recommendationRepository.getActive(userId, farmId, cropId, type);
    
    const ttlHours = TTL_HOURS[type] || 24;
    const now = new Date();
    
    // Check if we can reuse the active recommendation
    if (activeRec && !forceRefresh && activeRec.input_hash === inputHash) {
      const isExpired = new Date(activeRec.expires_at) < now;
      if (!isExpired) {
        // Active, fresh recommendation! Update last viewed and return.
        await recommendationRepository.updateLastViewed(activeRec.id);
        const metadata = computeStatusMetadata(activeRec, ttlHours);
        return {
          ...activeRec.ai_response,
          metadata
        };
      }
    }
    
    // Generate new advice using Gemini
    try {
      const { generateAdvice } = await import('../ai/index.js');
      const template = mapTypeToTemplate(type);
      
      const aiResponse = await generateAdvice(template, inputs, {
        userId,
        memoryKey: cropId ? `crop_${cropId}` : (farmId ? `farm_${farmId}` : `user_${userId}`),
        image
      });
      
      // Calculate expires_at
      const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
      
      // Archive previous active recommendations of this type
      await recommendationRepository.archivePrevious(userId, farmId, cropId, type);
      
      // Save new recommendation as active
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const newRec = await recommendationRepository.create({
        user_id: userId,
        farm_id: farmId,
        crop_id: cropId,
        recommendation_type: type,
        input_hash: inputHash,
        input_snapshot: inputs,
        weather_snapshot: inputs.weather || null,
        market_snapshot: inputs.market || null,
        ai_response: aiResponse,
        model: modelName,
        confidence: aiResponse.confidence || 90.0,
        expires_at: expiresAt
      });
      
      const metadata = computeStatusMetadata(newRec, ttlHours);
      return {
        ...aiResponse,
        metadata
      };
      
    } catch (apiError) {
      console.error(`[RECOMMENDATION SERVICE ERROR] Gemini call failed for ${type}:`, apiError.message);
      
      // Fallback: retrieve latest history record
      const history = await recommendationRepository.getHistory(userId, farmId, cropId, type);
      if (history && history.length > 0) {
        const latestFallback = history[0];
        const metadata = computeStatusMetadata(latestFallback, ttlHours);
        metadata.showOfflineWarning = true;
        metadata.offlineMessage = "Unable to generate a new recommendation currently. Showing your latest saved recommendation.";
        
        return {
          ...latestFallback.ai_response,
          metadata
        };
      }
      
      throw apiError;
    }
  },

  async getHistoryList(userId, farmId, cropId, type) {
    const history = await recommendationRepository.getHistory(userId, farmId, cropId, type);
    return history.map(rec => {
      const ttlHours = TTL_HOURS[type] || 24;
      return {
        id: rec.id,
        created_at: rec.created_at,
        model: rec.model,
        ai_response: rec.ai_response,
        metadata: computeStatusMetadata(rec, ttlHours)
      };
    });
  },

  async getRecommendationDetail(id) {
    const rec = await recommendationRepository.getById(id);
    if (!rec) return null;
    
    const ttlHours = TTL_HOURS[rec.recommendation_type] || 24;
    const metadata = computeStatusMetadata(rec, ttlHours);
    return {
      ...rec.ai_response,
      metadata
    };
  }
};
