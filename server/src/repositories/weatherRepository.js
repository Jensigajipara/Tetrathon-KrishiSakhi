import { query, isMock, getMockDb } from '../config/db.js';

export const weatherRepository = {
  async addWeatherHistory(farmId, { temperature, humidity, rainfall, wind_speed }) {
    if (isMock) {
      const db = getMockDb();
      const newRecord = {
        id: db.weather_history.length + 1,
        farm_id: Number(farmId),
        temperature: Number(temperature),
        humidity: Number(humidity),
        rainfall: Number(rainfall),
        wind_speed: Number(wind_speed),
        recorded_at: new Date()
      };
      db.weather_history.push(newRecord);
      return newRecord;
    }
    const sql = `
      INSERT INTO weather_history (farm_id, temperature, humidity, rainfall, wind_speed)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await query(sql, [farmId, temperature, humidity, rainfall, wind_speed]);
    return res.rows[0];
  },

  async getWeatherHistory(farmId, limit = 10) {
    if (isMock) {
      const db = getMockDb();
      return db.weather_history
        .filter(w => w.farm_id === Number(farmId))
        .sort((a, b) => b.recorded_at - a.recorded_at)
        .slice(0, limit);
    }
    const sql = `
      SELECT * FROM weather_history 
      WHERE farm_id = $1 
      ORDER BY recorded_at DESC 
      LIMIT $2
    `;
    const res = await query(sql, [farmId, limit]);
    return res.rows;
  }
};
