import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Select } from '../components/ui/select.jsx';
import { Dialog } from '../components/ui/dialog.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, Trash2, Calendar, TrendingUp, ChevronRight, Plus, 
  Loader2, Info, Droplet, Star, ShieldAlert, Coins, Warehouse, 
  CheckCircle, ArrowRight 
} from 'lucide-react';

export default function Crops() {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCatalogCrop, setSelectedCatalogCrop] = useState(null);
  const [catalogDetails, setCatalogDetails] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  
  // Form states
  const [farmId, setFarmId] = useState('');
  const [cropName, setCropName] = useState('Rice');
  const [cropType, setCropType] = useState('Cereal');
  const [sowingDate, setSowingDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [growthStage, setGrowthStage] = useState('Sowing');

  // Detail Modal sub-tab
  const [detailTab, setDetailTab] = useState('overview');

  // Static Crop Catalog data
  const cropCatalog = [
    {
      id: 'rice',
      name: 'Rice',
      type: 'Cereal',
      season: 'Kharif (Monsoon)',
      profit: '₹35,000 / Acre',
      difficulty: 'Medium',
      water: 'High',
      sellingPrice: '₹2,480 / Quintal',
      image: '/crops/rice.png',
      suitability: 'Clay or Clay Loam soils that hold standing water.',
      weather: 'Hot & Humid weather with temperatures between 21°C - 37°C.',
      fertilizerSchedule: 'Apply Nitrogen in 3 split doses (Basal, Tillering, Panicle initiation). Add Zinc Sulphate for healthy grain count.',
      pests: 'Stem Borer, Leaf Folder, Blast disease. Keep risk low by draining standing water periodically.',
      harvestStorage: 'Harvest when grains turn golden-yellow. Dry the grain to under 14% moisture before storage in dry warehouses.',
      equipment: 'Combine Harvester (subsidy rent: ₹2,500/day), Multicrop Thresher.'
    },
    {
      id: 'wheat',
      name: 'Wheat',
      type: 'Cereal',
      season: 'Rabi (Winter)',
      profit: '₹28,000 / Acre',
      difficulty: 'Easy',
      water: 'Medium',
      sellingPrice: '₹2,150 / Quintal',
      image: '/crops/wheat.png',
      suitability: 'Well-drained Fertile Silt-Loam or Clay-Loam soils.',
      weather: 'Cool growing weather (15°C - 25°C) and bright sunshine during harvesting.',
      fertilizerSchedule: 'Balanced NPK complex application during basal preparation. Top dress Urea during the Crown Root Initiation (CRI) stage.',
      pests: 'Yellow Rust, Aphids, Brown rust. Apply biological sprays on early detection.',
      harvestStorage: 'Harvest when ears turn yellow-dry. Keep grain moisture around 12% in steel metallic storage bins.',
      equipment: 'Tractor cultivator with Rotavator (rent: ₹1,200/day), Multicrop Thresher.'
    },
    {
      id: 'cotton',
      name: 'Cotton',
      type: 'Cash Crop',
      season: 'Kharif (Summer)',
      profit: '₹52,000 / Acre',
      difficulty: 'High',
      water: 'Low',
      sellingPrice: '₹7,250 / Quintal',
      image: '/crops/cotton.png',
      suitability: 'Deep Black Soil (Regur soil) with excellent drainage.',
      weather: 'Warm weather (20°C - 35°C), requires at least 180 frost-free days.',
      fertilizerSchedule: 'Composted manure, supplemented with phosphorus and potassium splits to increase boll formation.',
      pests: 'Pink Bollworm, Cotton Whitefly. Setup yellow sticky traps and spray Neem Oil.',
      harvestStorage: 'Perform hand picking of mature open bolls during dry spells. Store in aerated gunny bags.',
      equipment: 'Laser Land Leveler (rent: ₹1,500/day), cotton cultivators.'
    },
    {
      id: 'sugarcane',
      name: 'Sugarcane',
      type: 'Cash Crop',
      season: 'Annual',
      profit: '₹75,000 / Acre',
      difficulty: 'Medium',
      water: 'High',
      sellingPrice: '₹3,150 / Ton',
      image: '/crops/sugarcane.png',
      suitability: 'Deep rich loamy soils, well drained, pH 6.5 - 7.5.',
      weather: 'Tropical climate with temperature 20°C to 30°C and long sunny periods.',
      fertilizerSchedule: 'Apply balanced Nitrogen, Phosphorus and Potash splits. Add micronutrients like Iron and Manganese.',
      pests: 'Early Shoot Borer, Top Borer, Red Rot. Use disease-resistant varieties and proper crop rotation.',
      harvestStorage: 'Harvest when leaves turn yellow and stalks sound metallic when tapped. Store in cool shade, process within 24 hours.',
      equipment: 'Sugarcane Harvester (rent: ₹3,500/day), mechanical cane loaders.'
    },
    {
      id: 'mustard',
      name: 'Mustard',
      type: 'Oilseed',
      season: 'Rabi (Winter)',
      profit: '₹32,000 / Acre',
      difficulty: 'Easy',
      water: 'Low',
      sellingPrice: '₹5,450 / Quintal',
      image: '/crops/mustard.png',
      suitability: 'Loam or sandy loam soil, dry and cool conditions.',
      weather: 'Cool temperature (10°C - 25°C) and moderate rainfall.',
      fertilizerSchedule: 'High sulfur application along with balanced NPK complex during land preparation.',
      pests: 'Aphids, Painted Bug, Mustard Sawfly. Spray biopesticides at first sign.',
      harvestStorage: 'Harvest when pods turn golden brown. Dry to under 8% moisture before storing in clean dry bags.',
      equipment: 'Mustard Thresher (rent: ₹1,000/day), crop windrower.'
    },
    {
      id: 'bajra',
      name: 'Bajra',
      type: 'Cereal',
      season: 'Kharif (Monsoon)',
      profit: '₹18,000 / Acre',
      difficulty: 'Easy',
      water: 'Low',
      sellingPrice: '₹2,350 / Quintal',
      image: '/crops/bajra.png',
      suitability: 'Light sandy soils, shallow soils with low organic matter.',
      weather: 'Hot and dry weather (25°C - 35°C), highly drought resistant.',
      fertilizerSchedule: 'Apply nitrogen top-dressing at tillering stage and balanced NPK basal complex.',
      pests: 'Downy Mildew, Ergot, Stem Borer. Select certified hybrid seeds and drain excess water.',
      harvestStorage: 'Harvest when grain moisture drops below 20%. Store in cool dry ventilated granaries.',
      equipment: 'Multicrop Thresher (rent: ₹1,000/day), dry storage bins.'
    },
    {
      id: 'chickpea',
      name: 'Chickpea',
      type: 'Cereal',
      season: 'Rabi (Winter)',
      profit: '₹26,000 / Acre',
      difficulty: 'Easy',
      water: 'Low',
      sellingPrice: '₹5,335 / Quintal',
      image: '/crops/chickpea.png',
      suitability: 'Well-drained sandy loam or clay loam soils.',
      weather: 'Cool climate (15°C - 25°C) during vegetative phase, warmer during seed development.',
      fertilizerSchedule: 'Low Nitrogen but high Phosphorus split application to promote nodulation and root growth.',
      pests: 'Pod Borer, Fusarium Wilt. Install bird perches and spray neem seed kernel extract.',
      harvestStorage: 'Harvest when plants turn yellowish-brown and leaves start shedding. Dry to 10% moisture.',
      equipment: 'Gram Thresher (rent: ₹1,200/day), moisture meter.'
    }
  ];

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const farmsRes = await API.get('/farms');
      setFarms(farmsRes.data);
      if (farmsRes.data.length > 0) {
        setFarmId(farmsRes.data[0].id);
      }

      const cropsRes = await API.get('/crops');
      setCrops(cropsRes.data);
    } catch (err) {
      setError('Could not retrieve crop tracking list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    if (farms.length === 0) {
      setError('Please register a farm plot before sowing or tracking crops.');
      return;
    }
    setCropName('Rice');
    setCropType('Cereal');
    setSowingDate(new Date().toISOString().split('T')[0]);
    
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 4);
    setExpectedHarvestDate(futureDate.toISOString().split('T')[0]);
    setGrowthStage('Sowing');
    setModalOpen(true);
  };

  const handleOpenCatalogAdd = (crop) => {
    if (farms.length === 0) {
      setError('Please register a farm plot before sowing or tracking crops.');
      return;
    }
    setCropName(crop.name);
    setCropType(crop.type);
    setSowingDate(new Date().toISOString().split('T')[0]);
    
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 4);
    setExpectedHarvestDate(futureDate.toISOString().split('T')[0]);
    setGrowthStage('Sowing');
    setDetailModalOpen(false);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      farm_id: Number(farmId),
      crop_name: cropName,
      crop_type: cropType,
      sowing_date: sowingDate,
      expected_harvest_date: expectedHarvestDate,
      growth_stage: growthStage,
      status: 'active'
    };

    try {
      await API.post('/crops', payload);
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not register crop.');
    }
  };

  const handleAdvanceStage = async (crop) => {
    const stages = ['Sowing', 'Vegetative', 'Flowering', 'Harvesting'];
    const currentIndex = stages.indexOf(crop.growth_stage);
    
    if (currentIndex === -1 || currentIndex === stages.length - 1) return;

    const nextStage = stages[currentIndex + 1];
    const isHarvested = nextStage === 'Harvesting';

    try {
      await API.put(`/crops/${crop.id}`, {
        crop_name: crop.crop_name,
        crop_type: crop.crop_type,
        sowing_date: crop.sowing_date.split('T')[0],
        expected_harvest_date: crop.expected_harvest_date.split('T')[0],
        growth_stage: nextStage,
        status: isHarvested ? 'harvested' : 'active'
      });
      loadData();
    } catch (err) {
      setError('Error updating crop growth stage.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this crop? Action cannot be undone.')) return;
    try {
      await API.delete(`/crops/${id}`);
      loadData();
    } catch (err) {
      setError('Error deleting crop.');
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Sowing': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Vegetative': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Flowering': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Harvesting': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getProgressPercentage = (stage) => {
    switch (stage) {
      case 'Sowing': return 25;
      case 'Vegetative': return 50;
      case 'Flowering': return 75;
      case 'Harvesting': return 100;
      default: return 0;
    }
  };

  const handleOpenDetail = async (crop) => {
    setSelectedCatalogCrop(crop);
    setDetailTab('overview');
    setDetailModalOpen(true);
    setCatalogLoading(true);
    setCatalogDetails(null);
    try {
      const res = await API.get(`/advisor/crop-catalog-details?cropName=${encodeURIComponent(crop.name)}`);
      setCatalogDetails(res.data);
    } catch (err) {
      console.warn('Failed to load crop catalog AI details:', err.message);
    } finally {
      setCatalogLoading(false);
    }
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
    <div className="space-y-6 text-left font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Crop Selection Catalog</h2>
          <p className="text-xs text-slate-500">Explore suitable crops, view agronomy schedules, and monitor current active cultivations</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus size={16} /> Sow New Crop
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* 1. Browse Crop Catalog Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
          <Sprout size={16} className="text-green-600" /> Suitable Crops Recommendations
        </h3>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {cropCatalog.map(crop => (
            <motion.div key={crop.id} variants={itemVariants}>
              <Card className="bg-white border border-slate-200 overflow-hidden hover-scale h-full flex flex-col justify-between">
                <div>
                  <img src={crop.image} alt={crop.name} className="h-32 w-full object-cover border-b border-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-805 text-base">{crop.name}</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{crop.season}</span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500 font-medium">
                      <div className="flex justify-between">
                        <span>Expected returns:</span>
                        <span className="font-bold text-green-650">{crop.profit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <span className="font-bold text-slate-700">{crop.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water demand:</span>
                        <span className="font-bold text-slate-700">{crop.water}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Button 
                    onClick={() => handleOpenDetail(crop)} 
                    variant="outline" 
                    className="w-full text-xs font-bold h-9 mt-2 flex items-center justify-center gap-1"
                  >
                    Agronomy Details <ChevronRight size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 2. Active Crops Timeline List */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={16} className="text-slate-450" /> Currently Active Cultivations
        </h3>
        
        {loading ? (
          <div className="h-[20vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-green-600" size={24} />
          </div>
        ) : crops.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-white">
            <p className="text-xs text-slate-400 py-4 font-medium">No crops sowed yet. Click "Sow New Crop" or browse the catalog above to plant.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {crops.map(crop => {
              const catalogCrop = cropCatalog.find(c => c.name.toLowerCase() === crop.crop_name.toLowerCase());
              const cropImg = catalogCrop ? catalogCrop.image : '/crops/rice.png';
              return (
                <Card 
                  key={crop.id} 
                  onClick={() => {
                    const catalogItem = cropCatalog.find(c => c.name.toLowerCase() === crop.crop_name.toLowerCase());
                    if (catalogItem) handleOpenDetail(catalogItem);
                  }}
                  className="border border-slate-200 shadow-sm relative overflow-hidden bg-white hover-scale cursor-pointer flex gap-4 p-4 text-left"
                >
                  <img 
                    src={cropImg} 
                    alt={crop.crop_name} 
                    className="h-24 w-24 object-cover rounded-xl border border-slate-100 shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-800">{crop.crop_name}</h3>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">{crop.crop_type}</span>
                          <span className={`text-[9px] uppercase font-black tracking-wide px-2.5 py-0.5 rounded-full border ${getStageColor(crop.growth_stage)}`}>
                            {crop.growth_stage}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 font-bold">
                          Sowed: {new Date(crop.sowing_date).toLocaleDateString()} &bull; Expected Harvest: {new Date(crop.expected_harvest_date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {crop.growth_stage !== 'Harvesting' && (
                          <Button onClick={() => handleAdvanceStage(crop)} variant="outline" size="sm" className="h-7 text-[10px] font-bold flex items-center gap-0.5">
                            Next Stage <ChevronRight size={12} />
                          </Button>
                        )}
                        <Button onClick={() => handleDelete(crop.id)} variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:bg-red-50">
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar timeline */}
                    <div className="mt-4 space-y-1.5">
                      <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 bottom-0 left-0 bg-green-500 transition-all duration-500 rounded-full" 
                          style={{ width: `${getProgressPercentage(crop.growth_stage)}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 text-[9px] font-bold text-slate-400 text-center">
                        <span className={crop.growth_stage === 'Sowing' ? 'text-green-600' : ''}>Sowing</span>
                        <span className={crop.growth_stage === 'Vegetative' ? 'text-green-600' : ''}>Vegetative</span>
                        <span className={crop.growth_stage === 'Flowering' ? 'text-green-600' : ''}>Flowering</span>
                        <span className={crop.growth_stage === 'Harvesting' ? 'text-green-600' : ''}>Harvesting</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Sowing Dialog */}
      <Dialog 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title="Sow New Crop"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-600">
          <Select
            label="Associated Farm Plot"
            value={farmId}
            onChange={(e) => setFarmId(e.target.value)}
          >
            {farms.map(f => (
              <option key={f.id} value={f.id}>{f.farm_name} ({f.district})</option>
            ))}
          </Select>

          <div className="space-y-2">
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider text-left">Select Crop to Sow</span>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50/50">
              {cropCatalog.map(catalogItem => {
                const isSelected = cropName.toLowerCase() === catalogItem.name.toLowerCase();
                return (
                  <button
                    key={catalogItem.id}
                    type="button"
                    onClick={() => {
                      setCropName(catalogItem.name);
                      setCropType(catalogItem.type);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition cursor-pointer gap-1.5 ${
                      isSelected 
                        ? 'border-green-600 bg-green-50 text-green-700 shadow-sm ring-1 ring-green-600' 
                        : 'border-slate-200 hover:border-green-400 bg-white text-slate-600'
                    }`}
                  >
                    <img 
                      src={catalogItem.image} 
                      alt={catalogItem.name} 
                      className="h-10 w-12 object-cover rounded-lg border border-slate-100 shadow-sm" 
                    />
                    <span className="text-[9px] font-black leading-tight">
                      {catalogItem.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sowing Date"
              type="date"
              required
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
            />
            <Input
              label="Expected Harvest Date"
              type="date"
              required
              value={expectedHarvestDate}
              onChange={(e) => setExpectedHarvestDate(e.target.value)}
            />
          </div>

          <Select
            label="Initial Growth Stage"
            value={growthStage}
            onChange={(e) => setGrowthStage(e.target.value)}
          >
            <option value="Sowing">Sowing (Basal preparation)</option>
            <option value="Vegetative">Vegetative (Top dressing dressing)</option>
            <option value="Flowering">Flowering (Reproductive stage)</option>
            <option value="Harvesting">Harvesting (Maturescent stage)</option>
          </Select>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Sow Crop</Button>
          </div>
        </form>
      </Dialog>

      {/* Catalog Crop Detail Modal */}
      <Dialog
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCatalogCrop ? `${selectedCatalogCrop.name} Agronomy Handbook` : 'Crop Details'}
      >
        {selectedCatalogCrop && (
          <div className="space-y-4 text-xs font-semibold text-slate-600">
            <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              <img src={selectedCatalogCrop.image} alt={selectedCatalogCrop.name} className="h-16 w-20 object-cover rounded" />
              <div>
                <h4 className="font-bold text-base text-slate-800">{selectedCatalogCrop.name}</h4>
                <p className="text-[10px] text-slate-400">Class: {selectedCatalogCrop.type} &bull; MKT Rate: {selectedCatalogCrop.sellingPrice}</p>
              </div>
            </div>

            {catalogLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="animate-spin text-green-600" size={32} />
                <p className="text-[10px] text-slate-400 font-bold animate-pulse text-center max-w-[280px]">
                  Gemini AI is analyzing soil metrics, growth schedules, and organic treatment plans for this crop...
                </p>
              </div>
            ) : catalogDetails ? (
              <>
                {/* Modal tabs */}
                <div className="flex border-b border-slate-200">
                  {[
                    { id: 'overview', label: 'Requirements' },
                    { id: 'recommendations', label: 'AI Recommendations' },
                    { id: 'calendar', label: 'AI Calendar' },
                    { id: 'instructions', label: 'Checklists' }
                  ].map(sub => (
                    <button
                      type="button"
                      key={sub.id}
                      onClick={() => setDetailTab(sub.id)}
                      className={`px-3 py-1.5 border-b-2 font-bold cursor-pointer transition ${
                        detailTab === sub.id 
                          ? 'border-green-600 text-green-700' 
                          : 'border-transparent text-slate-455 hover:text-slate-700'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                <div className="py-2 leading-relaxed text-left">
                  {detailTab === 'overview' && (
                    <div className="space-y-2.5 font-medium text-xs text-slate-600">
                      <p><span className="font-bold text-slate-750">Soil Suitability:</span> {catalogDetails.summary || selectedCatalogCrop.suitability}</p>
                      <p><span className="font-bold text-slate-750">Weather & Climate:</span> {catalogDetails.reasoning || selectedCatalogCrop.weather}</p>
                      <p><span className="font-bold text-slate-750">Water Demand:</span> {catalogDetails.expectedOutcome || selectedCatalogCrop.water}</p>
                    </div>
                  )}

                  {detailTab === 'recommendations' && (
                    <div className="space-y-3 font-medium text-xs text-slate-600">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Traditional Remedies (Desi Nuska)</span>
                        <p className="text-slate-750 font-bold italic">{catalogDetails.desiNuska || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Organic Control</span>
                        <p className="text-slate-750">{catalogDetails.organicTreatment || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Chemical Control</span>
                        <p className="text-slate-750">{catalogDetails.chemicalTreatment || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {detailTab === 'calendar' && (
                    <div className="space-y-4">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI Sowing Calendar Timeline</p>
                      {catalogDetails.timeline && catalogDetails.timeline.length > 0 ? (
                        <div className="relative border-l border-green-200 pl-4 ml-2 space-y-4">
                          {catalogDetails.timeline.map((step, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center text-[8px] font-bold text-green-700">
                                {idx + 1}
                              </span>
                              <div className="text-left">
                                <h5 className="font-bold text-slate-800 text-xs flex justify-between">
                                  <span>{step.stage}</span>
                                  <span className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.2 rounded border border-green-100 font-bold">{step.duration}</span>
                                </h5>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{step.notes || step.activity || step.recommendation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No calendar stages available currently.</p>
                      )}
                    </div>
                  )}

                  {detailTab === 'instructions' && (
                    <div className="space-y-3 font-medium text-xs text-slate-600">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Do's & Don'ts</span>
                        <p className="text-slate-750 font-semibold">{catalogDetails.dosAndDonts || 'N/A'}</p>
                      </div>
                      {catalogDetails.preventionChecklist && catalogDetails.preventionChecklist.length > 0 && (
                        <div className="space-y-2">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Preventive Action Items</span>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {catalogDetails.preventionChecklist.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-655 font-bold">
                                <CheckCircle className="text-green-500 shrink-0" size={13} />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="font-bold text-green-700">Expected Profit: {selectedCatalogCrop.profit}</span>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setDetailModalOpen(false)}>Close</Button>
                    <Button type="button" onClick={() => handleOpenCatalogAdd(selectedCatalogCrop)}>Sow Crop</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-slate-400">
                Failed to load AI handbook details for this crop.
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
