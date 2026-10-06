import { query, isMock, getMockDb } from '../config/db.js';
import { alertRepository } from '../repositories/alertRepository.js';

export const getEquipmentList = async (req, res) => {
  try {
    if (isMock) {
      const db = getMockDb();
      return res.json(db.equipment);
    }
    const sql = 'SELECT * FROM equipment ORDER BY id ASC';
    const result = await query(sql);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching equipment list:', error);
    return res.status(500).json({ message: 'Server error fetching rental equipment.' });
  }
};

export const rentEquipment = async (req, res) => {
  const { equipment_id, duration_days } = req.body;
  if (!equipment_id || !duration_days) {
    return res.status(400).json({ message: 'Equipment ID and duration are required.' });
  }

  try {
    if (isMock) {
      const db = getMockDb();
      const equip = db.equipment.find(e => e.id === Number(equipment_id));
      if (!equip) {
        return res.status(404).json({ message: 'Equipment not found.' });
      }
      
      const newRental = {
        id: db.equipment_rentals.length + 1,
        user_id: req.user.id,
        equipment_id: Number(equipment_id),
        rental_date: new Date(),
        duration_days: Number(duration_days),
        status: 'booked',
        equipment_name: equip.name,
        rental_cost: equip.rental_cost
      };
      db.equipment_rentals.push(newRental);
      await alertRepository.logAction(req.user.id, `Booked rental for ${equip.name}`);
      return res.status(201).json(newRental);
    }

    // Live SQL
    const checkSql = 'SELECT * FROM equipment WHERE id = $1';
    const checkRes = await query(checkSql, [equipment_id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }
    const equip = checkRes.rows[0];

    const sql = `
      INSERT INTO equipment_rentals (user_id, equipment_id, duration_days)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await query(sql, [req.user.id, equipment_id, duration_days]);
    await alertRepository.logAction(req.user.id, `Booked rental for ${equip.name}`);
    return res.status(201).json({ ...result.rows[0], equipment_name: equip.name, rental_cost: equip.rental_cost });
  } catch (error) {
    console.error('Error renting equipment:', error);
    return res.status(500).json({ message: 'Server error booking rental.' });
  }
};

export const getRentedEquipment = async (req, res) => {
  try {
    if (isMock) {
      const db = getMockDb();
      const rentals = db.equipment_rentals.filter(r => r.user_id === req.user.id);
      return res.json(rentals);
    }

    const sql = `
      SELECT r.*, e.name AS equipment_name, e.rental_cost, e.image_url
      FROM equipment_rentals r
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.user_id = $1
      ORDER BY r.rental_date DESC
    `;
    const result = await query(sql, [req.user.id]);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rented equipment:', error);
    return res.status(500).json({ message: 'Server error fetching booking logs.' });
  }
};
