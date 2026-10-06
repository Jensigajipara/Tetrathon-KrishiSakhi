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
  MapPin, Trash2, Edit3, Plus, Compass, Loader2, 
  Droplet, Sliders, Thermometer, Wind, RefreshCw, Eye, Sprout
} from 'lucide-react';

export default function Farms() {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  
  // Form values
  const [farmName, setFarmName] = useState('');
  const [state, setState] = useState('Haryana');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [soilType, setSoilType] = useState('Loam');

  // New soil/NPK fields
  const [nitrogen, setNitrogen] = useState('120');
  const [phosphorus, setPhosphorus] = useState('50');
  const [potassium, setPotassium] = useState('60');
  const [soilPh, setSoilPh] = useState('6.5');
  const [irrigationSource, setIrrigationSource] = useState('Tube Well');
  const [waterAvailability, setWaterAvailability] = useState('High');

  const fetchFarmsAndCrops = async () => {
    setLoading(true);
    try {
      const farmsRes = await API.get('/farms');
      setFarms(farmsRes.data);
      const cropsRes = await API.get('/crops');
      setCrops(cropsRes.data);
    } catch (err) {
      setError('Could not retrieve farms or crops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmsAndCrops();
  }, []);

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setFarmName('');
    setState('Haryana');
    setDistrict('');
    setVillage('');
    setLatitude('');
    setLongitude('');
    setFarmSize('');
    setSoilType('Loam');
    setNitrogen('120');
    setPhosphorus('50');
    setPotassium('60');
    setSoilPh('6.5');
    setIrrigationSource('Tube Well');
    setWaterAvailability('High');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (farm) => {
    setEditingFarm(farm);
    setFarmName(farm.farm_name);
    setState(farm.state);
    setDistrict(farm.district);
    setVillage(farm.village || '');
    setLatitude(farm.latitude || '');
    setLongitude(farm.longitude || '');
    setFarmSize(farm.farm_size);
    setSoilType(farm.soil_type);
    setNitrogen(farm.nitrogen !== undefined ? String(farm.nitrogen) : '120');
    setPhosphorus(farm.phosphorus !== undefined ? String(farm.phosphorus) : '50');
    setPotassium(farm.potassium !== undefined ? String(farm.potassium) : '60');
    setSoilPh(farm.soil_ph !== undefined ? String(farm.soil_ph) : '6.5');
    setIrrigationSource(farm.irrigation_source || 'Tube Well');
    setWaterAvailability(farm.water_availability || 'High');
    setError('');
    setModalOpen(true);
  };

  const handleSimulateGPS = () => {
    const lat = (28.0 + Math.random() * 3).toFixed(6);
    const lng = (75.0 + Math.random() * 3).toFixed(6);
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      farm_name: farmName,
      state,
      district,
      village,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      farm_size: Number(farmSize),
      soil_type: soilType,
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      npk_ratio: `${nitrogen}-${phosphorus}-${potassium}`,
      soil_ph: Number(soilPh),
      irrigation_source: irrigationSource,
      water_availability: waterAvailability
    };

    try {
      if (editingFarm) {
        await API.put(`/farms/${editingFarm.id}`, payload);
      } else {
        await API.post('/farms', payload);
      }
      setModalOpen(false);
      fetchFarmsAndCrops();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred saving farm data.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farm? This will also remove registered crops.')) return;
    try {
      await API.delete(`/farms/${id}`);
      fetchFarmsAndCrops();
    } catch (err) {
      setError('Could not delete selected farm.');
    }
  };

  const getFarmImage = (soilType, idx) => {
    const images = [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=600'
    ];
    return images[idx % images.length];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 90 } }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Land Plots Management</h2>
          <p className="text-xs text-slate-500">Configure your cultivation acreage, NPK balance, and irrigation profiles</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus size={16} /> Register New Plot
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : farms.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-white">
          <div className="max-w-md mx-auto space-y-4 py-6">
            <Compass className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Farm Plots Registered</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Register a farm plot detailing soil chemistry and sizes to receive specialized advisory reports and weather irrigation guides.
            </p>
            <Button onClick={handleOpenAdd}>Register Your First Plot</Button>
          </div>
        </Card>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {farms.map((farm, idx) => {
            const activeCrops = crops.filter(c => c.farm_id === farm.id && c.status === 'active');
            return (
              <motion.div key={farm.id} variants={cardVariants}>
                <Card className="overflow-hidden hover-scale bg-white border border-slate-200 shadow-sm flex flex-col justify-between h-full relative">
                  <div>
                    {/* Farm card cover photo */}
                    <div className="h-36 relative">
                      <img 
                        src={getFarmImage(farm.soil_type, idx)} 
                        alt={farm.farm_name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-slate-900/35" />
                      <div className="absolute bottom-3 left-4 text-white">
                        <h3 className="text-lg font-black tracking-tight">{farm.farm_name}</h3>
                        <p className="text-[10px] text-slate-100 font-semibold flex items-center gap-0.5">
                          <MapPin size={10} /> {farm.village ? `${farm.village}, ` : ''}{farm.district}, {farm.state}
                        </p>
                      </div>
                      <span className="absolute top-3 right-4 text-[9px] px-2.5 py-0.5 bg-white/20 backdrop-blur-sm text-white font-extrabold rounded-full border border-white/20">
                        {farm.farm_size} Acres
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Active crop tracking banner */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active cultivation</span>
                        {activeCrops.length > 0 ? (
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Sprout className="text-green-600" size={14} /> {activeCrops[0].crop_name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700">Stage: {activeCrops[0].growth_stage}</span>
                          </div>
                        ) : (
                          <p className="text-slate-450 italic">No crop sowed. Setup plan in Crop Planner.</p>
                        )}
                      </div>

                      {/* Soil Parameters Visual bars */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                          <span>Soil N-P-K balance</span>
                          <span className="text-slate-600 font-bold">{farm.npk_ratio || '120-50-60'}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-bold text-slate-500">N</span>
                              <span className="font-bold text-green-600">{farm.nitrogen || 120}</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${Math.min(((farm.nitrogen || 120)/200)*100, 100)}%` }} />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-bold text-slate-500">P</span>
                              <span className="font-bold text-teal-600">{farm.phosphorus || 50}</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500" style={{ width: `${Math.min(((farm.phosphorus || 50)/100)*100, 100)}%` }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-bold text-slate-500">K</span>
                              <span className="font-bold text-blue-600">{farm.potassium || 60}</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${Math.min(((farm.potassium || 60)/120)*100, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Soil pH & Water Info */}
                      <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3 text-xs">
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Soil Chemistry pH</span>
                          <span className="font-black text-slate-800 text-sm">{farm.soil_ph || 6.5} pH</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Irrigation Feed</span>
                          <span className="font-bold text-slate-850 truncate block">{farm.irrigation_source || 'Tube Well'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="border-t border-slate-100 p-4 bg-slate-50/40 flex justify-between items-center gap-2">
                    <div className="flex gap-1">
                      <Button onClick={() => window.location.href = `/dashboard/crop-advisor`} variant="outline" size="sm" className="h-8 text-[11px] font-bold">
                        <Eye size={12} className="mr-1" /> View Plan
                      </Button>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(farm)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-150 transition cursor-pointer"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(farm.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={editingFarm ? 'Edit Farm Plot' : 'Register New Farm Plot'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-600">
          <Input
            label="Farm Name"
            type="text"
            required
            placeholder="e.g. Rice Paddy A"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="Haryana">Haryana</option>
              <option value="Punjab">Punjab</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
            </Select>

            <Input
              label="District"
              type="text"
              required
              placeholder="e.g. Karnal"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Village"
              type="text"
              placeholder="e.g. Shamgarh"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />

            <Input
              label="Farm Size (Acres)"
              type="number"
              step="0.01"
              required
              placeholder="e.g. 5.5"
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Soil Classification"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="col-span-2"
            >
              <option value="Loam">Loam (Optimal general farming)</option>
              <option value="Clay">Clay (Holds moisture well, suits Rice)</option>
              <option value="Sandy">Sandy (Drains fast, requires high watering)</option>
              <option value="Silt">Silt (Highly fertile, fine particles)</option>
              <option value="Saline">Saline (High salt content)</option>
            </Select>

            <Input
              label="pH Level"
              type="number"
              step="0.1"
              min="3"
              max="10"
              required
              value={soilPh}
              onChange={(e) => setSoilPh(e.target.value)}
            />
          </div>

          {/* NPK parameters input */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Soil Nitrogen (N), Phosphorus (P), Potassium (K) Levels</span>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Nitrogen (N)"
                type="number"
                required
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
              />
              <Input
                label="Phosphorus (P)"
                type="number"
                required
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
              />
              <Input
                label="Potassium (K)"
                type="number"
                required
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
              />
            </div>
          </div>

          {/* Irrigation and Water availability */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Irrigation Source"
              value={irrigationSource}
              onChange={(e) => setIrrigationSource(e.target.value)}
            >
              <option value="Tube Well">Tube Well</option>
              <option value="Canal">Canal</option>
              <option value="Rainfed">Rainfed (Seasonal)</option>
              <option value="Drip Irrigation">Drip Lines</option>
            </Select>

            <Select
              label="Water Availability"
              value={waterAvailability}
              onChange={(e) => setWaterAvailability(e.target.value)}
            >
              <option value="High">High (Abundant supply)</option>
              <option value="Medium">Medium (Incidental intervals)</option>
              <option value="Low">Low (Scarce supply)</option>
            </Select>
          </div>

          {/* GPS Coordinates Simulation */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Satellite Coordinates</span>
              <Button type="button" onClick={handleSimulateGPS} variant="outline" size="sm" className="h-7 text-xs">
                Pick Live GPS Location
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="0.000001"
                placeholder="e.g. 29.7820"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
              <Input
                label="Longitude"
                type="number"
                step="0.000001"
                placeholder="e.g. 76.9910"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Farm</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
