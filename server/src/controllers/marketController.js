import { marketRepository } from '../repositories/marketRepository.js';
import { cropRepository } from '../repositories/cropRepository.js';
import { farmRepository } from '../repositories/farmRepository.js';
import { decisionRepository } from '../repositories/decisionRepository.js';
import { alertRepository } from '../repositories/alertRepository.js';
import { decisionEngine } from '../services/decisionEngine.js';
import { notificationService } from '../services/notificationService.js';

export const getMarketPrices = async (req, res) => {
  const { crop, district } = req.query;
  try {
    let prices = [];
    if (crop) {
      prices = await marketRepository.getPricesByCrop(crop);
    } else if (district) {
      prices = await marketRepository.getPricesByDistrict(district);
    } else {
      prices = await marketRepository.getAllPrices();
    }
    return res.json(prices);
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return res.status(500).json({ message: 'Server error retrieving market prices.' });
  }
};

export const getPriceAlerts = async (req, res) => {
  try {
    const alerts = await marketRepository.getPriceAlerts(req.user.id);
    return res.json(alerts);
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    return res.status(500).json({ message: 'Server error retrieving price alerts.' });
  }
};

export const createPriceAlert = async (req, res) => {
  const { crop_name, target_price } = req.body;
  if (!crop_name || !target_price) {
    return res.status(400).json({ message: 'Crop name and target price are required.' });
  }
  try {
    const alert = await marketRepository.createPriceAlert(req.user.id, {
      crop_name,
      target_price
    });
    
    await alertRepository.logAction(req.user.id, `Created price alert for "${crop_name}" at ₹${target_price}`);
    return res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating price alert:', error);
    return res.status(500).json({ message: 'Server error creating price alert.' });
  }
};

export const getDecisionBreakdown = async (req, res) => {
  const { cropId } = req.params;
  const quantity = Number(req.query.quantity) || 50; // in quintals
  const localMandi = req.query.localMandi || '';
  const forceRefresh = req.query.refresh === 'true';

  try {
    const crop = await cropRepository.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found.' });
    }

    const farm = await farmRepository.findById(crop.farm_id);
    const result = await decisionEngine.calculateOptions(crop, quantity, localMandi, farm.district, forceRefresh, req.user.id);

    // Save calculations in db for history/tracking compatibility
    await decisionRepository.addStoragePrediction(cropId, {
      spoilage_percentage: result.breakdown.store.spoilageRate * 100,
      storage_type: result.breakdown.store.type,
      recommendation: result.explanation
    });

    if (result.breakdown.transport) {
      await decisionRepository.addTransportPrediction(cropId, {
        destination: `${result.breakdown.transport.mandiName} (${result.breakdown.transport.district})`,
        transport_cost: result.breakdown.transport.cost,
        estimated_profit: result.breakdown.transport.profit
      });
    }

    return res.json(result);
  } catch (error) {
    console.error('Error generating post-harvest decision breakdown:', error);
    return res.status(500).json({ message: 'Server error running post-harvest engine.' });
  }
};

// Admin interface to change price and trigger alerts
export const updateMandiPrice = async (req, res) => {
  const { crop_name, mandi_name, district, price } = req.body;
  
  if (!crop_name || !mandi_name || !district || !price) {
    return res.status(400).json({ message: 'Crop name, mandi name, district, and price are required.' });
  }

  try {
    const newPriceRecord = await marketRepository.addPrice({
      crop_name,
      mandi_name,
      district,
      price
    });

    // Check if this new price triggers any price alerts
    await notificationService.checkPriceAlerts(crop_name, Number(price), mandi_name);

    return res.status(201).json(newPriceRecord);
  } catch (error) {
    console.error('Error updating mandi price:', error);
    return res.status(500).json({ message: 'Server error updating price.' });
  }
};
