import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Lock, 
  ChevronRight, 
  Camera, 
  Mail, 
  Phone, 
  Building2, 
  Stethoscope,
  CheckCircle2,
  Settings,
  CreditCard,
  LogOut,
  Upload,
  X,
  Save,
  Globe,
  Briefcase,
  MapPin,
  Calendar
} from 'lucide-react';

interface ProfileProps {
  user: any;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'security'>('info');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || 'Dr. Richardson',
    role: user?.role || 'Cardiologist',
    npi: '1234567890',
    organization: 'Vantum Health Center',
    email: 'richardson@vantum.clinic',
    phone: '(555) 123-4567',
    specialty: 'Cardiovascular Disease',
    joined: 'Jan 2024',
    location: 'San Francisco, CA',
    bio: 'Dedicated cardiologist with over 12 years of experience in managing complex cardiovascular conditions and implementing remote patient monitoring solutions.'
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-8">
            {/* Photo Upload Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-zinc-50 rounded-[40px] border border-zinc-100">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[48px] bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl ring-1 ring-zinc-200 transition-transform duration-500 group-hover:scale-105">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-zinc-400" />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-900 rounded-2xl border-4 border-white flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-all shadow-xl hover:scale-110 active:scale-95"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload} 
                />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-lg font-black text-zinc-900 mb-1">Profile Picture</h3>
                <p className="text-xs text-zinc-500 mb-4 max-w-xs">A professional photo helps build trust with your patients and colleagues.</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                  >
                    Upload New
                  </button>
                  {profilePhoto && (
                    <button 
                      onClick={() => setProfilePhoto(null)}
                      className="px-4 py-2 bg-white text-zinc-500 border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-900/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Professional Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                      type="text" 
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-900/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-900/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-900/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-900/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">NPI Number</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                      type="text" 
                      name="npi"
                      value={formData.npi}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-900/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Professional Bio</label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-[32px] p-6 text-sm font-medium text-zinc-600 focus:outline-none focus:border-zinc-900/20 focus:bg-white transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button className="px-8 py-4 bg-zinc-50 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all">
                Cancel
              </button>
              <button className="px-8 py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-4">
            {[
              { id: 'notifications', label: 'Notification Preferences', icon: Bell, desc: 'Manage how you receive alerts and messages.' },
              { id: 'billing', label: 'Billing & Subscription', icon: CreditCard, desc: 'View your clinic plan and billing history.' },
              { id: 'preferences', label: 'App Preferences', icon: Settings, desc: 'Customize your dashboard and interface.' }
            ].map((item) => (
              <button key={item.id} className="w-full p-6 bg-zinc-50 rounded-[32px] border border-zinc-100 flex items-center justify-between group hover:bg-zinc-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-zinc-900">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4">
            {[
              { id: 'password', label: 'Change Password', icon: Lock, desc: 'Update your login credentials.' },
              { id: 'mfa', label: 'Two-Factor Authentication', icon: ShieldCheck, desc: 'Add an extra layer of security to your account.' },
              { id: 'sessions', label: 'Active Sessions', icon: User, desc: 'Manage your logged-in devices.' }
            ].map((item) => (
              <button key={item.id} className="w-full p-6 bg-zinc-50 rounded-[32px] border border-zinc-100 flex items-center justify-between group hover:bg-zinc-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-zinc-900">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-6">
      <div className="mb-16 flex flex-col md:flex-row items-center gap-10">
        <div className="relative group">
          <div className="w-40 h-40 rounded-[56px] bg-zinc-900 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-zinc-900/30 relative overflow-hidden ring-8 ring-zinc-50">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              formData.name.split(' ').map(n => n[0]).join('')
            )}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px]"
            >
              <Camera className="w-10 h-10 text-white mb-2" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Photo</span>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              Verified Provider
            </span>
            <span className="px-4 py-1.5 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-200">
              {formData.role}
            </span>
          </div>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tight leading-tight mb-3">{formData.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-zinc-500">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-bold">{formData.organization}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold">{formData.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold">Member since {formData.joined}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="px-8 py-4 bg-red-50 text-red-600 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      <div className="bg-white rounded-[64px] p-10 md:p-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-zinc-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
        
        <div className="flex items-center gap-2 mb-12 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'info', label: 'Profile Info', icon: User },
            { id: 'settings', label: 'App Settings', icon: Settings },
            { id: 'security', label: 'Security', icon: ShieldCheck }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-zinc-900 text-white shadow-2xl shadow-zinc-900/30 scale-105' 
                  : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
