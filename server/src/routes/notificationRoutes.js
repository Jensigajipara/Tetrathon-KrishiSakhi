import express from 'express';
import { alertRepository } from '../repositories/alertRepository.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const list = await alertRepository.getNotifications(req.user.id);
    return res.json(list);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error retrieving notifications.' });
  }
});

router.put('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const success = await alertRepository.markAsRead(id);
    if (!success) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    return res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error marking notification:', error);
    return res.status(500).json({ message: 'Server error updating notification.' });
  }
});

export default router;
