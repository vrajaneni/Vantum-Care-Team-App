import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  Sparkles,
  Download,
  Calendar,
  User,
  Activity,
  ClipboardCheck,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PATIENTS } from '../constants';

interface CPTQualification {
  id: string;
  patientId: string;
  patientName: string;
  program: string;
  code: string;
  description: string;
  status: 'Qualified' | 'Unqualified' | 'In Progress';
  progress: number; // percentage
  requirements: {
    label: string;
    current: number | string;
    target: number | string;
    isMet: boolean;
  }[];
  lastUpdated: string;
}

const CMS_PROGRAMS = ['RPM', 'CCM', 'RTM', 'BHI', 'APCM'];

const MOCK_QUALIFICATIONS: CPTQualification[] = [
  {
    id: 'q1',
    patientId: '1',
    patientName: 'John Doe',
    program: 'RPM',
    code: '99454',
    description: 'RPM Device Supply & Readings',
    status: 'Qualified',
    progress: 100,
    requirements: [
      { label: 'Days of Readings', current: 18, target: 16, isMet: true },
      { label: 'Device Active', current: 'Yes', target: 'Yes', isMet: true }
    ],
    lastUpdated: '2024-02-24'
  },
  {
    id: 'q2',
    patientId: '1',
    patientName: 'John Doe',
    program: 'RPM',
    code: '99457',
    description: 'RPM Interactive Communication (20m)',
    status: 'In Progress',
    progress: 75,
    requirements: [
      { label: 'Interactive Time', current: 15, target: 20, isMet: false },
      { label: 'Provider Review', current: 'Yes', target: 'Yes', isMet: true }
    ],
    lastUpdated: '2024-02-25'
  },
  {
    id: 'q3',
    patientId: '1',
    patientName: 'John Doe',
    program: 'CCM',
    code: '99490',
    description: 'CCM Clinical Staff Time (20m)',
    status: 'Qualified',
    progress: 100,
    requirements: [
      { label: 'Clinical Time', current: 22, target: 20, isMet: true },
      { label: 'Care Plan Update', current: 'Yes', target: 'Yes', isMet: true }
    ],
    lastUpdated: '2024-02-23'
  },
  {
    id: 'q4',
    patientId: '2',
    patientName: 'Jane Smith',
    program: 'CCM',
    code: '99490',
    description: 'CCM Clinical Staff Time (20m)',
    status: 'In Progress',
    progress: 40,
    requirements: [
      { label: 'Clinical Time', current: 8, target: 20, isMet: false },
      { label: 'Care Plan Update', current: 'No', target: 'Yes', isMet: false }
    ],
    lastUpdated: '2024-02-25'
  },
  {
    id: 'q5',
    patientId: '2',
    patientName: 'Jane Smith',
    program: 'BHI',
    code: '99484',
    description: 'BHI Care Management (20m)',
    status: 'Unqualified',
    progress: 10,
    requirements: [
      { label: 'Clinical Time', current: 2, target: 20, isMet: false },
      { label: 'Assessment Done', current: 'No', target: 'Yes', isMet: false }
    ],
    lastUpdated: '2024-02-20'
  },
  {
    id: 'q6',
    patientId: '3',
    patientName: 'Robert Wilson',
    program: 'RPM',
    code: '99454',
    description: 'RPM Device Supply & Readings',
    status: 'In Progress',
    progress: 62,
    requirements: [
      { label: 'Days of Readings', current: 10, target: 16, isMet: false },
      { label: 'Device Active', current: 'Yes', target: 'Yes', isMet: true }
    ],
    lastUpdated: '2024-02-25'
  },
  {
    id: 'q7',
    patientId: '3',
    patientName: 'Robert Wilson',
    program: 'RTM',
    code: '98980',
    description: 'RTM Treatment Management (20m)',
    status: 'Qualified',
    progress: 100,
    requirements: [
      { label: 'Management Time', current: 25, target: 20, isMet: true },
      { label: 'Data Review', current: 'Yes', target: 'Yes', isMet: true }
    ],
    lastUpdated: '2024-02-24'
  }
];

