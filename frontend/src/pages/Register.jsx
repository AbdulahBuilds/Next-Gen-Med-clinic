import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, UserPlus } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Patient', consultationFee: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledRole = searchParams.get('role');

  useEffect(() => {
    if (prefilledRole) {
      setFormData(prev => ({ ...prev, role: prefilledRole }));
    }
    // Fetch dynamic roles from backend
    const fetchRoles = async () => {
      try {
        // We can't fetch roles without auth, so we use defaults with option to add more
        // This will be populated after first login or we fetch from public endpoint
        setRoles(['Admin', 'Doctor', 'Receptionist', 'Patient']);
      } catch {
        setRoles(['Admin', 'Doctor', 'Receptionist', 'Patient']);
      }
    };
    fetchRoles();
  }, [prefilledRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData };
      if (formData.role === 'Doctor' && formData.consultationFee) {
        payload.consultationFee = Number(formData.consultationFee);
      }
      const user = await register(payload.name, payload.email, payload.password, payload.role, payload.consultationFee);
      switch (user.role) {
        case 'Admin': navigate('/admin'); break;
        case 'Doctor': navigate('/doctor'); break;
        case 'Receptionist': navigate('/receptionist'); break;
        case 'Patient': navigate('/patient'); break;
        default: navigate('/patient');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Clinic Name */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 mb-4 shadow-lg">
            <Stethoscope size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">NEXT GEN MED CLINIC</h1>
          <p className="text-slate-400 text-sm mt-1">AI-Powered Healthcare Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create an Account</h2>
            {prefilledRole && (
              <p className="text-sm text-teal-600 font-medium mt-1">Registering as <span className="font-bold">{prefilledRole}</span></p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="Dr. Ahmed Khan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="ahmed@clinic.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="••••••••"
                minLength="6"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Doctor-specific fee field */}
            {formData.role === 'Doctor' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Consultation Fee (PKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">Rs</span>
                  <input
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="2000"
                    min="0"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-60 flex items-center justify-center space-x-2 mt-2"
            >
              <UserPlus size={18} />
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
