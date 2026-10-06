import { marketRepository } from '../repositories/marketRepository.js';
import { alertRepository } from '../repositories/alertRepository.js';

export const notificationService = {
  /**
   * Scans active price alerts and fires notifications if target price conditions are met
   * @param {string} cropName 
   * @param {number} currentPrice 
   * @param {string} mandiName 
   */
  async checkPriceAlerts(cropName, currentPrice, mandiName) {
    try {
      const activeAlerts = await marketRepository.getActivePriceAlerts();
      const matchingAlerts = activeAlerts.filter(
        alert => alert.crop_name.toLowerCase() === cropName.toLowerCase()
      );

      for (const alert of matchingAlerts) {
        // Condition: price meets or exceeds target price
        if (currentPrice >= Number(alert.target_price)) {
          // Trigger notification
          const title = `Price Alert: ${cropName} Target Reached!`;
          const message = `The price of ${cropName} at ${mandiName} has reached ₹${currentPrice}/quintal, which meets or exceeds your target price of ₹${alert.target_price}/quintal. Recommended: Consider selling.`;
          
          await alertRepository.createNotification(alert.user_id, {
            title,
            message,
            type: 'price'
          });

          // Mark alert as triggered
          await marketRepository.updatePriceAlertStatus(alert.id, 'triggered');
          console.log(`🎯 Price Alert triggered for User ${alert.user_id}: ${cropName} at ₹${currentPrice}`);
        }
      }
    } catch (error) {
      console.error('Error checking price alerts:', error.message);
    }
  },

  /**
   * Generates weather warning alerts based on forecasted adverse conditions
   */
  async checkWeatherAlerts(userId, farmName, forecast) {
    try {
      for (const day of forecast) {
        if (day.rainProbability > 80 && day.condition === 'Rainy') {
          await alertRepository.createNotification(userId, {
            title: `Weather Alert: Heavy Rain Expected on ${day.day}`,
            message: `A high rain probability (${day.rainProbability}%) is forecast for ${day.date} at your farm "${farmName}". Postpone fertilizer applications and clear drainage channels.`,
            type: 'weather'
          });
          break; // Avoid spamming multiple weather notifications
        }
      }
    } catch (error) {
      console.error('Error generating weather alerts:', error.message);
    }
  }
};
