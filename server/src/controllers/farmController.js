import { farmRepository } from '../repositories/farmRepository.js';
import { alertRepository } from '../repositories/alertRepository.js';

export const getUserFarms = async (req, res) => {
  try {
    const farms = await farmRepository.findByUserId(req.user.id);
    return res.json(farms);
  } catch (error) {
    console.error('Error fetching user farms:', error);
    return res.status(500).json({ message: 'Server error retrieving farms.' });
  }
};

export const getFarmDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const farm = await farmRepository.findById(id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found.' });
    }
    
    // Authorization check
    if (farm.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this farm.' });
    }

    return res.json(farm);
  } catch (error) {
    console.error('Error fetching farm details:', error);
    return res.status(500).json({ message: 'Server error retrieving farm details.' });
  }
};

export const createFarm = async (req, res) => {
  const { farm_name, state, district, village, latitude, longitude, farm_size, soil_type, nitrogen, phosphorus, potassium, npk_ratio, soil_ph, irrigation_source, water_availability } = req.body;

  if (!farm_name || !state || !district || !farm_size || !soil_type) {
    return res.status(400).json({ message: 'Name, state, district, farm size, and soil type are required.' });
  }

  try {
    const farm = await farmRepository.create({
      user_id: req.user.id,
      farm_name,
      state,
      district,
      village,
      latitude,
      longitude,
      farm_size,
      soil_type,
      nitrogen,
      phosphorus,
      potassium,
      npk_ratio,
      soil_ph,
      irrigation_source,
      water_availability
    });

    await alertRepository.logAction(req.user.id, `Created farm "${farm_name}"`);
    return res.status(201).json(farm);
  } catch (error) {
    console.error('Error creating farm:', error);
    return res.status(500).json({ message: 'Server error creating farm.' });
  }
};

export const updateFarm = async (req, res) => {
  const { id } = req.params;
  const { farm_name, state, district, village, latitude, longitude, farm_size, soil_type, nitrogen, phosphorus, potassium, npk_ratio, soil_ph, irrigation_source, water_availability } = req.body;

  try {
    const farm = await farmRepository.findById(id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found.' });
    }

    if (farm.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this farm.' });
    }

    const updated = await farmRepository.update(id, {
      farm_name,
      state,
      district,
      village,
      latitude,
      longitude,
      farm_size,
      soil_type,
      nitrogen,
      phosphorus,
      potassium,
      npk_ratio,
      soil_ph,
      irrigation_source,
      water_availability
    });

    await alertRepository.logAction(req.user.id, `Updated farm "${farm_name}"`);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating farm:', error);
    return res.status(500).json({ message: 'Server error updating farm.' });
  }
};

export const deleteFarm = async (req, res) => {
  const { id } = req.params;
  try {
    const farm = await farmRepository.findById(id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found.' });
    }

    if (farm.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this farm.' });
    }

    await farmRepository.delete(id);
    await alertRepository.logAction(req.user.id, `Deleted farm "${farm.farm_name}"`);
    
    return res.json({ message: 'Farm deleted successfully.' });
  } catch (error) {
    console.error('Error deleting farm:', error);
    return res.status(500).json({ message: 'Server error deleting farm.' });
  }
};
