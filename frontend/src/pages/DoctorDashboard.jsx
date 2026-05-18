import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Calendar, FileText, Activity, Menu, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const DoctorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [symptomForm, setSymptomForm] = useState({ symptoms: '', age: '', gender: '', history: '' });
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ medicines: [], name: '', dosage: '', duration: '', instructions: '' });

  useEffect(() => { fetchAppointments(); }, []);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });

  const fetchAppointments = async () => {
    try { const res = await API.get('/api/appointments', getHeaders()); setAppointments(res.data); }
    catch (error) { console.error(error); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await API.put(`/api/appointments/${id}/status`, { status }, getHeaders()); fetchAppointments(); }
    catch (error) { console.error(error); }
  };

  const handleSymptomCheck = async (e) => {
    e.preventDefault(); setIsAiLoading(true);
    try {
      const res = await API.post('/api/ai/symptom-checker', { ...symptomForm, patientId: selectedAppointment.patientId._id }, getHeaders());
      setAiResponse(res.data);
    } catch (error) {
      const msg = error.response?.data?.message || 'AI analysis failed.';
      alert('⚠️ ' + msg);
    }
    setIsAiLoading(false);
  };

  const handleAddMedicine = () => {
    if (!prescriptionForm.name) return;
    setPrescriptionForm(prev => ({ ...prev, medicines: [...prev.medicines, { name: prev.name, dosage: prev.dosage, duration: prev.duration }], name: '', dosage: '', duration: '' }));
  };

  const handleSavePrescription = async () => {
    if (prescriptionForm.medicines.length === 0) { alert("Add at least one medicine."); return; }
    try {
      await API.post('/api/prescriptions', { patientId: selectedAppointment.patientId._id, appointmentId: selectedAppointment._id, medicines: prescriptionForm.medicines, instructions: prescriptionForm.instructions }, getHeaders());
      handleStatusUpdate(selectedAppointment._id, 'completed');
      alert('Prescription saved!');
      setSelectedAppointment(null);
      setPrescriptionForm({ medicines: [], name: '', dosage: '', duration: '', instructions: '' });
      setAiResponse(null);
      setSymptomForm({ symptoms: '', age: '', gender: '', history: '' });
    } catch { alert('Failed to save prescription'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-teal-900 flex-col h-screen sticky top-0 flex-shrink-0 p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-lg flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-xs truncate">NEXT GEN MED CLINIC</p>
            <p className="text-teal-400 text-xs">Doctor Portal</p>
          </div>
        </div>
        <nav className="flex-1">
          <button onClick={() => { setSelectedAppointment(null); }}
            className="w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg text-sm font-medium bg-teal-700 text-white">
            <Calendar size={18} /><span>Appointments</span>
          </button>
        </nav>
        {user?.consultationFee && (
          <p className="text-teal-400 text-xs mb-3 px-1">Fee: Rs {user.consultationFee.toLocaleString()}</p>
        )}
        <button onClick={handleLogout} className="flex items-center space-x-2 text-teal-300 hover:text-white py-2 px-4 text-sm">
          <LogOut size={18} /><span>Logout</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-teal-900 p-6 flex flex-col">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <Stethoscope size={16} className="text-white" />
              </div>
              <p className="text-white font-bold text-xs">NEXT GEN MED CLINIC</p>
            </div>
            <button onClick={() => { setSelectedAppointment(null); setSidebarOpen(false); }} className="w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg bg-teal-700 text-white text-sm font-medium">
              <Calendar size={18} /><span>Appointments</span>
            </button>
            <div className="mt-auto">
              <button onClick={handleLogout} className="flex items-center space-x-2 text-teal-300 py-2 px-4 text-sm">
                <LogOut size={18} /><span>Logout</span>
              </button>
            </div>
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
          {/* Welcome */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome, Dr. {user?.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">NEXT GEN MED CLINIC · Manage your appointments and consultations.</p>
            </div>
            {user?.consultationFee && (
              <div className="bg-teal-50 border border-teal-100 text-teal-700 px-4 py-2 rounded-xl text-sm font-bold">
                Consultation Fee: Rs {user.consultationFee.toLocaleString()}
              </div>
            )}
          </div>

          {/* Appointment List */}
          {!selectedAppointment && (
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Your Appointments</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointments.map(a => (
                  <div key={a._id} className="p-4 bg-gray-50 border border-teal-100 rounded-xl hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-sm">{a.patientId?.name || 'Unknown'}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3"><Calendar size={11} className="inline mr-1" />{a.date} at {a.time}</p>
                    {a.status !== 'completed' && (
                      <button onClick={() => setSelectedAppointment(a)} className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 text-sm font-semibold transition">
                        Start Consultation
                      </button>
                    )}
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <Calendar size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No appointments scheduled.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Consultation View */}
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-xl font-bold text-gray-800">Consulting: {selectedAppointment.patientId?.name}</h2>
                <button onClick={() => setSelectedAppointment(null)} className="text-sm text-teal-600 hover:underline">← Back</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Symptom Checker */}
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 text-teal-700 flex items-center"><Activity className="mr-2" size={18}/>AI Symptom Checker</h3>
                  <form onSubmit={handleSymptomCheck} className="space-y-3">
                    <div className="flex space-x-2">
                      <input type="number" placeholder="Age" className="w-1/2 p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" value={symptomForm.age} onChange={e => setSymptomForm({ ...symptomForm, age: e.target.value })} required />
                      <select className="w-1/2 p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white" value={symptomForm.gender} onChange={e => setSymptomForm({ ...symptomForm, gender: e.target.value })} required>
                        <option value="">Gender</option><option>Male</option><option>Female</option>
                      </select>
                    </div>
                    <textarea placeholder="Medical History" className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" rows="2" value={symptomForm.history} onChange={e => setSymptomForm({ ...symptomForm, history: e.target.value })} />
                    <textarea placeholder="Current Symptoms" className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" rows="3" value={symptomForm.symptoms} onChange={e => setSymptomForm({ ...symptomForm, symptoms: e.target.value })} required />
                    <button type="submit" disabled={isAiLoading} className="w-full bg-slate-800 text-white p-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 transition hover:bg-slate-700">
                      {isAiLoading ? 'Analyzing...' : 'Generate AI Insights'}
                    </button>
                  </form>
                  {aiResponse && (
                    <div className={`mt-4 p-4 border rounded-xl text-sm ${aiResponse.riskLevel === 'High' ? 'bg-red-50 border-red-200' : aiResponse.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                      <p className={`font-bold mb-2 ${aiResponse.riskLevel === 'High' ? 'text-red-700' : aiResponse.riskLevel === 'Medium' ? 'text-yellow-700' : 'text-green-700'}`}>Risk Level: {aiResponse.riskLevel}</p>
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">{aiResponse.aiResponse}</div>
                    </div>
                  )}
                </div>

                {/* Prescription Builder */}
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 text-teal-700 flex items-center"><FileText className="mr-2" size={18}/>Write Prescription</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <input type="text" placeholder="Medicine Name" className="flex-1 min-w-0 p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" value={prescriptionForm.name} onChange={e => setPrescriptionForm({ ...prescriptionForm, name: e.target.value })} />
                      <input type="text" placeholder="Dosage" className="w-20 p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" value={prescriptionForm.dosage} onChange={e => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })} />
                      <input type="text" placeholder="Duration" className="w-20 p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" value={prescriptionForm.duration} onChange={e => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })} />
                      <button onClick={handleAddMedicine} className="bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition">+</button>
                    </div>
                    {prescriptionForm.medicines.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-xl border">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Added Medicines</p>
                        {prescriptionForm.medicines.map((m, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                            <span className="font-medium">{m.name}</span>
                            <span className="text-gray-400 text-xs">{m.dosage} · {m.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea placeholder="Instructions / Notes" className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" rows="3" value={prescriptionForm.instructions} onChange={e => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })} />
                  </div>
                  <button onClick={handleSavePrescription} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition">
                    Save Prescription & Complete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
