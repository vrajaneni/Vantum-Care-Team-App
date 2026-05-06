import React, { useState } from 'react';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Wind, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  MessageSquare,
  Phone,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const RPM_PROGRAMS = [
  {
    id: 'chf',
    name: 'Heart Failure (CHF)',
    icon: Heart,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
    patients: [
      { id: '1', name: 'John Doe', status: 'Critical', alert: 'Weight gain 3lbs in 24h', adherence: '85%', lastSync: '2 mins ago' },
      { id: '3', name: 'Robert Wilson', status: 'Stable', adherence: '92%', lastSync: '1 hr ago' }
    ]
  },
  {
    id: 'htn',
    name: 'Hypertension',
    icon: Activity,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    patients: [
      { id: '2', name: 'Sarah Jenkins', status: 'Warning', alert: 'BP 145/92 consecutive days', adherence: '78%', lastSync: '5 mins ago' },
      { id: '4', name: 'Emily Davis', status: 'Stable', adherence: '100%', lastSync: '1 min ago' }
    ]
  },
  {
    id: 'copd',
    name: 'COPD Monitoring',
    icon: Wind,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    patients: [
      { id: '5', name: 'Michael Brown', status: 'Stable', adherence: '88%', lastSync: '3 hrs ago' }
    ]
  },
  {
    id: 'dm',
    name: 'Diabetes Care',
    icon: Thermometer,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    patients: [
      { id: '6', name: 'Lisa Taylor', status: 'Warning', alert: 'Fasting glucose > 130', adherence: '82%', lastSync: '10 mins ago' }
    ]
  }
];

const RPM: React.FC = () => {
  const [expandedProgram, setExpandedProgram] = useState<string | null>('chf');

  const toggleProgram = (id: string) => {
    if (expandedProgram === id) {
      setExpandedProgram(null);
    } else {
      setExpandedProgram(id);
    }
  };

  return (
    <div className="space-y-6 w-full pb-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">RPM Monitoring</h2>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Remote Patient Programs</p>
      </div>

      {/* Nuvia Engagement Card */}
      <div className="bg-zinc-950 p-6 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100" 
                alt="Nuvia AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-tight">Nuvia Assistant</h3>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Monitoring</p>
            </div>
          </div>
          <p className="text-sm text-zinc-300 font-medium leading-relaxed mb-4">
            I've analyzed your RPM programs. There are <span className="text-white font-bold">2 critical alerts</span> requiring attention today. Would you like me to draft outreach messages or schedule follow-ups?
          </p>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Draft Messages
            </button>
            <button className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              Schedule Calls
            </button>
          </div>
        </div>
      </div>

      {/* Program Tiles */}
      <div className="space-y-4">
        {RPM_PROGRAMS.map((program) => (
          <div 
            key={program.id} 
            className={`bg-white rounded-[32px] border ${expandedProgram === program.id ? program.border : 'border-zinc-200'} shadow-sm overflow-hidden transition-all duration-300`}
          >
            {/* Tile Header */}
            <button 
              onClick={() => toggleProgram(program.id)}
              className="w-full p-5 flex items-center justify-between bg-white hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${program.bg} flex items-center justify-center`}>
                  <program.icon className={`w-6 h-6 ${program.color}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-zinc-900 tracking-tight text-base">{program.name}</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                    {program.patients.length} Enrolled
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {program.patients.some(p => p.status === 'Critical' || p.status === 'Warning') && (
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${expandedProgram === program.id ? 'rotate-180 bg-zinc-100' : 'bg-zinc-50'}`}>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            </button>

            {/* Expanded Content: Patients List */}
            <AnimatePresence>
              {expandedProgram === program.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-2 border-t border-zinc-100">
                    <div className="space-y-3">
                      {program.patients.map((patient) => (
                        <div key={patient.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center font-black text-zinc-600 text-sm shadow-sm">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-bold text-zinc-900 text-sm">{patient.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Clock className="w-3 h-3 text-zinc-400" />
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{patient.lastSync}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                patient.status === 'Critical' ? 'bg-red-100 text-red-600' :
                                patient.status === 'Warning' ? 'bg-orange-100 text-orange-600' :
                                'bg-emerald-100 text-emerald-600'
                              }`}>
                                {patient.status}
                              </span>
                            </div>
                          </div>
                          
                          {patient.alert && (
                            <div className="flex items-start gap-2 p-2.5 bg-red-50 rounded-xl border border-red-100">
                              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-red-700 leading-tight">{patient.alert}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Adherence:</span>
                              <span className="text-xs font-black text-zinc-900">{patient.adherence}</span>
                            </div>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-[10px] font-black uppercase tracking-widest text-zinc-700 shadow-sm">
                              Review
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RPM;
