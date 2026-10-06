import { query, isMock, getMockDb } from '../config/db.js';

export const decisionRepository = {
  // Storage Predictions
  async addStoragePrediction(cropId, { spoilage_percentage, storage_type, recommendation }) {
    if (isMock) {
      const db = getMockDb();
      // Remove previous prediction for same crop if exists
      db.storage_predictions = db.storage_predictions.filter(s => s.crop_id !== Number(cropId));
      const newPred = {
        id: db.storage_predictions.length + 1,
        crop_id: Number(cropId),
        spoilage_percentage: Number(spoilage_percentage),
        storage_type,
        recommendation
      };
      db.storage_predictions.push(newPred);
      return newPred;
    }
    
    // Delete existing to avoid duplicates
    await query('DELETE FROM storage_predictions WHERE crop_id = $1', [cropId]);
    const sql = `
      INSERT INTO storage_predictions (crop_id, spoilage_percentage, storage_type, recommendation)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [cropId, spoilage_percentage, storage_type, recommendation]);
    return res.rows[0];
  },

  async getStoragePrediction(cropId) {
    if (isMock) {
      const db = getMockDb();
      return db.storage_predictions.find(s => s.crop_id === Number(cropId)) || null;
    }
    const sql = 'SELECT * FROM storage_predictions WHERE crop_id = $1';
    const res = await query(sql, [cropId]);
    return res.rows[0] || null;
  },

  // Transport Predictions
  async addTransportPrediction(cropId, { destination, transport_cost, estimated_profit }) {
    if (isMock) {
      const db = getMockDb();
      // Clear previous
      db.transport_predictions = db.transport_predictions.filter(t => t.crop_id !== Number(cropId));
      const newPred = {
        id: db.transport_predictions.length + 1,
        crop_id: Number(cropId),
        destination,
        transport_cost: Number(transport_cost),
        estimated_profit: Number(estimated_profit)
      };
      db.transport_predictions.push(newPred);
      return newPred;
    }
    await query('DELETE FROM transport_predictions WHERE crop_id = $1', [cropId]);
    const sql = `
      INSERT INTO transport_predictions (crop_id, destination, transport_cost, estimated_profit)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [cropId, destination, transport_cost, estimated_profit]);
    return res.rows[0];
  },

  async getTransportPrediction(cropId) {
    if (isMock) {
      const db = getMockDb();
      return db.transport_predictions.find(t => t.crop_id === Number(cropId)) || null;
    }
    const sql = 'SELECT * FROM transport_predictions WHERE crop_id = $1';
    const res = await query(sql, [cropId]);
    return res.rows[0] || null;
  }
};
