import React, { useState, useRef } from 'react';
import { 
  Search, 
  Upload, 
  FileText, 
  Share2, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  User,
  X,
  Send,
  Users,
  MessageSquare,
  ArrowLeft,
  Scan,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { MOCK_PATIENTS } from '../constants';
import { geminiService } from '../services/geminiService';

interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  date: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
  summary?: string;
  analysis?: string;
  findings?: {
    parameter: string;
    value: string;
    unit: string;
    reference: string;
    status: 'Normal' | 'Abnormal' | 'Critical';
  }[];
}

const MOCK_REPORTS: LabReport[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Doe',
    type: 'Complete Blood Count (CBC)',
    date: '2024-02-20',
    status: 'Normal',
    summary: 'All parameters within normal range.',
    analysis: 'The CBC results show a healthy balance of red and white blood cells. Hemoglobin and hematocrit levels are optimal, indicating no signs of anemia. Platelet count is also normal, suggesting efficient blood clotting capabilities.',
    findings: [
      { parameter: 'WBC', value: '6.4', unit: 'x10E3/uL', reference: '3.4-10.8', status: 'Normal' },
      { parameter: 'RBC', value: '4.82', unit: 'x10E6/uL', reference: '4.14-5.80', status: 'Normal' },
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', reference: '12.6-17.7', status: 'Normal' },
      { parameter: 'Hematocrit', value: '42.1', unit: '%', reference: '37.5-51.0', status: 'Normal' }
    ]
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Jane Smith',
    type: 'Metabolic Panel',
    date: '2024-02-18',
    status: 'Abnormal',
    summary: 'Elevated glucose levels detected.',
    analysis: 'The metabolic panel indicates elevated fasting glucose levels (126 mg/dL), which is in the pre-diabetic range. Kidney and liver function markers (BUN, Creatinine, ALT, AST) are within normal limits. Electrolyte balance is stable.',
    findings: [
      { parameter: 'Glucose', value: '126', unit: 'mg/dL', reference: '65-99', status: 'Abnormal' },
      { parameter: 'BUN', value: '18', unit: 'mg/dL', reference: '7-25', status: 'Normal' },
      { parameter: 'Creatinine', value: '0.92', unit: 'mg/dL', reference: '0.60-1.35', status: 'Normal' },
      { parameter: 'Sodium', value: '138', unit: 'mmol/L', reference: '135-146', status: 'Normal' }
    ]
  }
];

