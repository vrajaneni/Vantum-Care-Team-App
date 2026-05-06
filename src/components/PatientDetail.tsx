import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Brain, 
  TrendingUp, 
  Calendar, 
  Activity, 
  FileText, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Video,
  Sparkles,
  Shield,
  Mic,
  Plus,
  ClipboardList,
  ListTodo,
  MessageSquare,
  Save,
  Trash2,
  Search,
  History,
  Bell
} from 'lucide-react';
import { Patient } from '../types';
import { geminiService } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack }) => {
  const [aiSnapshot, setAiSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'vitals' | 'notes' | 'problems' | 'careplan' | 'assess' | 'tasks' | 'meds'>('vitals');
  
  // Vitals State
  const [vitalType, setVitalType] = useState<'BP' | 'Glucose' | 'Weight'>('BP');
  const [vitalRange, setVitalRange] = useState<'7' | '15' | '30'>('15');
  
  // Tasks State
  const [tasks, setTasks] = useState<any[]>([
    { id: '1', title: 'Schedule Echo', description: 'Follow up echo for CHF monitoring', assignedTo: 'Clinical Team', status: 'Pending', priority: 'High', dueDate: '2024-03-01', history: [{ date: '2024-02-20', action: 'Task Created', user: 'Dr. Richardson' }] },
    { id: '2', title: 'Daily Weight Log', description: 'Patient to log weight every morning', assignedTo: 'Patient', status: 'In-Progress', priority: 'Medium', dueDate: '2024-12-31', history: [{ date: '2024-02-15', action: 'Task Assigned', user: 'Nuvia AI' }] }
  ]);
  const [showAddTask, setShowAddTask] = useState(false);

  // Medications State
  const [medications, setMedications] = useState<any[]>([
    { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', startDate: '2023-01-10', status: 'Active', adherence: 95, refillDue: '2024-03-15', prescribedBy: 'Dr. Richardson' },
    { id: '2', name: 'Furosemide', dosage: '20mg', frequency: 'Daily', startDate: '2023-05-20', status: 'Active', adherence: 88, refillDue: '2024-03-10', prescribedBy: 'Dr. Richardson' }
  ]);
  const [showAddMed, setShowAddMed] = useState(false);
  const [medSuggestions, setMedSuggestions] = useState<any[]>([]);

  // Care Plan State
  const [careGoals, setCareGoals] = useState<any[]>([
    { id: '1', text: 'Maintain BP below 130/80', status: 'In Progress', targetDate: '2024-06-01' },
    { id: '2', text: 'Daily weight monitoring', status: 'Met', targetDate: '2024-02-01' }
  ]);
  const [sdoh, setSdoh] = useState<any[]>([
    { category: 'Transportation', status: 'Stable', notes: 'Has own vehicle' },
    { category: 'Food', status: 'Stable', notes: 'Access to grocery stores' }
  ]);

  // Nuvia Context State
  const [nuviaResponse, setNuviaResponse] = useState<string>('');
  const [isNuviaSpeaking, setIsNuviaSpeaking] = useState(false);

  useEffect(() => {
    const handleNuviaCommand = (e: any) => {
      const { name, args } = e.detail;
      console.log("PatientDetail handling Nuvia command:", name, args);

      switch (name) {
        case 'schedule_task':
          setTasks(prev => [{
            id: Date.now().toString(),
            title: args.title,
            description: args.description || '',
            assignedTo: args.assignedTo,
            status: 'Pending',
            priority: 'Medium',
            dueDate: args.dueDate || '2024-12-31',
            history: [{ date: 'Today', action: 'Task Scheduled by Nuvia', user: 'Nuvia AI' }]
          }, ...prev]);
          setActiveSubTab('tasks');
          break;
        case 'add_medication':
          setMedications(prev => [{
            id: Date.now().toString(),
            name: args.name,
            dosage: args.dosage,
            frequency: args.frequency,
            startDate: 'Today',
            status: 'Active',
            adherence: 100,
            prescribedBy: 'Nuvia AI',
            aiSuggested: true
          }, ...prev]);
          setActiveSubTab('medications');
          break;
        case 'update_care_plan':
          if (args.goalText) {
            setCareGoals(prev => [{
              id: Date.now().toString(),
              text: args.goalText,
              status: 'In Progress',
              targetDate: '2024-12-31'
            }, ...prev]);
          }
          if (args.sdohCategory) {
            setSdoh(prev => {
              const existing = prev.find(s => s.category === args.sdohCategory);
              if (existing) {
                return prev.map(s => s.category === args.sdohCategory ? { ...s, status: args.sdohStatus || s.status } : s);
              }
              return [...prev, { category: args.sdohCategory, status: args.sdohStatus || 'Stable', notes: 'Updated by Nuvia' }];
            });
          }
          setActiveSubTab('careplan');
          break;
        case 'schedule_appointment':
          // In a real app, this would update the global schedule
          alert(`Appointment scheduled for ${args.date} at ${args.time} (${args.type || 'Telehealth'})`);
          break;
        case 'add_assessment':
          setAssessments(prev => [{
            id: Date.now().toString(),
            name: args.name,
            date: 'Today',
            score: 'Pending',
            status: 'Assigned'
          }, ...prev]);
          setActiveSubTab('assessments');
          break;
        case 'review_assessment':
          const assessment = assessments.find(a => a.id === args.assessmentId);
          if (assessment) {
            alert(`Reviewing ${assessment.name}...`);
            setAssessments(prev => prev.map(a => a.id === args.assessmentId ? { ...a, status: 'Reviewed' } : a));
          }
          setActiveSubTab('assessments');
          break;
      }
    };

    window.addEventListener('nuvia-command', handleNuviaCommand);
    return () => window.removeEventListener('nuvia-command', handleNuviaCommand);
  }, []);

  useEffect(() => {
    // Nuvia explains health condition on entry
    const explainHealth = async () => {
      setIsNuviaSpeaking(true);
      const explanation = `Hello Dr. Richardson. I've reviewed ${patient.name}'s chart. They are currently at ${patient.riskLevel} risk due to ${patient.conditions.join(', ')}. Medication adherence is at ${patient.medicationAdherence}%, which is ${patient.medicationAdherence > 80 ? 'good' : 'concerning'}. I recommend reviewing the pending CHF symptom survey and considering a dosage adjustment for Lisinopril if BP remains elevated.`;
      setNuviaResponse(explanation);
      // In a real app, we'd call the TTS service here
      setTimeout(() => setIsNuviaSpeaking(false), 5000);
    };
    explainHealth();
  }, [patient.id]);

  // Clinical Notes State
  const [notes, setNotes] = useState([
    { id: 1, date: 'Feb 20, 2024', author: 'Dr. Richardson', type: 'Progress Note', content: 'Patient reports improved breathing. BP stable.' },
    { id: 2, date: 'Feb 15, 2024', author: 'Dr. Richardson', type: 'Telehealth Visit', content: 'Discussed medication adherence. Patient agreed to daily monitoring.' }
  ]);
  const [newNote, setNewNote] = useState('');
  const [isDictating, setIsDictating] = useState(false);

  // Problem List State
  const [problems, setProblems] = useState([
    { id: 1, diagnosis: 'Congestive Heart Failure', code: 'I50.9', status: 'Active', date: 'Jan 10, 2023' },
    { id: 2, diagnosis: 'Hypertension', code: 'I10', status: 'Active', date: 'Mar 15, 2022' },
    { id: 3, diagnosis: 'Type 2 Diabetes', code: 'E11.9', status: 'Active', date: 'Nov 05, 2021' }
  ]);
  const [showAddProblem, setShowAddProblem] = useState(false);

  // Assessments State
  const [assessments, setAssessments] = useState([
    { id: 1, name: 'PHQ-9 Depression Screen', date: 'Feb 01, 2024', score: '4 (Minimal)', status: 'Reviewed' },
    { id: 2, name: 'CHF Symptom Survey', date: 'Feb 24, 2024', score: 'High Risk', status: 'Pending Review' }
  ]);

  // Care Plan State
  const [carePlan, setCarePlan] = useState({
    goals: [
      { id: 1, text: 'Maintain BP below 130/80', status: 'In Progress' },
      { id: 2, text: 'Daily weight monitoring', status: 'Met' },
      { id: 3, text: 'Reduce sodium intake to <2g/day', status: 'In Progress' }
    ],
    interventions: [
      { id: 1, text: 'Lisinopril 10mg daily', type: 'Medication' },
      { id: 2, text: 'Weekly telehealth check-ins', type: 'Monitoring' },
      { id: 3, text: 'Low-sodium diet education', type: 'Education' }
    ]
  });

  const [vitalsAnalysis, setVitalsAnalysis] = useState<any>(null);
  const [carePlanSuggestions, setCarePlanSuggestions] = useState<any>(null);
  const [isAnalyzingVitals, setIsAnalyzingVitals] = useState(false);
  const [isSuggestingCarePlan, setIsSuggestingCarePlan] = useState(false);

  const MOCK_VITALS_DATA = {
    BP: [120, 118, 125, 132, 128, 140, 135, 130, 125, 122, 118, 120, 124, 130, 135, 142, 138, 130, 125, 120, 118, 122, 125, 128, 130, 135, 132, 128, 125, 120],
    Glucose: [95, 102, 110, 105, 98, 145, 130, 115, 100, 95, 92, 98, 105, 112, 120, 150, 140, 125, 110, 105, 98, 102, 108, 115, 122, 135, 128, 115, 105, 95],
    Weight: [175, 175.2, 175.5, 175.1, 175.8, 176.5, 176.2, 175.9, 175.5, 175.2, 175.0, 175.3, 175.6, 176.0, 176.4, 177.2, 176.8, 176.3, 175.8, 175.4, 175.1, 175.4, 175.7, 176.1, 176.5, 177.0, 176.6, 176.1, 175.6, 175.2]
  };

  useEffect(() => {
    const fetchVitalsAnalysis = async () => {
      if (activeSubTab === 'vitals') {
        setIsAnalyzingVitals(true);
        try {
          const days = parseInt(vitalRange);
          const fullData = MOCK_VITALS_DATA[vitalType];
          const data = fullData.slice(fullData.length - days);
          const analysis = await geminiService.analyzeVitals(data);
          setVitalsAnalysis(analysis);
        } catch (error) {
          console.error("Failed to analyze vitals", error);
        } finally {
          setIsAnalyzingVitals(false);
        }
      }
    };
    fetchVitalsAnalysis();
  }, [activeSubTab, vitalType, vitalRange]);

  useEffect(() => {
    const fetchCarePlanSuggestions = async () => {
      if (activeSubTab === 'careplan' && !carePlanSuggestions) {
        setIsSuggestingCarePlan(true);
        try {
          const suggestions = await geminiService.suggestCarePlanUpdates(patient, carePlan);
          setCarePlanSuggestions(suggestions);
        } catch (error) {
          console.error("Failed to suggest care plan updates", error);
        } finally {
          setIsSuggestingCarePlan(false);
        }
      }
    };
    fetchCarePlanSuggestions();
  }, [activeSubTab, carePlanSuggestions, patient, carePlan]);

  useEffect(() => {
    const fetchSnapshot = async () => {
      setLoading(true);
      try {
        const snapshot = await geminiService.getPatientRiskSnapshot(patient);
        setAiSnapshot(snapshot);
      } catch (error) {
        console.error("Failed to fetch AI snapshot", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshot();
  }, [patient]);

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 pb-24 md:pb-12 md:pr-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Queue
        </button>
        <div className="flex gap-2 md:gap-3">
          <button className="flex-1 md:flex-none px-4 py-3 md:py-2.5 bg-white border border-zinc-200 rounded-2xl md:rounded-xl text-sm font-bold text-zinc-700 active:scale-95 transition-all">
            Edit
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 md:py-2.5 bg-emerald-500 text-white rounded-2xl md:rounded-xl text-sm font-bold active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
            <Video className="w-4 h-4" />
            Start Visit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Patient Info Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 md:mb-8 gap-6">
            <div className="flex gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-zinc-100 flex items-center justify-center text-xl md:text-2xl font-bold text-zinc-600">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">{patient.name}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 md:mt-2 text-zinc-500 font-medium text-xs md:text-sm">
                  <span>{patient.dob} ({patient.gender})</span>
                  <span className="hidden md:inline">•</span>
                  <span>MRN: #VT-{patient.id}492</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
                  {patient.programs.map(p => (
                    <span key={p} className="px-2 md:px-3 py-0.5 md:py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider border border-emerald-100">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex md:block items-center justify-between bg-zinc-50 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest md:mb-1">Risk Score</p>
              <div className={`text-3xl md:text-4xl font-black ${patient.riskScore > 80 ? 'text-red-500' : 'text-emerald-500'}`}>
                {patient.riskScore}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-100">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Conditions</p>
              <div className="flex flex-wrap gap-2">
                {patient.conditions.map(c => (
                  <span key={c} className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded-md text-[10px] md:text-xs font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Medication Adherence</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${patient.medicationAdherence > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                    style={{ width: `${patient.medicationAdherence}%` }}
                  />
                </div>
                <span className="text-xs md:text-sm font-bold text-zinc-700">{patient.medicationAdherence}%</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Hospitalization Risk</p>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${patient.predictedHospitalization > 30 ? 'text-red-500' : 'text-emerald-500'}`} />
                <span className="text-xs md:text-sm font-bold text-zinc-700">{patient.predictedHospitalization}% Predicted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nuvia AI Snapshot */}
        <div className="bg-zinc-950 rounded-2xl md:rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <img 
              src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400" 
              alt="Nuvia AI"
              className="w-32 h-32 md:w-56 md:h-56 object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/20">
                  <img 
                    src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100" 
                    alt="Nuvia AI"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black tracking-tight leading-tight">Nuvia Co-Pilot</h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Clinical Intelligence Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Validated</span>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-800 rounded w-full"></div>
                <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Clinical Intelligence</p>
                  <div className="relative">
                    <p className="text-xs md:text-sm text-zinc-300 leading-relaxed italic">
                      {nuviaResponse || aiSnapshot?.conditionSummary || "Analyzing patient history..."}
                    </p>
                    {isNuviaSpeaking && (
                      <div className="absolute -right-2 -top-2">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">CCM Time</p>
                    <p className="text-sm font-black text-emerald-400">14 / 20m</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Risk Tier</p>
                    <p className="text-sm font-black text-orange-400">High (CHF)</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Suggested Actions</p>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl group/btn hover:bg-emerald-500/20 transition-all">
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-emerald-400 font-bold">
                        <FileText className="w-3.5 h-3.5" />
                        Draft SOAP Note
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-500 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl group/btn hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-zinc-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Log CCM Interaction
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs / Sub-modules */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-px bg-zinc-100 border-b border-zinc-100">
          {[
            { id: 'vitals', label: 'Vitals', icon: Activity },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'problems', label: 'Problems', icon: AlertTriangle },
            { id: 'careplan', label: 'Care', icon: ClipboardList },
            { id: 'tasks', label: 'Tasks', icon: ListTodo },
            { id: 'meds', label: 'Meds', icon: Stethoscope },
            { id: 'assess', label: 'Assess', icon: ClipboardList },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1 p-3 text-[9px] font-black uppercase tracking-widest transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-white text-emerald-600' 
                  : 'bg-zinc-50/50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeSubTab === tab.id ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {activeSubTab === 'vitals' && (
              <motion.div
                key="vitals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                    <h3 className="text-lg md:text-xl font-bold text-zinc-900 tracking-tight">RPM Vitals</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex bg-zinc-100 p-1 rounded-xl">
                      {(['7', '15', '30'] as const).map((range) => (
                        <button 
                          key={range}
                          onClick={() => setVitalRange(range)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${vitalRange === range ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                          {range}D
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['BP', 'Glucose', 'Weight'] as const).map((type) => (
                        <button 
                          key={type}
                          onClick={() => setVitalType(type)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${vitalType === type ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-300'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {(() => {
                  const days = parseInt(vitalRange);
                  const fullData = MOCK_VITALS_DATA[vitalType];
                  const rawData = fullData.slice(fullData.length - days);
                  
                  let threshold = 0;
                  let unit = '';
                  let maxVal = 0;
                  let minVal = 0;
                  let color = '#10b981'; // emerald-500

                  if (vitalType === 'BP') {
                    threshold = 135;
                    unit = 'mmHg';
                    maxVal = 160;
                    minVal = 90;
                    color = '#10b981';
                  } else if (vitalType === 'Glucose') {
                    threshold = 140;
                    unit = 'mg/dL';
                    maxVal = 200;
                    minVal = 60;
                    color = '#3b82f6'; // blue-500
                  } else if (vitalType === 'Weight') {
                    threshold = 178;
                    unit = 'lbs';
                    maxVal = 185;
                    minVal = 165;
                    color = '#8b5cf6'; // violet-500
                  }

                  const today = new Date();
                  const data = rawData.map((val, i) => {
                    const d = new Date(today);
                    d.setDate(today.getDate() - (rawData.length - 1 - i));
                    return {
                      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      value: val,
                      isAbnormal: val > threshold
                    };
                  });

                  return (
                    <div className="h-64 md:h-80 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            interval={Math.floor(days / 4)}
                          />
                          <YAxis 
                            domain={[minVal, maxVal]} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#18181b', 
                              border: 'none', 
                              borderRadius: '12px',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: color, strokeWidth: 2 }}
                            formatter={(value: number) => [`${value} ${unit}`, vitalType]}
                          />
                          <ReferenceLine 
                            y={threshold} 
                            stroke="#ef4444" 
                            strokeDasharray="3 3" 
                            label={{ position: 'right', value: 'Limit', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={color} 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            animationDuration={1500}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}

                {/* Nuvia Vitals Analysis */}
                <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-24 h-24 text-emerald-900" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-sm font-black text-emerald-900 tracking-tight">Nuvia Vitals Analysis</h4>
                    </div>
                    
                    {isAnalyzingVitals ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-2 bg-emerald-200 rounded w-3/4"></div>
                        <div className="h-2 bg-emerald-200 rounded w-full"></div>
                        <div className="h-2 bg-emerald-200 rounded w-5/6"></div>
                      </div>
                    ) : vitalsAnalysis ? (
                      <div className="space-y-4">
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium italic">"{vitalsAnalysis.summary}"</p>
                        
                        {vitalsAnalysis.flags && vitalsAnalysis.flags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {vitalsAnalysis.flags.map((flag: string, idx: number) => (
                              <span key={idx} className="px-2.5 py-1 bg-white text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                                <AlertCircle className="w-3 h-3 text-emerald-500" />
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="p-4 bg-white/60 rounded-2xl border border-emerald-100">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Trend Analysis</p>
                          <p className="text-xs text-emerald-900 font-medium">{vitalsAnalysis.trendAnalysis}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600">Analysis unavailable.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Enter clinical note manually or use dictation..."
                      className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[120px]"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button 
                        onClick={() => {
                          setIsDictating(!isDictating);
                          if (!isDictating) {
                            // Mock dictation
                            setTimeout(() => {
                              setNewNote(prev => prev + " Patient reports feeling better today. ");
                              setIsDictating(false);
                            }, 3000);
                          }
                        }}
                        className={`p-2 rounded-xl transition-all ${isDictating ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (newNote.trim()) {
                            setNotes([{ id: Date.now(), date: 'Today', author: 'Dr. Richardson', type: 'Progress Note', content: newNote }, ...notes]);
                            setNewNote('');
                          }
                        }}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recent Notes</h4>
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-zinc-900 text-sm">{note.type}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">{note.date} • {note.author}</p>
                        </div>
                        <button className="text-zinc-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-zinc-600 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSubTab === 'problems' && (
              <motion.div
                key="problems"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Problems</h4>
                  <button 
                    onClick={() => setShowAddProblem(true)}
                    className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Problem
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {problems.map((prob) => (
                    <div key={prob.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex justify-between items-center group hover:border-emerald-200 transition-all">
                      <div>
                        <p className="font-bold text-zinc-900 text-sm">{prob.diagnosis}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 bg-zinc-200 text-zinc-600 rounded text-[8px] font-black uppercase">{prob.code}</span>
                          <span className="text-[10px] text-zinc-500 font-medium">{prob.date}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[8px] font-black uppercase tracking-widest">
                        {prob.status}
                      </span>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {showAddProblem && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-4">
                        <h5 className="font-bold text-sm">Add New Diagnosis</h5>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input 
                            type="text" 
                            placeholder="Search ICD-10 codes or diagnosis..."
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setShowAddProblem(false)}
                            className="flex-1 py-3 bg-white/5 text-zinc-400 rounded-xl font-bold text-xs hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => setShowAddProblem(false)}
                            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all"
                          >
                            Add to List
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeSubTab === 'careplan' && (
              <motion.div
                key="careplan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Clinical Goals
                      </h4>
                      <button className="text-emerald-600 font-bold text-xs hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Goal
                      </button>
                    </div>
                    <div className="space-y-3">
                      {careGoals.map((goal) => (
                        <div key={goal.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${goal.status === 'Met' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300'}`}>
                            {goal.status === 'Met' && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${goal.status === 'Met' ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{goal.text}</p>
                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">{goal.status} • Target: {goal.targetDate}</p>
                          </div>
                          <button className="text-zinc-400 hover:text-emerald-500"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" />
                      SDOH Data
                    </h4>
                    <div className="space-y-3">
                      {sdoh.map((item, i) => (
                        <div key={i} className="p-4 bg-white border border-zinc-100 rounded-2xl flex items-center justify-between group hover:border-emerald-200 transition-all">
                          <div>
                            <p className="text-sm font-bold text-zinc-900">{item.category}</p>
                            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{item.notes}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${item.status === 'Stable' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                      <button className="w-full py-3 border border-dashed border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-400 hover:border-emerald-300 hover:text-emerald-500 transition-all">
                        + Add SDOH Factor
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nuvia Care Plan Suggestions */}
                <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-24 h-24 text-emerald-900" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-sm font-black text-emerald-900 tracking-tight">Nuvia Care Plan Suggestions</h4>
                    </div>
                    
                    {isSuggestingCarePlan ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-2 bg-emerald-200 rounded w-3/4"></div>
                        <div className="h-2 bg-emerald-200 rounded w-full"></div>
                        <div className="h-2 bg-emerald-200 rounded w-5/6"></div>
                      </div>
                    ) : carePlanSuggestions ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Suggested Goals</p>
                          {carePlanSuggestions.suggestedGoals?.map((goal: string, idx: number) => (
                            <div key={idx} className="p-3 bg-white/60 rounded-xl border border-emerald-100 flex items-start gap-2">
                              <Plus className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-emerald-900 font-medium">{goal}</p>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Suggested Interventions</p>
                          {carePlanSuggestions.suggestedInterventions?.map((intervention: string, idx: number) => (
                            <div key={idx} className="p-3 bg-white/60 rounded-xl border border-emerald-100 flex items-start gap-2">
                              <Plus className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-emerald-900 font-medium">{intervention}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600">Suggestions unavailable.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Patient & Team Tasks</h4>
                  <button 
                    onClick={() => setShowAddTask(true)}
                    className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Task
                  </button>
                </div>

                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-5 bg-zinc-50 border border-zinc-100 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          <ListTodo className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{task.title}</p>
                          <p className="text-xs text-zinc-500 font-medium">Assigned to: {task.assignedTo} • Due: {task.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <select 
                          value={task.status}
                          onChange={(e) => {
                            const newTasks = tasks.map(t => t.id === task.id ? { ...t, status: e.target.value, history: [...t.history, { date: 'Today', action: `Status updated to ${e.target.value}`, user: 'Dr. Richardson' }] } : t);
                            setTasks(newTasks);
                          }}
                          className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option>Pending</option>
                          <option>In-Progress</option>
                          <option>Completed</option>
                          <option>Deferred</option>
                        </select>
                        <button className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-emerald-500 transition-colors">
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSubTab === 'meds' && (
              <motion.div
                key="meds"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Medications</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setMedSuggestions([
                          { name: 'Carvedilol', dosage: '6.25mg', frequency: 'Twice daily', reason: 'CHF management' },
                          { name: 'Spironolactone', dosage: '25mg', frequency: 'Daily', reason: 'Potassium-sparing diuretic' }
                        ]);
                      }}
                      className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Nuvia Suggestions
                    </button>
                    <button 
                      onClick={() => setShowAddMed(true)}
                      className="flex items-center gap-1.5 text-zinc-600 font-bold text-xs hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Manual
                    </button>
                  </div>
                </div>

                {medSuggestions.length > 0 && (
                  <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h5 className="font-bold text-sm">Nuvia Prescribing Suggestions</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {medSuggestions.map((s, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <p className="font-bold text-emerald-400">{s.name} {s.dosage}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{s.reason}</p>
                          <button 
                            onClick={() => {
                              setMedications([...medications, { ...s, id: Date.now().toString(), startDate: 'Today', status: 'Active', adherence: 100, prescribedBy: 'Dr. Richardson', aiSuggested: true }]);
                              setMedSuggestions(medSuggestions.filter((_, idx) => idx !== i));
                            }}
                            className="mt-3 w-full py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600"
                          >
                            Prescribe
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medications.map((med) => (
                    <div key={med.id} className="p-5 bg-zinc-50 border border-zinc-100 rounded-[24px] space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-zinc-900">{med.name}</p>
                            {med.aiSuggested && <Sparkles className="w-3 h-3 text-emerald-500" />}
                          </div>
                          <p className="text-xs text-zinc-500 font-medium">{med.dosage} • {med.frequency}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => alert('Refill alert sent to patient and user.')}
                            className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-orange-500 transition-colors"
                            title="Send Refill Alert"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-emerald-500 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => {
                              const newMeds = medications.map(m => m.id === med.id ? { ...m, status: 'Taken' } : m);
                              setMedications(newMeds);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${med.status === 'Taken' ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-500 border border-zinc-200'}`}
                          >
                            Taken
                          </button>
                          <button 
                            onClick={() => {
                              const newMeds = medications.map(m => m.id === med.id ? { ...m, status: 'Missed' } : m);
                              setMedications(newMeds);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${med.status === 'Missed' ? 'bg-red-500 text-white' : 'bg-white text-zinc-500 border border-zinc-200'}`}
                          >
                            Missed
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Adherence</p>
                          <p className="text-sm font-black text-emerald-600">{med.adherence}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSubTab === 'assessments' && (
              <motion.div
                key="assessments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Surveys & Assessments</h4>
                  <button className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs hover:underline">
                    <Calendar className="w-3.5 h-3.5" />
                    Schedule New
                  </button>
                </div>

                <div className="space-y-4">
                  {assessments.map((survey) => (
                    <div key={survey.id} className="p-5 bg-zinc-50 border border-zinc-100 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${survey.status === 'Pending Review' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          <ListTodo className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{survey.name}</p>
                          <p className="text-xs text-zinc-500 font-medium">Completed: {survey.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-right">
                          <p className={`font-black text-base ${survey.score.includes('High') ? 'text-red-500' : 'text-zinc-900'}`}>{survey.score}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{survey.status}</p>
                        </div>
                        <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-colors">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-3">
          {/* Recent Labs */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                  <h3 className="text-lg md:text-xl font-bold text-zinc-900 tracking-tight">Recent Labs</h3>
                </div>
                <button className="text-emerald-600 font-bold text-xs md:text-sm hover:underline">View All</button>
             </div>
             <div className="space-y-3 md:space-y-4">
                {[
                  { test: 'HbA1c', date: 'Feb 10, 2024', value: '7.2%', status: 'Abnormal' },
                  { test: 'eGFR', date: 'Feb 10, 2024', value: '85 mL/min', status: 'Normal' },
                  { test: 'LDL', date: 'Jan 15, 2024', value: '142 mg/dL', status: 'Abnormal' },
                ].map((lab, i) => (
                  <div key={i} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border border-zinc-100 hover:border-emerald-200 transition-colors group">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center ${lab.status === 'Abnormal' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <FileText className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-sm md:text-base">{lab.test}</p>
                        <p className="text-[10px] md:text-xs text-zinc-500">{lab.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8">
                      <div className="text-right">
                        <p className={`font-black text-base md:text-lg ${lab.status === 'Abnormal' ? 'text-orange-600' : 'text-zinc-900'}`}>{lab.value}</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lab.status}</p>
                      </div>
                      <button className="p-1.5 md:p-2 rounded-lg bg-zinc-50 text-zinc-400 group-hover:text-emerald-500 transition-colors">
                        <ChevronRight className="w-4 h-4 md:w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-4 md:space-y-6">
          {/* CMS Time Tracking */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-emerald-500" />
              <h4 className="font-bold text-zinc-900 tracking-tight">CMS Tracking</h4>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 rounded-xl md:rounded-2xl border border-zinc-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">CCM (99490)</span>
                  <span className="text-[10px] font-black text-emerald-600">18 / 20m</span>
                </div>
                <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl md:rounded-2xl border border-zinc-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">RPM (99457)</span>
                  <span className="text-[10px] font-black text-zinc-400">0 / 20m</span>
                </div>
                <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-300 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
              <button className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-[10px] font-bold hover:bg-black transition-colors">
                Log Manual Time
              </button>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h4 className="font-bold text-zinc-900 tracking-tight">Next Visit</h4>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl md:rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Telehealth</p>
              <p className="text-base md:text-lg font-black text-emerald-900">Tomorrow, 10:00 AM</p>
              <p className="text-[10px] text-emerald-600 mt-1">CHF Management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
