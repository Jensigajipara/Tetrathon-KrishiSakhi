import { userRepository } from '../repositories/userRepository.js';
import { farmRepository } from '../repositories/farmRepository.js';
import { cropRepository } from '../repositories/cropRepository.js';
import { marketRepository } from '../repositories/marketRepository.js';
import { alertRepository } from '../repositories/alertRepository.js';

export const getDashboardStats = async (req, res) => {
  try {
    const farmers = await userRepository.getAllFarmers();
    const farms = await farmRepository.getAll();
    const crops = await cropRepository.getAll();
    const logs = await alertRepository.getAnalyticsLogs();
    const prices = await marketRepository.getAllPrices();

    const activeCrops = crops.filter(c => c.status === 'active');
    const harvestedCrops = crops.filter(c => c.status === 'harvested');

    return res.json({
      summary: {
        totalFarmers: farmers.length,
        totalFarms: farms.length,
        totalCrops: crops.length,
        activeCrops: activeCrops.length,
        harvestedCrops: harvestedCrops.length,
        priceRecords: prices.length
      },
      recentLogs: logs.slice(0, 10),
      cropDistribution: activeCrops.reduce((acc, crop) => {
        acc[crop.crop_name] = (acc[crop.crop_name] || 0) + 1;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Server error retrieving dashboard statistics.' });
  }
};

export const getAllFarmers = async (req, res) => {
  try {
    const farmers = await userRepository.getAllFarmers();
    return res.json(farmers);
  } catch (error) {
    console.error('Error fetching farmers list:', error);
    return res.status(500).json({ message: 'Server error retrieving farmers roster.' });
  }
};

export const deleteFarmer = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await userRepository.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Farmer not found.' });
    }
    return res.json({ message: 'Farmer account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting farmer:', error);
    return res.status(500).json({ message: 'Server error deleting farmer.' });
  }
};

export const getAllFarms = async (req, res) => {
  try {
    const farms = await farmRepository.getAll();
    return res.json(farms);
  } catch (error) {
    console.error('Error fetching farms list:', error);
    return res.status(500).json({ message: 'Server error retrieving farms roster.' });
  }
};

export const getAllCrops = async (req, res) => {
  try {
    const crops = await cropRepository.getAll();
    return res.json(crops);
  } catch (error) {
    console.error('Error fetching crops list:', error);
    return res.status(500).json({ message: 'Server error retrieving crops roster.' });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    const logs = await alertRepository.getAnalyticsLogs();
    return res.json(logs);
  } catch (error) {
    console.error('Error loading action logs:', error);
    return res.status(500).json({ message: 'Server error retrieving action logs.' });
  }
};
