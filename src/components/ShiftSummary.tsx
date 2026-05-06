import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, CheckCircle2, Clock, AlertCircle, 
  TrendingUp, Users, Sparkles, Shield, Lock,
  ChevronRight, FileText, Zap, Play, StopCircle, 
  Search, Filter, Calendar, ArrowRight, MessageSquare,
  Activity, BarChart3, Download, Share2, Edit3, Mic,
  User, ChevronDown, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ShiftStatus = 'not_started' | 'active' | 'review' | 'completed';
type ShiftTab = 'current' | 'history';

const ShiftSummary: React.FC = () => {
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>('active');
  const [activeTab, setActiveTab] = useState<ShiftTab>('current');
  const [shiftType, setShiftType] = useState<string>('Nursing Shift');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [showNuviaReminder, setShowNuviaReminder] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [showHandoffNotification, setShowHandoffNotification] = useState(false);
  const [confirmedPanel, setConfirmedPanel] = useState(false);
  const [historyViewMode, setHistoryViewMode] = useState<'day' | 'user' | 'patient'>('day');
  const [isSigned, setIsSigned] = useState(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [showEndShiftConfirmation, setShowEndShiftConfirmation] = useState(false);
  const [shiftOverview, setShiftOverview] = useState<string>(
    "Overall productive shift. Managed 14 patients with a focus on high-risk CHF and Diabetes cases. Successfully addressed 2 critical RPM alerts and adjusted medications for 3 patients. All CMS documentation for the period is up to date."
  );
  
  // History Filter States
  const [historySearch, setHistorySearch] = useState('');
  const [historyDept, setHistoryDept] = useState('All Departments');
  const [historyDateFilter, setHistoryDateFilter] = useState('');

  // Handoff Intelligence State
  const [handoffStep, setHandoffStep] = useState<'options' | 'ai_brief' | 'recording' | 'confirm'>('options');
  const [handoffNotes, setHandoffNotes] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiBriefContent, setAiBriefContent] = useState<string>(
    "Shift Overview: 14 patients seen, 8 visits completed. High-priority handoff for John Doe (Weight +3lbs, BP 148/92) and Sarah Jenkins (Medication adjusted). 3 pending tasks: John Doe follow-up, Sarah Jenkins lab review, RPM non-adherence follow-up."
  );

  const activities = [
    { time: '04:30 PM', action: 'Completed Telehealth visit with John Doe', duration: '15m', type: 'Telehealth', status: 'success' },
    { time: '03:15 PM', action: 'Reviewed lab results for Sarah Jenkins', duration: '5m', type: 'Chart Review', status: 'info' },
    { time: '02:00 PM', action: 'RPM Alert: High BP detected for Robert Wilson', duration: '10m', type: 'Alert Response', status: 'warning' },
    { time: '01:30 PM', action: 'Updated care plan for Jane Smith', duration: '8m', type: 'Care Plan', status: 'success' },
    { time: '12:45 PM', action: 'Medication Reconciliation: Sarah Jenkins', duration: '12m', type: 'Med Rec', status: 'success' },
    { time: '11:00 AM', action: 'CCM Program Tracking: 22 mins logged', duration: '22m', type: 'CMS Tracking', status: 'success' },
  ];

  const patientSummaries = [
    { 
      name: 'John Doe', 
      conditions: 'CHF, HTN', 
      updates: 'Weight trending upward (+3lbs). BP 148/92.', 
      cms: 'CCM: 18/20m', 
      status: 'High Risk',
      riskFlags: ['Weight Trending Upward', 'BP Elevated'],
      keyUpdates: 'Patient reported increased shortness of breath. Diuretic dose may need adjustment.'
    },
    { 
      name: 'Sarah Jenkins', 
      conditions: 'Type 2 Diabetes', 
      updates: 'A1C reviewed. Medication adjusted.', 
      cms: 'RPM: 15/20m', 
      status: 'Stable',
      riskFlags: [],
      keyUpdates: 'Metformin increased to 1000mg BID. Patient educated on new regimen.'
    },
    { 
      name: 'Robert Wilson', 
      conditions: 'COPD', 
      updates: 'Oxygen saturation stable at 94%.', 
      cms: 'CCM: 22/20m', 
      status: 'Threshold Met',
      riskFlags: ['Smoker'],
      keyUpdates: 'Stable on current home oxygen. Encouraged smoking cessation.'
    },
  ];

  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [suggestedTasks, setSuggestedTasks] = useState([
    { task: 'Schedule follow-up weight check: John Doe', dueDate: '02-26-2026', reason: 'Weight trending upward (+3lbs)' },
    { task: 'Review A1C trends: Sarah Jenkins', dueDate: '02-27-2026', reason: 'Medication adjusted' }
  ]);

  const [editableSummaries, setEditableSummaries] = useState(patientSummaries);

  // Simulate Nuvia reminder after 5 seconds for demo purposes
  useEffect(() => {
    if (shiftStatus === 'active') {
      const timer = setTimeout(() => {
        setShowNuviaReminder(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shiftStatus]);

  const stats = [
    { label: 'Patients Seen', value: '14', icon: Users, color: 'text-blue-500' },
    { label: 'Visits Completed', value: '8', icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Pending Notes', value: '3', icon: Clock, color: 'text-orange-500' },
    { label: 'Critical Alerts', value: '2', icon: AlertCircle, color: 'text-red-500' },
  ];

  const historyData = [
    { date: 'Feb 23, 2026', type: 'Day Shift', patients: 12, mins: 145, revenue: '$1,240', status: 'Finalized' },
    { date: 'Feb 22, 2026', type: 'Night Shift', patients: 8, mins: 90, revenue: '$850', status: 'Finalized' },
    { date: 'Feb 21, 2026', type: 'Weekend Shift', patients: 15, mins: 180, revenue: '$1,600', status: 'Finalized' },
  ];

  const renderNotStarted = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="bg-zinc-950 p-12 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600&h=600" 
            alt="Nuvia AI"
            className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200" 
                alt="Nuvia AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">Shift Initialization</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">Nuvia Care Team Co-Pilot</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Shift Type</p>
              <div className="grid grid-cols-1 gap-3">
                {['Nursing Shift', 'Provider On-Call', 'RPM Monitoring', 'Behavioral Health'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setShiftType(type)}
                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                      shiftType === type ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-bold text-sm">{type}</span>
                    {shiftType === type && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-lg">Nuvia Pre-Shift Briefing</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>3 High-risk patients identified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>5 Pending tasks from previous shift</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>8 Patients near CMS threshold</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Assigned Panel Confirmation</p>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-300">Team Alpha • 24 Patients</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={confirmedPanel}
                    onChange={(e) => setConfirmedPanel(e.target.checked)}
                    className="w-5 h-5 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShiftStatus('active')}
            disabled={!confirmedPanel}
            className="w-full py-6 bg-white text-zinc-950 rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-6 h-6 fill-current" />
            Start Shift
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderActive = () => (
    <div className="space-y-6">
      <div className="bg-zinc-950 p-8 rounded-[32px] text-white relative overflow-hidden shadow-2xl group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Active Shift: {shiftType}</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Started at 08:00 AM • Dr. Richardson</p>
            </div>
          </div>
          <button 
            onClick={() => setShowEndShiftConfirmation(true)}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-red-500/20"
          >
            <StopCircle className="w-5 h-5" />
            End Shift
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showNuviaReminder && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-lg"
          >
            <div className="bg-zinc-900 border border-emerald-500/30 p-6 rounded-[32px] shadow-2xl shadow-emerald-500/20 flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt="Nuvia AI"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Shift Ending Soon</h4>
                <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                  Nuvia: "I've prepared your shift summary. Would you like to review and finalize it now?"
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setShowNuviaReminder(false);
                    setShiftStatus('review');
                  }}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all"
                >
                  Review
                </button>
                <button 
                  onClick={() => setShowNuviaReminder(false)}
                  className="px-4 py-2 bg-white/5 text-zinc-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEndShiftConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <StopCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-4">End Your Shift?</h3>
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=50&h=50" 
                        alt="Nuvia AI"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Nuvia Analysis</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "I've analyzed your 6 activities today. You've met CMS thresholds for 8 patients and addressed 2 critical alerts. I've prepared a summary highlighting the CHF weight trends for John Doe."
                  </p>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  Would you like to review and finalize your shift summary now?
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => {
                      setShiftStatus('review');
                      setIsEditingSummary(false);
                      setShowEndShiftConfirmation(false);
                    }}
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Review
                  </button>
                  <button 
                    onClick={() => {
                      setShiftStatus('review');
                      setIsEditingSummary(true);
                      setShowEndShiftConfirmation(false);
                    }}
                    className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Summary
                  </button>
                  <button 
                    onClick={() => setShowEndShiftConfirmation(false)}
                    className="w-full py-4 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Real-Time Activity Capture</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nuvia Tracking Active</span>
              </div>
            </div>
            <div className="space-y-6">
              {activities.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      item.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                      item.status === 'warning' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {item.type === 'Telehealth' ? <Users className="w-5 h-5" /> :
                       item.type === 'Chart Review' ? <Search className="w-5 h-5" /> :
                       item.type === 'Alert Response' ? <AlertCircle className="w-5 h-5" /> :
                       item.type === 'Care Plan' ? <ClipboardList className="w-5 h-5" /> :
                       item.type === 'Med Rec' ? <Shield className="w-5 h-5" /> :
                       <Activity className="w-5 h-5" />}
                    </div>
                    {i !== activities.length - 1 && <div className="w-px flex-1 bg-zinc-100 my-2" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.time}</p>
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">{item.duration}</span>
                    </div>
                    <p className="text-zinc-800 font-bold text-sm">{item.action}</p>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{item.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-500 p-8 rounded-[32px] text-white shadow-xl shadow-emerald-500/20">
            <TrendingUp className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-bold mb-2 tracking-tight">Live Productivity</h3>
            <p className="text-4xl font-black mb-4">94%</p>
            <p className="text-sm font-medium text-emerald-100 leading-relaxed">
              You are performing 12% above your average shift productivity. Nuvia assisted in 65% of documentation tasks.
            </p>
          </div>

          <div className="bg-zinc-900 p-8 rounded-[32px] text-white shadow-xl">
            <BarChart3 className="w-8 h-8 mb-4 text-emerald-500" />
            <h3 className="text-xl font-bold mb-4 tracking-tight">CMS Minutes</h3>
            <div className="space-y-4">
              {[
                { label: 'CCM', current: 145, target: 200 },
                { label: 'RPM', current: 85, target: 100 },
                { label: 'BHI', current: 40, target: 60 },
              ].map(prog => (
                <div key={prog.label}>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                    <span className="text-zinc-500">{prog.label}</span>
                    <span className="text-emerald-500">{prog.current} / {prog.target}m</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(prog.current/prog.target)*100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-24"
    >
      <div className="bg-zinc-950 p-12 rounded-[48px] text-white relative overflow-hidden shadow-2xl group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
          <img 
            src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400" 
            alt="Nuvia AI"
            className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl shadow-emerald-500/20">
                <img 
                  src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt="Nuvia AI"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-1">Nuvia Shift Summary</h2>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Clinical Intelligence Report</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Analysis Active</span>
            </div>
          </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditingSummary(!isEditingSummary)}
                className={`p-3 border rounded-xl transition-colors ${isEditingSummary ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'}`}
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Shift Duration', value: '8h 15m', icon: Clock },
              { label: 'Interactions', value: '24', icon: Users },
              { label: 'CMS Minutes', value: '270m', icon: Activity },
              { label: 'Escalations', value: '3', icon: AlertCircle },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <stat.icon className="w-5 h-5 mb-4 text-emerald-500" />
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Shift Overview Section */}
          <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">Shift Overview</h3>
              {!isEditingSummary && (
                <button 
                  onClick={() => setIsEditingSummary(true)}
                  className="flex items-center gap-2 text-emerald-600 font-bold text-xs hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Summary
                </button>
              )}
            </div>
            {isEditingSummary ? (
              <textarea 
                value={shiftOverview}
                onChange={(e) => setShiftOverview(e.target.value)}
                className="w-full p-6 bg-zinc-50 border border-zinc-200 rounded-3xl text-sm text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[120px]"
                rows={4}
              />
            ) : (
              <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                {shiftOverview}
              </p>
            )}
          </div>

          {/* Patient Level Summary */}
          <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm">
            <h3 className="text-xl font-black text-zinc-900 mb-6 tracking-tight">Patient-Level Summary</h3>
            <div className="space-y-4">
              {editableSummaries.map((p, i) => {
                const isExpanded = expandedPatient === p.name;
                return (
                  <div 
                    key={i} 
                    onClick={() => !isEditingSummary && setExpandedPatient(isExpanded ? null : p.name)}
                    className={`p-6 bg-zinc-50 rounded-3xl border transition-all group cursor-pointer ${
                      isExpanded ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-lg' : 'border-zinc-100 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          p.status === 'High Risk' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900">{p.name}</h4>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{p.conditions}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          p.status === 'High Risk' ? 'bg-red-100 text-red-700' : 
                          p.status === 'Threshold Met' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {p.status}
                        </span>
                        {!isEditingSummary && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="text-zinc-400"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {isEditingSummary ? (
                      <textarea 
                        value={p.updates}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const newSummaries = [...editableSummaries];
                          newSummaries[i].updates = e.target.value;
                          setEditableSummaries(newSummaries);
                        }}
                        className="w-full p-4 bg-white border border-zinc-200 rounded-2xl text-sm text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-4"
                        rows={3}
                      />
                    ) : (
                      <>
                        <p className="text-sm text-zinc-600 mb-4 leading-relaxed">{p.updates}</p>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 border-t border-zinc-200/50 space-y-4">
                                {/* Risk Flags */}
                                {p.riskFlags && p.riskFlags.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Risk Flags</p>
                                    <div className="flex flex-wrap gap-2">
                                      {p.riskFlags.map((flag: string, fi: number) => (
                                        <span key={fi} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                          {flag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Key Updates */}
                                <div className="p-4 bg-white border border-zinc-100 rounded-2xl">
                                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Key Updates</p>
                                  <p className="text-xs text-zinc-600 leading-relaxed italic">
                                    {p.keyUpdates || 'No critical updates for this shift.'}
                                  </p>
                                </div>

                                {/* CMS Minutes Logged */}
                                <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">CMS Minutes Logged</span>
                                  </div>
                                  <span className="text-sm font-black text-emerald-700">{p.cms}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                    
                    {!isExpanded && !isEditingSummary && (
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-200/50">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{p.cms}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Click to expand</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CMS Billing Summary */}
          <div className="bg-zinc-900 p-8 rounded-[40px] text-white shadow-xl border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight mb-1">CMS Billing Summary</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Compliance & Reimbursement Tracking</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Validated</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { prog: 'CCM', mins: '22 min', target: '20 min', status: 'Yes', desc: 'Chronic Care Management' },
                { prog: 'RPM', mins: '18 min', target: '20 min', status: 'No', desc: 'Remote Patient Monitoring' },
                { prog: 'BHI', mins: '10 min', target: '20 min', status: 'No', desc: 'Behavioral Health Integration' },
                { prog: 'APCM', mins: 'Activity', target: 'Tier 2', status: 'In Progress', desc: 'Principal Care Management' },
              ].map((row, i) => (
                <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group/row">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-black text-base tracking-tight">{row.prog}</span>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{row.desc}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      row.status === 'Yes' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                      row.status === 'No' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      {row.status === 'Yes' ? 'Ready to Bill' : row.status === 'No' ? 'Ineligible' : 'Review Needed'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Minutes</p>
                      <p className="text-sm font-bold text-zinc-200">{row.mins}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Target</p>
                      <p className="text-sm font-bold text-zinc-400">{row.target}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Status</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${
                        row.status === 'Yes' ? 'text-emerald-400' : 
                        row.status === 'No' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {row.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-black text-zinc-900 mb-6 tracking-tight">Risk & Escalations</h3>
            <div className="space-y-4">
              {[
                { label: 'High-Risk Patients', count: 3, color: 'bg-red-500' },
                { label: 'ER Recommendations', count: 1, color: 'bg-orange-500' },
                { label: 'Medication Changes', count: 2, color: 'bg-blue-500' },
              ].map((risk, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${risk.color}`} />
                    <span className="text-xs font-bold text-zinc-700">{risk.label}</span>
                  </div>
                  <span className="font-black text-zinc-900">{risk.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">Pending Handoff</h3>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">3 Items</span>
            </div>
            <div className="space-y-4">
              {[
                { task: 'Follow-up call: John Doe', dueDate: '02-27-2026' },
                { task: 'Review Labs: Sarah Jenkins', dueDate: '02-27-2026' },
                { task: 'RPM Non-adherence follow-up', dueDate: '02-27-2026' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-zinc-700">{item.task}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-7">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Due: {item.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Nuvia Suggested Tasks */}
            <div className="mt-10 pt-10 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center overflow-hidden border border-emerald-500/20">
                    <img 
                      src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100" 
                      alt="Nuvia AI"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.15em]">Nuvia Suggested Tasks</h4>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">AI Care Optimization</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{suggestedTasks.length} Suggestions</span>
                </div>
              </div>
              <div className="space-y-4">
                {suggestedTasks.map((item, i) => (
                  <div key={i} className="p-5 bg-zinc-50 border border-zinc-100 rounded-[24px] group hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-sm font-black text-zinc-900 tracking-tight">{item.task}</span>
                      </div>
                      <button className="p-2 bg-emerald-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-emerald-500/20">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="ml-11 space-y-3">
                      <div className="p-3 bg-white border border-zinc-100 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Clinical Rationale</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed italic">"{item.reason}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Suggested Due: {item.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {handoffNotes && (
            <div className="bg-emerald-50 p-10 rounded-[40px] border border-emerald-100 shadow-sm relative overflow-hidden group/handoff">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/handoff:opacity-10 transition-opacity">
                <FileText className="w-32 h-32 text-emerald-900" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100" 
                      alt="Nuvia AI"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-emerald-900 tracking-tight">Nuvia Handoff Notes</h3>
                    <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">AI-Synthesized Briefing</p>
                  </div>
                </div>
                <div className="p-6 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-3xl shadow-sm">
                  <p className="text-sm text-emerald-900 leading-relaxed font-medium italic">
                    "{handoffNotes}"
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-zinc-950 p-8 rounded-[40px] text-white shadow-2xl">
            <h3 className="text-lg font-black mb-6 tracking-tight">Finalize & Handoff</h3>
            <div className="space-y-4">
              {!isConfirmed ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Mandatory Confirmation</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      By approving, you confirm this summary is accurate. It will be timestamped and digitally signed.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsConfirmed(true);
                      setIsSigned(true);
                      setAuditLog(prev => [...prev, `Shift finalized and signed at ${new Date().toLocaleTimeString()}`]);
                    }}
                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
                  >
                    <Lock className="w-4 h-4" />
                    Sign & Approve
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-full py-5 bg-white/10 text-emerald-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    Digitally Signed
                  </div>
                  <button 
                    onClick={() => setShowHandoffModal(true)}
                    className="w-full py-5 bg-white text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Next Shift Handoff
                  </button>
                </div>
              )}
              <button className="w-full py-5 bg-white/5 text-zinc-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                Save as Draft
              </button>
              <button 
                onClick={() => setShiftStatus('active')}
                className="w-full py-5 text-red-400 font-bold text-xs uppercase tracking-widest hover:text-red-300 transition-colors"
              >
                Discard & Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Handoff Modal */}
      <AnimatePresence>
        {showHandoffModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-zinc-950 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <MessageSquare className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200" 
                      alt="Nuvia AI"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Nuvia Handoff Intelligence</h3>
                </div>

                {handoffStep === 'options' && (
                  <div className="space-y-8">
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      "I've prepared a structured verbal briefing for the incoming shift. Would you like to review the AI brief or record a custom handoff?"
                    </p>
                    <div className="space-y-4">
                      <button 
                        onClick={() => setHandoffStep('ai_brief')}
                        className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                      >
                        <Zap className="w-4 h-4" />
                        Review AI Verbal Briefing
                      </button>
                      <button 
                        onClick={() => setHandoffStep('recording')}
                        className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                      >
                        <Mic className="w-4 h-4" />
                        Record Custom Handoff
                      </button>
                      <button 
                        onClick={() => {
                          setShowHandoffModal(false);
                          setShiftStatus('completed');
                        }}
                        className="w-full py-5 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Skip & Exit
                      </button>
                    </div>
                  </div>
                )}

                {handoffStep === 'ai_brief' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl relative group">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Generated Verbal Briefing</p>
                        <button className="p-2 bg-emerald-500/20 text-emerald-500 rounded-full hover:bg-emerald-500/30 transition-all">
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                      <textarea 
                        value={aiBriefContent}
                        onChange={(e) => setAiBriefContent(e.target.value)}
                        className="w-full bg-transparent text-sm text-zinc-300 leading-relaxed focus:outline-none min-h-[150px] resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setHandoffStep('options')}
                        className="flex-1 py-4 bg-white/5 text-zinc-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => {
                          setHandoffNotes(aiBriefContent);
                          setHandoffStep('confirm');
                        }}
                        className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                      >
                        Confirm Briefing
                      </button>
                    </div>
                  </div>
                )}

                {handoffStep === 'recording' && (
                  <div className="space-y-8 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-zinc-800'}`}>
                        <Mic className={`w-10 h-10 ${isRecording ? 'text-white' : 'text-zinc-500'}`} />
                      </div>
                      <p className="mt-6 text-sm font-bold text-zinc-300">
                        {isRecording ? "Recording handoff..." : "Ready to record"}
                      </p>
                      {isRecording && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2">00:12 / 01:00</p>}
                    </div>
                    <div className="space-y-4">
                      {!isRecording ? (
                        <button 
                          onClick={() => setIsRecording(true)}
                          className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
                        >
                          Start Recording
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setIsRecording(false);
                            setHandoffNotes("Custom voice handoff recorded. Duration: 45s. Summary: Patient John Doe stable, Sarah Jenkins meds adjusted.");
                            setHandoffStep('confirm');
                          }}
                          className="w-full py-5 bg-white text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all"
                        >
                          Stop & Save
                        </button>
                      )}
                      <button 
                        onClick={() => setHandoffStep('options')}
                        className="w-full py-4 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {handoffStep === 'confirm' && (
                  <div className="space-y-8 text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black tracking-tight mb-2">Handoff Ready</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Your handoff briefing has been prepared and will be delivered to the incoming team.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowHandoffModal(false);
                        setShiftStatus('completed');
                      }}
                      className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Finish & Exit Shift
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderHistory = () => {
    const filteredHistory = historyData.filter(item => {
      const matchesSearch = item.date.toLowerCase().includes(historySearch.toLowerCase()) || 
                           item.type.toLowerCase().includes(historySearch.toLowerCase());
      const matchesDept = historyDept === 'All Departments' || item.type.includes(historyDept);
      return matchesSearch && matchesDept;
    });

    const userData = [
      { name: 'Dr. Richardson', role: 'Cardiologist', patients: 45, time: '32h', revenue: '$4,200', status: 'Active', dept: 'Cardiology' },
      { name: 'Nurse Sarah', role: 'RPM Lead', patients: 120, time: '40h', revenue: '$8,500', status: 'Active', dept: 'RPM Team' },
      { name: 'Dr. Miller', role: 'ER Physician', patients: 65, time: '36h', revenue: '$6,800', status: 'Active', dept: 'Emergency' },
    ];

    const filteredUsers = userData.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(historySearch.toLowerCase()) || 
                           user.role.toLowerCase().includes(historySearch.toLowerCase());
      const matchesDept = historyDept === 'All Departments' || user.dept === historyDept;
      return matchesSearch && matchesDept;
    });

    const patientHistoryData = [
      { name: 'John Doe', id: 'P-102', continuity: 'High (3 visits)', time: '45m', revenue: '$120', status: 'Stable', dept: 'Cardiology' },
      { name: 'Sarah Jenkins', id: 'P-105', continuity: 'Med (2 visits)', time: '30m', revenue: '$85', status: 'High Risk', dept: 'RPM Team' },
      { name: 'Robert Wilson', id: 'P-110', continuity: 'Low (1 visit)', time: '20m', revenue: '$50', status: 'Stable', dept: 'Emergency' },
    ];

    const filteredPatients = patientHistoryData.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(historySearch.toLowerCase()) || 
                           patient.id.toLowerCase().includes(historySearch.toLowerCase());
      const matchesDept = historyDept === 'All Departments' || patient.dept === historyDept;
      return matchesSearch && matchesDept;
    });

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Shift History</h2>
            <p className="text-zinc-500 font-medium text-sm">Audit-ready records & productivity trends</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..." 
                className="pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full md:w-64"
              />
            </div>
            <select 
              value={historyDept}
              onChange={(e) => setHistoryDept(e.target.value)}
              className="px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option>All Departments</option>
              <option>Cardiology</option>
              <option>Emergency</option>
              <option>RPM Team</option>
            </select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input 
                type="date"
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button 
              onClick={() => {
                setHistorySearch('');
                setHistoryDept('All Departments');
                setHistoryDateFilter('');
              }}
              className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Clear Filters"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl w-fit">
          {[
            { id: 'day', label: 'Day-wise' },
            { id: 'user', label: 'User-wise' },
            { id: 'patient', label: 'Patient-wise' },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setHistoryViewMode(mode.id as any)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                historyViewMode === mode.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Avg Productivity', value: '91%', icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Total Revenue', value: '$42,850', icon: BarChart3, color: 'text-blue-500' },
            { label: 'Risk Escalations', value: '12', icon: AlertCircle, color: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm">
              <stat.icon className={`w-5 h-5 mb-4 ${stat.color}`} />
              <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[40px] border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {historyViewMode === 'day' ? 'Date / Type' : historyViewMode === 'user' ? 'User / Role' : 'Patient / ID'}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {historyViewMode === 'patient' ? 'Care Continuity' : 'Patients'}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Time Logged</th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Revenue</th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {historyViewMode === 'day' ? filteredHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-zinc-900">{row.date}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{row.type}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-600 font-medium">{row.patients}</td>
                    <td className="px-8 py-6 text-sm text-zinc-600 font-medium">{row.mins}m</td>
                    <td className="px-8 py-6 text-sm text-emerald-600 font-bold">{row.revenue}</td>
                    <td className="px-8 py-6">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button className="text-zinc-400 group-hover:text-zinc-900 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )) : historyViewMode === 'user' ? filteredUsers.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-zinc-900">{row.name}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{row.role}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-600 font-medium">{row.patients}</td>
                    <td className="px-8 py-6 text-sm text-zinc-600 font-medium">{row.time}</td>
                    <td className="px-8 py-6 text-sm text-emerald-600 font-bold">{row.revenue}</td>
                    <td className="px-8 py-6">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button className="text-zinc-400 group-hover:text-zinc-900 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )) : filteredPatients.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-zinc-900">{row.name}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{row.id}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-600 font-medium">{row.continuity}</td>
                    <td className="px-8 py-6 text-sm text-zinc-600 font-medium">{row.time}</td>
                    <td className="px-8 py-6 text-sm text-emerald-600 font-bold">{row.revenue}</td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        row.status === 'High Risk' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button className="text-zinc-400 group-hover:text-zinc-900 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Tab Navigation */}
      <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-fit border border-zinc-200">
        <button 
          onClick={() => setActiveTab('current')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          Current Shift
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          Shift History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'current' ? (
          <div key="current">
            {shiftStatus === 'not_started' && renderNotStarted()}
            {shiftStatus === 'active' && renderActive()}
            {shiftStatus === 'review' && renderReview()}
            {shiftStatus === 'completed' && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-[32px] flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Shift Successfully Finalized</h3>
                  <p className="text-zinc-500 font-medium mt-2">All documentation and handoff items have been synced.</p>
                </div>
                <button 
                  onClick={() => {
                    setShiftStatus('not_started');
                    setIsConfirmed(false);
                  }}
                  className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Start New Shift
                </button>
              </div>
            )}
          </div>
        ) : (
          <div key="history">
            {renderHistory()}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShiftSummary;
