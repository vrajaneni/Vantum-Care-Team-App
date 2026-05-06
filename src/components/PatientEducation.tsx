import React, { useState } from 'react';
import { BookOpen, Upload, FileText, Video, Link as LinkIcon, Users, Calendar, CheckCircle, Clock, AlertCircle, Sparkles, X, Search, FileAudio, File, ChevronRight, Plus, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { MOCK_PATIENTS } from '../constants';

const INITIAL_CONTENT = [
  { id: 'c1', title: 'Understanding Your A1C', type: 'ai-summary', format: 'text', date: '2023-10-25' },
  { id: 'c2', title: 'Hypertension Diet Guide', type: 'upload', format: 'pdf', date: '2023-10-24' },
  { id: 'c3', title: 'How to use your inhaler', type: 'upload', format: 'video', date: '2023-10-20' },
];

const INITIAL_TRACKING = [
  { id: 't1', patientId: '1', patientName: 'Sarah Jenkins', contentId: 'c1', contentTitle: 'Understanding Your A1C', status: 'Completed', date: '2023-10-26' },
  { id: 't2', patientId: '2', patientName: 'Michael Chen', contentId: 'c2', contentTitle: 'Hypertension Diet Guide', status: 'In Progress', date: '2023-10-26' },
  { id: 't3', patientId: '3', patientName: 'Emma Thompson', contentId: 'c3', contentTitle: 'How to use your inhaler', status: 'Not Started', date: '2023-10-26' },
];

export default function PatientEducation() {
  const [activeTab, setActiveTab] = useState<'library' | 'assign' | 'tracking'>('library');
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [tracking, setTracking] = useState(INITIAL_TRACKING);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'ai' | 'upload' | null>(null);
  
  // AI Generation State
  const [clinicalText, setClinicalText] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  
  // Upload State
  const [uploadFormat, setUploadFormat] = useState<'pdf' | 'word' | 'video' | 'audio' | 'url'>('pdf');
  const [uploadUrl, setUploadUrl] = useState('');

  // Assignment State
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');

  const handleGenerateSummary = async () => {
    if (!clinicalText) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Simplify the following clinical information into patient-friendly language. Make it easy to understand, empathetic, and clear. Avoid complex medical jargon where possible, or explain it simply if necessary.\n\nClinical Information:\n${clinicalText}`,
      });
      setGeneratedSummary(response.text || 'Failed to generate summary.');
    } catch (error) {
      console.error('Error generating summary:', error);
      setGeneratedSummary('Error generating summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = () => {
    if (!contentTitle) return;
    const newContent = {
      id: `c${Date.now()}`,
      title: contentTitle,
      type: createType === 'ai' ? 'ai-summary' : 'upload',
      format: createType === 'ai' ? 'text' : uploadFormat,
      date: new Date().toISOString().split('T')[0],
    };
    setContent([newContent, ...content]);
    setShowCreateModal(false);
    setCreateType(null);
    setContentTitle('');
    setClinicalText('');
    setGeneratedSummary('');
  };

  const handleAssign = () => {
    if (selectedContent.length === 0 || selectedPatients.length === 0) return;
    
    const newTracking = [];
    for (const pId of selectedPatients) {
      const patient = MOCK_PATIENTS.find(p => p.id === pId);
      for (const cId of selectedContent) {
        const c = content.find(c => c.id === cId);
        if (patient && c) {
          newTracking.push({
            id: `t${Date.now()}-${pId}-${cId}`,
            patientId: pId,
            patientName: patient.name,
            contentId: cId,
            contentTitle: c.title,
            status: 'Not Started',
            date: scheduleDate || new Date().toISOString().split('T')[0],
          });
        }
      }
    }
    
    setTracking([...newTracking, ...tracking]);
    setSelectedContent([]);
    setSelectedPatients([]);
    setScheduleDate('');
    setActiveTab('tracking');
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'word': return <File className="w-4 h-4 text-blue-500" />;
      case 'video': return <Video className="w-4 h-4 text-purple-500" />;
      case 'audio': return <FileAudio className="w-4 h-4 text-yellow-500" />;
      case 'url': return <LinkIcon className="w-4 h-4 text-emerald-500" />;
      default: return <BookOpen className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Header */}
      <div className="p-4 md:p-6 bg-white border-b border-zinc-200 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">Patient Education</h2>
            <p className="text-xs text-zinc-500 font-medium">AI-powered health literacy & tracking</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          {[
            { id: 'library', label: 'Library', icon: BookOpen },
            { id: 'assign', label: 'Assign', icon: Users },
            { id: 'tracking', label: 'Tracking', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-zinc-500 group-hover:text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-zinc-600 group-hover:text-emerald-700">Create or Upload Content</span>
              </button>

              <div className="space-y-3">
                {content.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                        {getFormatIcon(item.format)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.date}</span>
                          {item.type === 'ai-summary' && (
                            <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-widest">
                              <Sparkles className="w-2 h-2" /> AI Generated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'assign' && (
            <motion.div
              key="assign"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Select Content */}
              <div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">1. Select Content</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar border border-zinc-200 rounded-2xl p-2 bg-white">
                  {content.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedContent.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedContent([...selectedContent, item.id]);
                          else setSelectedContent(selectedContent.filter(id => id !== item.id));
                        }}
                        className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-2">
                        {getFormatIcon(item.format)}
                        <span className="text-sm font-medium text-zinc-700">{item.title}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Select Patients */}
              <div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">2. Select Patients</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar border border-zinc-200 rounded-2xl p-2 bg-white">
                  {MOCK_PATIENTS.map((patient) => (
                    <label key={patient.id} className="flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedPatients.includes(patient.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedPatients([...selectedPatients, patient.id]);
                          else setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
                        }}
                        className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-zinc-700 block">{patient.name}</span>
                          <span className="text-[10px] text-zinc-500">{patient.conditions?.[0] || 'General'}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">3. Schedule (Optional)</h3>
                <input 
                  type="date" 
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <button 
                onClick={handleAssign}
                disabled={selectedContent.length === 0 || selectedPatients.length === 0}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Assign & Schedule
              </button>
            </motion.div>
          )}

          {activeTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Recent Assignments</h3>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" /> Nuvia Tracking Active
                </div>
              </div>

              <div className="space-y-3">
                {tracking.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">{item.patientName}</h4>
                        <p className="text-xs text-zinc-500">{item.contentTitle}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-3 border-t border-zinc-100">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                      {item.status === 'Completed' ? (
                        <span className="flex items-center gap-1 text-emerald-500"><CheckCircle className="w-3 h-3" /> Verified</span>
                      ) : item.status === 'In Progress' ? (
                        <span className="flex items-center gap-1 text-blue-500"><Clock className="w-3 h-3" /> Viewing</span>
                      ) : (
                        <span className="flex items-center gap-1 text-zinc-500"><AlertCircle className="w-3 h-3" /> Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-black tracking-tight">Add Educational Content</h3>
                <button onClick={() => { setShowCreateModal(false); setCreateType(null); }} className="p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto no-scrollbar flex-1">
                {!createType ? (
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => setCreateType('ai')}
                      className="p-6 border-2 border-zinc-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center text-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 group-hover:text-emerald-700">AI-Generated Summary</h4>
                        <p className="text-xs text-zinc-500 mt-1">Simplify complex clinical notes or lab reports into patient-friendly language.</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setCreateType('upload')}
                      className="p-6 border-2 border-zinc-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center text-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 group-hover:text-blue-700">Upload Existing Content</h4>
                        <p className="text-xs text-zinc-500 mt-1">Upload PDFs, Word docs, Videos, Audio, or share a URL.</p>
                      </div>
                    </button>
                  </div>
                ) : createType === 'ai' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">Content Title</label>
                      <input 
                        type="text" 
                        value={contentTitle}
                        onChange={(e) => setContentTitle(e.target.value)}
                        placeholder="e.g., Understanding Your Lab Results"
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">Clinical Information (Paste here)</label>
                      <textarea 
                        value={clinicalText}
                        onChange={(e) => setClinicalText(e.target.value)}
                        placeholder="Paste complex lab reports, care plans, or clinical notes here..."
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <button 
                      onClick={handleGenerateSummary}
                      disabled={!clinicalText || isGenerating}
                      className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-emerald-200 transition-colors"
                    >
                      {isGenerating ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {isGenerating ? 'Simplifying...' : 'Generate Patient-Friendly Summary'}
                    </button>

                    {generatedSummary && (
                      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Generated Summary</h4>
                        <p className="text-sm text-zinc-700 whitespace-pre-wrap">{generatedSummary}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">Content Title</label>
                      <input 
                        type="text" 
                        value={contentTitle}
                        onChange={(e) => setContentTitle(e.target.value)}
                        placeholder="e.g., Asthma Action Plan"
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">Format</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'pdf', label: 'PDF', icon: FileText },
                          { id: 'word', label: 'Word', icon: File },
                          { id: 'video', label: 'Video', icon: Video },
                          { id: 'audio', label: 'Audio', icon: FileAudio },
                          { id: 'url', label: 'URL Link', icon: LinkIcon },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            onClick={() => setUploadFormat(fmt.id as any)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                              uploadFormat === fmt.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            <fmt.icon className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase">{fmt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {uploadFormat === 'url' ? (
                      <div>
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">URL</label>
                        <input 
                          type="url" 
                          value={uploadUrl}
                          onChange={(e) => setUploadUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-zinc-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-zinc-50">
                        <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                        <p className="text-sm font-medium text-zinc-600">Tap to browse files</p>
                        <p className="text-xs text-zinc-400 mt-1">Supports {uploadFormat.toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {createType && (
                <div className="p-4 border-t border-zinc-100 shrink-0">
                  <button 
                    onClick={handleSaveContent}
                    disabled={!contentTitle || (createType === 'ai' && !generatedSummary)}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                  >
                    Save Content
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
