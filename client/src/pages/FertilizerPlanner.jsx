import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { Select } from '../components/ui/select.jsx';
import { Button } from '../components/ui/button.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Compass, Calculator, Coins, ArrowRight, 
  Loader2, Sparkles, Sprout, Percent, Calendar, RefreshCw 
} from 'lucide-react';

export default function FertilizerPlanner() {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [fertilizerPlan, setFertilizerPlan] = useState([]);
  const [aiResponse, setAiResponse] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const farmsRes = await API.get('/farms');
      setFarms(farmsRes.data);

      const res = await API.get('/crops');
      const active = res.data.filter(c => c.status === 'active');
      setCrops(active);
      if (active.length > 0) {
        setSelectedCropId(active[0].id);
      }
    } catch (err) {
      setError('Could not retrieve active crops or farms.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (cropId) => {
    if (!cropId) return;
    try {
      const res = await API.get(`/advisor/history/fertilizer_planner?cropId=${cropId}`);
      setHistoryList(res.data);
    } catch (err) {
      console.warn('Failed to load fertilizer recommendations history:', err.message);
    }
  };

  const fetchPlan = async (cropId, refresh = false) => {
    if (!cropId) return;
    setPlanLoading(true);
    setError('');
    try {
      const res = await API.get(`/advisor/fertilizer/${cropId}${refresh ? '?refresh=true' : ''}`);
      if (res.data && res.data.recommendations) {
        setFertilizerPlan(res.data.recommendations);
        setAiResponse(res.data.ai_response);
      } else {
        setFertilizerPlan(res.data || []);
        setAiResponse(null);
      }
      await fetchHistory(cropId);
    } catch (err) {
      setError('Failed to fetch chemical fertilizer planning schedule.');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    const ai_response = item.ai_response;
    const quantityMatch = (ai_response.summary || '').match(/\d+/);
    const quantity = quantityMatch ? Number(quantityMatch[0]) : 60;
    
    const fertilizerRates = {
      'urea (nitrogen)': 6.0,
      'single super phosphate (ssp)': 11.0,
      'muriate of potash (mop)': 22.0,
      'dap (diammonium phosphate)': 27.0,
      'npk complex (15:15:15)': 29.0
    };
    const key = (ai_response.title || '').toLowerCase();
    const rate = fertilizerRates[key] || 15.0;
    const estimatedCost = Number((quantity * rate).toFixed(2));
    
    setFertilizerPlan([{
      fertilizer_name: ai_response.title || 'NPK Complex',
      quantity,
      schedule: ai_response.recommendation,
      estimated_cost: estimatedCost,
      unit_rate: rate
    }]);
    setAiResponse({
      ...ai_response,
      metadata: item.metadata
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCropId) {
      fetchPlan(selectedCropId);
    }
  }, [selectedCropId]);

  const selectedCrop = crops.find(c => c.id === Number(selectedCropId));
  const selectedFarm = selectedCrop ? farms.find(f => f.id === selectedCrop.farm_id) : null;

  const handleLocateFertilizerShops = () => {
    if (selectedFarm && selectedFarm.latitude && selectedFarm.longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=fertilizer+shop&location=${selectedFarm.latitude},${selectedFarm.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=fertilizer+shop+near+me`, '_blank');
    }
  };

  // Compute cost estimate
  const totalCostEstimate = fertilizerPlan.reduce((sum, item) => sum + Number(item.estimated_cost || 0), 0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Precision Fertilizer Planner</h2>
          <p className="text-xs text-slate-500 font-medium">Calculate Nitrogen (N), Phosphorus (P), and Potassium (K) deficiencies and retrieve fertilizer quantities</p>
        </div>
        {selectedCropId && (
          <Button 
            onClick={() => fetchPlan(selectedCropId)} 
            disabled={planLoading}
            variant="outline" 
            size="sm" 
            className="h-9"
          >
            <RefreshCw size={14} className={`mr-1.5 ${planLoading ? 'animate-spin' : ''}`} /> Recalculate
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : crops.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-white">
          <div className="max-w-md mx-auto space-y-4 py-6">
            <Award className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Active Crops Found</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Fertilizer plans require active crop details (classification and sowing schedules) to generate precise top dressing schedules.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/crops'}>Register Active Crop</Button>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          
          {/* Selector & Cost Summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-4 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Crop Select</span>
              <Select
                className="mt-1"
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
              >
                {crops.map(c => (
                  <option key={c.id} value={c.id}>{c.crop_name} (ID: {c.id})</option>
                ))}
              </Select>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-sm text-left space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-800 uppercase tracking-wider">
                <Calculator size={14} /> Cost Calculator Overview
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Budget Per Acre</p>
                <h3 className="text-3xl font-black text-green-700">₹{totalCostEstimate.toFixed(2)}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estimates are computed using local subsidized retail price indices for Urea, DAP, and Potash complexes.
              </p>
            </Card>

            {/* NPK Indicator widget */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">NPK Ingredient Balance Ratio</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Nitrogen (N) - Leaf Growth</span>
                    <span className="font-bold text-green-600">46%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '46%' }}
                      transition={{ duration: 1 }}
                      className="h-full bg-green-500 rounded-full" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Phosphorus (P) - Roots</span>
                    <span className="font-bold text-teal-600">18%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '18%' }}
                      transition={{ duration: 1 }}
                      className="h-full bg-teal-500 rounded-full" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Potassium (K) - Defense</span>
                    <span className="font-bold text-blue-600">15%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '15%' }}
                      transition={{ duration: 1 }}
                      className="h-full bg-blue-500 rounded-full" 
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* History Selector Widget */}
            <Card className="p-4 bg-white border border-slate-200 shadow-sm text-left space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommendation History</span>
              {historyList.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium italic">No previous versions saved.</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {historyList.map((hist, idx) => (
                    <button
                      key={hist.id}
                      onClick={() => handleSelectHistoryItem(hist)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-medium transition flex justify-between items-center border ${
                        aiResponse && aiResponse.metadata && aiResponse.metadata.id === hist.id
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-bold truncate text-[11px]">{hist.ai_response.title || 'Plan'}</p>
                        <p className="text-[9px] text-slate-400">{new Date(hist.created_at).toLocaleString()}</p>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/50 text-slate-500 font-bold shrink-0">
                        v{historyList.length - idx}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Schedule list */}
          <div className="lg:col-span-2 space-y-4">
            {aiResponse && aiResponse.metadata && (
              <Card className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-left flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      AI Status: 
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        aiResponse.metadata.recommendationStatus === 'Fresh' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : aiResponse.metadata.recommendationStatus === 'Expiring Soon'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {aiResponse.metadata.recommendationStatus}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Model: <span className="font-bold text-slate-650">{aiResponse.metadata.modelUsed}</span> | Generated: <span className="font-bold text-slate-650">{new Date(aiResponse.metadata.generatedAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-[10px] text-slate-500 font-bold uppercase tracking-wider text-right">
                    Expires In: <span className="text-slate-700 block mt-0.5">{aiResponse.metadata.expiresIn}</span>
                  </div>
                  <Button 
                    onClick={() => {
                      if (window.confirm("Are you sure you want to regenerate this recommendation using Gemini AI? This will create a new version in your history log.")) {
                        fetchPlan(selectedCropId, true);
                      }
                    }} 
                    disabled={planLoading}
                    variant="outline" 
                    size="sm" 
                    className="h-9 text-xs font-bold"
                  >
                    <RefreshCw size={12} className={`mr-1.5 ${planLoading ? 'animate-spin' : ''}`} /> Refresh AI
                  </Button>
                </div>
              </Card>
            )}

            {aiResponse && aiResponse.metadata && aiResponse.metadata.showOfflineWarning && (
              <Alert variant="warning" className="text-left bg-amber-50 border-amber-200 text-amber-900 text-xs font-medium py-3">
                ⚠️ {aiResponse.metadata.offlineMessage || "Unable to generate a new recommendation currently. Showing your latest saved recommendation."}
              </Alert>
            )}
            {planLoading ? (
              <div className="h-[30vh] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                <Loader2 className="animate-spin text-green-600" size={28} />
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={18} className="text-green-600" /> Fertilizer Dosage & Schedules
                </h3>

                {fertilizerPlan.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">No fertilizer schedules generated.</p>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    {fertilizerPlan.map((item, idx) => (
                      <motion.div key={idx} variants={itemVariants}>
                        <Card className="border border-slate-200 hover-scale bg-white">
                          <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="space-y-2 text-left">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                                  <Sprout size={16} />
                                </div>
                                <h4 className="text-base font-bold text-slate-850">{item.fertilizer_name}</h4>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                                  Recommended Dose: {item.quantity} kg / Acre
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-2 mt-2">
                                <div className="flex items-start gap-1">
                                  <Calendar size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                  <span><span className="font-bold text-slate-800">Application Plan:</span> {item.schedule}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Price</span>
                              <span className="text-xl font-black text-green-600">₹{item.estimated_cost}</span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Before / After Outcome card */}
                {fertilizerPlan.length > 0 && (
                  <Card className="p-6 bg-white border border-slate-200 shadow-sm text-left">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Advisory Expected Outcome</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Without Proper Fertilizer</span>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Slow leaf growth, pale yellow foliage, stunted root development, and significantly lowered crop yields.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border border-green-150 bg-green-50/20 space-y-2">
                        <span className="text-[10px] font-bold text-green-750 uppercase tracking-wider block">With Precision Plan</span>
                        <p className="text-xs text-green-800 font-medium leading-relaxed">
                          Vibrant green canopies, accelerated tillering, deeper root structure, and up to 20% estimated yield increase.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Need For Fertilizer supplies map card */}
                {fertilizerPlan.length > 0 && (
                  <Card className="bg-slate-900 border border-slate-800 text-white shadow-sm overflow-hidden">
                    <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1 text-left">
                        <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                          <Compass size={16} className="text-red-500" /> Need Fertilizer Supplies?
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Locate certified fertilizer distribution outlets and seed stores in your regional cooperative boundary.
                        </p>
                      </div>
                      <Button onClick={handleLocateFertilizerShops} className="bg-green-600 hover:bg-green-700 text-white border-0 text-xs font-bold shrink-0">
                        Need For Fertilizer
                      </Button>
                    </div>
                  </Card>
                )}

              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
