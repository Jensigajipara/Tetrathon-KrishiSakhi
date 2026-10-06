import { weatherRepository } from '../repositories/weatherRepository.js';
import { farmRepository } from '../repositories/farmRepository.js';
import { cropRepository } from '../repositories/cropRepository.js';
import { weatherService } from '../services/weatherService.js';
import { notificationService } from '../services/notificationService.js';
import { generateAdvice } from '../ai/index.js';

export const getWeatherReport = async (req, res) => {
  const { farmId } = req.params;
  try {
    const farm = await farmRepository.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found.' });
    }

    const history = await weatherRepository.getWeatherHistory(farmId, 1);
    const forecast = weatherService.get7DayForecast(farm.state, farm.district);

    let currentWeather;
    if (history.length === 0) {
      currentWeather = weatherService.generateCurrentWeather(farm.state, farm.district);
      await weatherRepository.addWeatherHistory(farmId, currentWeather);
    } else {
      currentWeather = history[0];
    }

    // Get active crop on the farm to refine irrigation suggestions
    const crops = await cropRepository.findByFarmId(farmId);
    const activeCrop = crops.find(c => c.status === 'active') || { crop_name: 'General', growth_stage: 'Vegetative' };

    // Request AI irrigation recommendations dynamically
    const aiPlan = await generateAdvice('irrigationAdvice', {
      cropName: activeCrop.crop_name,
      growthStage: activeCrop.growth_stage || 'Vegetative',
      temperature: currentWeather.temperature,
      humidity: currentWeather.humidity,
      rainfall: currentWeather.rainfall,
      windSpeed: currentWeather.wind_speed
    }, {
      userId: req.user.id,
      memoryKey: `farm_${farmId}`
    });

    const irrigationPlan = {
      ...aiPlan,
      recommendation: aiPlan.recommendation,
      action: aiPlan.title,
      type: aiPlan.riskLevel === 'High' ? 'warning' : aiPlan.priority === 'High' ? 'action' : 'info',
      currentWeather,
      forecast
    };

    return res.json({
      farm_id: farm.id,
      farm_name: farm.farm_name,
      current: currentWeather,
      forecast,
      irrigation: irrigationPlan
    });
  } catch (error) {
    console.error('Error loading weather report:', error);
    return res.status(500).json({ message: 'Server error retrieving weather report.' });
  }
};

export const refreshWeatherReport = async (req, res) => {
  const { farmId } = req.params;
  try {
    const farm = await farmRepository.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found.' });
    }

    const newWeather = weatherService.generateCurrentWeather(farm.state, farm.district);
    const saved = await weatherRepository.addWeatherHistory(farmId, newWeather);
    const forecast = weatherService.get7DayForecast(farm.state, farm.district);

    const crops = await cropRepository.findByFarmId(farmId);
    const activeCrop = crops.find(c => c.status === 'active') || { crop_name: 'General', growth_stage: 'Vegetative' };

    // Request AI irrigation recommendations dynamically
    const aiPlan = await generateAdvice('irrigationAdvice', {
      cropName: activeCrop.crop_name,
      growthStage: activeCrop.growth_stage || 'Vegetative',
      temperature: saved.temperature,
      humidity: saved.humidity,
      rainfall: saved.rainfall,
      windSpeed: saved.wind_speed
    }, {
      userId: req.user.id,
      memoryKey: `farm_${farmId}`
    });

    const irrigationPlan = {
      ...aiPlan,
      recommendation: aiPlan.recommendation,
      action: aiPlan.title,
      type: aiPlan.riskLevel === 'High' ? 'warning' : aiPlan.priority === 'High' ? 'action' : 'info',
      currentWeather: saved,
      forecast
    };

    // Evaluate weather warnings (heavy rain triggers warning notification)
    await notificationService.checkWeatherAlerts(req.user.id, farm.farm_name, forecast);

    return res.json({
      farm_id: farm.id,
      farm_name: farm.farm_name,
      current: saved,
      forecast,
      irrigation: irrigationPlan
    });
  } catch (error) {
    console.error('Error refreshing weather report:', error);
    return res.status(500).json({ message: 'Server error updating weather report.' });
  }
};

export const getWeatherHistory = async (req, res) => {
  const { farmId } = req.params;
  try {
    const history = await weatherRepository.getWeatherHistory(farmId, 30);
    return res.json(history);
  } catch (error) {
    console.error('Error retrieving weather history:', error);
    return res.status(500).json({ message: 'Server error retrieving weather charts.' });
  }
};
