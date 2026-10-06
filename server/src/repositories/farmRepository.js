import { query, isMock, getMockDb } from '../config/db.js';

export const farmRepository = {
  async findByUserId(userId) {
    if (isMock) {
      const db = getMockDb();
      return db.farms.filter(f => f.user_id === Number(userId));
    }
    const sql = 'SELECT * FROM farms WHERE user_id = $1 ORDER BY created_at DESC';
    const res = await query(sql, [userId]);
    return res.rows;
  },

  async findById(id) {
    if (isMock) {
      const db = getMockDb();
      const farm = db.farms.find(f => f.id === Number(id));
      return farm || null;
    }
    const sql = 'SELECT * FROM farms WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async create({ user_id, farm_name, state, district, village, latitude, longitude, farm_size, soil_type, nitrogen, phosphorus, potassium, npk_ratio, soil_ph, irrigation_source, water_availability }) {
    if (isMock) {
      const db = getMockDb();
      const newFarm = {
        id: db.farms.length + 1,
        user_id: Number(user_id),
        farm_name,
        state,
        district,
        village,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        farm_size: Number(farm_size),
        soil_type,
        nitrogen: nitrogen ? Number(nitrogen) : 120,
        phosphorus: phosphorus ? Number(phosphorus) : 50,
        potassium: potassium ? Number(potassium) : 60,
        npk_ratio: npk_ratio || '120-50-60',
        soil_ph: soil_ph ? Number(soil_ph) : 6.5,
        irrigation_source: irrigation_source || 'Tube Well',
        water_availability: water_availability || 'High',
        created_at: new Date()
      };
      db.farms.push(newFarm);
      return newFarm;
    }
    const sql = `
      INSERT INTO farms (user_id, farm_name, state, district, village, latitude, longitude, farm_size, soil_type, nitrogen, phosphorus, potassium, npk_ratio, soil_ph, irrigation_source, water_availability)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    const res = await query(sql, [
      user_id,
      farm_name,
      state,
      district,
      village,
      latitude,
      longitude,
      farm_size,
      soil_type,
      nitrogen ? Number(nitrogen) : 120,
      phosphorus ? Number(phosphorus) : 50,
      potassium ? Number(potassium) : 60,
      npk_ratio || '120-50-60',
      soil_ph ? Number(soil_ph) : 6.5,
      irrigation_source || 'Tube Well',
      water_availability || 'High'
    ]);
    return res.rows[0];
  },

  async update(id, { farm_name, state, district, village, latitude, longitude, farm_size, soil_type, nitrogen, phosphorus, potassium, npk_ratio, soil_ph, irrigation_source, water_availability }) {
    if (isMock) {
      const db = getMockDb();
      const farm = db.farms.find(f => f.id === Number(id));
      if (farm) {
        farm.farm_name = farm_name;
        farm.state = state;
        farm.district = district;
        farm.village = village;
        farm.latitude = latitude ? Number(latitude) : null;
        farm.longitude = longitude ? Number(longitude) : null;
        farm.farm_size = Number(farm_size);
        farm.soil_type = soil_type;
        farm.nitrogen = nitrogen ? Number(nitrogen) : farm.nitrogen;
        farm.phosphorus = phosphorus ? Number(phosphorus) : farm.phosphorus;
        farm.potassium = potassium ? Number(potassium) : farm.potassium;
        farm.npk_ratio = npk_ratio || farm.npk_ratio;
        farm.soil_ph = soil_ph ? Number(soil_ph) : farm.soil_ph;
        farm.irrigation_source = irrigation_source || farm.irrigation_source;
        farm.water_availability = water_availability || farm.water_availability;
        return farm;
      }
      return null;
    }
    const sql = `
      UPDATE farms
      SET farm_name = $1, state = $2, district = $3, village = $4, latitude = $5, longitude = $6, farm_size = $7, soil_type = $8,
          nitrogen = $9, phosphorus = $10, potassium = $11, npk_ratio = $12, soil_ph = $13, irrigation_source = $14, water_availability = $15
      WHERE id = $16
      RETURNING *
    `;
    const res = await query(sql, [
      farm_name,
      state,
      district,
      village,
      latitude,
      longitude,
      farm_size,
      soil_type,
      nitrogen ? Number(nitrogen) : null,
      phosphorus ? Number(phosphorus) : null,
      potassium ? Number(potassium) : null,
      npk_ratio,
      soil_ph ? Number(soil_ph) : null,
      irrigation_source,
      water_availability,
      id
    ]);
    return res.rows[0] || null;
  },

  async delete(id) {
    if (isMock) {
      const db = getMockDb();
      const index = db.farms.findIndex(f => f.id === Number(id));
      if (index !== -1) {
        db.farms.splice(index, 1);
        // Cascading deletes for mock
        db.crops = db.crops.filter(c => c.farm_id !== Number(id));
        return true;
      }
      return false;
    }
    const sql = 'DELETE FROM farms WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rowCount > 0;
  },

  async getAll() {
    if (isMock) {
      const db = getMockDb();
      return db.farms;
    }
    const sql = 'SELECT * FROM farms ORDER BY created_at DESC';
    const res = await query(sql);
    return res.rows;
  }
};
