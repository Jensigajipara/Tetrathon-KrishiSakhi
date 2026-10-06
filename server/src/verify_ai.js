import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import { initializeDatabase } from './config/dbInit.js';
import { generateAdvice } from './ai/index.js';

async function runVerification() {
  console.log('🧪 Starting KrishiSakhi NVIDIA Nemotron 3 Ultra verification...');
  await initializeDatabase();
  console.log('OpenRouter API Key present:', !!process.env.OPEN_ROUTER_API_KEY);
  console.log('Model Name configured:', process.env.OPEN_ROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b');

  try {
    const response = await generateAdvice('precisionAdvisory', {
      cropName: 'Wheat',
      growthStage: 'Flowering',
      soilType: 'Clay Loam'
    }, {
      userId: null,
      memoryKey: 'test_run_wheat'
    });

    console.log('\n🌟 AI Response Validated Successfully:');
    console.log('======================================');
    console.log(`Title: ${response.title}`);
    console.log(`Summary: ${response.summary}`);
    console.log(`Recommendation: ${response.recommendation}`);
    console.log(`Confidence Score: ${response.confidence}%`);
    console.log(`Risk Level: ${response.riskLevel}`);
    console.log(`Next Steps: ${response.nextActions.join(' -> ')}`);
    console.log('======================================');
    console.log('✅ Verification Completed: Centralized AI client integration is operational.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification Failed:', error.message);
    process.exit(1);
  }
}

runVerification();
