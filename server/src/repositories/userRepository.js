import { query, isMock, getMockDb } from '../config/db.js';

export const userRepository = {
  async findByEmail(email) {
    if (isMock) {
      const db = getMockDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
    const sql = 'SELECT * FROM users WHERE email = $1';
    const res = await query(sql, [email]);
    return res.rows[0] || null;
  },

  async findById(id) {
    if (isMock) {
      const db = getMockDb();
      const user = db.users.find(u => u.id === Number(id));
      return user || null;
    }
    const sql = 'SELECT * FROM users WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async create({ full_name, email, password, role = 'farmer', phone }) {
    if (isMock) {
      const db = getMockDb();
      const newUser = {
        id: db.users.length + 1,
        full_name,
        email,
        password,
        role,
        phone,
        created_at: new Date()
      };
      db.users.push(newUser);
      return newUser;
    }
    const sql = `
      INSERT INTO users (full_name, email, password, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await query(sql, [full_name, email, password, role, phone]);
    return res.rows[0];
  },

  async getAllFarmers() {
    if (isMock) {
      const db = getMockDb();
      return db.users.filter(u => u.role === 'farmer');
    }
    const sql = 'SELECT id, full_name, email, role, phone, created_at FROM users WHERE role = $1 ORDER BY created_at DESC';
    const res = await query(sql, ['farmer']);
    return res.rows;
  },

  async deleteUser(id) {
    if (isMock) {
      const db = getMockDb();
      const index = db.users.findIndex(u => u.id === Number(id));
      if (index !== -1) {
        db.users.splice(index, 1);
        return true;
      }
      return false;
    }
    const sql = 'DELETE FROM users WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rowCount > 0;
  },

  async findAdminByEmail(email) {
    if (isMock) {
      const db = getMockDb();
      const admin = db.admin_users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return admin || null;
    }
    const sql = 'SELECT * FROM admin_users WHERE email = $1';
    const res = await query(sql, [email]);
    return res.rows[0] || null;
  },

  async findAdminById(id) {
    if (isMock) {
      const db = getMockDb();
      const admin = db.admin_users.find(u => u.id === Number(id));
      return admin || null;
    }
    const sql = 'SELECT * FROM admin_users WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
};
