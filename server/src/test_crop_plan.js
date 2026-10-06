import { generateCropPlan } from './controllers/advisorController.js';

// Mock request and response
const req = {
  params: { farmId: '5' },
  user: { id: 3, role: 'farmer' } // denil@gmail.com is user_id 3
};

const res = {
  status(code) {
    console.log('Status set to:', code);
    return this;
  },
  json(data) {
    console.log('JSON returned:', JSON.stringify(data, null, 2));
    return this;
  }
};

console.log('🧪 Simulating generateCropPlan endpoint call for farm 5...');
generateCropPlan(req, res).catch(err => {
  console.error('Trigger Exception:', err);
});
