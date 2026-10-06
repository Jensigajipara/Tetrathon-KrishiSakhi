import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Select } from '../components/ui/select.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { 
  Users, 
  Map, 
  Sprout, 
  TrendingUp, 
  History, 
  Trash2, 
  RefreshCw, 
  Loader2 
} from 'lucide-react';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Mandi Price Form
  const [cropName, setCropName] = useState('Rice');
  const [mandiName, setMandiName] = useState('');
  const [district, setDistrict] = useState('');
  const [price, setPrice] = useState('');
  const [submittingPrice, setSubmittingPrice] = useState(false);

  // Sync active path with controlled tab selection
  const getTabFromPath = (path) => {
    if (path === '/admin/users') return 'farmers';
    if (path === '/admin/farms') return 'farms';
    if (path === '/admin/crops') return 'crops';
    if (path === '/admin/market') return 'market';
    if (path === '/admin/analytics') return 'logs';
    return 'stats'; // fallback for /admin
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (val) => {
    if (val === 'farmers') navigate('/admin/users');
    else if (val === 'farms') navigate('/admin/farms');
    else if (val === 'crops') navigate('/admin/crops');
    else if (val === 'market') navigate('/admin/market');
    else if (val === 'logs') navigate('/admin/analytics');
    else navigate('/admin');
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const statsRes = await API.get('/admin/stats');
      setStats(statsRes.data);

      const farmersRes = await API.get('/admin/farmers');
      setFarmers(farmersRes.data);

      const farmsRes = await API.get('/admin/farms');
      setFarms(farmsRes.data);

      const cropsRes = await API.get('/admin/crops');
      setCrops(cropsRes.data);

      const pricesRes = await API.get('/market/prices');
      setPrices(pricesRes.data);
    } catch (err) {
      setError('Could not retrieve admin platform statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteFarmer = async (id) => {
    if (!window.confirm('Delete farmer account? This removes all associated plots and crops.')) return;
    try {
      await API.delete(`/admin/farmers/${id}`);
      setSuccess('Farmer account successfully removed.');
      loadData();
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const handleAddPrice = async (e) => {
    e.preventDefault();
    if (!mandiName || !district || !price) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmittingPrice(true);

    try {
      await API.post('/market/prices', {
        crop_name: cropName,
        mandi_name: mandiName,
        district,
        price: Number(price)
      });
      setSuccess(`Mandi price updated. Target price alerts evaluated successfully.`);
      setMandiName('');
      setDistrict('');
      setPrice('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating Mandi prices.');
    } finally {
      setSubmittingPrice(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Platform Administration</h2>
          <p className="text-xs text-slate-500 font-medium">Manage mandi prices, review farmer registries, and inspect system audit logs</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" className="h-9">
          <RefreshCw size={14} className="mr-1.5" /> Refresh Data
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      ) : stats ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 flex flex-wrap gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50">
            <TabsTrigger value="stats">Platform Summary</TabsTrigger>
            <TabsTrigger value="farmers">Farmers List</TabsTrigger>
            <TabsTrigger value="farms">Farms Registry</TabsTrigger>
            <TabsTrigger value="crops">Crops Registry</TabsTrigger>
            <TabsTrigger value="market">Mandi Management</TabsTrigger>
            <TabsTrigger value="logs">Action Logs</TabsTrigger>
          </TabsList>

          {/* Stats overview Tab */}
          <TabsContent value="stats">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <Card className="p-6 hover-scale flex items-center justify-between shadow-sm border border-slate-200 bg-white">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Farmers</p>
                  <h3 className="text-3xl font-black text-slate-800">{stats.summary.totalFarmers}</h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Users size={24} />
                </div>
              </Card>

              <Card className="p-6 hover-scale flex items-center justify-between shadow-sm border border-slate-200 bg-white">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Farms Mapped</p>
                  <h3 className="text-3xl font-black text-slate-800">{stats.summary.totalFarms}</h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Map size={24} />
                </div>
              </Card>

              <Card className="p-6 hover-scale flex items-center justify-between shadow-sm border border-slate-200 bg-white">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Crops</p>
                  <h3 className="text-3xl font-black text-slate-800">{stats.summary.activeCrops}</h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Sprout size={24} />
                </div>
              </Card>

              <Card className="p-6 hover-scale flex items-center justify-between shadow-sm border border-slate-200 bg-white">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Wholesale Prices</p>
                  <h3 className="text-3xl font-black text-slate-800">{stats.summary.priceRecords}</h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
              </Card>

            </div>

            {/* Active crop distribution card */}
            <Card className="mt-6 border border-slate-200 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">Crop Cultivation Distribution</CardTitle>
                <CardDescription className="text-xs text-slate-500">Visual breakdown of registered active crops currently on the platform</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {Object.keys(stats.cropDistribution).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No active crops registered on the system.</p>
                ) : (
                  Object.entries(stats.cropDistribution).map(([crop, count]) => (
                    <div key={crop} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">{crop}</span>
                        <span className="text-slate-500 font-medium">{count} Active Fields</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.min(count * 20, 100)}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farmer Roster Tab */}
          <TabsContent value="farmers">
            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-600 border-collapse">
                  <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left">Farmer Name</th>
                      <th className="px-6 py-4 text-left">Email Address</th>
                      <th className="px-6 py-4 text-left">Phone Number</th>
                      <th className="px-6 py-4 text-left">Created Date</th>
                      <th className="px-6 py-4 text-right">Delete Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {farmers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center p-8 text-xs text-slate-400">No farmers registered</td>
                      </tr>
                    ) : (
                      farmers.map(farmer => (
                        <tr key={farmer.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="px-6 py-4 font-bold text-slate-800">{farmer.full_name}</td>
                          <td className="px-6 py-4">{farmer.email}</td>
                          <td className="px-6 py-4">{farmer.phone || 'N/A'}</td>
                          <td className="px-6 py-4">{new Date(farmer.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteFarmer(farmer.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-500 transition cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Farms Registry Tab */}
          <TabsContent value="farms">
            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-600 border-collapse">
                  <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left">Farm ID</th>
                      <th className="px-6 py-4 text-left">Farm Name</th>
                      <th className="px-6 py-4 text-left">Location (Village, District, State)</th>
                      <th className="px-6 py-4 text-left">Soil Type</th>
                      <th className="px-6 py-4 text-right">Size (Acres)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {farms.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center p-8 text-xs text-slate-400">No farms registered</td>
                      </tr>
                    ) : (
                      farms.map(f => (
                        <tr key={f.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">#{f.id}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{f.farm_name}</td>
                          <td className="px-6 py-4">{f.village}, {f.district}, {f.state}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {f.soil_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-800">{Number(f.farm_size).toFixed(1)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Crops Registry Tab */}
          <TabsContent value="crops">
            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-600 border-collapse">
                  <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left">Crop Name</th>
                      <th className="px-6 py-4 text-left">Type</th>
                      <th className="px-6 py-4 text-left">Growth Stage</th>
                      <th className="px-6 py-4 text-left">Sowing Date</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {crops.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center p-8 text-xs text-slate-400">No crops registered</td>
                      </tr>
                    ) : (
                      crops.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="px-6 py-4 font-bold text-slate-800">{c.crop_name}</td>
                          <td className="px-6 py-4">{c.crop_type}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                              {c.growth_stage}
                            </span>
                          </td>
                          <td className="px-6 py-4">{new Date(c.sowing_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                              c.status === 'active' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Mandi pricing controls Tab */}
          <TabsContent value="market">
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              
              {/* Form to insert price */}
              <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-50 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-800">Update Mandi Index</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Enter prices per quintal. Automatically evaluates and triggers price alerts</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAddPrice} className="space-y-4">
                    <Select
                      label="Crop Type"
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                    >
                      <option value="Rice">Rice</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Maize">Maize</option>
                      <option value="Sugarcane">Sugarcane</option>
                    </Select>

                    <Input
                      label="Mandi Name"
                      type="text"
                      required
                      placeholder="e.g. Karnal Mandi"
                      value={mandiName}
                      onChange={(e) => setMandiName(e.target.value)}
                    />

                    <Input
                      label="District"
                      type="text"
                      required
                      placeholder="e.g. Karnal"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />

                    <Input
                      label="Wholesale Price (₹)"
                      type="number"
                      required
                      placeholder="e.g. 2480"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />

                    <Button type="submit" loading={submittingPrice} variant="accent" className="w-full">
                      Add / Update Price Index
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Pricing List */}
              <div className="lg:col-span-2 space-y-4 text-left">
                <h4 className="text-base font-bold text-slate-800">Current Wholesale Indices</h4>
                
                <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
                  <div className="overflow-x-auto max-h-[420px]">
                    <table className="w-full text-sm text-slate-600 border-collapse">
                      <thead className="bg-slate-50 text-slate-455 font-semibold text-[10px] uppercase border-b border-slate-100 sticky top-0">
                        <tr>
                          <th className="px-6 py-4 text-left">Crop</th>
                          <th className="px-6 py-4 text-left">Mandi Location</th>
                          <th className="px-6 py-4 text-left">District</th>
                          <th className="px-6 py-4 text-right">Price Index</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {prices.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-3 font-semibold text-slate-850">{p.crop_name}</td>
                            <td className="px-6 py-3">{p.mandi_name}</td>
                            <td className="px-6 py-3">{p.district}</td>
                            <td className="px-6 py-3 text-right font-black text-slate-800">₹{Number(p.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs">
            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-1.5"><History size={18} className="text-teal-600" /> System Action Audit Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 text-xs">
                  {stats.recentLogs.map((log, idx) => (
                    <div key={log.id || idx} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50/50 transition">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-700 text-sm">{log.action}</span>
                        <p className="text-[10px] text-slate-400 font-medium">User ID: {log.user_id || 'System'}</p>
                      </div>
                      <span className="text-[10px] text-slate-450 font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      ) : null}
    </div>
  );
}
