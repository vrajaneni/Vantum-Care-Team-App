import React, { useState, useEffect } from 'react';
import MobileNav from './components/MobileNav';
import PatientQueue from './components/PatientQueue';
import PatientDetail from './components/PatientDetail';
import TelehealthRoom from './components/TelehealthRoom';
import Messaging from './components/Messaging';
import Billing from './components/Billing';
import RPM from './components/RPM';
import NuviaAssistant from './components/NuviaAssistant';
import ShiftSummary from './components/ShiftSummary';
import TelehealthModule from './components/TelehealthModule';
import PatientOnboarding from './components/PatientOnboarding';
import PatientEducation from './components/PatientEducation';
import Auth from './components/Auth';
import Labs from './components/Labs';
import Tasks from './components/Tasks';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import { MOCK_PATIENTS } from './constants';
import { Patient } from './types';
import Logo from './components/Logo';
import { 
  Bell, 
  Search, 
  Calendar as CalendarIcon, 
  Plus,
  Activity,
  TrendingUp,
  Users,
  Menu,
  Stethoscope,
  User as UserIcon,
  AlertCircle,
  Video,
  MessageSquare,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isTelehealthActive, setIsTelehealthActive] = useState(false);
  const [telehealthMode, setTelehealthMode] = useState<'B2B' | 'B2C'>('B2C');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleNuviaCommand = (e: any) => {
      const { name, args } = e.detail;
      console.log("App handling Nuvia command:", name, args);

      switch (name) {
        case 'start_shift':
          setActiveTab('shift-summary');
          // We can't easily trigger the 'start' button inside ShiftSummary from here 
          // without more complex state lifting, but navigating there is a good start.
          break;
        case 'show_patient':
          if (args.patientId) {
            setSelectedPatientId(args.patientId);
          } else if (args.patientName) {
            const patient = MOCK_PATIENTS.find(p => 
              p.name.toLowerCase().includes(args.patientName.toLowerCase())
            );
            if (patient) {
              setSelectedPatientId(patient.id);
              setActiveTab('patients');
            }
          }
          break;
        case 'show_history':
          setActiveTab('shift-summary');
          // Again, we'd need to tell ShiftSummary to show the history tab.
          // For now, navigating to the module is the primary action.
          break;
        case 'navigate_to':
          setActiveTab(args.module);
          setSelectedPatientId(null);
          setIsTelehealthActive(false);
          break;
        case 'explain_data':
          if (args.patientName) {
            const patient = MOCK_PATIENTS.find(p => 
              p.name.toLowerCase().includes(args.patientName.toLowerCase())
            );
            if (patient) {
              setSelectedPatientId(patient.id);
              setActiveTab('patients');
              // The assistant will handle the explanation via its own logic
            }
          }
          break;
        case 'add_clinical_note':
          const pNote = MOCK_PATIENTS.find(p => 
            p.name.toLowerCase().includes(args.patientName?.toLowerCase() || '')
          );
          if (pNote) {
            setSelectedPatientId(pNote.id);
            setActiveTab('patients');
            // In a real app, this would open a modal or update the patient's record
            console.log(`Adding note for ${pNote.name}: ${args.content}`);
            alert(`Note added for ${pNote.name}:\n${args.content}`);
          }
          break;
        case 'schedule_appointment':
          const pAppt = MOCK_PATIENTS.find(p => 
            p.name.toLowerCase().includes(args.patientName?.toLowerCase() || '')
          );
          if (pAppt) {
            setSelectedPatientId(pAppt.id);
            setActiveTab('patients');
            console.log(`Scheduling ${args.type} appointment for ${pAppt.name} on ${args.date}`);
            alert(`Scheduled ${args.type} appointment for ${pAppt.name} on ${args.date}`);
          }
          break;
        case 'add_medication':
          const pMed = MOCK_PATIENTS.find(p => 
            p.name.toLowerCase().includes(args.patientName?.toLowerCase() || '')
          );
          if (pMed) {
            setSelectedPatientId(pMed.id);
            setActiveTab('patients');
            console.log(`Adding medication for ${pMed.name}: ${args.name} ${args.dosage} ${args.frequency}`);
            alert(`Added medication for ${pMed.name}:\n${args.name} ${args.dosage} ${args.frequency}`);
          }
          break;
        case 'summarize_patient_history':
          const patientToSummarize = MOCK_PATIENTS.find(p => 
            p.name.toLowerCase().includes(args.patientName.toLowerCase())
          );
          if (patientToSummarize) {
            setSelectedPatientId(patientToSummarize.id);
            setActiveTab('patients');
          }
          break;
      }
    };

    window.addEventListener('nuvia-command', handleNuviaCommand);
    return () => window.removeEventListener('nuvia-command', handleNuviaCommand);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    // For demo, we'll skip onboarding if they just login
    setIsOnboarding(false);
  };

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedPatientId);

  const renderContent = () => {
    if (isTelehealthActive && selectedPatient) {
      return (
        <TelehealthRoom 
          patient={selectedPatient} 
          mode={telehealthMode}
          onEndCall={() => setIsTelehealthActive(false)} 
        />
      );
    }

    if (selectedPatientId && selectedPatient) {
      return (
        <PatientDetail 
          patient={selectedPatient} 
          onBack={() => setSelectedPatientId(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Quick Stats / Bento Grid Header */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active Patients', value: '24', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'patients' },
                { label: 'Pending Tasks', value: '12', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', tab: 'tasks' },
                { label: 'RPM Alerts', value: '5', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', tab: 'rpm' },
                { label: 'Billable Mins', value: '420', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', tab: 'billing' },
              ].map((stat, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(stat.tab as any)}
                  className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col gap-2 text-left hover:border-zinc-400 transition-all active:scale-95"
                >
                  <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-zinc-900 tracking-tight">{stat.value}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Actions Section */}
            <div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 ml-1">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'New Visit', icon: Video, bg: 'bg-zinc-900', text: 'text-white', action: () => setActiveTab('telehealth') },
                  { label: 'Add Patient', icon: Plus, bg: 'bg-white', text: 'text-zinc-900', action: () => setIsOnboarding(true) },
                  { label: 'Education', icon: BookOpen, bg: 'bg-white', text: 'text-zinc-900', action: () => setActiveTab('education') },
                  { label: 'Schedule', icon: CalendarIcon, bg: 'bg-white', text: 'text-zinc-900', action: () => setActiveTab('telehealth') },
                ].map((action, i) => (
                  <button 
                    key={i} 
                    onClick={action.action}
                    className={`flex flex-col items-center justify-center gap-2 p-4 ${action.bg} ${action.text} rounded-2xl border border-zinc-200 shadow-sm font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <action.icon className="w-5 h-5" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <PatientQueue onSelectPatient={(id) => setSelectedPatientId(id)} />
              </div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight">Today's Schedule</h3>
                    <CalendarIcon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="space-y-3">
                    {[
                      { time: '10:00 AM', patient: 'John Doe', type: 'Telehealth', status: 'Ready' },
                      { time: '11:30 AM', patient: 'Jane Smith', type: 'In-Person', status: 'Scheduled' },
                      { time: '02:00 PM', patient: 'Robert Wilson', type: 'Telehealth', status: 'Scheduled' },
                    ].map((apt, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          const p = MOCK_PATIENTS.find(p => p.name === apt.patient);
                          if (p) setSelectedPatientId(p.id);
                        }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:border-emerald-200 transition-all cursor-pointer"
                      >
                        <div className="text-center min-w-[50px]">
                          <p className="text-[10px] font-black text-zinc-900">{apt.time.split(' ')[0]}</p>
                          <p className="text-[8px] font-black text-zinc-400 uppercase">{apt.time.split(' ')[1]}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-zinc-900 text-sm truncate">{apt.patient}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">{apt.type}</p>
                        </div>
                        {apt.status === 'Ready' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const p = MOCK_PATIENTS.find(p => p.name === apt.patient);
                              if (p) {
                                setSelectedPatientId(p.id);
                                setTelehealthMode('B2C');
                                setIsTelehealthActive(true);
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                          >
                            JOIN
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950 p-6 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100" 
                          alt="Nuvia AI"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-tight leading-tight">Nuvia Insights</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Operational Intelligence</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div 
                        onClick={() => setActiveTab('rpm')}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group/item text-left w-full"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Risk Alert</p>
                          <AlertCircle className="w-3 h-3 text-orange-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-zinc-200 font-medium leading-relaxed">5 patients in RPM program showing signs of CHF worsening. Nuvia recommends immediate outreach.</p>
                        <div className="mt-3 flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveTab('rpm'); }}
                            className="px-3 py-1 bg-orange-400/20 text-orange-400 text-[8px] font-black uppercase rounded-lg border border-orange-400/20"
                          >
                            Review List
                          </button>
                        </div>
                      </div>
                      <div 
                        onClick={() => setActiveTab('billing')}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group/item text-left w-full"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Billing Tip</p>
                          <TrendingUp className="w-3 h-3 text-emerald-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-zinc-200 font-medium leading-relaxed">12 CCM patients are within 2 minutes of meeting 99490 requirements. Documentation is 95% complete.</p>
                        <div className="mt-3 flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveTab('billing'); }}
                            className="px-3 py-1 bg-emerald-400/20 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-400/20"
                          >
                            Finalize Notes
                          </button>
                        </div>
                      </div>
                      <div 
                        onClick={() => setActiveTab('labs')}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group/item text-left w-full"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Clinical Insight</p>
                          <Stethoscope className="w-3 h-3 text-blue-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-zinc-200 font-medium leading-relaxed">Recent lab results for John Doe indicate potential electrolyte imbalance. Correlate with RPM data.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'patients':
        return <PatientQueue onSelectPatient={(id) => setSelectedPatientId(id)} />;
      case 'telehealth':
        if (selectedPatientId) {
          const patient = MOCK_PATIENTS.find(p => p.id === selectedPatientId);
          if (patient) {
            return (
              <TelehealthRoom 
                patient={patient} 
                mode={telehealthMode}
                onEndCall={() => {
                  setSelectedPatientId(null);
                  setIsTelehealthActive(false);
                }} 
              />
            );
          }
        }
        return (
          <TelehealthModule 
            onStartVisit={(id, mode) => {
              setSelectedPatientId(id);
              setTelehealthMode(mode);
              setIsTelehealthActive(true);
            }} 
          />
        );
      case 'messages':
        return <Messaging />;
      case 'billing':
        return <Billing />;
      case 'labs':
        return <Labs />;
      case 'tasks':
        return <Tasks />;
      case 'rpm':
        return <RPM />;
      case 'nuvia':
        return <NuviaAssistant patient={selectedPatient} currentPage={activeTab} allPatients={MOCK_PATIENTS} isFullScreen />;
      case 'shift-summary':
        return <ShiftSummary />;
      case 'education':
        return <PatientEducation />;
      case 'profile':
        return <Profile user={user} onLogout={() => setIsAuthenticated(false)} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-400 px-6 text-center">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-base font-medium">Module under development</p>
            <p className="text-xs">This feature will be available in Phase 2 of the roadmap.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 font-sans text-zinc-900 overflow-hidden justify-center">
      {/* Mobile Container */}
      <div className="w-full max-w-[430px] h-full bg-zinc-50 relative overflow-hidden flex flex-col shadow-2xl sm:border-x sm:border-zinc-800">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <Logo className="w-20 h-20 mb-6" iconClassName="w-10 h-10" />
                <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Vantum Clinic</h1>
                <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-[0.3em]">AI Co-Pilot Care Journey</p>
              </motion.div>
              <div className="absolute bottom-12 w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-full h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isAuthenticated && !isLoading ? (
            <motion.div 
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <Auth onLogin={handleLogin} />
            </motion.div>
          ) : isAuthenticated && isOnboarding && !isLoading ? (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <PatientOnboarding onComplete={() => setIsOnboarding(false)} />
            </motion.div>
          ) : !isLoading ? (
            <motion.main 
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden relative"
            >
              {/* Header */}
              <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-zinc-200 px-4 flex items-center justify-between shrink-0 z-40 sticky top-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0">
                <Logo className="w-8 h-8" iconClassName="w-5 h-5" />
              </div>
              <div className="flex flex-col truncate">
                <h1 className="text-base font-black tracking-tight capitalize truncate leading-tight">
                  {user?.name || 'Dr. Richardson'}
                </h1>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                  {user?.role || 'Provider'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 border rounded-xl transition-all relative ${
                  showNotifications ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full right-0 z-50 w-80"
                  >
                    <Notifications onClose={() => setShowNotifications(false)} />
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={() => {
                  setActiveTab('profile');
                  setSelectedPatientId(null);
                  setIsTelehealthActive(false);
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg transition-all ${
                  activeTab === 'profile' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-zinc-900 text-white shadow-zinc-900/20'
                }`}
              >
                {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
              </button>
            </div>
          </header>

          {/* Content Area */}
          <div className={`flex-1 overflow-y-auto pb-24 no-scrollbar bg-zinc-50/50 ${
            activeTab === 'nuvia' || isTelehealthActive ? 'p-0' : 'p-4'
          }`}>
            <div className="w-full h-full">
              <div className={activeTab === 'nuvia' || isTelehealthActive ? 'h-full' : ''}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPatientId || activeTab || (isTelehealthActive ? 'tele' : 'main')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={activeTab === 'nuvia' || isTelehealthActive ? 'h-full' : ''}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

              {/* Mobile Bottom Navigation */}
              <MobileNav activeTab={activeTab} setActiveTab={(tab) => {
                setActiveTab(tab);
                setSelectedPatientId(null);
                setIsTelehealthActive(false);
              }} />
            </motion.main>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
