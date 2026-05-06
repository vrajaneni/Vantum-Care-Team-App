import React, { useState } from 'react';
import { 
  Calendar, Clock, Video, Users, Settings, Plus, 
  Search, CheckCircle2, AlertCircle, Sparkles, Shield, 
  Zap, FileText, BarChart3, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TelehealthModuleProps {
  onStartVisit: (patientId: string, mode: 'B2B' | 'B2C') => void;
}

const TelehealthModule: React.FC<TelehealthModuleProps> = ({ onStartVisit }) => {
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'waiting_room' | 'analytics' | 'availability' | 'history'>('schedule');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingType, setBookingType] = useState<'B2B' | 'B2C'>('B2C');
  const [viewMode, setViewMode] = useState<'B2B' | 'B2C'>('B2C');

  const [slotDuration, setSlotDuration] = useState('30');
  const [schedule, setSchedule] = useState([
    { day: 'Monday', active: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', active: true, start: '10:00', end: '14:00' },
    { day: 'Thursday', active: true, start: '09:00', end: '17:00' },
    { day: 'Friday', active: true, start: '09:00', end: '12:00' },
    { day: 'Saturday', active: false, start: '09:00', end: '17:00' },
    { day: 'Sunday', active: false, start: '09:00', end: '17:00' },
  ]);

  const upcomingVisits = [
    { id: '1', patient: 'John Doe', time: '09:00 AM', type: 'CCM Check-in', status: 'Confirmed', urgency: 'High', symptoms: 'Shortness of breath', intakeComplete: true, mode: 'B2C' },
    { id: '2', patient: 'Sarah Jenkins', time: '10:30 AM', type: 'RPM Interactive', status: 'Pending', urgency: 'Normal', symptoms: 'Routine follow-up', intakeComplete: false, mode: 'B2C' },
    { id: '3', patient: 'Dr. Michael Smith', time: '11:45 AM', type: 'Specialist Consult', status: 'Confirmed', urgency: 'Normal', symptoms: 'Referral Review', intakeComplete: true, mode: 'B2B' },
    { id: '4', patient: 'Robert Wilson', time: '01:15 PM', type: 'Telehealth Consult', status: 'Confirmed', urgency: 'Normal', symptoms: 'Medication review', intakeComplete: true, mode: 'B2C' },
  ];

  const waitingRoom = [
    { id: 'w1', patient: 'Alice Brown', status: 'Ready', waitTime: '4m', intake: 'Complete', vitals: 'Stable', mode: 'B2C' },
    { id: 'w2', patient: 'Charlie Davis', status: 'In Intake', waitTime: '12m', intake: 'Processing', vitals: 'Pending', mode: 'B2C' },
    { id: 'w3', patient: 'Dr. Sarah Connor', status: 'Ready', waitTime: '2m', intake: 'N/A', vitals: 'N/A', mode: 'B2B' },
  ];

  const availabilitySlots = [
    { day: 'Monday', slots: '09:00 AM - 05:00 PM', status: 'Active' },
    { day: 'Tuesday', slots: '09:00 AM - 05:00 PM', status: 'Active' },
    { day: 'Wednesday', slots: '10:00 AM - 02:00 PM', status: 'Partial' },
    { day: 'Thursday', slots: '09:00 AM - 05:00 PM', status: 'Active' },
    { day: 'Friday', slots: '09:00 AM - 12:00 PM', status: 'Active' },
  ];

  const isB2B = viewMode === 'B2B';
  const themeColor = isB2B ? 'blue' : 'emerald';

  return (
    <div className="relative space-y-6 pb-6">
        
        {/* Native Segmented Control for Mode Toggle */}
        <div className="bg-zinc-200/50 p-1 rounded-xl flex w-full">
          <button 
            onClick={() => setViewMode('B2C')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isB2B ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Patient Care
          </button>
          <button 
            onClick={() => setViewMode('B2B')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isB2B ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Professional
          </button>
        </div>

        {/* Premium Native Briefing Card */}
        <div className={`rounded-[28px] p-5 text-white relative overflow-hidden shadow-xl transition-colors duration-500 ${isB2B ? 'bg-gradient-to-br from-blue-900 to-[#0A192F]' : 'bg-gradient-to-br from-zinc-800 to-zinc-950'}`}>
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isB2B ? 'bg-blue-600' : 'bg-emerald-500'}`}>
                {isB2B ? <Users className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight leading-tight">
                  {isB2B ? 'Professional Network' : 'Telehealth Co-Pilot'}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Shield className={`w-3 h-3 ${isB2B ? 'text-blue-400' : 'text-emerald-400'}`} />
                  <p className={`font-bold uppercase tracking-widest text-[8px] ${isB2B ? 'text-blue-300' : 'text-zinc-400'}`}>
                    CMS Compliant • Feb 24
                  </p>
                </div>
              </div>
            </div>

            {/* Horizontal Scrollable Metrics for Mobile */}
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 no-scrollbar snap-x">
              <div className="min-w-[140px] p-3.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl snap-start">
                <div className={`flex items-center gap-1.5 mb-2 ${isB2B ? 'text-blue-300' : 'text-emerald-300'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {isB2B ? 'Consults' : 'Visits'}
                  </span>
                </div>
                <p className="text-xl font-black mb-0.5">{isB2B ? '4' : '8'}</p>
                <p className="text-[9px] font-medium text-white/60 leading-tight">
                  {isB2B ? '2 Specialists' : '3 CCM • 2 RPM'}
                </p>
              </div>
              
              <div className="min-w-[140px] p-3.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl snap-start">
                <div className={`flex items-center gap-1.5 mb-2 ${isB2B ? 'text-emerald-300' : 'text-orange-300'}`}>
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {isB2B ? 'Value' : 'Billing'}
                  </span>
                </div>
                <p className="text-xl font-black mb-0.5">{isB2B ? 'High' : '$1.2k'}</p>
                <p className="text-[9px] font-medium text-white/60 leading-tight">
                  {isB2B ? 'Strong conversion' : 'CPT 99490 & 99457'}
                </p>
              </div>

              <div className="min-w-[140px] p-3.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl snap-start">
                <div className={`flex items-center gap-1.5 mb-2 ${isB2B ? 'text-purple-300' : 'text-blue-300'}`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {isB2B ? 'Reviews' : 'Alerts'}
                  </span>
                </div>
                <p className="text-xl font-black mb-0.5">2</p>
                <p className="text-[9px] font-medium text-white/60 leading-tight">
                  {isB2B ? 'Reports ready' : 'High BP detected'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Sub-Navigation Tabs */}
        <div className="sticky -top-4 z-20 bg-zinc-50/90 backdrop-blur-xl -mx-4 px-4 py-3 border-b border-zinc-200/50">
          <div className="flex overflow-x-auto no-scrollbar gap-2">
            {[
              { id: 'schedule', label: 'Schedule' },
              { id: 'waiting_room', label: 'Waiting' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'availability', label: 'Availability' },
              { id: 'history', label: 'History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeSubTab === tab.id 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Areas */}
        <AnimatePresence mode="wait">
          {activeSubTab === 'schedule' && (
            <motion.div 
              key="schedule"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {upcomingVisits.filter(v => v.mode === viewMode).map(visit => (
                <div key={visit.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isB2B ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900">{visit.patient}</p>
                        <p className="text-xs text-zinc-500 font-medium">{visit.time} • {visit.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onStartVisit(visit.id, visit.mode as any)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95 ${isB2B ? 'bg-blue-600 shadow-blue-600/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${visit.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {visit.status}
                    </span>
                    {visit.urgency === 'High' && (
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {upcomingVisits.filter(v => v.mode === viewMode).length === 0 && (
                <div className="text-center py-8 text-zinc-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No visits scheduled</p>
                </div>
              )}
            </motion.div>
          )}

          {activeSubTab === 'waiting_room' && (
            <motion.div 
              key="waiting_room"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Queue</span>
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isB2B ? 'text-blue-500' : 'text-emerald-500'}`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isB2B ? 'bg-blue-500' : 'bg-emerald-500'}`}/> 
                  {waitingRoom.filter(w => w.mode === viewMode).length} Waiting
                </span>
              </div>
              {waitingRoom.filter(w => w.mode === viewMode).map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-zinc-900">{item.patient}</p>
                      <p className="text-xs text-zinc-500 font-medium">Wait time: <span className="text-orange-500 font-bold">{item.waitTime}</span></p>
                    </div>
                    <button 
                      onClick={() => onStartVisit(item.id, item.mode as any)}
                      disabled={item.status !== 'Ready'}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${item.status === 'Ready' ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-100 text-zinc-400'}`}
                    >
                      Admit
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${item.intake === 'Complete' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      Intake: {item.intake}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${item.vitals === 'Stable' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      Vitals: {item.vitals}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeSubTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Visits', value: '1,248', trend: '+12%', icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Avg Wait', value: '8.4m', trend: '-2.1m', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Satisfaction', value: '4.9/5', trend: '+0.2', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { label: 'Revenue', value: '$42.5k', trend: '+18%', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.trend}</span>
                    </div>
                    <p className="text-xl font-black text-zinc-900">{stat.value}</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100">
                <h3 className="text-sm font-black text-zinc-900 mb-4 tracking-tight">Weekly Volume</h3>
                <div className="h-32 flex items-end gap-2">
                  {[45, 62, 58, 75, 90, 82, 95].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: `${h}%` }}
                        className={`w-full rounded-t-md ${isB2B ? 'bg-blue-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'availability' && (
            <motion.div 
              key="availability"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Slot Duration */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100">
                <h3 className="text-sm font-black text-zinc-900 mb-3 tracking-tight">Slot Duration</h3>
                <div className="grid grid-cols-4 gap-2">
                  {['15', '30', '45', '60'].map(min => (
                    <button
                      key={min}
                      onClick={() => setSlotDuration(min)}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all ${slotDuration === min ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-zinc-900 tracking-tight">Weekly Hours</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">Auto-Sync Active</span>
                </div>
                
                <div className="space-y-4">
                  {schedule.map((slot, i) => (
                    <div key={slot.day} className="flex flex-col gap-3 pb-4 border-b border-zinc-50 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              const newSchedule = [...schedule];
                              newSchedule[i].active = !newSchedule[i].active;
                              setSchedule(newSchedule);
                            }}
                            className={`w-12 h-7 rounded-full transition-colors relative ${slot.active ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                          >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${slot.active ? 'left-6' : 'left-1'}`} />
                          </button>
                          <span className={`text-sm font-bold ${slot.active ? 'text-zinc-900' : 'text-zinc-400'}`}>{slot.day}</span>
                        </div>
                      </div>
                      
                      {slot.active && (
                        <div className="flex items-center gap-2 pl-[60px]">
                          <input 
                            type="time" 
                            value={slot.start}
                            onChange={(e) => {
                              const newSchedule = [...schedule];
                              newSchedule[i].start = e.target.value;
                              setSchedule(newSchedule);
                            }}
                            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                          <span className="text-zinc-400 text-xs font-bold">to</span>
                          <input 
                            type="time" 
                            value={slot.end}
                            onChange={(e) => {
                              const newSchedule = [...schedule];
                              newSchedule[i].end = e.target.value;
                              setSchedule(newSchedule);
                            }}
                            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <button className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-zinc-900/20">
                Save Availability
              </button>
            </motion.div>
          )}

          {activeSubTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search past visits..." 
                  className="w-full pl-9 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors" 
                />
              </div>
              {[
                { date: 'Feb 22', patient: 'Michael Ross', type: 'CCM Check-in', duration: '18m', status: 'Billed' },
                { date: 'Feb 21', patient: 'Emily Blunt', type: 'Telehealth Consult', duration: '25m', status: 'Signed' },
                { date: 'Feb 20', patient: 'David Tennant', type: 'RPM Interactive', duration: '12m', status: 'Signed' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">{item.patient}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.date} • {item.duration}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${item.status === 'Billed' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-600'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-zinc-500 font-medium">{item.type}</span>
                    <button className={`flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest ${isB2B ? 'text-blue-600' : 'text-emerald-600'}`}>
                      <FileText className="w-3 h-3" /> SOAP
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      
      {/* Floating Action Button (FAB) for Scheduling */}
      <button 
        onClick={() => setShowBookingModal(true)}
        className={`fixed bottom-24 right-6 w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center z-40 transition-transform active:scale-95 ${isB2B ? 'bg-blue-600 shadow-blue-600/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Booking Modal (Native Bottom Sheet Style) */}
      <AnimatePresence>
        {showBookingModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowBookingModal(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 z-[101] bg-white rounded-t-[32px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Schedule Visit</h3>
                <button onClick={() => setShowBookingModal(false)} className="p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex bg-zinc-100 p-1 rounded-xl mb-6">
                <button 
                  onClick={() => setBookingType('B2C')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${bookingType === 'B2C' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                >
                  Patient Care
                </button>
                <button 
                  onClick={() => setBookingType('B2B')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${bookingType === 'B2B' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                >
                  Professional
                </button>
              </div>

              <div className="space-y-5">
                {bookingStep === 1 ? (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Select {bookingType === 'B2B' ? 'Provider' : 'Patient'}</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                          type="text" 
                          placeholder="Search..." 
                          className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Specialty</label>
                        <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-3 text-sm focus:outline-none">
                          <option>Primary Care</option>
                          <option>Cardiology</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Visit Type</label>
                        <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-3 text-sm focus:outline-none">
                          <option>Consult</option>
                          <option>Follow-up</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={() => setBookingStep(2)}
                      className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all mt-4"
                    >
                      Find Availability
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Available Slots</label>
                      <div className="space-y-2">
                        {[
                          { name: 'Dr. Emily Chen', time: 'Today, 2:00 PM' },
                          { name: 'Dr. Marcus Thorne', time: 'Tomorrow, 9:30 AM' },
                        ].map((provider, i) => (
                          <div key={i} className="p-4 border border-zinc-200 rounded-xl hover:border-emerald-500 transition-colors cursor-pointer flex justify-between items-center bg-white">
                            <p className="font-bold text-zinc-900 text-sm">{provider.name}</p>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{provider.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1.5 text-emerald-700">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Scheduler</span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Optimized for CCM billing requirements.
                      </p>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={() => setBookingStep(1)}
                        className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => {
                          setShowBookingModal(false);
                          setBookingStep(1);
                        }}
                        className="flex-[2] py-4 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Confirm
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TelehealthModule;
