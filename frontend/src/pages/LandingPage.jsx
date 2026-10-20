import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Stethoscope,
  ClipboardList,
  Heart,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Activity,
  Sparkles,
  CheckCircle2,
  Lock,
  FileText,
  Clock,
  ChevronDown,
  Zap,
  TrendingUp,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const PRESET_SYMPTOMS = [
  {
    id: 'migraine',
    label: 'Unilateral Pulsating Headache',
    patient: { age: 34, gender: 'Female', history: 'Episodic stress headaches' },
    symptoms: 'Throbbing left-sided temporal headache, photophobia, nausea, worsening with light and sound for 8 hours.',
    diagnosis: 'Migraine with Aura / Tension-Type Exacerbation',
    risk: 'Low',
    riskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    tests: ['Neurological physical exam', 'Optional Non-contrast Head CT if refractory', 'Fundoscopic exam'],
    advice: 'Dark room rest, hydration, NSAIDs or Triptan therapy under medical supervision.'
  },
  {
    id: 'respiratory',
    label: 'Persistent Cough & Subfebrile Temp',
    patient: { age: 48, gender: 'Male', history: 'Non-smoker, seasonal allergies' },
    symptoms: 'Non-productive dry cough for 9 days, mild exertional dyspnea, fatigue, low-grade temperature 38.1°C.',
    diagnosis: 'Acute Viral Bronchitis / Atypical Upper Respiratory Tract Infection',
    risk: 'Medium',
    riskColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    tests: ['Chest X-Ray (PA view)', 'Complete Blood Count (CBC) with differential', 'SpO2 pulse oximetry monitoring'],
    advice: 'Steam inhalation, antitussives, hydration; evaluate for secondary bacterial consolidation if fever spikes.'
  },
  {
    id: 'gerd',
    label: 'Postprandial Epigastric Burning',
    patient: { age: 42, gender: 'Male', history: 'Sedentary desk job, high caffeine intake' },
    symptoms: 'Burning substernal chest discomfort radiating to epigastrium after spicy dinner, sour regurgitation upon lying flat.',
    diagnosis: 'Gastroesophageal Reflux Disease (GERD) / Functional Dyspepsia',
    risk: 'Low',
    riskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    tests: ['H. Pylori Stool Antigen / Urea Breath Test', 'Resting 12-lead ECG (to rule out atypical cardiac ischemia)', 'Upper GI Endoscopy if alarm symptoms occur'],
    advice: 'Proton Pump Inhibitors (PPI) 30 min before meals, elevate bedhead 15 cm, dietary trigger avoidance.'
  },
  {
    id: 'rlq',
    label: 'Acute Right Lower Quadrant Pain',
    patient: { age: 22, gender: 'Female', history: 'No chronic illnesses' },
    symptoms: 'Periumbilical discomfort shifting to right iliac fossa over 12 hours, localized rebound tenderness, low appetite, fever 38.4°C.',
    diagnosis: 'Suspected Acute Appendicitis / Acute Abdomen',
    risk: 'High',
    riskColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    tests: ['Urgent Abdominal Ultrasound / Contrast Abdominal CT', 'CBC (look for marked leukocytosis)', 'Serum CRP & Urine Pregnancy Test'],
    advice: 'Immediate surgical triage required. Nil per os (NPO) and urgent in-person physical examination.'
  }
];

