export const cropRecommendation = ({ soilType, district, state, expectedRain }) => {
  return `
You are a precision agriculture crop scientist. Formulate a crop suitability recommendation for a plot with:
- Soil Classification: ${soilType}
- Geographic Region: ${district}, ${state}
- Expected Seasonal Precipitation: ${expectedRain} mm

Recommend which crop varieties are highly suitable for these environmental parameters. Outline expected planting windows, crop duration, and estimated yield potential.
`;
};

export const precisionAdvisory = ({ cropName, growthStage, soilType }) => {
  return `
Provide daily precision crop advisory instructions for this plant:
- Crop Name: ${cropName}
- Current Growth Stage: ${growthStage}
- Soil Classification: ${soilType}

Outline specific crop protection practices, nitrogen top dressing needs, and potential leaf conditions to monitor during the current "${growthStage}" stage.
`;
};

export const irrigationAdvice = ({ cropName, growthStage, temperature, humidity, rainfall, windSpeed }) => {
  return `
Formulate a precision irrigation scheduling recommendation based on the current weather logs:
- Crop Type: ${cropName}
- Growth Stage: ${growthStage}
- Ambient Temperature: ${temperature}°C
- Relative Humidity: ${humidity}%
- Recorded Rainfall (last 24h): ${rainfall} mm
- Wind Speed: ${windSpeed} km/h

Advise the farmer whether to perform standard watering, postpone due to precipitation probability, or accelerate irrigation due to high transpiration.
`;
};

export const fertilizerPlan = ({ cropName, growthStage, soilType }) => {
  return `
Generate a precision fertilizer application schedule:
- Crop Type: ${cropName}
- Growth Stage: ${growthStage}
- Soil Classification: ${soilType}

Provide the recommended fertilizer type (e.g., Urea, DAP, MOP, or NPK complex), targeted quantity (in kg per acre), and schedule of application (e.g. basal dressing, jointing stage split).
`;
};

export const diseaseScanner = ({ originalFileName }) => {
  return `
You are an expert plant pathologist. Analyze the attached leaf photograph (File Name: ${originalFileName || 'leaf_scan.jpg'}).
1. Inspect the leaf/plant carefully.
2. Determine if this image is actually about a crop, plant, field, or agricultural item.
3. If it is NOT related to crops or plants (e.g. it is a person, a car, an indoor object, a generic animal, or completely unrelated scenery), you MUST return:
   - "isValidImage": false
   - "title": "Invalid Agricultural Image"
   - "summary": "The uploaded photo is not related to any agricultural crop or plant."
   - "recommendation": "Please upload a correct photo of a crop or leaf to execute a diagnosis."
   - "reasoning": "The visual contents do not align with any plant leaf pathology diagnostics."
4. If it IS a crop, diagnose potential fungal, bacterial, viral, or pest diseases. Specify the detected crop type, disease name, severity level (Low, Medium, High), and provide organic, chemical, and traditional (desi nuska) treatment steps. Set "isValidImage": true.
`;
};

export const postHarvestSolver = ({ cropName, quantity, localMandiPrice, futurePriceEstimation, storageRentRate, destinationMandiName, destinationMandiPrice, distance, transitRatePerKm }) => {
  return `
Solve the post-harvest selling strategy comparing three logistical options:
1. Sell Immediately locally:
   - Quantity: ${quantity} quintals
   - Local Mandi Price: ₹${localMandiPrice}/quintal
2. Store in Cold Storage:
   - Expected Future Price (in 3 months): ₹${futurePriceEstimation}/quintal
   - Storage Rent Rate: ₹${storageRentRate}/quintal/month
3. Transport to regional Mandi:
   - Destination: ${destinationMandiName}
   - Destination Mandi Price: ₹${destinationMandiPrice}/quintal
   - Distance: ${distance} km
   - Transit Rate: ₹${transitRatePerKm}/quintal/km

Compare the net revenue profiles of all three options. Give a clear recommendation on which strategy maximizes profit and outline the exact calculation breakdown.
`;
};

export const pestAlert = ({ cropName, growthStage, regionalPestAlerts }) => {
  return `
Predict pest outbreak risks and generate treatment recommendations:
- Crop Name: ${cropName}
- Growth Stage: ${growthStage}
- Recent Regional Alerts: ${JSON.stringify(regionalPestAlerts)}

Assess the risk level and provide detailed preventative and chemical treatment suggestions.
`;
};

export const cropPlanner = ({ soilType, district, state, irrigationSource, waterAvailability, nitrogen, phosphorus, potassium, soilPh }) => {
  return `
You are helping a farmer choose a future crop plan and design a sowing/harvesting calendar based on their farm details:
- Soil Type: ${soilType}
- pH: ${soilPh}
- Region: ${district}, ${state}
- Irrigation Source: ${irrigationSource}
- Water Availability Level: ${waterAvailability}
- Current Soil NPK Levels: N=${nitrogen}, P=${phosphorus}, K=${potassium}

Provide the following:
1. Recommended Next Crop to plant.
2. Comprehensive crop rotation advice to preserve soil health.
3. Remaining land utilization tips.
4. Timeline calendar stages for this crop (e.g. Sowing, Vegetative, Flowering, Harvesting stages with durations).
5. Automatic step-by-step action list tasks for the crop lifecycle, including estimated task priorities and costs.
6. Expected profit per acre.
`;
};

export const equipmentRecommendation = ({ cropName, farmSize, stage }) => {
  return `
Formulate an AI post-harvest equipment rental recommendation for:
- Crop Name: ${cropName}
- Cultivation Area Size: ${farmSize} Acres
- Stage of Operation: ${stage}

Recommend what post-harvest equipment (like Combine Harvesters, Grain Dryers, Multicrop Threshers, or Laser Levelers) the farmer should rent.
List estimated rental costs, availability bounds, nearby rental center guidelines, rental duration, and specific instructions on how to use it.
`;
};

export const cropCatalogDetails = ({ cropName }) => {
  return `
Synthesize a comprehensive agronomy handbook and AI guidance advisor profile for:
- Crop Name: ${cropName}

Provide the following detail elements:
1. Detailed Soil Suitability description and optimal pH levels.
2. Optimal Weather & Climate conditions (season, temperature range).
3. Water level and irrigation frequency recommendations.
4. An AI rotation & fertilizer advice summary.
5. Dynamic organic treatment methods, chemical pesticide recommendations, and a traditional Indian Home Remedy (Desi Nuska).
6. A detailed stage-by-stage crop Sowing Timeline Calendar (Sowing, Vegetative, Flowering, Harvesting stages with exact day durations and tasks).
7. Do's and Don'ts checklist and prevention actions.
8. Expected profit estimate per acre and average mandi selling price per quintal.
`;
};
