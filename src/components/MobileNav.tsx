import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Activity, 
  FileText, 
  MessageSquare,
  Sparkles,
  ClipboardList,
  MoreHorizontal,
  X,
  CreditCard
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'nuvia', label: 'Nuvia Co-Pilot', icon: Sparkles, isAi: true },
    { id: 'telehealth', label: 'Visit', icon: Video },
    { id: 'more', label: 'More', icon: MoreHorizontal, isMore: true },
  ];

  const moreItems = [
    { id: 'tasks', label: 'Clinical Tasks', icon: ClipboardList, description: 'Manage care workflow' },
    { id: 'rpm', label: 'RPM Monitoring', icon: Activity, description: 'Remote Patient Monitoring' },
    { id: 'labs', label: 'Lab Reports', icon: FileText, description: 'View and analyze labs' },
    { id: 'billing', label: 'Billing & Claims', icon: CreditCard, description: 'Manage revenue cycle' },
    { id: 'shift-summary', label: 'Shift Summary', icon: ClipboardList, description: 'Daily clinical overview' },
  ];

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-white/10 px-2 pb-safe pt-2 z-50 flex justify-around items-center h-24 rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
        {mainItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.isMore) {
                setShowMore(true);
              } else {
                setActiveTab(item.id);
                setShowMore(false);
              }
            }}
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all relative ${
              item.isAi 
                ? 'scale-110 -translate-y-8' 
                : activeTab === item.id || (item.isMore && moreItems.some(m => m.id === activeTab))
                  ? 'text-emerald-400' 
                  : 'text-zinc-500'
            }`}
          >
            {(activeTab === item.id || (item.isMore && moreItems.some(m => m.id === activeTab))) && !item.isAi && (
              <motion.div 
                layoutId="activeTabMobile"
                className="absolute inset-0 bg-white/5 rounded-2xl -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            {item.isAi ? (
              <div className="w-16 h-16 bg-emerald-500 rounded-[24px] flex items-center justify-center shadow-2xl shadow-emerald-500/50 relative overflow-hidden group border-4 border-zinc-900">
                <img 
                  src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt="Nuvia AI"
                  className="w-full h-full object-cover relative z-10"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/40 to-transparent z-20" />
                {activeTab === 'nuvia' && (
                  <motion.div 
                    layoutId="activeAiGlow"
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            ) : (
              <item.icon className={`w-6 h-6 transition-transform ${activeTab === item.id ? 'scale-110' : 'scale-100'}`} />
            )}
            <span className={`text-[9px] font-black uppercase tracking-widest ${item.isAi ? 'text-emerald-400 mt-2' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* More Menu Bottom Sheet */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 rounded-t-[40px] z-[70] p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white tracking-tight">More Modules</h3>
                <button 
                  onClick={() => setShowMore(false)}
                  className="p-2 bg-white/5 rounded-xl text-zinc-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {moreItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMore(false);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      activeTab === item.id ? 'bg-white/20' : 'bg-zinc-800'
                    }`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{item.label}</p>
                      <p className={`text-[10px] ${activeTab === item.id ? 'text-white/70' : 'text-zinc-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8 h-8" /> {/* Safe area spacer */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;