const Labs: React.FC = () => {
  const [reports, setReports] = useState<LabReport[]>(MOCK_REPORTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Normal' | 'Abnormal' | 'Critical'>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Last 7 Days' | 'Last 30 Days'>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState<'patient' | 'team'>('patient');
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render((decodedText) => {
        console.log("Decoded text:", decodedText);
        // Simulate finding a patient from QR
        const patient = MOCK_PATIENTS.find(p => p.id === decodedText) || MOCK_PATIENTS[0];
        setSelectedPatient(patient.id);
        scanner.clear();
        setIsScanning(false);
        setShowUploadModal(true);
      }, (error) => {
        // console.warn(error);
      });
      
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleAiAsk = async () => {
    if (!aiInput.trim() || !selectedReport) return;
    
    const userMsg = aiInput;
    setAiChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiInput('');
    setIsAiThinking(true);
    
    try {
      const prompt = `The user is asking a follow-up question about this lab report:
      REPORT TYPE: ${selectedReport.type}
      PATIENT: ${selectedReport.patientName}
      ANALYSIS: ${selectedReport.analysis}
      
      USER QUESTION: ${userMsg}`;
      
      const response = await geminiService.generateContent(prompt);
      setAiChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      console.error("AI follow-up failed", error);
      setAiChatMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I couldn't process that question right now." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPatient = selectedPatient ? report.patientId === selectedPatient : true;
    const matchesStatus = statusFilter === 'All' ? true : report.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'All') {
      const reportDate = new Date(report.date);
      const now = new Date();
      const diffDays = (now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24);
      if (dateFilter === 'Last 7 Days') matchesDate = diffDays <= 7;
      if (dateFilter === 'Last 30 Days') matchesDate = diffDays <= 30;
    }
    
    return matchesSearch && matchesPatient && matchesStatus && matchesDate;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!selectedPatient) {
      setUploadError("Please select a patient first.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      setIsUploading(false);
      setAnalyzing(true);

      // Simulate AI Analysis
      const patient = MOCK_PATIENTS.find(p => p.id === selectedPatient);
      const newReport: LabReport = {
        id: Date.now().toString(),
        patientId: selectedPatient,
        patientName: patient?.name || 'Unknown',
        type: file.name.replace(/\.[^/.]+$/, "") || 'Uploaded Report',
        date: new Date().toISOString().split('T')[0],
        status: 'Normal',
        findings: [
          { parameter: 'Glucose, Fasting', value: '104', unit: 'mg/dL', reference: '65-99', status: 'Abnormal' },
          { parameter: 'BUN', value: '14', unit: 'mg/dL', reference: '7-25', status: 'Normal' },
          { parameter: 'Creatinine', value: '0.88', unit: 'mg/dL', reference: '0.60-1.35', status: 'Normal' },
          { parameter: 'Sodium', value: '140', unit: 'mmol/L', reference: '135-146', status: 'Normal' },
          { parameter: 'Potassium', value: '4.2', unit: 'mmol/L', reference: '3.5-5.3', status: 'Normal' }
        ]
      };

      // In a real app, we'd send the file content to Gemini
      const prompt = `Analyze this lab report for ${patient?.name}. Provide two parts: 
      1. ANALYSIS: A detailed clinical analysis.
      2. SUMMARY: A concise, user-friendly summary (max 2 sentences).
      Format the response as:
      ANALYSIS: [analysis text]
      SUMMARY: [summary text]`;
      
      const response = await geminiService.generateContent(prompt);
      const text = response;
      
      const analysisMatch = text.match(/ANALYSIS:\s*([\s\S]*?)(?=SUMMARY:|$)/i);
      const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)$/i);
      
      newReport.analysis = analysisMatch ? analysisMatch[1].trim() : text;
      newReport.summary = summaryMatch ? summaryMatch[1].trim() : "Analysis completed by Nuvia AI.";
      
      // Update status based on findings
      if (newReport.findings?.some(f => f.status === 'Critical')) newReport.status = 'Critical';
      else if (newReport.findings?.some(f => f.status === 'Abnormal')) newReport.status = 'Abnormal';

      setReports([newReport, ...reports]);
      setSelectedReport(newReport);
      setShowUploadModal(false);
    } catch (error) {
      console.error("AI Analysis failed", error);
      setUploadError("AI Analysis failed. Please try again.");
    } finally {
      setIsUploading(false);
      setAnalyzing(false);
    }
  };

  const handleShare = () => {
    if (!selectedReport) return;
    
    const interpretation = selectedReport.summary || selectedReport.analysis || "No analysis available.";
    const shareContent = `Lab Report: ${selectedReport.type}\nPatient: ${selectedReport.patientName}\nDate: ${selectedReport.date}\nStatus: ${selectedReport.status}\n\nNuvia AI Interpretation:\n${interpretation}`;
    
    // Simulate sharing
    console.log("Sharing content:", shareContent);
    alert(`Report shared with ${shareTarget === 'patient' ? 'Patient' : 'Care Team'}.\n\nContent includes Nuvia AI interpretation.`);
    setShowShareModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-zinc-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Lab Reports</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nuvia Diagnostic Hub</p>
          </div>
          <button 
            onClick={() => {
              setUploadError(null);
              setShowUploadModal(true);
            }}
            className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button 
            onClick={() => setSelectedPatient(selectedPatient ? null : MOCK_PATIENTS[0].id)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              selectedPatient ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Patient Filter Pills */}
      <div className="px-6 py-2 overflow-x-auto no-scrollbar flex gap-2 bg-white border-b border-zinc-100">
        <button 
          onClick={() => setSelectedPatient(null)}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
            !selectedPatient ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
          }`}
        >
          All Patients
        </button>
        {MOCK_PATIENTS.map(p => (
          <button 
            key={p.id}
            onClick={() => setSelectedPatient(p.id)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              selectedPatient === p.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Additional Filters */}
      <div className="px-6 py-3 bg-white border-b border-zinc-200 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-2">Status</p>
            <div className="flex gap-1">
              {['All', 'Normal', 'Abnormal', 'Critical'].map(s => (
                <button 
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                    statusFilter === s ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-2">Timeframe</p>
            <div className="flex gap-1">
              {['All', 'Last 7 Days', 'Last 30 Days'].map(d => (
                <button 
                  key={d}
                  onClick={() => setDateFilter(d as any)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                    dateFilter === d ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {d === 'All' ? 'All' : d.replace('Last ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {filteredReports.map((report) => (
          <motion.div 
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedReport(report)}
            className="bg-white p-5 rounded-[32px] border border-zinc-200 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">{report.type}</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{report.patientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReport(report);
                    setShowShareModal(true);
                  }}
                  className="p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-emerald-500 hover:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  report.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 
                  report.status === 'Abnormal' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {report.status}
                </div>
              </div>
            </div>

            {report.summary && (
              <div className="mb-4 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded bg-emerald-500/20 flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=50&h=50" 
                      alt="Nuvia AI"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Nuvia Summary</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {report.summary}
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              <span>{report.date}</span>
              <div className="flex items-center gap-1 text-emerald-500">
                <div className="w-3 h-3 rounded bg-emerald-500/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=50&h=50" 
                    alt="Nuvia AI"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span>Nuvia Analyzed</span>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No reports found</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
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
              className="w-full max-w-lg bg-white rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Upload Lab Report</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 bg-zinc-100 rounded-full">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Select Patient</label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                    {MOCK_PATIENTS.map(patient => (
                      <button 
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          selectedPatient === patient.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4" />
                          <span className="font-bold text-sm">{patient.name}</span>
                        </div>
                        {selectedPatient === patient.id && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => {
                      if (!selectedPatient) {
                        setUploadError("Please select a patient first.");
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    className={`border-2 border-dashed rounded-[32px] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      !selectedPatient ? 'border-zinc-100 bg-zinc-50/50 opacity-50' : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${!selectedPatient ? 'bg-zinc-200' : 'bg-emerald-500/10'}`}>
                      <Upload className={`w-6 h-6 ${!selectedPatient ? 'text-zinc-400' : 'text-emerald-500'}`} />
                    </div>
                    <div className="text-center">
                      <p className={`font-bold text-xs ${!selectedPatient ? 'text-zinc-400' : 'text-zinc-900'}`}>Upload PDF</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      if (!selectedPatient) {
                        setUploadError("Please select a patient first.");
                        return;
                      }
                      startScanner();
                    }}
                    className={`border-2 border-dashed rounded-[32px] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      !selectedPatient ? 'border-zinc-100 bg-zinc-50/50 opacity-50' : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${!selectedPatient ? 'bg-zinc-200' : 'bg-blue-500/10'}`}>
                      <Scan className={`w-6 h-6 ${!selectedPatient ? 'text-zinc-400' : 'text-blue-500'}`} />
                    </div>
                    <div className="text-center">
                      <p className={`font-bold text-xs ${!selectedPatient ? 'text-zinc-400' : 'text-zinc-900'}`}>Scan Report</p>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-xs font-bold">{uploadError}</p>
                  </motion.div>
                )}

                <AnimatePresence>
                  {isScanning && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[200] bg-black flex flex-col"
                    >
                      <div className="p-6 flex items-center justify-between text-white">
                        <h3 className="text-xl font-black tracking-tight">Scan QR/Barcode</h3>
                        <button onClick={stopScanner} className="p-2 bg-white/10 rounded-full">
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div id="reader" className="w-full max-w-sm overflow-hidden rounded-3xl border-4 border-emerald-500" />
                      </div>
                      <div className="p-10 text-center text-white/60">
                        <p className="text-sm font-medium">Position the QR code or barcode within the frame to scan</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                />

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-500" 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {analyzing && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center overflow-hidden"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=50&h=50" 
                        alt="Nuvia AI"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                    <p className="text-xs font-bold text-emerald-700">Nuvia is analyzing the report...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-white flex flex-col"
          >
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <button onClick={() => setSelectedReport(null)} className="p-2 bg-zinc-100 rounded-full">
                <ArrowLeft className="w-5 h-5 text-zinc-500" />
              </button>
              <div className="text-center">
                <h3 className="font-black text-zinc-900 tracking-tight">{selectedReport.type}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{selectedReport.patientName}</p>
              </div>
              <button 
                onClick={() => setShowShareModal(true)}
                className="p-2 bg-emerald-500 rounded-full text-white"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="p-6 bg-zinc-950 rounded-[40px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Nuvia AI Analysis</span>
                  </div>
                  <h4 className="text-xl font-black mb-4 tracking-tight">Clinical Summary</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium mb-6">
                    {selectedReport.analysis || "Analysis pending..."}
                  </p>
                  <button 
                    onClick={() => setShowAiChat(!showAiChat)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    {showAiChat ? 'Close Chat' : 'Ask Nuvia'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showAiChat && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-zinc-50 rounded-[32px] border border-zinc-200 overflow-hidden flex flex-col"
                  >
                    <div className="p-4 bg-zinc-100 border-b border-zinc-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Nuvia Follow-up</span>
                    </div>
                    <div className="flex-1 max-h-60 overflow-y-auto p-4 space-y-4">
                      {aiChatMessages.length === 0 && (
                        <p className="text-xs text-zinc-400 text-center py-4">Ask any question about these results...</p>
                      )}
                      {aiChatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                            msg.role === 'user' ? 'bg-zinc-900 text-white rounded-tr-none' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isAiThinking && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-zinc-200 p-3 rounded-2xl rounded-tl-none">
                            <motion.div 
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="flex gap-1"
                            >
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white border-t border-zinc-200 flex gap-2">
                      <input 
                        type="text" 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                        placeholder="Ask Nuvia..."
                        className="flex-1 bg-zinc-50 border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button 
                        onClick={handleAiAsk}
                        disabled={isAiThinking || !aiInput.trim()}
                        className="p-2 bg-zinc-900 text-white rounded-xl disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                {selectedReport.findings && (
                  <div>
                    <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Analyzed Results</h5>
                    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-100">
                            <th className="px-4 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Parameter</th>
                            <th className="px-4 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Value</th>
                            <th className="px-4 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Ref Range</th>
                            <th className="px-4 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {selectedReport.findings.map((finding, i) => (
                            <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-4 py-3 text-xs font-bold text-zinc-900">{finding.parameter}</td>
                              <td className="px-4 py-3 text-xs font-medium text-zinc-600">{finding.value} <span className="text-[10px] text-zinc-400">{finding.unit}</span></td>
                              <td className="px-4 py-3 text-xs text-zinc-500">{finding.reference}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                  finding.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 
                                  finding.status === 'Abnormal' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {finding.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Report Details</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-[8px] text-zinc-400 font-bold uppercase mb-1">Date</p>
                      <p className="text-xs font-bold text-zinc-900">{selectedReport.date}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-[8px] text-zinc-400 font-bold uppercase mb-1">Status</p>
                      <p className={`text-xs font-bold ${
                        selectedReport.status === 'Normal' ? 'text-emerald-600' : 'text-orange-600'
                      }`}>{selectedReport.status}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px]">
                  <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Action Items</h5>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Discuss results with patient during next visit
                    </li>
                    <li className="flex items-center gap-3 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Monitor glucose levels daily via RPM
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Share Summary</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 bg-zinc-100 rounded-full">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <button 
                  onClick={() => setShareTarget('patient')}
                  className={`w-full p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                    shareTarget === 'patient' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${shareTarget === 'patient' ? 'bg-white/20' : 'bg-zinc-200'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Share with Patient</p>
                    <p className={`text-[10px] ${shareTarget === 'patient' ? 'text-white/70' : 'text-zinc-500'}`}>Send user-friendly summary</p>
                  </div>
                </button>

                <button 
                  onClick={() => setShareTarget('team')}
                  className={`w-full p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                    shareTarget === 'team' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${shareTarget === 'team' ? 'bg-white/20' : 'bg-zinc-200'}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Share with Care Team</p>
                    <p className={`text-[10px] ${shareTarget === 'team' ? 'text-white/70' : 'text-zinc-500'}`}>Send clinical analysis</p>
                  </div>
                </button>
              </div>

              <button 
                onClick={handleShare}
                className="w-full py-5 bg-zinc-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
              >
                <Send className="w-5 h-5" />
                Send Summary
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Labs;
