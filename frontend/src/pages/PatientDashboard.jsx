import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Calendar, FileText, Sparkles, Download, Clock, Menu, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import jsPDF from 'jspdf';

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [aiExplanation, setAiExplanation] = useState('');
  const [explainingId, setExplainingId] = useState(null);

  const [diagnoses, setDiagnoses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [appointmentForm, setAppointmentForm] = useState({ doctorId: '', date: '', time: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDoctorFee, setSelectedDoctorFee] = useState(null);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
  });

  const fetchPatientData = async () => {
    try {
      const appRes = await API.get('/api/appointments', getHeaders());
      setAppointments(appRes.data);

      const presRes = await API.get('/api/prescriptions', getHeaders());
      setPrescriptions(presRes.data);

      const diagRes = await API.get('/api/ai/diagnosis', getHeaders());
      setDiagnoses(diagRes.data);
      
      const docRes = await API.get('/api/auth/users?role=Doctor', getHeaders());
      setDoctors(docRes.data);

      // Build unified timeline
      const t = [];
      appRes.data.forEach(a => t.push({ id: a._id, type: 'Appointment', date: new Date(a.createdAt), displayDate: a.date, data: a }));
      presRes.data.forEach(p => t.push({ id: p._id, type: 'Prescription', date: new Date(p.createdAt), displayDate: new Date(p.createdAt).toLocaleDateString(), data: p }));
      diagRes.data.forEach(d => t.push({ id: d._id, type: 'Diagnosis', date: new Date(d.createdAt), displayDate: new Date(d.createdAt).toLocaleDateString(), data: d }));
      t.sort((a,b) => b.date - a.date);
      setTimeline(t);
    } catch (error) { console.error(error); }
  };

  const handleExplainPrescription = async (prescription) => {
    setExplainingId(prescription._id);
    try {
      const res = await API.post('/api/ai/explain-prescription', {
        instructions: prescription.instructions,
        medicines: prescription.medicines
      }, getHeaders());
      setAiExplanation(res.data.explanation);
    } catch (error) {
      alert('Failed to load AI explanation.');
    }
    setExplainingId(null);
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
      setAppointmentForm({ doctorId: '', date: '', time: '' });
      fetchPatientData();
      alert('Appointment booked successfully!');
    } catch (error) { alert('Failed to book appointment: ' + (error.response?.data?.message || error.message)); }
  };

  const handleDownloadPDF = (p) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text('AI Clinic Portal', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Prescription Details', 20, 35);
    
    doc.setFontSize(12);
    doc.text(`Patient: ${user?.name}`, 20, 45);
    doc.text(`Doctor: Dr. ${p.doctorId?.name || 'Unknown'}`, 20, 52);
    doc.text(`Date: ${new Date(p.createdAt).toLocaleDateString()}`, 20, 59);
    
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);
    
    doc.setFontSize(14);
    doc.text('Medicines:', 20, 75);
    
    let yPos = 85;
    doc.setFontSize(12);
    p.medicines.forEach((m, idx) => {
      doc.text(`${idx + 1}. ${m.name} - ${m.dosage} (${m.duration})`, 25, yPos);
      yPos += 8;
    });
    
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Instructions / Notes:', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(12);
    const splitNotes = doc.splitTextToSize(p.instructions || 'None', 170);
    doc.text(splitNotes, 20, yPos);
    
    doc.save(`Prescription_${p._id.substring(0,6)}.pdf`);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base text-gray-900">NEXT GEN MED CLINIC</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:block text-gray-600 text-sm font-medium">{user?.name}</span>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Health Dashboard</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <div onClick={() => setActiveTab('profile')} className={`bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4 cursor-pointer transition ${activeTab === 'profile' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100 hover:shadow-md'}`}>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><User size={24}/></div>
            <div>
              <h3 className="font-bold text-gray-900">My Profile</h3>
              <p className="text-sm text-gray-500">View and update details</p>
            </div>
          </div>
          
          <div onClick={() => setActiveTab('appointments')} className={`bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4 cursor-pointer transition ${activeTab === 'appointments' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100 hover:shadow-md'}`}>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Calendar size={24}/></div>
            <div>
              <h3 className="font-bold text-gray-900">Appointments</h3>
              <p className="text-sm text-gray-500">View upcoming visits</p>
            </div>
          </div>
          
          <div onClick={() => setActiveTab('prescriptions')} className={`bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4 cursor-pointer transition ${activeTab === 'prescriptions' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-100 hover:shadow-md'}`}>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><FileText size={24}/></div>
            <div>
              <h3 className="font-bold text-gray-900">Prescriptions</h3>
              <p className="text-sm text-gray-500">View AI insights</p>
            </div>
          </div>
          
          <div onClick={() => setActiveTab('timeline')} className={`bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4 cursor-pointer transition ${activeTab === 'timeline' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-100 hover:shadow-md'}`}>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Clock size={24}/></div>
            <div>
              <h3 className="font-bold text-gray-900">Medical Timeline</h3>
              <p className="text-sm text-gray-500">Full history tracker</p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
          {activeTab === 'appointments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Your Appointments</h2>
                <div className="space-y-4">
                  {appointments.map(a => (
                    <div key={a._id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">Consultation with Dr. {a.doctorId?.name || 'Unknown'}</p>
                        <p className="text-gray-500">{a.date} at {a.time}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="text-gray-500">No appointments found.</p>}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                <h2 className="text-base sm:text-xl font-bold mb-4 flex items-center"><Calendar className="mr-2 text-green-600" size={18}/> Book New Appointment</h2>
                <form onSubmit={handleBookAppointment} className="space-y-3">
                  <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-green-500" value={appointmentForm.doctorId} onChange={handleDoctorChange} required>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}{d.consultationFee ? ` — Rs ${d.consultationFee.toLocaleString()}` : ''}</option>)}
                  </select>
                  {selectedDoctorFee && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm font-bold">
                      Doctor Fee: Rs {selectedDoctorFee.toLocaleString()}
                    </div>
                  )}
                  <div className="flex space-x-3">
                    <input type="date" className="w-1/2 p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" value={appointmentForm.date} onChange={e => setAppointmentForm({ ...appointmentForm, date: e.target.value })} required />
                    <input type="time" className="w-1/2 p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" value={appointmentForm.time} onChange={e => setAppointmentForm({ ...appointmentForm, time: e.target.value })} required />
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 font-semibold text-sm transition">Book Now</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Prescriptions</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {prescriptions.map(p => (
                    <div key={p._id} className="p-4 border rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-lg">Dr. {p.doctorId?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">Issued on {new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => handleExplainPrescription(p)}
                          disabled={explainingId === p._id}
                          className="flex items-center space-x-1 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-200 transition font-medium"
                        >
                          <Sparkles size={14} /> <span>{explainingId === p._id ? 'Analyzing...' : 'AI Explain'}</span>
                        </button>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded mb-3 border border-gray-200">
                        <ul className="text-sm space-y-1">
                          {p.medicines.map((m, idx) => (
                            <li key={idx} className="font-medium">• {m.name} <span className="text-gray-500 font-normal ml-2">- {m.dosage} ({m.duration})</span></li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-gray-700"><strong>Notes:</strong> {p.instructions}</p>
                      
                      <button onClick={() => handleDownloadPDF(p)} className="mt-4 flex items-center space-x-1 text-blue-600 text-sm hover:underline font-bold">
                        <Download size={16} /> <span>Download Prescription PDF</span>
                      </button>
                    </div>
                  ))}
                  {prescriptions.length === 0 && <p className="text-gray-500">No prescriptions found.</p>}
                </div>

                <div>
                  {aiExplanation ? (
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl shadow-sm sticky top-6">
                      <h3 className="font-bold text-purple-800 mb-4 flex items-center text-lg"><Sparkles className="mr-2"/> AI Prescription Guide</h3>
                      <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {aiExplanation}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-center bg-gray-50">
                      <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-purple-400">
                        <Sparkles size={32} />
                      </div>
                      <p className="text-gray-500 max-w-xs">Click "AI Explain" on any prescription to get a simple, easy-to-understand breakdown of your medicines and lifestyle tips.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Medical History Timeline</h2>
              <div className="relative border-l-2 border-indigo-200 ml-4 space-y-8 pb-4">
                {timeline.map((item, index) => (
                  <div key={`${item.type}-${item.id}`} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${item.type === 'Appointment' ? 'bg-green-500' : item.type === 'Prescription' ? 'bg-purple-500' : 'bg-red-500'}`}></div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${item.type === 'Appointment' ? 'bg-green-50 text-green-700' : item.type === 'Prescription' ? 'bg-purple-50 text-purple-700' : 'bg-red-50 text-red-700'}`}>
                          {item.type}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">{item.displayDate}</span>
                      </div>
                      
                      {item.type === 'Appointment' && (
                        <div>
                          <p className="font-bold text-gray-800">Appointment with Dr. {item.data.doctorId?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">Status: {item.data.status}</p>
                        </div>
                      )}
                      
                      {item.type === 'Diagnosis' && (
                        <div>
                          <p className="font-bold text-gray-800">Diagnosis Recorded</p>
                          <p className="text-sm text-gray-600"><strong>Symptoms:</strong> {item.data.symptoms}</p>
                          <p className="text-sm mt-1"><strong className={`${item.data.riskLevel === 'High' ? 'text-red-600' : 'text-gray-600'}`}>AI Risk Flag:</strong> {item.data.riskLevel}</p>
                        </div>
                      )}

                      {item.type === 'Prescription' && (
                        <div>
                          <p className="font-bold text-gray-800">Prescription Issued by Dr. {item.data.doctorId?.name || 'Unknown'}</p>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.data.medicines.map((m, i) => <span key={i} className="mr-2 border bg-gray-50 px-1 rounded">{m.name}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && <p className="pl-6 text-gray-500">No medical history available.</p>}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Account Details</h2>
              <div className="max-w-md bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                <p className="mb-3 border-b pb-2"><span className="font-bold w-24 inline-block text-gray-700">Name:</span> {user?.name}</p>
                <p className="mb-3 border-b pb-2"><span className="font-bold w-24 inline-block text-gray-700">Email:</span> {user?.email}</p>
                <p className="mb-3 border-b pb-2"><span className="font-bold w-24 inline-block text-gray-700">Role:</span> {user?.role}</p>
                <p><span className="font-bold w-24 inline-block text-gray-700">Plan:</span> <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-sm font-bold uppercase">{user?.subscriptionPlan}</span></p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
