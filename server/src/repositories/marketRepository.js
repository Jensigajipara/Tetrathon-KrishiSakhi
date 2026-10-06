import { query, isMock, getMockDb } from '../config/db.js';

export const marketRepository = {
  // Mandi prices
  async getPricesByCrop(cropName) {
    if (isMock) {
      const db = getMockDb();
      return db.market_prices.filter(p => p.crop_name.toLowerCase() === cropName.toLowerCase());
    }
    const sql = 'SELECT * FROM market_prices WHERE LOWER(crop_name) = LOWER($1) ORDER BY date DESC';
    const res = await query(sql, [cropName]);
    return res.rows;
  },

  async getPricesByDistrict(district) {
    if (isMock) {
      const db = getMockDb();
      return db.market_prices.filter(p => p.district.toLowerCase() === district.toLowerCase());
    }
    const sql = 'SELECT * FROM market_prices WHERE LOWER(district) = LOWER($1) ORDER BY date DESC';
    const res = await query(sql, [district]);
    return res.rows;
  },

  async getAllPrices() {
    if (isMock) {
      const db = getMockDb();
      return db.market_prices;
    }
    const sql = 'SELECT * FROM market_prices ORDER BY date DESC, crop_name ASC';
    const res = await query(sql);
    return res.rows;
  },

  async addPrice({ crop_name, mandi_name, district, price }) {
    if (isMock) {
      const db = getMockDb();
      const newPrice = {
        id: db.market_prices.length + 1,
        crop_name,
        mandi_name,
        district,
        price: Number(price),
        date: new Date()
      };
      db.market_prices.push(newPrice);
      return newPrice;
    }
    const sql = `
      INSERT INTO market_prices (crop_name, mandi_name, district, price, date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING *
    `;
    const res = await query(sql, [crop_name, mandi_name, district, price]);
    return res.rows[0];
  },

  async deletePrice(id) {
    if (isMock) {
      const db = getMockDb();
      const index = db.market_prices.findIndex(p => p.id === Number(id));
      if (index !== -1) {
        db.market_prices.splice(index, 1);
        return true;
      }
      return false;
    }
    const sql = 'DELETE FROM market_prices WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rowCount > 0;
  },

  // Price Alerts
  async createPriceAlert(userId, { crop_name, target_price }) {
    if (isMock) {
      const db = getMockDb();
      const newAlert = {
        id: db.price_alerts.length + 1,
        user_id: Number(userId),
        crop_name,
        target_price: Number(target_price),
        status: 'active'
      };
      db.price_alerts.push(newAlert);
      return newAlert;
    }
    const sql = `
      INSERT INTO price_alerts (user_id, crop_name, target_price, status)
      VALUES ($1, $2, $3, 'active')
      RETURNING *
    `;
    const res = await query(sql, [userId, crop_name, target_price]);
    return res.rows[0];
  },

  async getPriceAlerts(userId) {
    if (isMock) {
      const db = getMockDb();
      return db.price_alerts.filter(a => a.user_id === Number(userId));
    }
    const sql = 'SELECT * FROM price_alerts WHERE user_id = $1 ORDER BY id DESC';
    const res = await query(sql, [userId]);
    return res.rows;
  },

  async getActivePriceAlerts() {
    if (isMock) {
      const db = getMockDb();
      return db.price_alerts.filter(a => a.status === 'active');
    }
    const sql = 'SELECT * FROM price_alerts WHERE status = $1';
    const res = await query(sql, ['active']);
    return res.rows;
  },

  async updatePriceAlertStatus(id, status) {
    if (isMock) {
      const db = getMockDb();
      const alert = db.price_alerts.find(a => a.id === Number(id));
      if (alert) {
        alert.status = status;
        return alert;
      }
      return null;
    }
    const sql = 'UPDATE price_alerts SET status = $1 WHERE id = $2 RETURNING *';
    const res = await query(sql, [status, id]);
    return res.rows[0] || null;
  }
};
