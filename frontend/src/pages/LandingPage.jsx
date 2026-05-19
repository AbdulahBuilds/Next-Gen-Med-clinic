import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import axios from 'axios';
import { Shield, Stethoscope, ClipboardList, Heart, Star, ArrowRight, Phone, Mail, MapPin, Activity } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Fetch dynamic roles for display - fallback to defaults
    const fetchRoles = async () => {
      try {
        const res = await API.get('/api/roles', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        setRoles(res.data);
      } catch {
        // Use defaults if not logged in
      }
    };
    fetchRoles();
  }, []);

  const defaultRoles = [
    { name: 'Admin', icon: Shield, color: 'from-slate-700 to-slate-900', desc: 'Manage clinic operations, staff, and analytics' },
    { name: 'Doctor', icon: Stethoscope, color: 'from-teal-600 to-teal-800', desc: 'Manage appointments, diagnoses & prescriptions' },
    { name: 'Receptionist', icon: ClipboardList, color: 'from-purple-600 to-purple-800', desc: 'Register patients and schedule appointments' },
    { name: 'Patient', icon: Heart, color: 'from-blue-600 to-blue-800', desc: 'View appointments, prescriptions & health history' },
  ];

  const features = [
    { icon: Activity, title: 'AI-Powered Diagnosis', desc: 'Advanced symptom checker with risk assessment powered by Google Gemini AI.' },
    { icon: ClipboardList, title: 'Smart Prescriptions', desc: 'Digital prescriptions with AI explanations — patients always know what they are taking.' },
    { icon: Shield, title: 'Role-Based Security', desc: 'Multi-role access control ensures data privacy and appropriate access at every level.' },
    { icon: Heart, title: 'Patient Timeline', desc: 'Full medical history including diagnoses, appointments, and prescriptions in one view.' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">NEXT GEN MED CLINIC</span>
            <span className="font-bold text-sm text-gray-900 sm:hidden">NGMC</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => document.getElementById('role-select').scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors text-sm">
              Login
            </button>
            <button
              onClick={() => document.getElementById('role-select').scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors text-sm shadow-sm">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900 flex items-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/10 text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-teal-400/30">
              <Star size={14} />
              <span>AI-Powered Medical Management Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              NEXT GEN<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-300">MED CLINIC</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              A complete, AI-powered clinic management system for doctors, staff, and patients —
              designed for the modern healthcare experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => document.getElementById('role-select').scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 text-lg">
                <span>Get Started Free</span>
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => document.getElementById('role-select').scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:border-white/60 hover:bg-white/10 transition-all text-lg">
                Sign In
              </button>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="mt-8" id="role-select">
            <p className="text-center text-slate-400 text-sm font-medium uppercase tracking-widest mb-6">Select Your Role to Get Started</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {defaultRoles.map(({ name, icon: Icon, color, desc }) => (
                <button
                  key={name}
                  onClick={() => navigate(`/register?role=${name}`)}
                  className="group p-5 sm:p-6 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl text-left transition-all hover:-translate-y-1 backdrop-blur-sm"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">{name}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-snug hidden sm:block">{desc}</p>
                  <div className="flex items-center space-x-1 text-teal-300 text-xs font-medium mt-3">
                    <span>Sign up as {name}</span>
                    <ArrowRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Everything Your Clinic Needs</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">From AI-powered diagnostics to seamless booking — all in one platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[['500+', 'Patients Served'], ['50+', 'Doctors Onboarded'], ['99.9%', 'Uptime'], ['AI', 'Powered Insights']].map(([val, label]) => (
              <div key={label}>
                <div className="text-3xl sm:text-4xl font-extrabold mb-2">{val}</div>
                <div className="text-teal-100 text-sm sm:text-base font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope size={18} className="text-white" />
                </div>
                <span className="font-bold text-lg">NEXT GEN MED CLINIC</span>
              </div>
              <p className="text-slate-400 text-sm">AI-powered healthcare management for the modern world.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm uppercase tracking-wider text-slate-300">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => navigate('/login')} className="block text-slate-400 hover:text-white text-sm transition-colors">Login</button>
                <button onClick={() => navigate('/register')} className="block text-slate-400 hover:text-white text-sm transition-colors">Register</button>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm uppercase tracking-wider text-slate-300">Contact</h4>
              <div className="space-y-2 text-slate-400 text-sm">
                <div className="flex items-center space-x-2"><Phone size={14} /><span>+92 321 000 0000</span></div>
                <div className="flex items-center space-x-2"><Mail size={14} /><span>info@nextgenmedclinic.com</span></div>
                <div className="flex items-center space-x-2"><MapPin size={14} /><span>Karachi, Pakistan</span></div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} NEXT GEN MED CLINIC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
