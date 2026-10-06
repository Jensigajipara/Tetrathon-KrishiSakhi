// Weather Intelligence Service for KrishiSakhi
import { weatherRepository } from '../repositories/weatherRepository.js';

export const weatherService = {
  // Generate high-fidelity simulated weather based on farm details
  generateCurrentWeather(state, district) {
    // Generate values depending on state and season (using Northern India summer defaults for July)
    const baseTemp = state === 'Punjab' || state === 'Haryana' ? 32.5 : 29.0;
    const randTemp = (Math.random() * 5 - 2.5); // +/- 2.5 degrees
    const temperature = Number((baseTemp + randTemp).toFixed(1));
    const humidity = Number((65 + Math.random() * 25).toFixed(1)); // Monsoon season (high humidity)
    
    // 30% chance of high rain in July
    const isRaining = Math.random() < 0.45;
    const rainfall = isRaining ? Number((Math.random() * 30 + 5).toFixed(1)) : 0.0;
    const wind_speed = Number((5 + Math.random() * 15).toFixed(1));

    return {
      temperature,
      humidity,
      rainfall,
      wind_speed,
      recorded_at: new Date()
    };
  },

  get7DayForecast(state, district) {
    const forecast = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayName = days[(todayIndex + i) % 7];
      
      const tempMin = Number((24 + Math.random() * 3).toFixed(1));
      const tempMax = Number((32 + Math.random() * 5).toFixed(1));
      const humidity = Number((55 + Math.random() * 35).toFixed(1));
      const rainProbability = Math.random() < 0.4 ? Math.floor(Math.random() * 60 + 30) : Math.floor(Math.random() * 20);
      const condition = rainProbability > 50 ? 'Rainy' : rainProbability > 25 ? 'Cloudy' : 'Sunny';

      forecast.push({
        day: dayName,
        date: date.toISOString().split('T')[0],
        tempMin,
        tempMax,
        humidity,
        rainProbability,
        condition
      });
    }
    return forecast;
  },

  getIrrigationRecommendation(currentWeather, forecast7Day, cropName, soilType) {
    // Basic heuristics:
    // If it is currently raining heavily (>10mm) or rain probability in next 24-48 hours is high (>60% and >15mm expected):
    // Delay irrigation to conserve water and prevent waterlogging.
    // If temperatures are high (>35C) and soil is Sandy, recommend increased irrigation frequency.
    
    const rainTomorrow = forecast7Day[1];
    const isRainExpected = rainTomorrow.rainProbability > 60;
    const isHot = currentWeather.temperature > 34;
    
    let recommendation = 'Standard watering schedule.';
    let action = 'No Action Required';
    let type = 'info';

    if (currentWeather.rainfall > 15) {
      recommendation = `Heavy rain detected (${currentWeather.rainfall} mm). Suspend all scheduled irrigation for the next 48 hours. Ensure proper drainage in your field to avoid waterlogging.`;
      action = 'Suspend Irrigation';
      type = 'warning';
    } else if (isRainExpected) {
      recommendation = `High probability of rainfall tomorrow (${rainTomorrow.rainProbability}%). Delay scheduled irrigation by 24 hours to utilize rainwater and conserve fuel/electricity.`;
      action = 'Delay Irrigation';
      type = 'warning';
    } else if (isHot && soilType === 'Sandy') {
      recommendation = `High heat (${currentWeather.temperature}°C) and Sandy soil detected. Sandy soil drains rapidly. Increase watering frequency by 20% to prevent soil moisture deficit.`;
      action = 'Increase Frequency';
      type = 'action';
    } else if (cropName.toLowerCase() === 'rice') {
      recommendation = 'Maintain a standing water layer of 2-5 cm. Monitor water levels daily as Rice is in its peak vegetative growth phase.';
      action = 'Maintain Water Level';
      type = 'info';
    } else {
      recommendation = 'Soil moisture is in the optimal range. Perform standard moderate watering during early morning hours.';
      action = 'Standard Schedule';
    }

    return {
      recommendation,
      action,
      type,
      currentWeather,
      forecast: forecast7Day
    };
  }
};
