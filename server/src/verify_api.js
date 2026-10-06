import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('🔍 Starting KrishiSakhi API Verification Tests...\n');
  
  // 1. Health Check
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ HEALTH CHECK: Server is online, responding with:', health.data);
  } catch (err) {
    console.error('❌ HEALTH CHECK FAILED: Is the Express server running on port 5000?');
    process.exit(1);
  }

  // 2. Authentication and Login (Farmer)
  let token = '';
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ramesh@gmail.com',
      password: 'farmer123'
    });
    token = loginRes.data.token;
    console.log('✅ AUTH LOGIN SUCCESS: Logged in Ramesh Kumar. Received token.');
  } catch (err) {
    console.error('❌ AUTH LOGIN FAILED:', err.response?.data?.message || err.message);
  }

  // Set default auth headers
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // 3. Farms Fetch
  let farmId = null;
  try {
    const farmsRes = await axios.get(`${BASE_URL}/farms`, authHeaders);
    console.log(`✅ FARMS GET SUCCESS: Retrieved ${farmsRes.data.length} plots of land.`);
    if (farmsRes.data.length > 0) {
      farmId = farmsRes.data[0].id;
      console.log(`   Selected plot ID: ${farmId} ("${farmsRes.data[0].farm_name}")`);
    }
  } catch (err) {
    console.error('❌ FARMS GET FAILED:', err.response?.data?.message || err.message);
  }

  // 4. Crops Fetch
  let cropId = null;
  try {
    const cropsRes = await axios.get(`${BASE_URL}/crops`, authHeaders);
    console.log(`✅ CROPS GET SUCCESS: Retrieved ${cropsRes.data.length} registered crops.`);
    if (cropsRes.data.length > 0) {
      cropId = cropsRes.data[0].id;
      console.log(`   Selected crop ID: ${cropId} ("${cropsRes.data[0].crop_name}")`);
    }
  } catch (err) {
    console.error('❌ CROPS GET FAILED:', err.response?.data?.message || err.message);
  }

  // Crop-plan test
  if (farmId) {
    try {
      const planRes = await axios.get(`${BASE_URL}/advisor/crop-plan/${farmId}`, authHeaders);
      console.log('✅ CROP PLAN SUCCESS:');
      console.log(JSON.stringify(planRes.data, null, 2));
    } catch (err) {
      console.error('❌ CROP PLAN FAILED:', err.response?.data?.message || err.message);
    }
  }

  // 5. Daily Recommendation Fetch
  if (cropId) {
    try {
      const recRes = await axios.get(`${BASE_URL}/advisor/recommendation/${cropId}`, authHeaders);
      console.log('✅ ADVISOR GET SUCCESS: Precision daily advice retrieved:');
      console.log(`   "${recRes.data.recommendation.slice(0, 80)}..." (Confidence: ${recRes.data.confidence_score}%)`);
    } catch (err) {
      console.error('❌ ADVISOR GET FAILED:', err.response?.data?.message || err.message);
    }
  }

  // 6. Market Mandi Prices
  try {
    const pricesRes = await axios.get(`${BASE_URL}/market/prices`, authHeaders);
    console.log(`✅ MANDI PRICES SUCCESS: Found ${pricesRes.data.length} pricing records.`);
  } catch (err) {
    console.error('❌ MANDI PRICES FAILED:', err.response?.data?.message || err.message);
  }

  // 7. Post-Harvest Decision Calculations
  if (cropId) {
    try {
      const decisionRes = await axios.get(`${BASE_URL}/market/decision/${cropId}?quantity=100&localMandi=Karnal Mandi`, authHeaders);
      console.log('✅ POST-HARVEST DECISION SOLVER SUCCESS:');
      console.log(`   Final Recommendation: "${decisionRes.data.recommendation}"`);
      console.log(`   Explanation: ${decisionRes.data.explanation.slice(0, 100)}...`);
    } catch (err) {
      console.error('❌ POST-HARVEST DECISION SOLVER FAILED:', err.response?.data?.message || err.message);
    }
  }

  console.log('\n🏁 Verification Run Complete.');
}

runVerification();
