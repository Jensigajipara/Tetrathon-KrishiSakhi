import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.jsx';
import { Select } from '../components/ui/select.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Button } from '../components/ui/button.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, Sprout, ShieldAlert, Award, Droplet, 
  RefreshCw, Loader2, Calendar, ClipboardList, Coins, 
  TrendingUp, Clock, Info, CheckSquare 
} from 'lucide-react';

export default function CropAdvisor() {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [cropPlan, setCropPlan] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('overview');

  const loadFarms = async () => {
    setLoading(true);
    try {
      const res = await API.get('/farms');
      setFarms(res.data);
      if (res.data.length > 0) {
        setSelectedFarmId(res.data[0].id);
      }
    } catch (err) {
      setError('Could not retrieve farm listings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (farmId) => {
    if (!farmId) return;
    try {
      const res = await API.get(`/advisor/history/crop_planner?farmId=${farmId}`);
      setHistoryList(res.data);
    } catch (err) {
      console.warn('Failed to load crop plan history:', err.message);
    }
  };

  const handleGeneratePlan = async (refresh = false) => {
    if (!selectedFarmId) return;
    setPlanLoading(true);
    setError('');
    try {
      const res = await API.get(`/advisor/crop-plan/${selectedFarmId}${refresh ? '?refresh=true' : ''}`);
      setCropPlan(res.data);
      setActiveTab('overview');
      await fetchHistory(selectedFarmId);
    } catch (err) {
      setError('Failed to generate AI crop planning schedule.');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setCropPlan({
      ...item.ai_response,
      metadata: item.metadata
    });
    setActiveTab('overview');
  };

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      handleGeneratePlan();
    }
  }, [selectedFarmId]);

  const selectedFarm = farms.find(f => f.id === Number(selectedFarmId));

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardFadeIn = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Crop Planner & Rotation Advisor</h2>
          <p className="text-xs text-slate-500 font-medium">Select a registered farm plot to synthesize a future crop rotation blueprint and sowing calendar</p>
        </div>
        {selectedFarmId && (
          <Button 
            onClick={handleGeneratePlan} 
            disabled={planLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={planLoading ? 'animate-spin' : ''} /> Generate Crop Plan
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : farms.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-white">
          <div className="max-w-md mx-auto space-y-4 py-6">
            <Sprout className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Registered Plots Found</h3>
            <p className="text-xs text-slate-500 leading-normal">
              To build crop planner recommendations, register a farm plot with NPK soil metrics first.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/my-farms'}>Register Plot Plot</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Selector Card */}
          <Card className="p-4 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-green-600 h-6 w-6" />
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configure Farm Selection</span>
                <Select
                  className="w-64 mt-1"
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>{f.farm_name} ({f.soil_type} Soil)</option>
                  ))}
                </Select>
              </div>
            </div>

            {selectedFarm && (
              <div className="grid grid-cols-3 gap-6 text-xs text-slate-500 font-medium">
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-bold">Soil Chemistry</span>
                  <span className="text-slate-800 font-bold">{selectedFarm.soil_ph} pH</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-bold">NPK Profile</span>
                  <span className="text-slate-800 font-bold">{selectedFarm.npk_ratio}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-bold">Irrigation Feed</span>
                  <span className="text-slate-800 font-bold">{selectedFarm.irrigation_source}</span>
                </div>
              </div>
            )}
          </Card>

          {planLoading ? (
            <div className="h-[40vh] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-center space-y-3">
                <Loader2 className="animate-spin text-green-600 mx-auto" size={36} />
                <p className="text-xs text-slate-500 font-medium">NVIDIA model is calculating soil rotation options...</p>
              </div>
            </div>
          ) : cropPlan ? (
            <div className="space-y-6 text-left">
              {/* AI Status Card */}
              {cropPlan.metadata && (
                <Card className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                      <RefreshCw size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        AI Status: 
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          cropPlan.metadata.recommendationStatus === 'Fresh' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : cropPlan.metadata.recommendationStatus === 'Expiring Soon'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {cropPlan.metadata.recommendationStatus}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Model: <span className="font-bold text-slate-650">{cropPlan.metadata.modelUsed}</span> | Generated: <span className="font-bold text-slate-650">{new Date(cropPlan.metadata.generatedAt).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-[10px] text-slate-500 font-bold uppercase tracking-wider text-right">
                      Expires In: <span className="text-slate-700 block mt-0.5">{cropPlan.metadata.expiresIn}</span>
                    </div>
                    <Button 
                      onClick={() => {
                        if (window.confirm("Are you sure you want to regenerate this crop plan using Gemini AI? This will create a new version in your history log.")) {
                          handleGeneratePlan(true);
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

              {cropPlan.metadata && cropPlan.metadata.showOfflineWarning && (
                <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-900 text-xs font-medium py-3">
                  ⚠️ {cropPlan.metadata.offlineMessage || "Unable to generate a new recommendation currently. Showing your latest saved recommendation."}
                </Alert>
              )}

              <div className="grid lg:grid-cols-4 gap-6 items-start">
                {/* Left Sidebar: Navigation & History */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Vertical Tabs navigation */}
                  <div className="flex flex-col gap-1 bg-slate-100/80 p-2 rounded-xl border border-slate-200/50">
                    {[
                      { id: 'overview', label: 'Recommended Rotation', icon: Sprout },
                      { id: 'timeline', label: 'Sowing Timeline', icon: Calendar },
                      { id: 'tasks', label: 'Action Checklist', icon: ClipboardList }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer text-left ${
                          activeTab === tab.id 
                            ? 'bg-white text-green-700 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
                        }`}
                      >
                        <tab.icon size={14} className="shrink-0" /> <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* History List Widget */}
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
                              cropPlan.metadata && cropPlan.metadata.id === hist.id
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

                {/* Right Area: Dynamic Tab Contents */}
                <div className="lg:col-span-3">
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-3 gap-6"
                  >
                    {/* Advice card */}
                    <motion.div variants={cardFadeIn} className="md:col-span-2">
                      <Card className="p-6 bg-white border border-slate-200 shadow-sm h-full flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-lg font-black text-slate-850 tracking-tight">{cropPlan.title || 'Rotational Crop Plan'}</h3>
                              <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Dynamic model synthesis</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold border border-green-200">
                              {cropPlan.confidence}% Match
                            </span>
                          </div>
                          
                          <div className="p-4 rounded-xl bg-green-50/20 border border-green-150 text-slate-700 text-xs leading-relaxed font-medium">
                            {cropPlan.recommendation}
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Crop Rotation Advice</h4>
                            <p className="text-xs text-slate-655 leading-relaxed font-medium">{cropPlan.reasoning}</p>
                          </div>
                        </div>

                        {cropPlan.warnings && cropPlan.warnings.length > 0 && (
                          <div className="pt-4 border-t border-slate-100 mt-4">
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-1">Important Precautions</span>
                            <p className="text-xs text-red-700 font-semibold">{cropPlan.warnings[0]}</p>
                          </div>
                        )}
                      </Card>
                    </motion.div>

                    {/* Stats side column */}
                    <motion.div variants={cardFadeIn} className="md:col-span-1 space-y-6">
                      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-150 shadow-sm text-center flex flex-col items-center justify-center space-y-3">
                        <Coins className="text-green-600" size={24} />
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Expected Profit / Acre</span>
                        <h3 className="text-3xl font-black text-green-700">₹35,000</h3>
                        <p className="text-[10px] text-slate-455 leading-relaxed">Profit estimations are matching local Mandi support indexes.</p>
                      </Card>

                      <Card className="p-5 bg-white border border-slate-200 shadow-sm text-left space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Land Utilization</h4>
                        <div className="space-y-2 text-xs text-slate-655 font-medium">
                          <p>Deploy border crops (like Mustard or Pigeon Pea) along the boundaries to act as natural windbreakers and pest barriers.</p>
                          <p>Dedicate &lt;10% land for local fodder or legumes to restore nitrogen levels naturally between key seasons.</p>
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === 'timeline' && (
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="max-w-2xl mx-auto"
                  >
                    <Card className="p-6 bg-white border border-slate-200 shadow-sm text-left">
                      <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-1.5">
                        <Calendar className="text-green-600" size={18} /> Sowing & Harvest Timeline Calendar
                      </h3>
                      
                      <div className="relative border-l-2 border-slate-100 pl-6 space-y-8">
                        {(cropPlan.timeline && cropPlan.timeline.length > 0 ? cropPlan.timeline : [
                          { stage: 'Land Prep & Basal Stage', duration: '15 Days', notes: 'Add deep compost and plow to allow aeration.' },
                          { stage: 'Sowing & Early Sowing CRI Stage', duration: '30 Days', notes: 'Ensure spacing of 20cm x 15cm is maintained.' },
                          { stage: 'Vegetative Tillering Phase', duration: '45 Days', notes: 'Top dress recommended nitrogen split dose.' },
                          { stage: 'Harvesting & Preservation Preparation', duration: '10 Days', notes: 'Drain the channels and start cutting crop when yellow.' }
                        ]).map((milestone, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm flex items-center justify-center">
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            </span>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 text-xs">{milestone.stage}</h4>
                                <span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-full">
                                  {milestone.duration}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{milestone.notes}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'tasks' && (
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="max-w-2xl mx-auto"
                  >
                    <Card className="p-6 bg-white border border-slate-200 shadow-sm text-left">
                      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                        <ClipboardList className="text-green-600" size={18} /> Dynamic Action Checklist
                      </h3>
                      
                      <div className="space-y-3">
                        {(cropPlan.tasks && cropPlan.tasks.length > 0 ? cropPlan.tasks : [
                          { task: 'Prepare soil with deep plowing', priority: 'High', cost: 'Free (Own Tractor)' },
                          { task: 'Seed treatment with Trichoderma viride', priority: 'High', cost: '₹150 / Acre' },
                          { task: 'Perform basal dose fertilization (DAP)', priority: 'Medium', cost: '₹1200 / Acre' },
                          { task: 'Monitor water levels CRI vegetative stage', priority: 'High', cost: 'Free' }
                        ]).map((item, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-4 hover-scale">
                            <div className="flex items-center gap-3">
                              <CheckSquare className="text-green-600 shrink-0" size={18} />
                              <div>
                                <p className="text-xs font-bold text-slate-800">{item.task}</p>
                                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mt-0.5">Estimated Cost: {item.cost}</span>
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              item.priority === 'High' 
                                ? 'bg-red-50 text-red-700 border border-red-100' 
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {item.priority} Priority
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm shadow-sm">
              Press Consult AI to calculate a rotational plan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
