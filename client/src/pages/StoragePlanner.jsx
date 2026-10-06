import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { Select } from '../components/ui/select.jsx';
import { Button } from '../components/ui/button.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Warehouse, AlertTriangle, Compass, ThermometerSun, CalendarCheck, 
  Loader2, RefreshCw, Info, CheckCircle2, Truck, ClipboardList, 
  Wrench, ShieldCheck, Map, ArrowRight, 
  Sparkles
} from 'lucide-react';

export default function StoragePlanner() {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [loading, setLoading] = useState(true);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageData, setStorageData] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [equipAdvice, setEquipAdvice] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const farmsRes = await API.get('/farms');
      setFarms(farmsRes.data);

      const res = await API.get('/crops');
      setCrops(res.data);
      if (res.data.length > 0) {
        setSelectedCropId(res.data[0].id);
      }
    } catch (err) {
      setError('Could not retrieve crop or farm listings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (cropId) => {
    if (!cropId) return;
    try {
      const res = await API.get(`/advisor/history/storage_planner?cropId=${cropId}`);
      setHistoryList(res.data);
    } catch (err) {
      console.warn('Failed to load storage history:', err.message);
    }
  };

  const fetchStorageInfo = async (cropId, refresh = false) => {
    if (!cropId) return;
    setStorageLoading(true);
    setError('');
    
    const crop = crops.find(c => c.id === Number(cropId));
    const farm = crop ? farms.find(f => f.id === crop.farm_id) : null;
    const farmSize = farm ? Number(farm.farm_size) : 5;
    
    let multiplier = 15;
    const nameLower = crop?.crop_name.toLowerCase() || '';
    if (nameLower.includes('rice')) multiplier = 24;
    else if (nameLower.includes('wheat')) multiplier = 20;
    else if (nameLower.includes('cotton')) multiplier = 8;
    
    const quantity = Math.round(farmSize * multiplier);

    try {
      const res = await API.get(`/market/decision/${cropId}?quantity=${quantity}${refresh ? '&refresh=true' : ''}`);
      setStorageData(res.data);
      
      const equipRes = await API.get(`/advisor/equipment/recommend?cropName=${crop?.crop_name}&farmSize=${farmSize}&stage=Harvesting`);
      setEquipAdvice(equipRes.data);
      
      await fetchHistory(cropId);
    } catch (err) {
      setError('Failed to compute harvest & storage optimization parameters.');
    } finally {
      setStorageLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    const ai_response = item.ai_response;
    const crop = crops.find(c => c.id === Number(selectedCropId));
    const farm = crop ? farms.find(f => f.id === crop.farm_id) : null;
    const farmSize = farm ? Number(farm.farm_size) : 5;
    
    let multiplier = 15;
    const nameLower = crop?.crop_name.toLowerCase() || '';
    if (nameLower.includes('rice')) multiplier = 24;
    else if (nameLower.includes('wheat')) multiplier = 20;
    else if (nameLower.includes('cotton')) multiplier = 8;
    const quantity = Math.round(farmSize * multiplier);

    // Calculate options structure matching decisionEngine format
    const localPrice = ai_response.localMandiPrice || 2200.0;
    const sellImmediatelyRevenue = quantity * localPrice;
    
    const storageDurationMonths = 3;
    const expectedPriceFactor = 1.12; 
    const futurePrice = localPrice * expectedPriceFactor;
    
    let storageType = 'Traditional Silo';
    let storageRatePerQuintalMonth = 25.0;
    let spoilagePercentage = 0.08;
    if (nameLower.includes('potato') || nameLower.includes('onion') || nameLower.includes('apple')) {
      storageType = 'Cold Storage';
      storageRatePerQuintalMonth = 50.0;
      spoilagePercentage = 0.02;
    } else if (nameLower.includes('rice') || nameLower.includes('wheat')) {
      storageType = 'Hermetic Bag Storage';
      storageRatePerQuintalMonth = 30.0;
      spoilagePercentage = 0.01;
    }
    const storageCost = quantity * storageRatePerQuintalMonth * storageDurationMonths;
    const storageQuantityRemaining = quantity * (1 - spoilagePercentage);
    const storageRevenue = storageQuantityRemaining * futurePrice;
    const storageProfit = storageRevenue - storageCost;

    let finalRecommendation = 'Sell';
    const recText = ((ai_response.title || '') + ' ' + (ai_response.recommendation || '')).toLowerCase();
    if (recText.includes('store')) {
      finalRecommendation = 'Store';
    } else if (recText.includes('transport') || recText.includes('regional')) {
      finalRecommendation = 'Transport';
    }

    setStorageData({
      cropId: Number(selectedCropId),
      cropName: crop?.crop_name,
      quantity,
      localMandiName: ai_response.destinationMandiName || 'Local Mandi',
      localPrice,
      recommendation: finalRecommendation,
      explanation: `${ai_response.recommendation || ''}. Outcome: ${ai_response.expectedOutcome || ''}. Reasoning: ${ai_response.reasoning || ''}`,
      breakdown: {
        sell: { revenue: sellImmediatelyRevenue, cost: 0, profit: sellImmediatelyRevenue },
        store: { type: storageType, spoilageRate: spoilagePercentage, spoilageLoss: quantity * spoilagePercentage * futurePrice, cost: storageCost, revenue: storageRevenue, profit: storageProfit },
        transport: ai_response.destinationMandiName !== 'N/A' ? {
          mandiName: ai_response.destinationMandiName,
          district: farm?.district || 'Nearby',
          price: ai_response.destinationMandiPrice || (localPrice * 1.1),
          cost: quantity * (ai_response.distance || 30) * 2.5,
          revenue: quantity * (ai_response.destinationMandiPrice || (localPrice * 1.1)),
          profit: (quantity * (ai_response.destinationMandiPrice || (localPrice * 1.1))) - (quantity * (ai_response.distance || 30) * 2.5)
        } : null
      },
      confidenceScore: ai_response.confidence || 90.0,
      metadata: item.metadata
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCropId && crops.length > 0) {
      fetchStorageInfo(selectedCropId);
    }
  }, [selectedCropId, crops]);

  const selectedCrop = crops.find(c => c.id === Number(selectedCropId));
  const selectedFarm = selectedCrop ? farms.find(f => f.id === selectedCrop.farm_id) : null;

  // Calculate readiness countdown
  const getReadinessDays = () => {
    if (!selectedCrop) return 0;
    const diffTime = new Date(selectedCrop.expected_harvest_date) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getRiskStyle = (spoilage) => {
    const rate = Number(spoilage) * 100;
    if (rate > 5) return 'text-red-700 bg-red-50 border-red-200';
    if (rate > 2) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-green-700 bg-green-50 border-green-200';
  };

  const handleOpenWarehouseMap = () => {
    if (selectedFarm && selectedFarm.latitude && selectedFarm.longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=warehouse+cold+storage&location=${selectedFarm.latitude},${selectedFarm.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=cold+storage+warehouse+near+me`, '_blank');
    }
  };

  const handleOpenMandiMap = (mandiName) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mandiName || 'grain mandi near me')}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Harvest & Storage Optimization</h2>
          <p className="text-xs text-slate-500 font-medium">Verify harvest readiness, rent post-harvest tools, calculate spoilage risks, and compare market logistics side-by-side</p>
        </div>
        {selectedCropId && (
          <Button 
            onClick={() => fetchStorageInfo(selectedCropId)} 
            disabled={storageLoading}
            variant="outline" 
            size="sm" 
            className="h-9"
          >
            <RefreshCw size={14} className={`mr-1.5 ${storageLoading ? 'animate-spin' : ''}`} /> Recalculate
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
            <Warehouse className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Cultivated Crops Registered</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Register a crop in the Crop Catalog to begin monitoring harvest countdowns and storage parameters.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/crops'}>Browse Crops Catalog</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Selector header */}
          <Card className="p-4 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Warehouse className="text-green-600 h-5 w-5 animate-pulse" />
              <div className="text-xs font-bold text-slate-750">
                Select Sowed Crop
                <Select
                  className="w-56 mt-1"
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                >
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>{c.crop_name} (Land ID: {c.farm_id})</option>
                  ))}
                </Select>
              </div>
            </div>

            {selectedCrop && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-500 font-medium">
                <div>
                  <span className="block text-[9px] text-slate-455 font-bold uppercase tracking-wider">Sowing Date</span>
                  <span className="text-slate-800 font-bold">{new Date(selectedCrop.sowing_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-455 font-bold uppercase tracking-wider">Expected Harvest</span>
                  <span className="text-slate-800 font-bold">{new Date(selectedCrop.expected_harvest_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-455 font-bold uppercase tracking-wider font-bold">Estimated Yield</span>
                  <span className="text-green-700 font-black">
                    {storageData ? `${storageData.quantity} Quintals` : 'Calculating...'}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {storageLoading ? (
            <div className="h-[40vh] flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : storageData ? (
            <div className="space-y-6 text-left">
              {/* AI Status Card */}
              {storageData.metadata && (
                <Card className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                      <RefreshCw size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        AI Status: 
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          storageData.metadata.recommendationStatus === 'Fresh' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : storageData.metadata.recommendationStatus === 'Expiring Soon'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {storageData.metadata.recommendationStatus}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Model: <span className="font-bold text-slate-650">{storageData.metadata.modelUsed}</span> | Generated: <span className="font-bold text-slate-650">{new Date(storageData.metadata.generatedAt).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-[10px] text-slate-500 font-bold uppercase tracking-wider text-right">
                      Expires In: <span className="text-slate-700 block mt-0.5">{storageData.metadata.expiresIn}</span>
                    </div>
                    <Button 
                      onClick={() => {
                        if (window.confirm("Are you sure you want to regenerate this post-harvest optimization recommendation using Gemini AI? This will create a new version in your history log.")) {
                          fetchStorageInfo(selectedCropId, true);
                        }
                      }} 
                      disabled={storageLoading}
                      variant="outline" 
                      size="sm" 
                      className="h-9 text-xs font-bold"
                    >
                      <RefreshCw size={12} className={`mr-1.5 ${storageLoading ? 'animate-spin' : ''}`} /> Refresh AI
                    </Button>
                  </div>
                </Card>
              )}

              {storageData.metadata && storageData.metadata.showOfflineWarning && (
                <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-900 text-xs font-medium py-3">
                  ⚠️ {storageData.metadata.offlineMessage || "Unable to generate a new recommendation currently. Showing your latest saved recommendation."}
                </Alert>
              )}

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid lg:grid-cols-3 gap-6 items-start"
              >
                {/* Left Column: Readiness, Equipment & Spoilage */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Harvest countdown card */}
                  <motion.div variants={itemVariants}>
                    <Card className="p-5 bg-white border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <CalendarCheck size={14} className="text-green-600" /> Harvest Readiness Countdown
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-800">{getReadinessDays()}</span>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Days Remaining</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold text-slate-500">
                      Sowing stage is currently <span className="text-green-600 font-bold">{selectedCrop.growth_stage}</span>.
                    </div>
                  </Card>
                </motion.div>

                {/* Post-harvest Equipment matching */}
                {equipAdvice && (
                  <motion.div variants={itemVariants}>
                    <Card className="p-5 bg-white border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Wrench size={14} className="text-green-600" /> AI Equipment Suggestion
                      </h4>
                      <p className="text-xs font-bold text-slate-800">{equipAdvice.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{equipAdvice.recommendation}</p>
                      <div className="pt-2">
                        <Button onClick={() => window.location.href = '/dashboard/equipment-rental'} size="sm" className="w-full text-[11px] font-bold">
                          Go to Rental Hub
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Spoilage Risk Gauge */}
                <motion.div variants={itemVariants}>
                  <Card className="p-5 bg-white border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle size={14} className="text-amber-500" /> Spoilage Danger Map
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <span>Spoilage Risk</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${getRiskStyle(storageData.breakdown.store.spoilageRate)}`}>
                          {(storageData.breakdown.store.spoilageRate * 100).toFixed(1)}% Spoilage Rate
                        </span>
                      </div>
                      
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${Math.min((storageData.breakdown.store.spoilageRate * 100)*10, 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3 text-xs">
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Storage Facility</span>
                          <span className="font-bold text-slate-800">{storageData.breakdown.store.type}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Est. Spoilage Loss</span>
                          <span className="font-bold text-red-600">₹{Math.round(storageData.breakdown.store.spoilageLoss)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* History Selector Widget */}
                <motion.div variants={itemVariants}>
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
                              storageData.metadata && storageData.metadata.id === hist.id
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
                </motion.div>

              </div>

              {/* Right Column: Comparison Solver & Maps routing */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* AI advisor summary card */}
                <motion.div variants={itemVariants}>
                  <Card className="p-5 border border-green-200 bg-gradient-to-br from-green-50/40 to-emerald-50/20 shadow-sm text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-500 animate-spin" /> Post-Harvest Optimization Decision
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded bg-green-50 text-green-700 font-bold border border-green-200">
                        {storageData.confidenceScore}% Confidence
                      </span>
                    </div>
                    <p className="font-black text-slate-850 text-base">Recommended action: {storageData.recommendation}</p>
                    <p className="text-xs text-slate-655 leading-relaxed font-semibold">{storageData.explanation}</p>
                  </Card>
                </motion.div>

                {/* Option breakdowns side by side */}
                <motion.div variants={itemVariants}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    
                    {/* Option A: Store in Warehouse */}
                    <Card className="p-5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Warehouse size={14} className="text-slate-400" /> Option A: Store & Sell Later
                        </h4>
                        <div className="space-y-2 text-xs font-semibold text-slate-500">
                          <div className="flex justify-between">
                            <span>Storage Duration</span>
                            <span className="font-bold text-slate-700">3 Months</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Storage Cost</span>
                            <span className="font-bold text-slate-700">₹{Math.round(storageData.breakdown.store.cost)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-50 pt-2 text-slate-800">
                            <span>Expected Profit Margin</span>
                            <span className="font-black text-green-600 text-sm">₹{Math.round(storageData.breakdown.store.profit)}</span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleOpenWarehouseMap} variant="outline" size="sm" className="w-full text-[11px] font-bold mt-4 flex items-center justify-center gap-1">
                        <Map size={12} className="text-green-600" /> View Warehouses On Map
                      </Button>
                    </Card>

                    {/* Option B: Transport to distant Mandi */}
                    {storageData.breakdown.transport ? (
                      <Card className="p-5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Truck size={14} className="text-slate-400" /> Option B: Transport & Sell
                          </h4>
                          <div className="space-y-2 text-xs font-semibold text-slate-500">
                            <div className="flex justify-between">
                              <span>Target Mandi</span>
                              <span className="font-bold text-slate-700 truncate max-w-[120px]">
                                {storageData.breakdown.transport.mandiName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Transit Expenses</span>
                              <span className="font-bold text-slate-700">₹{Math.round(storageData.breakdown.transport.cost)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-50 pt-2 text-slate-800">
                              <span>Net profit margin</span>
                              <span className="font-black text-green-600 text-sm">₹{Math.round(storageData.breakdown.transport.profit)}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleOpenMandiMap(storageData.breakdown.transport.mandiName)} 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-[11px] font-bold mt-4 flex items-center justify-center gap-1"
                        >
                          <Map size={12} className="text-green-600" /> View Route to Mandi
                        </Button>
                      </Card>
                    ) : (
                      <Card className="p-5 bg-slate-50 border border-slate-100 text-center flex items-center justify-center text-xs text-slate-400 font-medium">
                        No regional mandis found for this crop classification.
                      </Card>
                    )}

                  </div>
                </motion.div>

              </div>
            </motion.div>
          </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm shadow-sm">
              Press Calculate to fetch post-harvest solver reports.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
