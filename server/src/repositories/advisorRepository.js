import { query, isMock, getMockDb } from '../config/db.js';

export const advisorRepository = {
  // Recommendations (daily crop advice, irrigation etc)
  async addRecommendation(cropId, { recommendation_type, recommendation, confidence_score, explanation }) {
    if (isMock) {
      const db = getMockDb();
      const newRec = {
        id: db.recommendations.length + 1,
        crop_id: Number(cropId),
        recommendation_type,
        recommendation,
        confidence_score: Number(confidence_score),
        explanation,
        created_at: new Date()
      };
      db.recommendations.push(newRec);
      return newRec;
    }
    const sql = `
      INSERT INTO recommendations (crop_id, recommendation_type, recommendation, confidence_score, explanation)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await query(sql, [cropId, recommendation_type, recommendation, confidence_score, explanation]);
    return res.rows[0];
  },

  async getRecommendationsByCropId(cropId) {
    if (isMock) {
      const db = getMockDb();
      return db.recommendations
        .filter(r => r.crop_id === Number(cropId))
        .sort((a, b) => b.created_at - a.created_at);
    }
    const sql = 'SELECT * FROM recommendations WHERE crop_id = $1 ORDER BY created_at DESC';
    const res = await query(sql, [cropId]);
    return res.rows;
  },

  // Disease predictions
  async addDiseasePrediction(cropImageId, { disease_name, confidence, severity, treatment }) {
    if (isMock) {
      const db = getMockDb();
      const newPred = {
        id: db.disease_predictions.length + 1,
        crop_image_id: Number(cropImageId),
        disease_name,
        confidence: Number(confidence),
        severity,
        treatment
      };
      db.disease_predictions.push(newPred);
      return newPred;
    }
    const sql = `
      INSERT INTO disease_predictions (crop_image_id, disease_name, confidence, severity, treatment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await query(sql, [cropImageId, disease_name, confidence, severity, treatment]);
    return res.rows[0];
  },

  async getDiseasePredictionsByCropId(cropId) {
    if (isMock) {
      const db = getMockDb();
      const imageIds = db.crop_images.filter(img => img.crop_id === Number(cropId)).map(img => img.id);
      return db.disease_predictions.filter(dp => imageIds.includes(dp.crop_image_id));
    }
    const sql = `
      SELECT dp.*, ci.image_url, ci.image_data, ci.uploaded_at
      FROM disease_predictions dp
      JOIN crop_images ci ON dp.crop_image_id = ci.id
      WHERE ci.crop_id = $1
      ORDER BY ci.uploaded_at DESC
    `;
    const res = await query(sql, [cropId]);
    return res.rows;
  },

  async addGlobalCropImage(userId, cropId, imageUrl, imageData) {
    if (isMock) {
      const db = getMockDb();
      const newImg = {
        id: db.crop_images.length + 1,
        crop_id: cropId ? Number(cropId) : null,
        user_id: Number(userId),
        image_url: imageUrl,
        image_data: imageData,
        uploaded_at: new Date()
      };
      db.crop_images.push(newImg);
      return newImg;
    }
    const sql = `
      INSERT INTO crop_images (user_id, crop_id, image_url, image_data)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [userId, cropId || null, imageUrl || null, imageData || null]);
    return res.rows[0];
  },

  async getDiseasePredictionsByUserId(userId) {
    if (isMock) {
      const db = getMockDb();
      const userImages = db.crop_images.filter(img => img.user_id === Number(userId));
      const imageIds = userImages.map(img => img.id);
      const preds = db.disease_predictions.filter(dp => imageIds.includes(dp.crop_image_id));
      return preds.map(p => {
        const img = userImages.find(ci => ci.id === p.crop_image_id);
        return {
          ...p,
          image_url: img.image_url,
          image_data: img.image_data,
          uploaded_at: img.uploaded_at
        };
      });
    }
    const sql = `
      SELECT dp.*, ci.image_url, ci.image_data, ci.uploaded_at
      FROM disease_predictions dp
      JOIN crop_images ci ON dp.crop_image_id = ci.id
      WHERE ci.user_id = $1
      ORDER BY ci.uploaded_at DESC
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  },

  // Fertilizer plans
  async addFertilizerRecommendation(cropId, { fertilizer_name, quantity, schedule }) {
    if (isMock) {
      const db = getMockDb();
      const newFert = {
        id: db.fertilizer_recommendations.length + 1,
        crop_id: Number(cropId),
        fertilizer_name,
        quantity: Number(quantity),
        schedule
      };
      db.fertilizer_recommendations.push(newFert);
      return newFert;
    }
    const sql = `
      INSERT INTO fertilizer_recommendations (crop_id, fertilizer_name, quantity, schedule)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [cropId, fertilizer_name, quantity, schedule]);
    return res.rows[0];
  },

  async getFertilizerRecommendations(cropId) {
    if (isMock) {
      const db = getMockDb();
      return db.fertilizer_recommendations.filter(f => f.crop_id === Number(cropId));
    }
    const sql = 'SELECT * FROM fertilizer_recommendations WHERE crop_id = $1';
    const res = await query(sql, [cropId]);
    return res.rows;
  },

  // Pest alerts
  async addPestAlert(cropId, { pest_name, risk_level, recommendation }) {
    if (isMock) {
      const db = getMockDb();
      const newPest = {
        id: db.pest_alerts.length + 1,
        crop_id: Number(cropId),
        pest_name,
        risk_level,
        recommendation
      };
      db.pest_alerts.push(newPest);
      return newPest;
    }
    const sql = `
      INSERT INTO pest_alerts (crop_id, pest_name, risk_level, recommendation)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [cropId, pest_name, risk_level, recommendation]);
    return res.rows[0];
  },

  async getPestAlerts(cropId) {
    if (isMock) {
      const db = getMockDb();
      return db.pest_alerts.filter(p => p.crop_id === Number(cropId));
    }
    const sql = 'SELECT * FROM pest_alerts WHERE crop_id = $1';
    const res = await query(sql, [cropId]);
    return res.rows;
  }
};
