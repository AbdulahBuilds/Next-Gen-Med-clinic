import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, UserPlus, CalendarDays, Users, Menu, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const ReceptionistDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patients');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientForm, setPatientForm] = useState({ name: '', email: '', age: '', gender: 'Male', contact: '' });
  const [editPatientId, setEditPatientId] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({ patientId: '', doctorId: '', date: '', time: '' });
  const [selectedDoctorFee, setSelectedDoctorFee] = useState(null);

  useEffect(() => { fetchPatients(); fetchAppointments(); fetchDoctors(); }, []);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });

  const fetchPatients = async () => {
    try { const res = await API.get('/api/patients', getHeaders()); setPatients(res.data); }
    catch (e) { console.error(e); }
  };
  const fetchAppointments = async () => {
    try { const res = await API.get('/api/appointments', getHeaders()); setAppointments(res.data); }
    catch (e) { console.error(e); }
  };
  const fetchDoctors = async () => {
    try { const res = await API.get('/api/auth/users?role=Doctor', getHeaders()); setDoctors(res.data); }
    catch (e) { console.error(e); }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      if (editPatientId) {
        await API.put(`/api/patients/${editPatientId}`, patientForm, getHeaders());
        alert('Patient updated!');
      } else {
        await API.post('/api/patients', patientForm, getHeaders());
        alert('Patient registered!');
      }
      setPatientForm({ name: '', email: '', age: '', gender: 'Male', contact: '' });
      setEditPatientId(null);
      fetchPatients();
    } catch (e) { alert('Failed: ' + (e.response?.data?.message || e.message)); }
  };

  const handleEditClick = (p) => {
    setPatientForm({ name: p.name, email: p.email, age: p.age, gender: p.gender, contact: p.contact });
    setEditPatientId(p._id);
    setActiveTab('patients');
    window.scrollTo(0, 0);
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    const doctor = doctors.find(d => d._id === doctorId);
    setAppointmentForm({ ...appointmentForm, doctorId });
    setSelectedDoctorFee(doctor?.consultationFee || null);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/appointments', appointmentForm, getHeaders());
      setAppointmentForm({ patientId: '', doctorId: '', date: '', time: '' });
      setSelectedDoctorFee(null);
      fetchAppointments();
      alert('Appointment booked!');
    } catch (e) { alert('Failed to book appointment'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-purple-900 flex-col h-screen sticky top-0 flex-shrink-0 p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Stethoscope size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-xs truncate">NEXT GEN MED CLINIC</p>
            <p className="text-purple-400 text-xs">Front Desk</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg text-sm font-medium transition ${activeTab === id ? 'bg-purple-700 text-white' : 'text-purple-200 hover:bg-purple-800'}`}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center space-x-2 text-purple-300 hover:text-white py-2 px-4 text-sm mt-4">
          <LogOut size={18} /><span>Logout</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-purple-900 p-6 flex flex-col">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Stethoscope size={16} className="text-white" />
              </div>
              <p className="text-white font-bold text-xs">NEXT GEN MED CLINIC</p>
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg text-sm font-medium transition ${activeTab === id ? 'bg-purple-700 text-white' : 'text-purple-200 hover:bg-purple-800'}`}>
                  <Icon size={18} /><span>{label}</span>
                </button>
              ))}
            </nav>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-purple-300 py-2 px-4 text-sm mt-4">
              <LogOut size={18} /><span>Logout</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b px-4 h-14 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600"><Menu size={22} /></button>
          <span className="font-bold text-sm">NEXT GEN MED CLINIC</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">NEXT GEN MED CLINIC · Front Desk Management</p>
          </div>

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                  <UserPlus className="mr-2 text-purple-600" size={20} />
                  {editPatientId ? 'Edit Patient' : 'Register New Patient'}
                </h2>
                <form onSubmit={handleRegisterPatient} className="space-y-3">
                  <input type="text" placeholder="Full Name" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" value={patientForm.name} onChange={e => setPatientForm({ ...patientForm, name: e.target.value })} required />
                  <input type="email" placeholder="Email Address" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" value={patientForm.email} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })} required />
                  <div className="flex space-x-3">
                    <input type="number" placeholder="Age" className="w-1/2 p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" value={patientForm.age} onChange={e => setPatientForm({ ...patientForm, age: e.target.value })} required />
                    <select className="w-1/2 p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={patientForm.gender} onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <input type="text" placeholder="Contact Number" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" value={patientForm.contact} onChange={e => setPatientForm({ ...patientForm, contact: e.target.value })} required />
                  <button type="submit" className="w-full bg-purple-600 text-white p-2.5 rounded-xl hover:bg-purple-700 font-semibold text-sm transition">
                    {editPatientId ? 'Update Patient' : 'Register Patient'}
                  </button>
                  {editPatientId && (
                    <button type="button" onClick={() => { setEditPatientId(null); setPatientForm({ name: '', email: '', age: '', gender: 'Male', contact: '' }); }} className="w-full border border-purple-300 text-purple-600 p-2.5 rounded-xl text-sm hover:bg-purple-50 transition">
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 text-gray-800">Patient List <span className="text-sm text-gray-400 font-normal">({patients.length})</span></h2>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {patients.map(p => (
                    <div key={p._id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center hover:bg-purple-50 transition">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.name} <span className="text-gray-400 font-normal text-xs">({p.age}{p.gender?.[0]})</span></p>
                        <p className="text-xs text-gray-500">{p.contact}</p>
                      </div>
                      <button onClick={() => handleEditClick(p)} className="text-purple-600 hover:text-purple-800 text-xs font-bold border border-purple-200 px-3 py-1 rounded-lg hover:bg-purple-100 transition">
                        Edit
                      </button>
                    </div>
                  ))}
                  {patients.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No patients registered yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                  <CalendarDays className="mr-2 text-purple-600" size={20} /> Book Appointment
                </h2>
                <form onSubmit={handleBookAppointment} className="space-y-3">
                  <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={appointmentForm.patientId} onChange={e => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })} required>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                  <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={appointmentForm.doctorId} onChange={handleDoctorChange} required>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}{d.consultationFee ? ` — Rs ${d.consultationFee.toLocaleString()}` : ''}</option>)}
                  </select>
                  {selectedDoctorFee && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm font-bold">
                      Doctor Fee: Rs {selectedDoctorFee.toLocaleString()}
                    </div>
                  )}
                  <div className="flex space-x-3">
                    <input type="date" className="w-1/2 p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" value={appointmentForm.date} onChange={e => setAppointmentForm({ ...appointmentForm, date: e.target.value })} required />
                    <input type="time" className="w-1/2 p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" value={appointmentForm.time} onChange={e => setAppointmentForm({ ...appointmentForm, time: e.target.value })} required />
                  </div>
                  <button type="submit" className="w-full bg-purple-600 text-white p-2.5 rounded-xl hover:bg-purple-700 font-semibold text-sm transition">
                    Book Appointment
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <h3 className="font-bold mb-4 text-gray-800 text-lg">All Appointments <span className="text-sm text-gray-400 font-normal">({appointments.length})</span></h3>
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {appointments.map(a => (
                    <div key={a._id} className="p-3 bg-gray-50 border-l-4 border-l-purple-500 rounded-xl flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{a.patientId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">Dr. {a.doctorId?.name || 'Unknown'}</p>
                        <p className="text-xs text-purple-600 font-medium mt-0.5">{a.date} at {a.time}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No appointments scheduled.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
