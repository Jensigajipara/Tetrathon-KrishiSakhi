import { query, isMock, getMockDb } from '../config/db.js';

export const cropRepository = {
  async findByFarmId(farmId) {
    if (isMock) {
      const db = getMockDb();
      return db.crops.filter(c => c.farm_id === Number(farmId));
    }
    const sql = 'SELECT * FROM crops WHERE farm_id = $1 ORDER BY sowing_date DESC';
    const res = await query(sql, [farmId]);
    return res.rows;
  },

  async findByUserId(userId) {
    if (isMock) {
      const db = getMockDb();
      const userFarms = db.farms.filter(f => f.user_id === Number(userId)).map(f => f.id);
      return db.crops.filter(c => userFarms.includes(c.farm_id));
    }
    const sql = `
      SELECT c.*, f.farm_name 
      FROM crops c
      JOIN farms f ON c.farm_id = f.id
      WHERE f.user_id = $1
      ORDER BY c.sowing_date DESC
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  },

  async findById(id) {
    if (isMock) {
      const db = getMockDb();
      const crop = db.crops.find(c => c.id === Number(id));
      return crop || null;
    }
    const sql = 'SELECT * FROM crops WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async create({ farm_id, crop_name, crop_type, sowing_date, expected_harvest_date, growth_stage = 'Sowing', status = 'active' }) {
    if (isMock) {
      const db = getMockDb();
      const newCrop = {
        id: db.crops.length + 1,
        farm_id: Number(farm_id),
        crop_name,
        crop_type,
        sowing_date,
        expected_harvest_date,
        growth_stage,
        status
      };
      db.crops.push(newCrop);
      return newCrop;
    }
    const sql = `
      INSERT INTO crops (farm_id, crop_name, crop_type, sowing_date, expected_harvest_date, growth_stage, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const res = await query(sql, [farm_id, crop_name, crop_type, sowing_date, expected_harvest_date, growth_stage, status]);
    return res.rows[0];
  },

  async update(id, { crop_name, crop_type, sowing_date, expected_harvest_date, growth_stage, status }) {
    if (isMock) {
      const db = getMockDb();
      const crop = db.crops.find(c => c.id === Number(id));
      if (crop) {
        crop.crop_name = crop_name;
        crop.crop_type = crop_type;
        crop.sowing_date = sowing_date;
        crop.expected_harvest_date = expected_harvest_date;
        crop.growth_stage = growth_stage;
        crop.status = status;
        return crop;
      }
      return null;
    }
    const sql = `
      UPDATE crops
      SET crop_name = $1, crop_type = $2, sowing_date = $3, expected_harvest_date = $4, growth_stage = $5, status = $6
      WHERE id = $7
      RETURNING *
    `;
    const res = await query(sql, [crop_name, crop_type, sowing_date, expected_harvest_date, growth_stage, status, id]);
    return res.rows[0] || null;
  },

  async delete(id) {
    if (isMock) {
      const db = getMockDb();
      const index = db.crops.findIndex(c => c.id === Number(id));
      if (index !== -1) {
        db.crops.splice(index, 1);
        return true;
      }
      return false;
    }
    const sql = 'DELETE FROM crops WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rowCount > 0;
  },

  async getAll() {
    if (isMock) {
      const db = getMockDb();
      return db.crops;
    }
    const sql = 'SELECT * FROM crops ORDER BY sowing_date DESC';
    const res = await query(sql);
    return res.rows;
  },

  async addCropImage(crop_id, image_url) {
    if (isMock) {
      const db = getMockDb();
      const newImg = {
        id: db.crop_images.length + 1,
        crop_id: Number(crop_id),
        image_url,
        uploaded_at: new Date()
      };
      db.crop_images.push(newImg);
      return newImg;
    }
    const sql = `
      INSERT INTO crop_images (crop_id, image_url)
      VALUES ($1, $2)
      RETURNING *
    `;
    const res = await query(sql, [crop_id, image_url]);
    return res.rows[0];
  },

  async getCropImages(crop_id) {
    if (isMock) {
      const db = getMockDb();
      return db.crop_images.filter(img => img.crop_id === Number(crop_id));
    }
    const sql = 'SELECT * FROM crop_images WHERE crop_id = $1 ORDER BY uploaded_at DESC';
    const res = await query(sql, [crop_id]);
    return res.rows;
  }
};