const Billing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPatientId, setSelectedPatientId] = useState('All');
  const [showReportModal, setShowReportModal] = useState(false);

  const filteredQuals = useMemo(() => {
    return MOCK_QUALIFICATIONS.filter(q => {
      const matchesSearch = q.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           q.code.includes(searchQuery);
      const matchesProgram = programFilter === 'All' || q.program === programFilter;
      const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
      const matchesPatient = selectedPatientId === 'All' || q.patientId === selectedPatientId;
      
      return matchesSearch && matchesProgram && matchesStatus && matchesPatient;
    });
  }, [searchQuery, programFilter, statusFilter, selectedPatientId]);

  const stats = useMemo(() => {
    return {
      qualified: MOCK_QUALIFICATIONS.filter(q => q.status === 'Qualified').length,
      inProgress: MOCK_QUALIFICATIONS.filter(q => q.status === 'In Progress').length,
      unqualified: MOCK_QUALIFICATIONS.filter(q => q.status === 'Unqualified').length,
    };
  }, []);

  const generateReport = () => {
    setShowReportModal(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Billing & Claims</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CPT Qualification Engine</p>
        </div>
        <button 
          onClick={generateReport}
          className="w-full sm:w-auto px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20 active:scale-95 transition-all"
        >
          <ClipboardCheck className="w-4 h-4" />
          Generate Claim Report
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Qualified</p>
          </div>
          <p className="text-3xl font-black text-zinc-900">{stats.qualified}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Ready for submission</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">In Progress</p>
          </div>
          <p className="text-3xl font-black text-zinc-900">{stats.inProgress}</p>
          <p className="text-[10px] text-blue-600 font-bold mt-1">Work remaining</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Unqualified</p>
          </div>
          <p className="text-3xl font-black text-zinc-900">{stats.unqualified}</p>
          <p className="text-[10px] text-red-600 font-bold mt-1">Action required</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search patient or code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select 
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-zinc-100 border-none rounded-2xl text-xs font-bold text-zinc-600 focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="All">All Programs</option>
                {CMS_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-zinc-100 border-none rounded-2xl text-xs font-bold text-zinc-600 focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="All">All Status</option>
                <option value="Qualified">Qualified</option>
                <option value="In Progress">In Progress</option>
                <option value="Unqualified">Unqualified</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Qualification List */}
      <div className="space-y-4">
        {filteredQuals.map((qual) => (
          <motion.div 
            key={qual.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  qual.program === 'RPM' ? 'bg-emerald-100 text-emerald-600' :
                  qual.program === 'CCM' ? 'bg-blue-100 text-blue-600' :
                  qual.program === 'RTM' ? 'bg-purple-100 text-purple-600' :
                  'bg-zinc-100 text-zinc-600'
                }`}>
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-zinc-900">{qual.patientName}</h4>
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[8px] font-black uppercase tracking-widest">{qual.program}</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-500">{qual.code} - {qual.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Qualification</p>
                  <p className={`text-sm font-black ${
                    qual.status === 'Qualified' ? 'text-emerald-600' :
                    qual.status === 'In Progress' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>{qual.status}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  qual.status === 'Qualified' ? 'bg-emerald-500 text-white' :
                  qual.status === 'In Progress' ? 'bg-blue-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {qual.status === 'Qualified' ? <CheckCircle2 className="w-6 h-6" /> : 
                   qual.status === 'In Progress' ? <Clock className="w-6 h-6" /> : 
                   <AlertCircle className="w-6 h-6" />}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <span>Progress to Qualification</span>
                <span>{qual.progress}%</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${qual.progress}%` }}
                  className={`h-full ${
                    qual.status === 'Qualified' ? 'bg-emerald-500' :
                    qual.status === 'In Progress' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {qual.requirements.map((req, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-500">{req.label}</span>
                      {!req.isMet && (
                        <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Work Remaining</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black ${req.isMet ? 'text-emerald-600' : 'text-zinc-900'}`}>
                        {req.current} / {req.target}
                      </span>
                      {req.isMet ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-blue-200 animate-pulse" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 tracking-tight">CMS Claim Qualification Report</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Generated for {new Date().toLocaleDateString()}</p>
                </div>
                <button onClick={() => setShowReportModal(false)} className="p-2 bg-zinc-100 rounded-full">
                  <AlertCircle className="w-5 h-5 text-zinc-500 rotate-45" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Qualified Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Qualified Claims</h4>
                  </div>
                  <div className="space-y-2">
                    {MOCK_QUALIFICATIONS.filter(q => q.status === 'Qualified').map(q => (
                      <div key={q.id} className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{q.patientName}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">{q.code} - {q.program}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Remaining Work (In Progress)</h4>
                  </div>
                  <div className="space-y-2">
                    {MOCK_QUALIFICATIONS.filter(q => q.status === 'In Progress').map(q => (
                      <div key={q.id} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-zinc-900">{q.patientName}</p>
                          <p className="text-[10px] text-blue-600 font-bold">{q.code} - {q.program}</p>
                        </div>
                        <div className="space-y-1">
                          {q.requirements.filter(r => !r.isMet).map((r, i) => (
                            <p key={i} className="text-[10px] text-zinc-500 font-medium flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Missing: {r.label} ({r.current} / {r.target})
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unqualified Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Unqualified Claims</h4>
                  </div>
                  <div className="space-y-2">
                    {MOCK_QUALIFICATIONS.filter(q => q.status === 'Unqualified').map(q => (
                      <div key={q.id} className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100">
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{q.patientName}</p>
                          <p className="text-[10px] text-red-600 font-bold">{q.code} - {q.program}</p>
                        </div>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setShowReportModal(false)}
                  className="w-full py-5 bg-zinc-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Download Full Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Billing;
