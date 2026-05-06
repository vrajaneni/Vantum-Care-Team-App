import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Brain, 
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  Activity,
  Sparkles,
  Users,
  Plus,
  ChevronDown,
  Monitor,
  PenTool,
  Layout,
  Share,
  Hand,
  Crown,
  BarChart3,
  Palette
} from 'lucide-react';
import { Patient } from '../types';
import { geminiService } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface TelehealthRoomProps {
  patient: Patient;
  mode: 'B2B' | 'B2C';
  onEndCall: () => void;
}

const TelehealthRoom: React.FC<TelehealthRoomProps> = ({ patient, mode, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordingConsent, setShowRecordingConsent] = useState(false);
  const [transcript, setTranscript] = useState<{ speaker: string, text: string, time: string }[]>([]);
  const [soapNote, setSoapNote] = useState<any>(null);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [isGeneratingCMS, setIsGeneratingCMS] = useState(false);
  const [cmsReport, setCmsReport] = useState<string | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [showAiSidebar, setShowAiSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'ai' | 'chart' | 'chat' | 'analytics'>('ai');
  const [showBriefing, setShowBriefing] = useState(true);
  const [briefingMode, setBriefingMode] = useState<'provider' | 'patient'>('provider');
  const [billableTime, setBillableTime] = useState(0);
  const [cptStatus, setCptStatus] = useState({ code: '99490', progress: 14, target: 20 });
  const [participants, setParticipants] = useState([
    { id: 'p1', name: patient.name, role: 'Patient', status: 'connected', isMuted: false, isModerator: false, isSpeaking: false, hasHandRaised: false },
    { id: 'p2', name: 'Dr. Sarah Jenkins', role: 'Primary Provider', status: 'connected', isMuted: false, isModerator: true, isSpeaking: true, hasHandRaised: false }
  ]);
  const [b2bBranding, setB2bBranding] = useState({
    logo: 'https://picsum.photos/seed/logo/200/200',
    primaryColor: '#10b981', // emerald-500
    orgName: 'Nuvia Clinical Health'
  });
  const [engagementAnalytics, setEngagementAnalytics] = useState({
    participationScore: 85,
    speakingTime: { 'Patient': 45, 'Provider': 55 },
    attentionLevel: 'High'
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Ask about recent weight gain (CHF risk)",
    "Verify medication adherence for Lisinopril",
    "Check for peripheral edema"
  ]);

  // Mock transcription effect
  useEffect(() => {
    const lines = [
      { speaker: 'Provider', text: "Good morning, John. How have you been feeling since our last visit?" },
      { speaker: 'John', text: "I've been okay, but I've noticed my ankles are a bit swollen in the evenings." },
      { speaker: 'Provider', text: "I see. Have you been weighing yourself daily as we discussed?" },
      { speaker: 'John', text: "Yes, I've gained about 3 pounds in the last two days." },
      { speaker: 'Provider', text: "That's important information. Are you experiencing any shortness of breath?" },
      { speaker: 'John', text: "A little bit when I walk up the stairs." },
      { speaker: 'Provider', text: "We should adjust your diuretic dosage. I'll send the update to your pharmacy." },
      { speaker: 'John', text: "Thank you, doctor. I'll keep monitoring my weight." }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        const now = new Date();
        const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setTranscript(prev => [...prev, { ...lines[i], time: timestamp }]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Timer for billable time
  useEffect(() => {
    const interval = setInterval(() => {
      setBillableTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const generateCMSDoc = async () => {
    setIsGeneratingCMS(true);
    // Simulate AI generation based on transcript
    await new Promise(resolve => setTimeout(resolve, 2500));
    const fullTranscript = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
    
    // In a real app, we'd pass the transcript to Gemini to format it for CMS
    setCmsReport(`
# CMS COMPLIANT TELEHEALTH DOCUMENTATION
## Encounter Date: ${new Date().toLocaleDateString()}

**Patient:** ${patient.name}
**Provider:** Dr. Sarah Jenkins
**Duration:** ${formatTime(billableTime)}

### 1. Clinical Encounter Summary
Based on the live interaction, the patient reported ankle swelling and a 3lb weight gain over 48 hours. Shortness of breath was noted during exertion.

### 2. Medical Decision Making (MDM)
- Complexity: Moderate
- Data Reviewed: RPM vitals (BP 148/92), weight logs.
- Risk: High (Potential CHF exacerbation).

### 3. Plan & Coordination
Adjusted diuretic dosage. Patient instructed to continue daily weight monitoring and BP sync via RPM device. Follow-up scheduled for 7 days.

### 4. CMS Compliance Verification
- Synchronous Audio/Video: YES
- Patient Location: Home
- Provider Location: Clinic
- CPT Code: 99214 + G2212 (Extended Time)
    `);
    setIsGeneratingCMS(false);
  };

  const handleEndCall = async () => {
    setIsGeneratingNote(true);
    try {
      const fullTranscript = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
      const note = await geminiService.generateSOAPNote(fullTranscript);
      setSoapNote(note);
    } catch (error) {
      console.error("Failed to generate SOAP note", error);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleParticipantMute = (id: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMuted: !p.isMuted } : p));
  };

  const removeParticipant = (id: string) => {
    if (participants.find(p => p.id === id)?.role === 'Patient') return; // Don't remove patient
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const toggleHandRaise = () => {
    setParticipants(prev => prev.map(p => p.id === 'p2' ? { ...p, hasHandRaised: !p.hasHandRaised } : p));
  };

  const promoteToModerator = (id: string) => {
    const currentUser = participants.find(p => p.id === 'p2');
    if (!currentUser?.isModerator) return;
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isModerator: true } : p));
  };

  const inviteParticipant = (name: string, role: string) => {
    const newParticipant = {
      id: `p${Date.now()}`,
      name,
      role,
      status: 'connected',
      isMuted: false,
      isModerator: false,
      isSpeaking: false,
      hasHandRaised: false
    };
    setParticipants(prev => [...prev, newParticipant]);
    setShowInviteModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 md:rounded-[32px] overflow-hidden md:shadow-2xl md:border border-zinc-800 relative">
      <AnimatePresence>
        {showBriefing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-zinc-900 rounded-[40px] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <Brain className="w-48 h-48" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    {mode === 'B2B' ? (
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
                        <img src={b2bBranding.logo} alt="Org Logo" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        {mode === 'B2B' ? b2bBranding.orgName : 'Nuvia Visit Briefing'}
                      </h2>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Patient: {patient.name} • {patient.age}y/o</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {mode === 'B2B' && (
                      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <Palette className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Branded Waiting Room</span>
                      </div>
                    )}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setBriefingMode('provider')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${briefingMode === 'provider' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500'}`}
                        style={briefingMode === 'provider' && mode === 'B2B' ? { backgroundColor: b2bBranding.primaryColor } : {}}
                      >
                        Provider
                      </button>
                      <button 
                        onClick={() => setBriefingMode('patient')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${briefingMode === 'patient' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500'}`}
                        style={briefingMode === 'patient' && mode === 'B2B' ? { backgroundColor: b2bBranding.primaryColor } : {}}
                      >
                        Patient
                      </button>
                    </div>
                  </div>
                </div>

                {briefingMode === 'provider' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Automated Intake Summary</p>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-medium">PHQ-9 Score</span>
                            <span className="text-orange-400 font-black">12 (Moderate)</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-medium">Medication Confirmed</span>
                            <span className="text-emerald-400 font-black">Yes (4/4)</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-medium">Recent BP (RPM)</span>
                            <span className="text-red-400 font-black">148/92</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Chronic Conditions</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.conditions.map(c => (
                            <span key={c} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-300">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Nuvia Risk Alerts</p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            Elevated BP trend (3 days)
                          </li>
                          <li className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                            Moderate Depression (PHQ-9)
                          </li>
                          <li className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                            Medication Adherence Risk
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">CMS Program Status</p>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <p className="text-xs font-bold text-emerald-400">CCM: 14/20 mins logged</p>
                          <p className="text-[10px] text-emerald-500/70 font-medium mt-0.5">6 minutes remaining for 99490</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-10 space-y-6">
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Your Health Summary</p>
                      <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                        Hi {patient.name.split(' ')[0]}, today we'll review your heart health and medications. Nuvia noticed your weight has been slightly up, so we'll talk about that first.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Review Lisinopril adherence
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Discuss ankle swelling management
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Next steps for your Cardiology referral
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setShowBriefing(false)}
                  className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                >
                  <Video className="w-5 h-5" />
                  Admit Patient & Start Visit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-zinc-900 flex items-center justify-center min-h-[300px] md:min-h-0">
          {/* Status Indicators */}
          <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                {mode === 'B2B' ? 'Professional Consult' : `Live: ${patient.name}`}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-500/30">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Billable: {formatTime(billableTime)}</span>
            </div>
            {isRecording && (
              <div className="flex items-center gap-3 bg-red-500/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-red-500/30">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Recording</span>
              </div>
            )}
          </div>

          {/* AI Toggle for Mobile */}
          <button 
            onClick={() => setShowAiSidebar(!showAiSidebar)}
            className="md:hidden absolute top-4 right-4 z-20 p-3 bg-emerald-500 rounded-2xl text-white shadow-lg"
          >
            <Brain className="w-5 h-5" />
          </button>

          {/* Mock Patient Video */}
          <div className="w-full h-full relative overflow-hidden">
            <motion.img 
              src={`https://picsum.photos/seed/${patient.id}/1280/720`} 
              className="w-full h-full object-cover"
              alt="Patient Video"
              referrerPolicy="no-referrer"
              animate={{
                filter: ["brightness(1) contrast(1)", "brightness(1.05) contrast(1.02)", "brightness(1) contrast(1)"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Subtle Scanlines/Noise Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Connection Quality Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <div className="flex gap-0.5 items-end h-3">
                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                <div className="w-1 h-2 bg-emerald-500 rounded-full" />
                <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                <div className="w-1 h-2 bg-emerald-500 rounded-full opacity-30" />
              </div>
              <span className="text-[8px] text-white font-black uppercase tracking-widest">HD • 720p</span>
            </div>
          </div>

          {/* Self View */}
          <div className="absolute bottom-28 md:bottom-12 right-4 md:right-12 w-32 md:w-56 h-24 md:h-40 bg-zinc-800 rounded-2xl md:rounded-3xl border-2 border-white/20 overflow-hidden shadow-2xl z-20">
             <motion.img 
              src="https://picsum.photos/seed/doctor/400/300" 
              className="w-full h-full object-cover"
              alt="Doctor Video"
              referrerPolicy="no-referrer"
              animate={{
                filter: ["brightness(1)", "brightness(1.02)", "brightness(1)"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md border border-white/10">
              <span className="text-[8px] text-white font-bold uppercase tracking-widest">You</span>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-wrap items-center gap-2 md:gap-4 px-4 md:px-8 py-3 md:py-4 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 w-[95%] md:w-auto justify-center z-30">
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 md:p-5 rounded-2xl transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 md:p-5 rounded-2xl transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <Video className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
              <button 
                onClick={() => isRecording ? setIsRecording(false) : setShowRecordingConsent(true)}
                className={`p-3 md:p-5 rounded-2xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
                title="Record Session"
              >
                <Activity className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 md:p-5 rounded-2xl transition-all ${isScreenSharing ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                title="Screen Share"
              >
                <Monitor className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={() => setShowWhiteboard(!showWhiteboard)}
                className={`p-3 md:p-5 rounded-2xl transition-all ${showWhiteboard ? 'bg-purple-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                title="Whiteboard"
              >
                <PenTool className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={toggleHandRaise}
                className={`p-3 md:p-5 rounded-2xl transition-all ${participants.find(p => p.id === 'p2')?.hasHandRaised ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                title="Raise Hand"
              >
                <Hand className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="p-3 md:p-5 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all"
                title="Invite Participants"
              >
                <Users className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="w-px h-8 md:h-10 bg-white/10 mx-1 md:mx-2 hidden xs:block" />
            
            <button 
              onClick={soapNote ? onEndCall : handleEndCall}
              className="px-4 md:px-10 py-3 md:py-5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all shadow-xl shadow-red-500/20"
            >
              <PhoneOff className="w-4 h-4 md:w-6 md:h-6" />
              <span>{soapNote ? 'Exit' : 'End'}</span>
            </button>
          </div>
        </div>

        {/* Nuvia Co-Pilot Sidebar */}
        <AnimatePresence>
          {showAiSidebar && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-full md:w-[400px] bg-zinc-950 border-l border-zinc-800 flex flex-col h-1/2 md:h-full absolute md:relative bottom-0 left-0 z-50 md:z-0"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100" 
                      alt="Nuvia AI"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight text-sm">Nuvia Co-Pilot</h3>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Live Clinical Sentinel</p>
                  </div>
                </div>
                <button onClick={() => setShowAiSidebar(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

                {/* Sidebar Tabs */}
                <div className="grid grid-cols-4 gap-px bg-zinc-800 p-px border-b border-zinc-800">
                  {[
                    { id: 'ai', label: 'AI', icon: Sparkles },
                    { id: 'chart', label: 'Chart', icon: FileText },
                    { id: 'chat', label: 'Chat', icon: MessageSquare },
                    { id: 'analytics', label: 'Data', icon: BarChart3 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSidebarTab(tab.id as any)}
                      className={`flex flex-col items-center justify-center gap-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${
                        sidebarTab === tab.id 
                          ? 'bg-zinc-900 text-emerald-400' 
                          : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {/* Participants List */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Participants</p>
                    <button 
                      onClick={() => setShowInviteModal(true)}
                      className="p-1 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {participants.map(p => (
                      <div key={p.id} className={`flex items-center justify-between group/p p-2 rounded-xl transition-all ${p.isSpeaking ? 'bg-emerald-500/10 border border-emerald-500/30' : 'border border-transparent'}`}>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'connected' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                            {p.isSpeaking && (
                              <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="absolute inset-0 bg-emerald-500 rounded-full"
                              />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-zinc-300 font-medium">{p.name}</span>
                              {p.isModerator && <Crown className="w-2.5 h-2.5 text-yellow-500" />}
                              {p.hasHandRaised && <Hand className="w-2.5 h-2.5 text-yellow-400 animate-bounce" />}
                              {p.isSpeaking && <Mic className="w-2.5 h-2.5 text-emerald-500" />}
                            </div>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">{p.role}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/p:opacity-100 transition-opacity">
                          {participants.find(u => u.id === 'p2')?.isModerator && !p.isModerator && (
                            <button 
                              onClick={() => promoteToModerator(p.id)}
                              className="p-1.5 text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
                              title="Promote to Moderator"
                            >
                              <Crown className="w-3 h-3" />
                            </button>
                          )}
                          <button 
                            onClick={() => toggleParticipantMute(p.id)}
                            className={`p-1.5 rounded-lg transition-colors ${p.isMuted ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                          >
                            {p.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                          </button>
                          {p.role !== 'Patient' && (
                            <button 
                              onClick={() => removeParticipant(p.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Plus className="w-3 h-3 rotate-45" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {sidebarTab === 'ai' && (
                  <>
                    {/* CPT Tracking */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CPT {cptStatus.code} Progress</span>
                        <span className="text-[10px] font-bold text-emerald-400">{cptStatus.progress + Math.floor(billableTime/60)} / {cptStatus.target}m</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${((cptStatus.progress + billableTime/60) / cptStatus.target) * 100}%` }}
                        />
                      </div>
                      {cptStatus.progress + billableTime/60 >= cptStatus.target && (
                        <div className="mt-3 flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Threshold Met: Ready for Billing
                        </div>
                      )}
                    </div>

                    {/* Live Transcription */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Transcription</p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                          <Zap className="w-2.5 h-2.5 text-emerald-500" />
                          <span className="text-[8px] font-black text-emerald-500 uppercase">AI Processing</span>
                        </div>
                      </div>
                      <div className="space-y-4 max-h-[200px] overflow-y-auto no-scrollbar pr-2">
                        {transcript.map((line, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={i} 
                            className="text-xs leading-relaxed group"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={line.speaker === 'Provider' ? 'text-emerald-400 font-black uppercase text-[9px]' : 'text-zinc-500 font-black uppercase text-[9px]'}>
                                {line.speaker}
                              </span>
                              <span className="text-[8px] text-zinc-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{line.time}</span>
                            </div>
                            <p className="text-zinc-300">{line.text}</p>
                          </motion.div>
                        ))}
                        {transcript.length === 0 && <p className="text-zinc-600 text-xs italic">Awaiting audio input...</p>}
                      </div>
                    </div>

                    {/* AI Sentinel Alerts */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sentinel Insights</p>
                      {aiSuggestions.map((s, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={i} 
                          className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-zinc-300 font-medium flex items-start gap-3 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                          {s}
                        </motion.div>
                      ))}
                    </div>

                    {/* CMS Documentation Trigger */}
                    <div className="pt-4 border-t border-zinc-800">
                      <button 
                        onClick={generateCMSDoc}
                        disabled={isGeneratingCMS}
                        className="w-full py-4 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2"
                      >
                        {isGeneratingCMS ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Zap className="w-4 h-4" />
                          </motion.div>
                        ) : <FileText className="w-4 h-4" />}
                        {isGeneratingCMS ? 'Generating CMS Doc...' : 'Generate CMS Documentation'}
                      </button>
                    </div>
                  </>
                )}

                {sidebarTab === 'chart' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Recent Vitals</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/20 rounded-xl">
                          <p className="text-[8px] text-zinc-500 font-bold uppercase">Blood Pressure</p>
                          <p className="text-sm font-black text-red-400">148/92</p>
                        </div>
                        <div className="p-3 bg-black/20 rounded-xl">
                          <p className="text-[8px] text-zinc-500 font-bold uppercase">Weight</p>
                          <p className="text-sm font-black text-orange-400">184.2 lbs</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Medications</p>
                      {['Lisinopril 20mg', 'Metformin 500mg', 'Atorvastatin 40mg'].map((med) => (
                        <div key={med} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                          <span className="text-xs text-zinc-300">{med}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Care Plan Goal</p>
                      <p className="text-xs text-zinc-300 leading-relaxed">Reduce sodium intake to &lt;2000mg/day and maintain daily weight log.</p>
                    </div>
                  </div>
                )}

                {sidebarTab === 'chat' && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[8px] font-black text-zinc-500 uppercase">Dr. Jenkins</span>
                        <div className="bg-zinc-800 p-3 rounded-2xl rounded-tl-none text-xs text-zinc-300 max-w-[80%]">
                          I'm reviewing the cardiology referral now.
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                      <button className="p-2 bg-emerald-500 rounded-xl text-white">
                        <Zap className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {sidebarTab === 'analytics' && mode === 'B2B' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Engagement Analytics</p>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-zinc-400 font-medium">Participation Score</span>
                            <span className="text-emerald-400 font-black text-xs">{engagementAnalytics.participationScore}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${engagementAnalytics.participationScore}%` }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="p-3 bg-black/20 rounded-xl">
                            <p className="text-[8px] text-zinc-500 font-bold uppercase mb-1">Attention Level</p>
                            <p className="text-xs font-black text-white">{engagementAnalytics.attentionLevel}</p>
                          </div>
                          <div className="p-3 bg-black/20 rounded-xl">
                            <p className="text-[8px] text-zinc-500 font-bold uppercase mb-1">Avg. Response Time</p>
                            <p className="text-xs font-black text-white">1.2s</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Speaking Time Distribution</p>
                          <div className="flex h-4 rounded-lg overflow-hidden border border-white/5">
                            <div className="bg-emerald-500 h-full" style={{ width: '45%' }} />
                            <div className="bg-blue-500 h-full" style={{ width: '55%' }} />
                          </div>
                          <div className="flex justify-between mt-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              <span className="text-[8px] text-zinc-400 font-bold uppercase">Patient (45%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <span className="text-[8px] text-zinc-400 font-bold uppercase">Provider (55%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">B2B Insight</p>
                      <p className="text-xs text-zinc-300 leading-relaxed">Engagement is 12% higher than the organizational average for this provider-patient pair.</p>
                    </div>
                  </div>
                )}

                {/* Post-Visit Documentation */}
                <AnimatePresence>
                  {isGeneratingNote && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 space-y-4 bg-white/5 rounded-3xl border border-white/10"
                    >
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">Nuvia is drafting SOAP note...</p>
                    </motion.div>
                  )}

                  {cmsReport && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-3xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-blue-400">
                          <Shield className="w-5 h-5" />
                          <span className="font-bold text-sm">CMS Compliant Draft</span>
                        </div>
                        <button onClick={() => setCmsReport(null)} className="text-zinc-500 hover:text-white">
                          <Plus className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                      <div className="text-[10px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto no-scrollbar">
                        {cmsReport}
                      </div>
                      <button className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                        Finalize CMS Submission
                      </button>
                    </motion.div>
                  )}

                  {soapNote && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold text-sm">AI-Drafted SOAP Note</span>
                          </div>
                          <div className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase">98% Match</div>
                        </div>
                        
                        <div className="space-y-5 text-[11px]">
                          {['Subjective', 'Objective', 'Assessment', 'Plan'].map((section) => (
                            <div key={section}>
                              <p className="font-black text-zinc-500 uppercase tracking-widest mb-1.5 text-[9px]">{section}</p>
                              <p className="text-zinc-200 leading-relaxed">{soapNote[section.toLowerCase()]}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 space-y-3">
                          <button className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                            Approve & Sign Note
                          </button>
                          <button className="w-full py-3.5 bg-white/5 text-zinc-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                            Edit Draft
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Compliance Footer */}
              <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-center gap-2">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">HIPAA Compliant • AES-256 Encrypted</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Recording Consent Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-zinc-900 rounded-[32px] p-8 shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white tracking-tight">Invite Participants</h3>
                <button onClick={() => setShowInviteModal(false)} className="text-zinc-500 hover:text-white">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-6 mb-2">Suggested Contacts</p>
                {[
                  { name: 'Dr. Michael Smith', role: 'Cardiologist', type: 'B2B' },
                  { name: 'Jane Doe', role: 'Family Member', type: 'B2C' },
                  { name: 'Sarah Wilson', role: 'Nurse Practitioner', type: 'B2B' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                    <div>
                      <p className="text-sm font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{p.role}</p>
                    </div>
                    <button 
                      onClick={() => inviteParticipant(p.name, p.role)}
                      className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      Invite
                    </button>
                  </div>
                ))}

                <div className="pt-4 border-t border-white/5">
                  <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Share className="w-4 h-4" />
                    Copy Meeting Link
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Consent Modal */}
      <AnimatePresence>
        {showRecordingConsent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">Record Visit?</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-8 font-medium">
                This visit will be recorded for clinical documentation purposes. Please ensure you have obtained verbal consent from the patient before proceeding.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowRecordingConsent(false)}
                  className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setIsRecording(true);
                    setShowRecordingConsent(false);
                  }}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Start Recording
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TelehealthRoom;