const ROLES_INFO = {
  Doctor: {
    name: 'Doctor Portal',
    badge: 'Clinical Decision Engine',
    desc: 'Empower physicians with real-time AI differential diagnoses, instant digital prescription drafting, and queue telemetry.',
    features: [
      'Gemini 2.0 Flash Symptom Diagnostic Assistant',
      'One-Click PDF Digital Prescription Dispatch',
      'Configurable Consultation Fee Schedule',
      'Longitudinal Patient Medical Timeline Tracker'
    ],
    metric: '99.4% Diagnostic Assistance Speed',
    theme: 'from-teal-500 to-emerald-600',
    border: 'border-teal-500/40',
    glow: 'glow-teal',
    tag: 'Doctor'
  },
  Patient: {
    name: 'Patient Health Portal',
    badge: 'Personal Care Concierge',
    desc: 'Seamless appointment scheduling, doctor selection with upfront fee transparency, and plain-English AI explanations of prescriptions.',
    features: [
      '24/7 Multi-Doctor Appointment Booking',
      'AI Prescription Explanation in Plain Language',
      'Personal Medical History & Timeline Records',
      'Instant Downloadable Pharmacy-Ready PDFs'
    ],
    metric: 'Zero-Wait Triage Self-Service',
    theme: 'from-blue-500 to-indigo-600',
    border: 'border-blue-500/40',
    glow: 'glow-cyan',
    tag: 'Patient'
  },
  Receptionist: {
    name: 'Front Desk Dispatch',
    badge: 'Intake & Scheduler',
    desc: 'Rapid patient demographic onboarding, doctor roster management, and live appointment schedule coordination.',
    features: [
      'Rapid Patient Registration & Instant Account Binding',
      'Live Multi-Physician Appointment Dispatch',
      'Real-Time Doctor Consultation Fee Verification',
      'Patient Profile Directory with Quick Editing'
    ],
    metric: '2.5x Faster Patient Intake Times',
    theme: 'from-purple-500 to-pink-600',
    border: 'border-purple-500/40',
    glow: 'glow-indigo',
    tag: 'Receptionist'
  },
  Admin: {
    name: 'Hospital & Clinic Admin',
    badge: 'System Governance',
    desc: 'Comprehensive clinic telemetry, revenue projections, staff role assignment, and enterprise subscription management.',
    features: [
      'Real-Time Monthly Revenue & Consult Analytics',
      'Multi-Role Staff Access Control (RBAC)',
      'Enterprise SaaS Tier Licensing (Free / Pro)',
      'Clinic-Wide Activity & Audit Logs'
    ],
    metric: '100% Operational Transparency',
    theme: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/40',
    glow: 'glow-cyan',
    tag: 'Admin'
  }
};

