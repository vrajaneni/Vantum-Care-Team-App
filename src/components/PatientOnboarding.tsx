import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Fingerprint, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  Mail, 
  Phone, 
  AlertCircle,
  ArrowLeft,
  Info,
  UserPlus,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientOnboardingProps {
  onComplete: () => void;
}

const PatientOnboarding: React.FC<PatientOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    problems: '',
    medications: '',
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [consents, setConsents] = useState({
    hipaa: false,
    terms: false,
    dataSharing: false
  });

  const totalSteps = 7;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Patient Onboarding</h2>
            <p className="text-zinc-500 leading-relaxed">
              Welcome to Vantum Clinic. To provide you with the best care, we need to collect some information about you. 
              Your data is protected by <span className="text-zinc-900 font-bold">HIPAA-compliant</span> security.
            </p>
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-600 font-medium">Secure clinical data storage</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-600 font-medium">Direct connection to your care team</p>
              </div>
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              Start Onboarding
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Demographics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">First Name</label>
                <input 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Last Name</label>
                <input 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Date of Birth</label>
                <input 
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Phone Number</label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 000-0000"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Address</label>
              <input 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all mt-4"
            >
              Continue
            </button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Clinical History</h2>
            <p className="text-zinc-500 text-sm">Please list any current medical problems or chronic conditions.</p>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Current Problems</label>
              <textarea 
                name="problems"
                value={formData.problems}
                onChange={handleInputChange}
                placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma..."
                className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none h-40 resize-none"
              />
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all"
            >
              Continue
            </button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Medications</h2>
            <p className="text-zinc-500 text-sm">List all current medications, including dosage and frequency.</p>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Current Medications</label>
              <textarea 
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                placeholder="e.g. Lisinopril 10mg daily, Metformin 500mg twice daily..."
                className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none h-40 resize-none"
              />
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all"
            >
              Continue
            </button>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Insurance Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Insurance Provider</label>
                <input 
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleInputChange}
                  placeholder="Blue Cross Blue Shield"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Policy Number</label>
                <input 
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleInputChange}
                  placeholder="ABC123456789"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Group Number</label>
                <input 
                  name="groupNumber"
                  value={formData.groupNumber}
                  onChange={handleInputChange}
                  placeholder="98765"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all mt-4"
            >
              Continue
            </button>
          </motion.div>
        );

      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Emergency Contact & Consents</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Contact Name</label>
                  <input 
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Contact Phone</label>
                  <input 
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    placeholder="(555) 111-2222"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'hipaa', label: 'HIPAA Data Authorization', desc: 'Allows Vantum to securely process your health records.' },
                  { id: 'terms', label: 'Terms of Service', desc: 'Agreement to our platform usage policies.' },
                  { id: 'dataSharing', label: 'Care Team Data Sharing', desc: 'Allows sharing vitals with your assigned providers.' }
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <input 
                      type="checkbox" 
                      id={item.id}
                      checked={consents[item.id as keyof typeof consents]}
                      onChange={(e) => setConsents(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      className="mt-1 w-5 h-5 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor={item.id} className="cursor-pointer">
                      <p className="font-bold text-zinc-900 text-sm">{item.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={nextStep}
              disabled={!consents.hipaa || !consents.terms}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finalize Onboarding
            </button>
          </motion.div>
        );

      case 7:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Onboarding Complete!</h2>
            <p className="text-zinc-500 leading-relaxed">
              Thank you, {formData.firstName}. Your information has been securely transmitted to your care team. 
              You can now access your patient dashboard.
            </p>
            <button 
              onClick={onComplete}
              className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-zinc-900/20"
            >
              Go to Dashboard
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-zinc-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-zinc-100 relative overflow-hidden">
        {/* Progress Bar */}
        {step < totalSteps && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
              className="h-full bg-emerald-500"
            />
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          {step > 1 && step < totalSteps ? (
            <button onClick={prevStep} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : <div className="w-5 h-5" />}
          
          {step < totalSteps && (
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Step {step} of {totalSteps - 1}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Footer Info */}
        {step === 1 && (
          <div className="mt-12 pt-8 border-t border-zinc-100 flex items-center justify-center gap-4 opacity-50">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">256-bit AES</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientOnboarding;
