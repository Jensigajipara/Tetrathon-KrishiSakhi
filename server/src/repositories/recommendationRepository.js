import { query, isMock, getMockDb } from '../config/db.js';

export const recommendationRepository = {
  async getActive(userId, farmId, cropId, type) {
    if (isMock) {
      const db = getMockDb();
      const rec = db.ai_recommendations.find(r => 
        r.user_id === Number(userId) &&
        r.recommendation_type === type &&
        (farmId ? r.farm_id === Number(farmId) : !r.farm_id) &&
        (cropId ? r.crop_id === Number(cropId) : !r.crop_id) &&
        r.status === 'active'
      );
      return rec || null;
    }

    const sql = `
      SELECT * FROM ai_recommendations 
      WHERE user_id = $1 
        AND recommendation_type = $2 
        AND (farm_id = $3 OR ($3 IS NULL AND farm_id IS NULL))
        AND (crop_id = $4 OR ($4 IS NULL AND crop_id IS NULL))
        AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const res = await query(sql, [userId, type, farmId || null, cropId || null]);
    return res.rows[0] || null;
  },

  async archivePrevious(userId, farmId, cropId, type) {
    if (isMock) {
      const db = getMockDb();
      db.ai_recommendations.forEach(r => {
        if (
          r.user_id === Number(userId) &&
          r.recommendation_type === type &&
          (farmId ? r.farm_id === Number(farmId) : !r.farm_id) &&
          (cropId ? r.crop_id === Number(cropId) : !r.crop_id) &&
          r.status === 'active'
        ) {
          r.status = 'archived';
        }
      });
      return;
    }

    const sql = `
      UPDATE ai_recommendations 
      SET status = 'archived', updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 
        AND recommendation_type = $2 
        AND (farm_id = $3 OR ($3 IS NULL AND farm_id IS NULL))
        AND (crop_id = $4 OR ($4 IS NULL AND crop_id IS NULL))
        AND status = 'active'
    `;
    await query(sql, [userId, type, farmId || null, cropId || null]);
  },

  async create({ user_id, farm_id, crop_id, recommendation_type, input_hash, input_snapshot, weather_snapshot, market_snapshot, ai_response, model, confidence, expires_at }) {
    if (isMock) {
      const db = getMockDb();
      const newRec = {
        id: db.ai_recommendations.length + 1,
        user_id: Number(user_id),
        farm_id: farm_id ? Number(farm_id) : null,
        crop_id: crop_id ? Number(crop_id) : null,
        recommendation_type,
        input_hash,
        input_snapshot,
        weather_snapshot,
        market_snapshot,
        ai_response,
        model,
        status: 'active',
        confidence: confidence ? Number(confidence) : 100.0,
        expires_at: new Date(expires_at),
        created_at: new Date(),
        updated_at: new Date(),
        last_viewed_at: new Date()
      };
      db.ai_recommendations.push(newRec);
      return newRec;
    }

    const sql = `
      INSERT INTO ai_recommendations (
        user_id, farm_id, crop_id, recommendation_type, input_hash, 
        input_snapshot, weather_snapshot, market_snapshot, ai_response, 
        model, status, confidence, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', $11, $12)
      RETURNING *
    `;
    const res = await query(sql, [
      user_id,
      farm_id || null,
      crop_id || null,
      recommendation_type,
      input_hash,
      JSON.stringify(input_snapshot),
      weather_snapshot ? JSON.stringify(weather_snapshot) : null,
      market_snapshot ? JSON.stringify(market_snapshot) : null,
      JSON.stringify(ai_response),
      model,
      confidence || 100.0,
      expires_at
    ]);
    return res.rows[0];
  },

  async getHistory(userId, farmId, cropId, type) {
    if (isMock) {
      const db = getMockDb();
      return db.ai_recommendations
        .filter(r => 
          r.user_id === Number(userId) &&
          r.recommendation_type === type &&
          (farmId ? r.farm_id === Number(farmId) : !r.farm_id) &&
          (cropId ? r.crop_id === Number(cropId) : !r.crop_id)
        )
        .sort((a, b) => b.created_at - a.created_at);
    }

    const sql = `
      SELECT * FROM ai_recommendations 
      WHERE user_id = $1 
        AND recommendation_type = $2 
        AND (farm_id = $3 OR ($3 IS NULL AND farm_id IS NULL))
        AND (crop_id = $4 OR ($4 IS NULL AND crop_id IS NULL))
      ORDER BY created_at DESC
    `;
    const res = await query(sql, [userId, type, farmId || null, cropId || null]);
    return res.rows;
  },

  async getById(id) {
    if (isMock) {
      const db = getMockDb();
      const rec = db.ai_recommendations.find(r => r.id === Number(id));
      return rec || null;
    }

    const sql = 'SELECT * FROM ai_recommendations WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async updateLastViewed(id) {
    if (isMock) {
      const db = getMockDb();
      const rec = db.ai_recommendations.find(r => r.id === Number(id));
      if (rec) {
        rec.last_viewed_at = new Date();
      }
      return;
    }

    const sql = 'UPDATE ai_recommendations SET last_viewed_at = CURRENT_TIMESTAMP WHERE id = $1';
    await query(sql, [id]);
  }
};