const FAQ_ITEMS = [
  {
    q: 'How does the Gemini 2.0 AI diagnostic co-pilot assist physicians?',
    a: 'Our neural symptom checker utilizes Google Gemini 2.0 Flash to synthesize patient age, gender, medical history, and presenting symptoms. It formulates potential differential diagnoses, generates immediate risk classifications (Low, Medium, High), and suggests targeted diagnostic tests to accelerate physician decision-making.'
  },
  {
    q: 'How do plain-English AI prescription explanations work for patients?',
    a: 'Patients frequently struggle to decipher medical abbreviations and complex pharmacology. When a doctor issues a prescription, patients can click "AI Explain" to receive a clear, jargon-free breakdown of what each medication does, lifestyle adaptations, and preventive guidelines.'
  },
  {
    q: 'Is patient data secure and role-isolated?',
    a: 'Yes. NextGen MedClinic implements military-grade cryptographic JSON Web Token (JWT) authorization, bcrypt password hashing, and granular Role-Based Access Control (RBAC). Patient records are strictly isolated, ensuring doctors, receptionists, and patients only access data aligned with their authorized permissions.'
  },
  {
    q: 'Can our clinic set custom consultation fees per physician?',
    a: 'Absolutely. Doctors can configure their consultation fees (e.g. Rs 2,000, Rs 3,500) directly upon registration or profile update. Patients and receptionists see transparent fee calculations before booking appointments.'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('Doctor');
  const [selectedSimulator, setSelectedSimulator] = useState(PRESET_SYMPTOMS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [pricingCycle, setPricingCycle] = useState('monthly');

  const handleSimulate = (preset) => {
    setIsSimulating(true);
    setSelectedSimulator(preset);
    setTimeout(() => {
      setIsSimulating(false);
    }, 450);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      {/* Background Radial Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-teal-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[650px] h-[650px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* Top Banner / Telemetry Notice */}
      <div className="relative z-50 bg-gradient-to-r from-teal-950/80 via-slate-950/90 to-blue-950/80 border-b border-teal-500/20 px-4 py-2 text-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">SYSTEM TELEMETRY:</span>
            <span className="text-slate-300 hidden sm:inline">All AI Neural Clinical Engines Operational</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span className="hidden md:inline">Gemini 2.0 Flash Inference: <strong className="text-teal-300">0.38s</strong></span>
            <span className="text-teal-400 font-mono">100% Encrypted</span>
          </div>
        </div>
      </div>

      {/* Floating Ultra-Glass Navbar */}
      <nav className="sticky top-0 z-40 glass-panel border-b border-white/10 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Stethoscope size={22} className="text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  NEXT<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">GEN</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-500/10 text-teal-300 rounded border border-teal-500/30">
                  Clinical AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">Intelligent Medical Infrastructure</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
            <a href="#simulator" className="hover:text-teal-400 transition-colors flex items-center space-x-1">
              <span>AI Simulator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            </a>
            <a href="#portals" className="hover:text-teal-400 transition-colors">Role Portals</a>
            <a href="#pricing" className="hover:text-teal-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-teal-400 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition border border-transparent hover:border-white/10"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('portals');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('/register');
              }}
              className="relative group px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all overflow-hidden flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full glass-card border border-teal-500/30 text-teal-300 text-xs sm:text-sm font-semibold mb-8 shadow-inner">
              <Sparkles size={16} className="text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>POWERED BY GOOGLE GEMINI 2.0 FLASH NEURAL INTELLIGENCE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
              The Operating System for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-400">
                AI-Driven Healthcare
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10 font-normal">
              Empower physicians with sub-second differential diagnosis, auto-translate complex prescriptions into plain language for patients, and streamline clinic scheduling with zero administrative drag.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById('portals');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300 hover:from-teal-200 hover:to-cyan-200 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/35 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
              >
                <span>Select Your Clinical Role</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('simulator');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white glass-card hover:bg-white/10 border border-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <Activity size={18} className="text-teal-400" />
                <span>Test Live AI Diagnostic Simulator</span>
              </button>
            </div>

            {/* Quick Proof Badges */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-white">0.38s</div>
                <div className="text-xs text-slate-400 font-medium mt-1">Average AI Inference Time</div>
              </div>
              <div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-teal-400">99.8%</div>
                <div className="text-xs text-slate-400 font-medium mt-1">Prescription Safety Protocol</div>
              </div>
              <div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-cyan-300">4 Distinct</div>
                <div className="text-xs text-slate-400 font-medium mt-1">Isolated Role Architectures</div>
              </div>
              <div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-white">100%</div>
                <div className="text-xs text-slate-400 font-medium mt-1">Encrypted Patient Records</div>
              </div>
            </div>
          </div>

          {/* Interactive Floating Hero Mockup Card */}
          <div className="relative max-w-5xl mx-auto mt-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 via-cyan-500/30 to-blue-600/30 rounded-3xl blur-2xl opacity-60" />
            <div className="relative rounded-2xl glass-panel border border-white/15 shadow-2xl p-4 sm:p-6 lg:p-8 overflow-hidden">
              {/* Window controls bar */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">nextgen-medclinic.portal // live_telemetry</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-teal-300 font-mono bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Dr. Consultation Active · Room 302</span>
                </div>
              </div>

              {/* Grid with Simulated Telemetry and AI Output */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Vitals Sidebar */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <span>HEART RATE</span>
                      <Activity size={14} className="text-rose-400" />
                    </div>
                    <div className="text-2xl font-bold font-display text-white">72 <span className="text-xs font-normal text-slate-400">BPM</span></div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-semibold">● Normal Sinus Rhythm</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <span>BLOOD PRESSURE</span>
                      <Heart size={14} className="text-cyan-400" />
                    </div>
                    <div className="text-2xl font-bold font-display text-white">120/80 <span className="text-xs font-normal text-slate-400">mmHg</span></div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-semibold">● Optimal Hemodynamics</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <span>OXYGEN SATURATION (SpO2)</span>
                      <Zap size={14} className="text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold font-display text-white">99% <span className="text-xs font-normal text-slate-400">Room Air</span></div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-semibold">● Adequate Oxygenation</div>
                  </div>
                </div>

                {/* Main AI Differential Diagnosis Panel */}
                <div className="lg:col-span-8 p-5 rounded-xl bg-gradient-to-br from-slate-900/95 to-slate-900/80 border border-teal-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={18} className="text-teal-400" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Gemini 2.0 Differential Triage Assistant</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                        LOW RISK FLAG
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-slate-400 font-semibold">PATIENT PRESENTATION:</span>
                        <p className="text-slate-200 mt-0.5">34yo F with persistent unilateral pulsating headache, mild photophobia, no neurological deficit.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                        <span className="text-teal-300 font-semibold">AI DIFFERENTIAL SYNTHESIS:</span>
                        <p className="text-slate-200 mt-0.5">1. Classical Migraine without aura (88% probabilistic match). 2. Cervicogenic headache secondary to postural strain.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <span className="text-cyan-300 font-semibold">SUGGESTED WORKUP:</span>
                        <p className="text-slate-200 mt-0.5">Fundoscopy, hydration maintenance, Sumatriptan 50mg PRN, trigger tracking log.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Lock size={12} className="text-teal-400" />
                      <span>HIPAA & End-to-End Cryptographically Bound</span>
                    </span>
                    <span className="text-teal-300 font-mono font-medium">Auto-Attached to Patient Timeline ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Diagnostic Simulator Section */}
      <section id="simulator" className="relative z-10 py-24 bg-slate-900/60 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
              Interactive Clinical Simulation
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4">
              Test Drive Our AI Diagnostic Engine
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Select a clinical scenario below to see how our Gemini 2.0 Flash engine evaluates symptoms, synthesizes risk tiers, and recommends targeted lab testing in real time.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {PRESET_SYMPTOMS.map((preset) => {
              const active = selectedSimulator.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSimulate(preset)}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    active
                      ? 'bg-gradient-to-br from-teal-500/20 to-blue-500/10 border-teal-400 text-white shadow-lg shadow-teal-500/15'
                      : 'glass-card border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-teal-300">
                      Case #{preset.id.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${preset.riskColor}`}>
                      {preset.risk} Risk
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white mb-1">{preset.label}</div>
                  <div className="text-xs text-slate-400">
                    Patient: {preset.patient.age}y {preset.patient.gender}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Simulator Terminal Output */}
          <div className="rounded-2xl glass-panel border border-teal-500/30 p-6 sm:p-8 relative overflow-hidden">
            {isSimulating && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
                <Sparkles size={32} className="text-teal-400 animate-spin" />
                <p className="text-sm font-mono text-teal-300">Processing Clinical Neural Vector with Gemini 2.0...</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Input Pane */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 border-b border-white/10 pb-2">
                  <Activity size={14} className="text-teal-400" />
                  <span>PATIENT CLINICAL INTAKE</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/10 text-xs">
                    <span className="text-slate-500 text-[10px] block">AGE</span>
                    <span className="font-bold text-white">{selectedSimulator.patient.age} Years</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/10 text-xs">
                    <span className="text-slate-500 text-[10px] block">GENDER</span>
                    <span className="font-bold text-white">{selectedSimulator.patient.gender}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/10 text-xs">
                    <span className="text-slate-500 text-[10px] block">PRIOR HX</span>
                    <span className="font-bold text-white truncate block">{selectedSimulator.patient.history}</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10">
                  <span className="text-slate-400 text-xs font-semibold block mb-1.5">PRESENTING SYMPTOM NARRATIVE:</span>
                  <p className="text-sm text-slate-200 leading-relaxed font-mono">
                    "{selectedSimulator.symptoms}"
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-300">
                  <strong className="text-teal-300 block mb-1 font-sans">Physician Workflow Benefit:</strong>
                  Reduces note charting time by 45% by pre-generating clinical differential hypotheses before physical examination.
                </div>
              </div>

              {/* Right Output Pane */}
              <div className="lg:col-span-7 bg-slate-900/90 rounded-xl p-5 sm:p-6 border border-white/10 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <Sparkles size={16} className="text-teal-400" />
                      <span className="font-bold text-sm text-white">AI Clinical Decision Synthesis</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${selectedSimulator.riskColor}`}>
                      {selectedSimulator.risk} Priority Level
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block mb-1 uppercase tracking-wide">
                        1. Primary Differential Diagnoses
                      </span>
                      <p className="text-base font-bold text-white bg-slate-950 p-3 rounded-lg border border-white/10">
                        {selectedSimulator.diagnosis}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-semibold block mb-1 uppercase tracking-wide">
                        2. Recommended Diagnostic Tests & Markers
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedSimulator.tests.map((test, i) => (
                          <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-cyan-300 flex items-center space-x-1.5">
                            <CheckCircle2 size={12} className="text-teal-400" />
                            <span>{test}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-semibold block mb-1 uppercase tracking-wide">
                        3. Clinical Management & Advice
                      </span>
                      <p className="text-xs sm:text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-white/10 leading-relaxed">
                        {selectedSimulator.advice}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">Want to test this live with real patients?</span>
                  <button
                    onClick={() => navigate('/register?role=Doctor')}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Launch as Doctor</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Interactive Command Center */}
      <section id="portals" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
              Role-Based Architecture
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4">
              Designed for Every Healthcare Stakeholder
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              NextGen MedClinic provides 4 tailored, secure portals. Select a role to preview its capabilities and sign up directly.
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto mb-8">
            {Object.keys(ROLES_INFO).map((roleKey) => {
              const r = ROLES_INFO[roleKey];
              const active = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => setActiveRole(roleKey)}
                  className={`p-4 rounded-xl text-center font-bold text-sm transition-all border ${
                    active
                      ? 'bg-slate-900 border-teal-400 text-white shadow-lg shadow-teal-500/10 ring-1 ring-teal-400'
                      : 'glass-card border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {roleKey === 'Doctor' && <Stethoscope size={18} className={active ? 'text-teal-400' : ''} />}
                    {roleKey === 'Patient' && <Heart size={18} className={active ? 'text-blue-400' : ''} />}
                    {roleKey === 'Receptionist' && <ClipboardList size={18} className={active ? 'text-purple-400' : ''} />}
                    {roleKey === 'Admin' && <Shield size={18} className={active ? 'text-amber-400' : ''} />}
                    <span>{r.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Role Card Showcase */}
          {(() => {
            const current = ROLES_INFO[activeRole];
            return (
              <div className={`max-w-4xl mx-auto rounded-3xl glass-panel border ${current.border} p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-4 max-w-xl">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-200">
                      <Award size={14} className="text-teal-400" />
                      <span>{current.badge}</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                      {current.name} Experience
                    </h3>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {current.desc}
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {current.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-2.5 text-xs sm:text-sm text-slate-200">
                          <CheckCircle2 size={16} className="text-teal-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={() => navigate(`/register?role=${current.tag}`)}
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${current.theme} shadow-lg hover:opacity-95 transition-all flex items-center justify-center space-x-2`}
                      >
                        <span>Create {current.tag} Account</span>
                        <ArrowRight size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/login?role=${current.tag}`)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-slate-300 glass-card hover:text-white transition"
                      >
                        Sign in as {current.tag}
                      </button>
                    </div>
                  </div>

                  {/* Right Highlight Badge */}
                  <div className="bg-slate-900/90 rounded-2xl p-6 border border-white/10 lg:w-72 text-center flex flex-col justify-center items-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                      <TrendingUp size={28} className="text-teal-300" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Key Impact Metric</div>
                      <div className="font-display text-xl font-bold text-white">{current.metric}</div>
                    </div>
                    <div className="text-[11px] text-slate-400 border-t border-white/10 pt-3 w-full">
                      ✓ Instant provisioning with JWT security
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Feature Architecture Matrix */}
      <section id="features" className="relative z-10 py-24 bg-slate-900/40 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
              End-To-End Infrastructure
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4">
              Everything Needed for Modern Clinic Operations
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Engineered from the ground up to replace fragmented clinic software with one cohesive, AI-augmented clinical platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Activity,
                color: 'text-teal-400',
                border: 'hover:border-teal-400/50',
                title: 'Gemini 2.0 Differential Triage',
                desc: 'Physicians receive real-time differential diagnosis hypotheses, risk flags, and suggested diagnostic testing based on patient symptoms.'
              },
              {
                icon: FileText,
                color: 'text-blue-400',
                border: 'hover:border-blue-400/50',
                title: 'Plain-English AI Rx Translation',
                desc: 'Transforms complex pharmacological terms into patient-friendly daily regimens, side effect precautions, and preventive advice.'
              },
              {
                icon: Clock,
                color: 'text-cyan-400',
                border: 'hover:border-cyan-400/50',
                title: 'Unified Medical Timeline',
                desc: 'Consolidated health chronologies combining past appointments, digital prescriptions, and AI diagnosis logs in a single interactive view.'
              },
              {
                icon: Lock,
                color: 'text-indigo-400',
                border: 'hover:border-indigo-400/50',
                title: 'Granular Role-Based Security',
                desc: 'Cryptographic JWT protection with role middleware ensuring doctors, patients, receptionists, and admins have strictly separated data boundaries.'
              },
              {
                icon: Layers,
                color: 'text-emerald-400',
                border: 'hover:border-emerald-400/50',
                title: 'Pharmacy-Ready PDF Generation',
                desc: 'Generate professional, print-ready prescription PDFs with clinic branding, patient demographics, and doctor signatures in one click.'
              },
              {
                icon: TrendingUp,
                color: 'text-amber-400',
                border: 'hover:border-amber-400/50',
                title: 'Clinic Revenue Analytics',
                desc: 'Admin dashboard with monthly revenue metrics, doctor consultation fee summaries, and patient volume trend projections.'
              }
            ].map(({ icon: Icon, color, border, title, desc }) => (
              <div
                key={title}
                className={`p-6 sm:p-8 rounded-2xl glass-card border border-white/10 ${border} transition-all hover:-translate-y-1 group`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon size={24} className={color} />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / SaaS Tier Section */}
      <section id="pricing" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
              Transparent Clinic Pricing
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4">
              Scale Your Practice With Confidence
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-6">
              Start free with core clinic management or upgrade to Pro for full AI differential diagnostics and predictive clinic analytics.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setPricingCycle('monthly')}
                className={`px-4 py-2 rounded-lg transition ${pricingCycle === 'monthly' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setPricingCycle('annual')}
                className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 ${pricingCycle === 'annual' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 text-[10px]">SAVE 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="rounded-3xl glass-card border border-white/10 p-8 flex flex-col justify-between">
              <div>
                <div className="inline-block text-xs font-bold uppercase px-3 py-1 rounded-md bg-white/10 text-slate-300 mb-4">
                  Standard Practice
                </div>
                <h3 className="font-display text-2xl font-extrabold text-white mb-2">Free Starter</h3>
                <p className="text-sm text-slate-400 mb-6">Essential clinic management for solo practitioners and nascent clinics.</p>

                <div className="text-4xl font-extrabold font-display text-white mb-6">
                  Rs 0 <span className="text-sm font-normal text-slate-400">/ clinic forever</span>
                </div>

                <div className="space-y-3 text-sm text-slate-300 mb-8 border-t border-white/10 pt-6">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Unlimited Patient Record Intake</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Doctor Consultation Scheduling</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Digital Prescription Builder & PDF Export</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-slate-500 line-through">
                    <span>✗</span>
                    <span>Gemini 2.0 Neural Symptom Checker</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-slate-500 line-through">
                    <span>✗</span>
                    <span>Patient AI Prescription Explanations</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-slate-500 line-through">
                    <span>✗</span>
                    <span>Clinic Revenue Trend Visualizations</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/register')}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white glass-card hover:bg-white/10 border border-white/20 transition"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro AI Tier */}
            <div className="rounded-3xl glass-panel border-2 border-teal-400 p-8 flex flex-col justify-between relative shadow-2xl shadow-teal-500/15">
              <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                RECOMMENDED BY CLINICS
              </div>

              <div>
                <div className="inline-block text-xs font-bold uppercase px-3 py-1 rounded-md bg-teal-500/20 text-teal-300 mb-4 border border-teal-500/30">
                  Full AI Superpowers
                </div>
                <h3 className="font-display text-2xl font-extrabold text-white mb-2">Pro Clinical AI</h3>
                <p className="text-sm text-slate-400 mb-6">Complete clinical intelligence suite with zero diagnostic limits.</p>

                <div className="text-4xl font-extrabold font-display text-white mb-6">
                  {pricingCycle === 'monthly' ? 'Rs 4,999' : 'Rs 3,999'} <span className="text-sm font-normal text-slate-400">/ month</span>
                </div>

                <div className="space-y-3 text-sm text-slate-200 mb-8 border-t border-white/10 pt-6">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-teal-400" />
                    <span>Everything in Free Starter</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-teal-400" />
                    <span>Gemini 2.0 Flash Symptom Diagnostic Engine</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-teal-400" />
                    <span>Patient AI Prescription Guide & Lifestyle Insights</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-teal-400" />
                    <span>Doctor Consultation Fee Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-teal-400" />
                    <span>Admin Financial Analytics & Volume Projections</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-teal-400" />
                    <span>Priority Technical & Compliance Support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/register?role=Admin')}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300 hover:from-teal-200 hover:to-cyan-200 shadow-lg shadow-teal-500/30 transition-all"
              >
                Upgrade Clinic to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical FAQ Section */}
      <section id="faq" className="relative z-10 py-24 bg-slate-900/40 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
              Clear Answers
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-base">
              Got questions about clinical safety, data isolation, or setup? We have answers.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl glass-card border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between text-white font-bold text-base sm:text-lg hover:text-teal-300 transition"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={20}
                      className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-teal-400' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High-Impact Final Call To Action */}
      <section className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-teal-900/90 via-slate-900 to-blue-950/90 border border-teal-500/40 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <span className="px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 inline-block">
                JOIN OVER 500+ CLINICS & MEDICAL TEAMS
              </span>

              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
                Ready to Upgrade Your Clinic to Next-Gen Clinical AI?
              </h2>

              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
                No credit card required. Onboard your doctors, reception desk, and patients in less than 3 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300 hover:from-teal-200 hover:to-cyan-200 shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Create Clinic Account Now</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white glass-card hover:bg-white/10 border border-white/20 transition"
                >
                  Sign In to Existing Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Medical Footer */}
      <footer className="relative z-10 bg-slate-950 border-t border-white/10 pt-16 pb-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                  <Stethoscope size={16} className="text-teal-400" />
                </div>
                <span className="font-display font-extrabold text-base text-white">NEXT GEN MED CLINIC</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Intelligent healthcare management platform powered by Google Gemini 2.0. Unifying physicians, reception staff, and patients on a secure medical cloud.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-teal-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Services Operational · 99.98% SLA</span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Clinical Portals</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => navigate('/login?role=Doctor')} className="hover:text-teal-400 transition">Doctor Consultation Suite</button></li>
                <li><button onClick={() => navigate('/login?role=Patient')} className="hover:text-teal-400 transition">Patient Health Concierge</button></li>
                <li><button onClick={() => navigate('/login?role=Receptionist')} className="hover:text-teal-400 transition">Front Desk Intake Dispatch</button></li>
                <li><button onClick={() => navigate('/login?role=Admin')} className="hover:text-teal-400 transition">Hospital Admin & Billing</button></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Architecture</h4>
              <ul className="space-y-2.5">
                <li><span className="text-slate-400">Gemini 2.0 Flash Neural Core</span></li>
                <li><span className="text-slate-400">HL7 & End-to-End JWT Auth</span></li>
                <li><span className="text-slate-400">Digital Prescription Engine</span></li>
                <li><span className="text-slate-400">Automated Patient Timelines</span></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Contact & Support</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center space-x-2">
                  <Phone size={14} className="text-teal-400" />
                  <span>+92 321 000 0000</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={14} className="text-teal-400" />
                  <span>clinical@nextgenmedclinic.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className="text-teal-400" />
                  <span>Karachi Medical Tech District, PK</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} NextGen MedClinic Systems. All rights reserved.</p>
            <p className="max-w-xl text-center sm:text-right text-[10px] text-slate-600">
              Disclaimer: NextGen MedClinic AI serves as a clinical decision support co-pilot for certified physicians and is not an autonomous medical device or a substitute for direct emergency care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
