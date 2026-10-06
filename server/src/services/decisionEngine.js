// Sell / Store / Transport Optimization Engine for KrishiSakhi
import { marketRepository } from '../repositories/marketRepository.js';
import { recommendationService } from './recommendationService.js';

export const decisionEngine = {
  /**
   * Evaluates post-harvest actions for a crop quantity
   * @param {Object} crop - Crop database entry
   * @param {number} quantity - Quantity in Quintals (1 Quintal = 100 kg)
   * @param {string} localMandi - Name of local mandi
   * @param {string} farmDistrict - Farm district
   * @param {boolean} forceRefresh - Flag to force new Gemini generation
   * @param {number} userId - ID of sowed crop user
   */
  async calculateOptions(crop, quantity = 50, localMandi = '', farmDistrict = '', forceRefresh = false, userId = 1) {
    // 1. Get all mandi prices for this crop type
    const cropName = crop.crop_name;
    const allPrices = await marketRepository.getPricesByCrop(cropName);
    
    if (allPrices.length === 0) {
      // Return default/simulated prices if none in DB
      allPrices.push(
        { mandi_name: 'Local Mandi', district: farmDistrict || 'Local', price: 2200.0, date: new Date() },
        { mandi_name: 'Regional Hub', district: 'Regional', price: 2450.0, date: new Date() }
      );
    }

    // 2. Identify local mandi price
    let localPriceRecord = allPrices.find(p => p.mandi_name.toLowerCase() === localMandi.toLowerCase());
    if (!localPriceRecord && localMandi) {
      localPriceRecord = allPrices.find(p => p.district.toLowerCase() === farmDistrict.toLowerCase());
    }
    const localPrice = localPriceRecord ? Number(localPriceRecord.price) : Number(allPrices[0].price);
    const resolvedLocalMandiName = localPriceRecord ? localPriceRecord.mandi_name : 'Local Mandi';

    // 3. OPTION A: SELL IMMEDIATELY (LOCAL)
    const sellImmediatelyRevenue = quantity * localPrice;
    const sellImmediatelyCost = 0;
    const sellImmediatelyProfit = sellImmediatelyRevenue - sellImmediatelyCost;

    // 4. OPTION B: STORE & SELL LATER
    const storageDurationMonths = 3;
    const expectedPriceFactor = 1.12; 
    const futurePrice = localPrice * expectedPriceFactor;

    let storageType = 'Traditional Silo';
    let storageRatePerQuintalMonth = 25.0;
    let spoilagePercentage = 0.08;

    if (cropName.toLowerCase() === 'potato' || cropName.toLowerCase() === 'onion' || cropName.toLowerCase() === 'apple') {
      storageType = 'Cold Storage';
      storageRatePerQuintalMonth = 50.0;
      spoilagePercentage = 0.02;
    } else if (cropName.toLowerCase() === 'rice' || cropName.toLowerCase() === 'wheat') {
      storageType = 'Hermetic Bag Storage';
      storageRatePerQuintalMonth = 30.0;
      spoilagePercentage = 0.01;
    }

    const storageCost = quantity * storageRatePerQuintalMonth * storageDurationMonths;
    const storageQuantityRemaining = quantity * (1 - spoilagePercentage);
    const storageRevenue = storageQuantityRemaining * futurePrice;
    const storageProfit = storageRevenue - storageCost;
    const spoilageLossValue = quantity * spoilagePercentage * futurePrice;

    // 5. OPTION C: TRANSPORT & SELL (REGIONAL/DISTANT MANDI)
    const externalMandis = allPrices.filter(p => p.mandi_name.toLowerCase() !== resolvedLocalMandiName.toLowerCase());
    
    let bestTransportOption = null;
    if (externalMandis.length > 0) {
      const bestMandi = externalMandis.reduce((prev, current) => (Number(prev.price) > Number(current.price)) ? prev : current);
      const distanceKm = bestMandi.district.toLowerCase() === farmDistrict.toLowerCase() ? 30 : 120;
      const transportRatePerQuintalKm = 2.5;
      const transportCost = quantity * distanceKm * transportRatePerQuintalKm;
      const transportRevenue = quantity * Number(bestMandi.price);
      const transportProfit = transportRevenue - transportCost;

      bestTransportOption = {
        mandiName: bestMandi.mandi_name,
        district: bestMandi.district,
        price: Number(bestMandi.price),
        distanceKm,
        cost: transportCost,
        revenue: transportRevenue,
        profit: transportProfit
      };
    }

    const breakdown = {
      sell: {
        revenue: sellImmediatelyRevenue,
        cost: sellImmediatelyCost,
        profit: sellImmediatelyProfit
      },
      store: {
        type: storageType,
        spoilageRate: spoilagePercentage,
        spoilageLoss: spoilageLossValue,
        cost: storageCost,
        revenue: storageRevenue,
        profit: storageProfit
      },
      transport: null
    };

    if (bestTransportOption) {
      breakdown.transport = {
        mandiName: bestTransportOption.mandiName,
        district: bestTransportOption.district,
        price: bestTransportOption.price,
        cost: bestTransportOption.cost,
        revenue: bestTransportOption.revenue,
        profit: bestTransportOption.profit
      };
    }

    // 6. CALL CENTRAL AI DECISION MAKER VIA CACHING LAYER
    const inputs = {
      cropName,
      quantity,
      localMandiPrice: localPrice,
      futurePriceEstimation: futurePrice,
      storageRentRate: storageRatePerQuintalMonth,
      destinationMandiName: bestTransportOption ? bestTransportOption.mandiName : 'N/A',
      destinationMandiPrice: bestTransportOption ? bestTransportOption.price : 0,
      distance: bestTransportOption ? bestTransportOption.distanceKm : 0,
      transitRatePerKm: 2.5
    };

    const aiResponse = await recommendationService.getOrCreateRecommendation({
      userId,
      farmId: crop.farm_id,
      cropId: crop.id,
      type: 'storage_planner',
      inputs,
      forceRefresh
    });

    // Parse recommendation type
    let finalRecommendation = 'Sell';
    const recText = ((aiResponse.title || '') + ' ' + (aiResponse.recommendation || '')).toLowerCase();
    if (recText.includes('store')) {
      finalRecommendation = 'Store';
    } else if (recText.includes('transport') || recText.includes('regional')) {
      finalRecommendation = 'Transport';
    }

    const explanation = `${aiResponse.recommendation} Expected Outcome: ${aiResponse.expectedOutcome}. Reasoning: ${aiResponse.reasoning}`;

    return {
      cropId: crop.id,
      cropName,
      quantity,
      localMandiName: resolvedLocalMandiName,
      localPrice,
      recommendation: finalRecommendation,
      explanation,
      breakdown,
      confidenceScore: aiResponse.confidence || 90.0,
      metadata: aiResponse.metadata || {}
    };
  }
};
