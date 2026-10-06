import { cropRepository } from '../repositories/cropRepository.js';
import { farmRepository } from '../repositories/farmRepository.js';
import { alertRepository } from '../repositories/alertRepository.js';

export const getUserCrops = async (req, res) => {
  try {
    const crops = await cropRepository.findByUserId(req.user.id);
    return res.json(crops);
  } catch (error) {
    console.error('Error fetching user crops:', error);
    return res.status(500).json({ message: 'Server error retrieving crops.' });
  }
};

export const getFarmCrops = async (req, res) => {
  const { farmId } = req.params;
  try {
    const farm = await farmRepository.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found.' });
    }
    if (farm.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this farm.' });
    }

    const crops = await cropRepository.findByFarmId(farmId);
    return res.json(crops);
  } catch (error) {
    console.error('Error fetching farm crops:', error);
    return res.status(500).json({ message: 'Server error retrieving farm crops.' });
  }
};

export const getCropDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const crop = await cropRepository.findById(id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found.' });
    }

    // Verify ownership of the parent farm
    const farm = await farmRepository.findById(crop.farm_id);
    if (!farm || (farm.user_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied. You do not own the farm associated with this crop.' });
    }

    const images = await cropRepository.getCropImages(id);
    return res.json({
      ...crop,
      images
    });
  } catch (error) {
    console.error('Error fetching crop details:', error);
    return res.status(500).json({ message: 'Server error retrieving crop details.' });
  }
};

export const registerCrop = async (req, res) => {
  const { farm_id, crop_name, crop_type, sowing_date, expected_harvest_date, growth_stage, status } = req.body;

  if (!farm_id || !crop_name || !sowing_date || !expected_harvest_date) {
    return res.status(400).json({ message: 'Farm ID, crop name, sowing date, and expected harvest date are required.' });
  }

  try {
    const farm = await farmRepository.findById(farm_id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found.' });
    }
    if (farm.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this farm.' });
    }

    const crop = await cropRepository.create({
      farm_id,
      crop_name,
      crop_type,
      sowing_date,
      expected_harvest_date,
      growth_stage,
      status
    });

    await alertRepository.logAction(req.user.id, `Registered crop "${crop_name}" for farm "${farm.farm_name}"`);
    return res.status(201).json(crop);
  } catch (error) {
    console.error('Error registering crop:', error);
    return res.status(500).json({ message: 'Server error registering crop.' });
  }
};

export const updateCrop = async (req, res) => {
  const { id } = req.params;
  const { crop_name, crop_type, sowing_date, expected_harvest_date, growth_stage, status } = req.body;

  try {
    const crop = await cropRepository.findById(id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found.' });
    }

    const farm = await farmRepository.findById(crop.farm_id);
    if (!farm || (farm.user_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied. You do not own this crop.' });
    }

    const updated = await cropRepository.update(id, {
      crop_name,
      crop_type,
      sowing_date,
      expected_harvest_date,
      growth_stage,
      status
    });

    await alertRepository.logAction(req.user.id, `Updated crop "${crop_name}" details`);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating crop:', error);
    return res.status(500).json({ message: 'Server error updating crop.' });
  }
};

export const deleteCrop = async (req, res) => {
  const { id } = req.params;
  try {
    const crop = await cropRepository.findById(id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found.' });
    }

    const farm = await farmRepository.findById(crop.farm_id);
    if (!farm || (farm.user_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied. You do not own this crop.' });
    }

    await cropRepository.delete(id);
    await alertRepository.logAction(req.user.id, `Deleted crop "${crop.crop_name}"`);
    return res.json({ message: 'Crop deleted successfully.' });
  } catch (error) {
    console.error('Error deleting crop:', error);
    return res.status(500).json({ message: 'Server error deleting crop.' });
  }
};

export const addCropImage = async (req, res) => {
  const { cropId } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  try {
    const crop = await cropRepository.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found.' });
    }

    // Relative url path to read static uploads
    const imageUrl = `/uploads/${req.file.filename}`;
    const newImage = await cropRepository.addCropImage(cropId, imageUrl);

    return res.status(201).json(newImage);
  } catch (error) {
    console.error('Error adding crop image:', error);
    return res.status(500).json({ message: 'Server error saving image metadata.' });
  }
};
