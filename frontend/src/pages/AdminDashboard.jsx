import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Users, Activity, Crown, Trash2, Shield, Menu, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  useEffect(() => { fetchData(); }, []);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
  });

  const fetchData = async () => {
    try {
      const [uRes, pRes, aRes, rRes] = await Promise.all([
        API.get('/api/auth/users', getHeaders()),
        API.get('/api/patients', getHeaders()),
        API.get('/api/appointments', getHeaders()),
        API.get('/api/roles', getHeaders()),
      ]);
      setUsersList(uRes.data);
      setPatients(pRes.data);
      setAppointments(aRes.data);
      setRoles(rRes.data);
    } catch (error) { console.error(error); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await API.delete(`/api/auth/users/${id}`, getHeaders());
      fetchData();
    } catch (error) {
      alert("Failed to delete user: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      await API.post('/api/roles', { name: newRoleName, description: newRoleDesc }, getHeaders());
      setNewRoleName('');
      setNewRoleDesc('');
      fetchData();
    } catch (error) {
      alert("Failed to add role: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      await API.delete(`/api/roles/${id}`, getHeaders());
      fetchData();
    } catch (error) { alert("Failed to delete role"); }
  };

  const getRevenueData = () => {
    const months = { 'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0, 'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0 };
    appointments.forEach(a => {
      if (a.status === 'completed') {
        const d = new Date(a.date);
        if (!isNaN(d.getTime())) {
          const monthName = d.toLocaleDateString('en-US', { month: 'short' });
          if (months[monthName] !== undefined) months[monthName] += 2000;
        }
      }
    });
    return Object.keys(months).map(name => ({ name, revenue: months[name] }));
  };

  const getAppointmentTrends = () => {
    const days = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
    appointments.forEach(a => {
      const d = new Date(a.date);
      if (!isNaN(d.getTime())) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (days[dayName] !== undefined) days[dayName]++;
      }
    });
    return Object.keys(days).map(name => ({ name, count: days[name] }));
  };

  const revenueData = getRevenueData();
  const appointmentTrends = getAppointmentTrends();
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  const navItems = [
    { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
    { id: 'users', label: 'Manage Staff', icon: Users },
    { id: 'roles', label: 'Role Management', icon: Shield },
    { id: 'saas', label: 'SaaS Plans', icon: Crown },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-xs leading-tight truncate">NEXT GEN MED CLINIC</p>
          <p className="text-slate-400 text-xs">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg transition text-sm font-medium ${activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Icon size={18} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <button onClick={handleLogout} className="flex items-center space-x-2 text-slate-400 hover:text-white py-2 px-4 text-sm transition">
        <LogOut size={18} /><span>Logout</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-slate-900 flex-col h-screen sticky top-0 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 p-1">
            <Menu size={22} />
          </button>
          <span className="font-bold text-sm text-gray-900">NEXT GEN MED CLINIC</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Welcome Header */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">NEXT GEN MED CLINIC · System Administrator</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold text-sm">Plan: {user?.subscriptionPlan}</span>
              <button onClick={handleLogout} className="md:hidden bg-red-50 text-red-600 p-2 rounded-lg">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Patients', value: patients.length, color: 'text-blue-600' },
                  { label: 'Total Doctors', value: usersList.filter(u => u.role === 'Doctor').length, color: 'text-teal-600' },
                  { label: 'Appointments', value: appointments.length, color: 'text-purple-600' },
                  { label: 'Revenue (Rs)', value: `${totalRevenue.toLocaleString()}`, color: 'text-green-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs sm:text-sm font-semibold mb-1">{label}</p>
                    <p className={`text-2xl sm:text-3xl font-extrabold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 text-lg mb-4">Revenue Trend (Rs PKR)</h3>
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => [`Rs ${v.toLocaleString()}`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 text-lg mb-4">Appointments This Week</h3>
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {user?.subscriptionPlan === 'Pro' ? (
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-2xl text-white flex items-start space-x-4">
                  <Activity size={28} className="text-blue-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xl mb-2">AI Predictive Analytics</h3>
                    <p className="text-blue-200 text-sm mb-3">Analyzing diagnosis logs to forecast trends...</p>
                    <div className="bg-white/10 p-4 rounded-xl text-sm space-y-1">
                      <p><strong>Forecast:</strong> 15% increase in respiratory cases expected next week.</p>
                      <p><strong>Most Common:</strong> Viral Fever (42% of cases).</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 p-6 rounded-2xl flex flex-col items-center text-center">
                  <Crown size={28} className="text-gray-400 mb-2" />
                  <h3 className="font-bold text-gray-700">Predictive Analytics Locked</h3>
                  <p className="text-sm text-gray-500 mt-1">Upgrade to Pro to unlock AI-powered forecasting.</p>
                  <button onClick={() => setActiveTab('saas')} className="mt-4 bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-sm">View Plans</button>
                </div>
              )}
            </div>
          )}

          {/* Staff Management Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Clinic Staff</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      {['Name', 'Email', 'Role', 'Fee (Rs)', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="py-3 px-4 text-gray-500 font-bold text-sm">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter(u => u.role !== 'Patient').map(u => (
                      <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-semibold text-gray-800">{u.name}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'Doctor' ? 'bg-teal-50 text-teal-700' : u.role === 'Admin' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{u.consultationFee ? `Rs ${u.consultationFee.toLocaleString()}` : '—'}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-600 transition p-1 rounded hover:bg-red-50" title="Delete User">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {usersList.filter(u => u.role !== 'Patient').length === 0 && (
                      <tr><td colSpan="6" className="py-8 text-center text-gray-400">No staff members found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Role Management Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Role</h2>
                <form onSubmit={handleAddRole} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Role name (e.g. Nurse, Lab Technician)"
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newRoleDesc}
                    onChange={e => setNewRoleDesc(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <button type="submit" className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition text-sm flex-shrink-0">
                    <Plus size={16} /><span>Add Role</span>
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Manage Roles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map(r => (
                    <div key={r._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                        {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteRole(r._id)} className="text-red-400 hover:text-red-600 transition p-1.5 rounded hover:bg-red-50 flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {roles.length === 0 && <p className="text-gray-400 col-span-full text-center py-4">No roles configured.</p>}
                </div>
              </div>
            </div>
          )}

          {/* SaaS Plans Tab */}
          {activeTab === 'saas' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Subscription Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[
                  { plan: 'Free', price: 'Rs 0', features: ['Manage Patients', 'Book Appointments', 'Basic Prescriptions'], locked: ['AI Symptom Checker', 'AI Explanations', 'Predictive Analytics'], color: 'blue' },
                  { plan: 'Pro', price: 'Rs 4,999', features: ['All Free Features', 'AI Symptom Checker', 'Patient AI Explanations', 'Predictive Analytics'], locked: [], color: 'indigo', recommended: true },
                ].map(({ plan, price, features, locked, color, recommended }) => (
                  <div key={plan} className={`p-6 sm:p-8 rounded-2xl border-2 relative ${user?.subscriptionPlan === plan ? `border-${color}-500 bg-${color}-50` : 'border-gray-200 bg-white shadow-sm'}`}>
                    {recommended && user?.subscriptionPlan !== plan && (
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">Recommended</div>
                    )}
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{plan} Plan</h3>
                    <div className="text-3xl font-extrabold text-gray-800 mb-5">{price}<span className="text-base font-normal text-gray-500">/mo</span></div>
                    <ul className="space-y-2 mb-6 text-sm">
                      {features.map(f => <li key={f} className="flex items-center space-x-2"><span className="text-green-500 font-bold">✓</span><span className="text-gray-700">{f}</span></li>)}
                      {locked.map(f => <li key={f} className="flex items-center space-x-2 opacity-40 line-through"><span>✗</span><span className="text-gray-500">{f}</span></li>)}
                    </ul>
                    <button disabled={user?.subscriptionPlan === plan}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition ${user?.subscriptionPlan === plan ? 'bg-gray-200 text-gray-500 cursor-default' : `bg-${color}-600 text-white hover:bg-${color}-700 shadow-md`}`}>
                      {user?.subscriptionPlan === plan ? 'Current Plan' : `Upgrade to ${plan}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
