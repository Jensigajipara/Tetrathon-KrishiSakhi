import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.jsx';
import { Sprout, Lock, Mail, ShieldAlert } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAdmin } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      if (isAdmin) {
        await loginAdmin(email, password);
        navigate('/admin');
      } else {
        await login(email, password);
        navigate('/dashboard/home');
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border border-slate-200">
        <CardHeader className="text-center space-y-2">
          <img src={logoImg} alt="KrishiSakhi Logo" className="mx-auto h-12 w-12 rounded-xl object-cover shadow-md shadow-green-150" />
          <CardTitle className="text-2xl font-bold">
            {isAdmin ? 'Admin Console' : 'Farmer Portal'}
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Enter credentials to manage the platform settings' 
              : 'Sign in to access farms, weather forecasts, and advisory reports'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Portal Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 text-xs">
            <button
              onClick={() => { setIsAdmin(false); setError(''); }}
              className={`py-2 rounded-md font-semibold text-center cursor-pointer transition ${
                !isAdmin ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Farmer Login
            </button>
            <button
              onClick={() => { setIsAdmin(true); setError(''); }}
              className={`py-2 rounded-md font-semibold text-center cursor-pointer transition ${
                isAdmin ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Admin Portal
            </button>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="e.g. farmer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              loading={submitting}
              variant={isAdmin ? 'accent' : 'primary'}
              className="w-full h-10 mt-2"
            >
              {isAdmin ? 'Login as Admin' : 'Login to Dashboard'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              {!isAdmin ? (
                <>
                  New to KrishiSakhi?{' '}
                  <Link to="/register" className="text-green-600 font-semibold hover:underline">
                    Create a free account
                  </Link>
                </>
              ) : (
                'System administrator access only'
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
