import React from 'react';
import Logo from './Logo';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Activity, 
  FileText, 
  MessageSquare, 
  Settings,
  ShieldCheck,
  LogOut,
  Stethoscope,
  ClipboardList
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Queue', icon: Users },
    { id: 'rpm', label: 'Vitals & RPM', icon: Activity },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'billing', label: 'Billing & CMS', icon: FileText },
    { id: 'labs', label: 'Lab Reports', icon: FileText },
    { id: 'messages', label: 'Messaging', icon: MessageSquare },
    { id: 'shift-summary', label: 'Shift Summary', icon: ClipboardList },
  ];

  return (
    <div className="w-72 bg-zinc-950 text-zinc-400 flex flex-col h-screen border-r border-white/5">
      <div className="p-8 flex items-center gap-4">
        <Logo />
        <div className="flex flex-col">
          <span className="text-white font-black text-xl tracking-tighter leading-none">Vantum Clinic</span>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">AI Co-Pilot Care Journey</span>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-1.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
                : 'hover:bg-white/5 hover:text-zinc-200'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-zinc-500'}`} />
            <span className="font-bold tracking-tight text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl mb-4 border transition-all ${
            activeTab === 'profile' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/5 border-white/5 hover:bg-white/10'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border ${
            activeTab === 'profile' ? 'bg-white/20 border-white/20 text-white' : 'bg-zinc-800 border-white/5 text-zinc-300'
          }`}>
            DR
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className={`text-sm font-bold truncate ${activeTab === 'profile' ? 'text-white' : 'text-zinc-200'}`}>Dr. Richardson</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${activeTab === 'profile' ? 'text-white/70' : 'text-zinc-500'}`}>Cardiologist</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all group">
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
