import { query, isMock, getMockDb } from '../config/db.js';

export const alertRepository = {
  async createNotification(userId, { title, message, type = 'info' }) {
    if (isMock) {
      const db = getMockDb();
      const newNotif = {
        id: db.notifications.length + 1,
        user_id: Number(userId),
        title,
        message,
        type,
        is_read: false,
        created_at: new Date()
      };
      db.notifications.push(newNotif);
      return newNotif;
    }
    const sql = `
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES ($1, $2, $3, $4, FALSE)
      RETURNING *
    `;
    const res = await query(sql, [userId, title, message, type]);
    return res.rows[0];
  },

  async getNotifications(userId) {
    if (isMock) {
      const db = getMockDb();
      return db.notifications
        .filter(n => n.user_id === Number(userId))
        .sort((a, b) => b.created_at - a.created_at);
    }
    const sql = 'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC';
    const res = await query(sql, [userId]);
    return res.rows;
  },

  async markAsRead(id) {
    if (isMock) {
      const db = getMockDb();
      const notif = db.notifications.find(n => n.id === Number(id));
      if (notif) {
        notif.is_read = true;
        return true;
      }
      return false;
    }
    const sql = 'UPDATE notifications SET is_read = TRUE WHERE id = $1';
    const res = await query(sql, [id]);
    return res.rowCount > 0;
  },

  async logAction(userId, action) {
    if (isMock) {
      const db = getMockDb();
      const newLog = {
        id: db.analytics_logs.length + 1,
        user_id: userId ? Number(userId) : null,
        action,
        created_at: new Date()
      };
      db.analytics_logs.push(newLog);
      return newLog;
    }
    const sql = 'INSERT INTO analytics_logs (user_id, action) VALUES ($1, $2) RETURNING *';
    const res = await query(sql, [userId, action]);
    return res.rows[0];
  },

  async getAnalyticsLogs() {
    if (isMock) {
      const db = getMockDb();
      return db.analytics_logs;
    }
    const sql = 'SELECT * FROM analytics_logs ORDER BY created_at DESC LIMIT 100';
    const res = await query(sql);
    return res.rows;
  }
};
