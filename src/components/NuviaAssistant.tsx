import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Mic, Brain, Zap, Shield, 
  CheckCircle2, AlertCircle, FileText, Clock, 
  ChevronRight, Info, ExternalLink, X, Play,
  Volume2, MessageSquare, ListChecks, History,
  MicOff, VolumeX, Settings, BookOpen, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { geminiService } from '../services/geminiService';
import { KNOWLEDGE_BASE } from '../constants/knowledgeBase';

// Audio constants
const SAMPLE_RATE = 24000;
const CHUNK_SIZE = 4096;

interface Suggestion {
  id: string;
  type: 'note' | 'billing' | 'care_plan' | 'message';
  title: string;
  content: string;
  patientName?: string;
}

interface NuviaAssistantProps {
  patient?: any;
  currentPage?: string;
  allPatients?: any[];
  isFullScreen?: boolean;
}

const NuviaAssistant: React.FC<NuviaAssistantProps> = ({ patient, currentPage, allPatients, isFullScreen }) => {
  const [isOpen, setIsOpen] = useState(isFullScreen);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'proactive' | 'tasks' | 'knowledge'>('chat');
  const [kbSearch, setKbSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [persona, setPersona] = useState({
    tone: 'friendly' as 'formal' | 'friendly' | 'concise',
    verbosity: 'medium' as 'low' | 'medium' | 'high'
  });
  const [pendingConfirmation, setPendingConfirmation] = useState<Suggestion | null>(null);
  const [aiVolume, setAiVolume] = useState(0);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [speakResponses, setSpeakResponses] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [userVolume, setUserVolume] = useState(0);
  const [voiceError, setVoiceError] = useState<{ message: string; link?: string } | null>(null);
  const isExplainingPageRef = useRef(false);

  const [isDictating, setIsDictating] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Good morning, Dr. Richardson. I've analyzed the overnight data. Mr. Johnson (Room 4) had 3 hypertensive readings. I've drafted a follow-up note and flagged him for a telehealth visit today. Would you like to review the draft?",
      citations: ["JNC 8 Hypertension Guidelines", "CMS CCM Requirements"]
    }
  ]);

  // Fetch proactive suggestions when page or patient changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isOpen && !isFullScreen) return; // Only fetch if visible
      
      try {
        const result = await geminiService.getProactiveSuggestions(currentPage, patient);
        if (result.suggestions && result.suggestions.length > 0) {
          // We could add these as a special message type or just standard assistant messages
          // For now, let's just add the top suggestion as a message if it's highly relevant
          const topSuggestion = result.suggestions[0];
          
          // Prevent spamming the same suggestion
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.content.includes(topSuggestion.title)) return;

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Proactive Suggestion: ${topSuggestion.title} - ${topSuggestion.description}`,
            citations: ["Nuvia Clinical Intelligence"]
          }]);
        }
      } catch (error) {
        console.error("Failed to fetch proactive suggestions:", error);
      }
    };

    // Debounce the fetch slightly
    const timer = setTimeout(fetchSuggestions, 2000);
    return () => clearTimeout(timer);
  }, [currentPage, patient?.id, isOpen, isFullScreen]);

  const [proactiveAlerts] = useState([
    { id: '1', title: 'CMS Qualification', description: 'Mrs. Smith needs 6 more minutes for CPT 99490.', icon: Clock, color: 'text-orange-500', action: 'Log CCM Time', type: 'billing' },
    { id: '2', title: 'Abnormal Lab', description: 'New creatinine (1.8) detected for Patient #492.', icon: AlertCircle, color: 'text-red-500', action: 'Review Labs', type: 'note' },
    { id: '3', title: 'Shift Handover', description: 'Dr. Rao needs review of potassium levels in Patient X.', icon: History, color: 'text-blue-500', action: 'Contact Dr. Rao', type: 'message' },
  ]);

  const [tasks, setTasks] = useState([
    { id: 't1', type: 'note', title: 'Draft SOAP Note', patient: 'John Doe', time: '2 mins ago', assignedTo: 'Clinical Team', status: 'Pending', priority: 'High', date: '2026-02-25' },
    { id: 't2', type: 'billing', title: 'RPM Billing Log', patient: 'Sarah Jenkins', time: '15 mins ago', assignedTo: 'Clinical Team', status: 'In-Progress', priority: 'Medium', date: '2026-02-24' },
    { id: 't3', type: 'message', title: 'Patient Outreach', patient: 'Robert Wilson', time: '1 hour ago', assignedTo: 'Patient', status: 'Pending', priority: 'Low', date: '2026-02-25' },
  ]);

  const [taskFilters, setTaskFilters] = useState({
    patient: 'All',
    assignedTo: 'All',
    status: 'All',
    priority: 'All'
  });
  const [taskSort, setTaskSort] = useState<'date' | 'priority'>('date');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // If user is within 100px of the bottom, enable auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // --- Voice Logic ---

  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const connectToVoice = async () => {
    setIsConnecting(true);
    setVoiceError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          // Enable real-time transcription
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are Nuvia, a highly advanced, human-like clinical co-pilot. 
          Your goal is to assist clinicians with administrative tasks, patient monitoring, and clinical decision support in a natural, conversational manner.
          
          Conversational Style Guidelines:
          - Be empathetic, professional, and highly intelligent.
          - Use natural language, avoiding overly robotic or repetitive phrases.
          - If the user is speaking to you via voice, keep your responses concise and easy to follow.
          - Proactively offer help based on the context of the conversation.
          - When discussing patients, maintain a focus on clinical accuracy and safety.
          - You are capable of understanding complex medical queries, summarizing patient histories, and providing nuanced clinical insights.
          
          Your persona preferences are: Tone: ${persona.tone}, Verbosity: ${persona.verbosity}. 
          Adjust your language and length of responses accordingly. 
          ${patient ? `The current selected patient is ${patient.name}, DOB ${patient.dob}, conditions: ${patient.conditions.join(', ')}. Medication adherence: ${patient.medicationAdherence}%. Risk Score: ${patient.riskScore}.` : ''}
          
          Recent Conversation Context:
          ${messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Nuvia'}: ${m.content}`).join('\n')}
          `,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "navigate_to",
                  description: "Navigates to a specific module.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      module: { type: Type.STRING, enum: ["dashboard", "patients", "telehealth", "messages", "billing", "rpm", "shift-summary"] }
                    },
                    required: ["module"]
                  }
                },
                {
                  name: "summarize_patient_history",
                  description: "Provides a detailed summary of the patient's medical history, including past visits, conditions, and medications.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      patientName: { type: Type.STRING, description: "The name of the patient to summarize" }
                    },
                    required: ["patientName"]
                  }
                },
                {
                  name: "start_shift",
                  description: "Start the clinician's shift summary process",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "show_patient",
                  description: "Show details for a specific patient",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      patientId: { type: Type.STRING, description: "The ID of the patient" },
                      patientName: { type: Type.STRING, description: "The name of the patient" }
                    }
                  }
                },
                {
                  name: "add_clinical_note",
                  description: "Add a clinical note for a patient",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      patientName: { type: Type.STRING, description: "The name of the patient" },
                      noteContent: { type: Type.STRING, description: "The content of the note" }
                    },
                    required: ["patientName", "noteContent"]
                  }
                },
                {
                  name: "schedule_task",
                  description: "Schedule a new task for a patient or clinical team",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Task title" },
                      description: { type: Type.STRING, description: "Task description" },
                      assignedTo: { type: Type.STRING, description: "Who the task is for (e.g., 'Patient', 'Clinical Team')" },
                      dueDate: { type: Type.STRING, description: "Due date (YYYY-MM-DD)" }
                    },
                    required: ["title", "assignedTo"]
                  }
                },
                {
                  name: "add_medication",
                  description: "Prescribe or add a medication to a patient's list",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Medication name" },
                      dosage: { type: Type.STRING, description: "Dosage (e.g., '10mg')" },
                      frequency: { type: Type.STRING, description: "Frequency (e.g., 'Daily')" }
                    },
                    required: ["name", "dosage", "frequency"]
                  }
                },
                {
                  name: "update_care_plan",
                  description: "Update a patient's care plan goals or SDOH data",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      goalText: { type: Type.STRING, description: "New goal text" },
                      sdohCategory: { type: Type.STRING, description: "SDOH category (Housing, Food, etc.)" },
                      sdohStatus: { type: Type.STRING, description: "SDOH status (Stable, At Risk, Critical)" }
                    }
                  }
                },
                {
                  name: "schedule_appointment",
                  description: "Schedule a new appointment for the patient",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      date: { type: Type.STRING, description: "Appointment date" },
                      time: { type: Type.STRING, description: "Appointment time" },
                      type: { type: Type.STRING, description: "Type (Telehealth, In-Person)" }
                    },
                    required: ["date", "time"]
                  }
                },
                {
                  name: "add_assessment",
                  description: "Add a new assessment or survey for the patient to complete",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Assessment name (e.g., 'PHQ-9', 'CHF Survey')" }
                    },
                    required: ["name"]
                  }
                },
                {
                  name: "review_assessment",
                  description: "Review a completed assessment",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      assessmentId: { type: Type.STRING, description: "The ID of the assessment to review" }
                    },
                    required: ["assessmentId"]
                  }
                }
              ]
            }
          ]
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsRecording(true);
            startMic();
          },
          onmessage: async (message: LiveServerMessage) => {
            const msg = message as any;
            // Handle User Transcription
            if (msg.serverContent?.userTurn?.parts) {
              const text = msg.serverContent.userTurn.parts.map((p: any) => p.text).filter(Boolean).join('');
              if (text) {
                setMessages(prev => {
                  const last = prev[prev.length - 1] as any;
                  if (last?.role === 'user' && last.isLive) {
                    return [...prev.slice(0, -1), { ...last, content: last.content + ' ' + text }];
                  }
                  return [...prev, { role: 'user', content: text, isLive: true } as any];
                });
              }
            }

            // Handle Model Transcription and Audio
            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.text) {
                  setMessages(prev => {
                    const last = prev[prev.length - 1] as any;
                    if (last?.role === 'assistant' && last.isLive) {
                      return [...prev.slice(0, -1), { ...last, content: last.content + part.text }];
                    }
                    return [...prev, { role: 'assistant', content: part.text, isLive: true } as any];
                  });
                }
                if (part.inlineData?.data) {
                  const base64Audio = part.inlineData.data;
                  const binaryString = atob(base64Audio);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const pcmData = new Int16Array(bytes.buffer);
                  audioQueueRef.current.push(pcmData);
                  if (!isPlayingRef.current) {
                    playNextInQueue();
                  }
                }
              }
            }

            if (msg.toolCall) {
              for (const call of msg.toolCall.functionCalls) {
                const event = new CustomEvent('nuvia-command', { detail: { name: call.name, args: call.args } });
                window.dispatchEvent(event);
                sessionRef.current?.sendToolResponse({
                  functionResponses: [{ name: call.name, id: call.id, response: { status: "success" } }]
                });
              }
            }

            if (msg.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              setIsSpeaking(false);
              if (currentSourceRef.current) {
                try {
                  currentSourceRef.current.stop();
                } catch (e) {}
                currentSourceRef.current = null;
              }
              setMessages(prev => [...prev, { role: 'assistant', content: '... (interrupted)', isLive: true } as any]);
            }
          },
          onerror: (err) => {
            setVoiceError({ 
              message: "Voice connection lost. Please check your internet and try again.",
              link: "https://nuvia.ai/troubleshoot/connection"
            });
            setIsConnecting(false);
            stopMic();
          },
          onclose: () => {
            setIsRecording(false);
            stopMic();
          }
        }
      });
      sessionRef.current = session;
    } catch (err) {
      setVoiceError({ 
        message: "Failed to initialize voice engine. Ensure your browser supports WebRTC.",
        link: "https://nuvia.ai/troubleshoot/browser"
      });
      setIsConnecting(false);
    }
  };

  const startMic = async () => {
    try {
      await initAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const source = audioContextRef.current!.createMediaStreamSource(stream);
      const processor = audioContextRef.current!.createScriptProcessor(CHUNK_SIZE, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isRecording || isMuted) return;
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for visual feedback
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const volume = Math.sqrt(sum / inputData.length);
        setUserVolume(volume);
        setIsUserSpeaking(volume > 0.05);

        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current?.sendRealtimeInput({ media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } });
      };

      source.connect(processor);
      processor.connect(audioContextRef.current!.destination);
    } catch (err) {
      setVoiceError({ 
        message: "Microphone access denied. Please enable it in your browser settings.",
        link: "https://nuvia.ai/troubleshoot/microphone"
      });
    }
  };

  const stopMic = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    processorRef.current?.disconnect();
    processorRef.current = null;
  };

  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0 || isMuted) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      setAiVolume(0);
      return;
    }
    isPlayingRef.current = true;
    setIsSpeaking(true);
    const pcmData = audioQueueRef.current.shift()!;
    if (audioContextRef.current) {
      const buffer = audioContextRef.current.createBuffer(1, pcmData.length, SAMPLE_RATE);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < pcmData.length; i++) channelData[i] = pcmData[i] / 0x7FFF;
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      
      // Add Analyser for AI Volume
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyser.connect(audioContextRef.current.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAiVolume = () => {
        if (!isPlayingRef.current) {
          setAiVolume(0);
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAiVolume(average / 255);
        requestAnimationFrame(updateAiVolume);
      };
      updateAiVolume();

      currentSourceRef.current = source;
      source.onended = () => {
        currentSourceRef.current = null;
        playNextInQueue();
      };
      source.start();
    }
  };

  const toggleVoice = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      setIsRecording(false);
      stopMic();
      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
        } catch (e) {}
        currentSourceRef.current = null;
      }
      audioQueueRef.current = [];
      isPlayingRef.current = false;
      setIsSpeaking(false);
    } else {
      setIsVoiceActive(true);
      connectToVoice();
    }
  };

  // --- End Voice Logic ---

  useEffect(() => {
    if (currentPage && !isFullScreen) {
      handlePageChange(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
      stopMic();
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handlePageChange = async (page: string) => {
    if (isExplainingPageRef.current) return;
    isExplainingPageRef.current = true;
    try {
      // Get pending actions for the page
      const pendingActions = [];
      if (page === 'tasks') pendingActions.push('Review 3 pending clinical tasks');
      if (page === 'billing') pendingActions.push('Verify 2 insurance claims');
      if (page === 'patients' && patient) pendingActions.push(`Update care plan for ${patient.name}`);

      const explanation = await geminiService.explainPage(page, patient, pendingActions);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: explanation,
        isContextual: true
      } as any]);

      if (speakResponses) {
        const base64Audio = await geminiService.textToSpeech(explanation);
        if (base64Audio) {
          enqueueAudio(base64Audio);
        }
      }
    } catch (error) {
      console.error("Failed to explain page:", error);
    } finally {
      setTimeout(() => { isExplainingPageRef.current = false; }, 5000); // Prevent spamming
    }
  };

  const enqueueAudio = (base64Audio: string) => {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pcmData = new Int16Array(bytes.buffer);
    audioQueueRef.current.push(pcmData);
    if (!isPlayingRef.current) {
      initAudio().then(() => playNextInQueue());
    }
  };

  const processMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    try {
      const nlpResult = await geminiService.processNLP(userMsg, {
        page: currentPage,
        patient: patient,
        allPatients: allPatients,
        chatHistory: messages.map(m => ({ role: m.role, content: m.content })).slice(-10)
      });
      console.log("NLP Result:", nlpResult);

      const { intent, entities, suggestedResponse } = nlpResult;

      // Handle intents by dispatching custom events
      if (intent === 'navigate_to' && entities.moduleName) {
        const event = new CustomEvent('nuvia-command', { 
          detail: { name: 'navigate_to', args: { module: entities.moduleName.toLowerCase() } } 
        });
        window.dispatchEvent(event);
      } else if (intent === 'show_patient' && entities.patientName) {
        const event = new CustomEvent('nuvia-command', { 
          detail: { name: 'show_patient', args: { patientName: entities.patientName } } 
        });
        window.dispatchEvent(event);
      } else if (intent === 'explain_data') {
        const event = new CustomEvent('nuvia-command', { 
          detail: { name: 'explain_data', args: { patientName: entities.patientName, dataType: entities.dataType } } 
        });
        window.dispatchEvent(event);
      } else if (intent === 'start_telehealth') {
        const event = new CustomEvent('nuvia-command', { 
          detail: { name: 'navigate_to', args: { module: 'telehealth' } } 
        });
        window.dispatchEvent(event);
      } else if (intent === 'schedule_task') {
        const event = new CustomEvent('nuvia-command', { 
          detail: { name: 'schedule_task', args: { 
            title: entities.taskTitle || 'Follow-up task', 
            description: entities.taskDescription || '', 
            assignedTo: entities.taskAssignedTo || 'Clinical Team', 
            dueDate: entities.taskDueDate || new Date().toISOString().split('T')[0],
            patientName: entities.patientName
          } } 
        });
        window.dispatchEvent(event);
      } else if (intent === 'add_clinical_note') {
        const event = new CustomEvent('nuvia-command', {
          detail: { name: 'add_clinical_note', args: {
            content: entities.noteContent,
            type: entities.noteType || 'General Note',
            patientName: entities.patientName || patient?.name
          }}
        });
        window.dispatchEvent(event);
      } else if (intent === 'schedule_appointment') {
        const event = new CustomEvent('nuvia-command', {
          detail: { name: 'schedule_appointment', args: {
            date: entities.appointmentDate,
            type: entities.appointmentType || 'Follow-up',
            patientName: entities.patientName || patient?.name
          }}
        });
        window.dispatchEvent(event);
      } else if (intent === 'add_medication') {
        const event = new CustomEvent('nuvia-command', {
          detail: { name: 'add_medication', args: {
            name: entities.medicationName,
            dosage: entities.medicationDosage,
            frequency: entities.medicationFrequency,
            patientName: entities.patientName || patient?.name
          }}
        });
        window.dispatchEvent(event);
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: suggestedResponse || "I've processed your request.",
        citations: ["Nuvia NLP Engine", "Clinical Protocol v4.2"]
      }]);

      if (speakResponses && suggestedResponse) {
        const base64Audio = await geminiService.textToSpeech(suggestedResponse);
        if (base64Audio) {
          enqueueAudio(base64Audio);
        }
      }

    } catch (error) {
      console.error("NLP processing failed:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I had trouble processing that. Could you rephrase?",
        citations: []
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    processMessage(input);
    setInput('');
  };

  const toggleDictation = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError({ message: "Speech recognition is not supported in this browser." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsDictating(true);
      transcriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setInput(transcript);
      transcriptRef.current = transcript;
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsDictating(false);
    };

    recognition.onend = () => {
      setIsDictating(false);
      if (transcriptRef.current.trim()) {
        processMessage(transcriptRef.current);
        setInput('');
        transcriptRef.current = '';
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleConfirmAction = (suggestion: Suggestion) => {
    setPendingConfirmation(suggestion);
  };

  return (
    <div className={`${isFullScreen ? 'h-full' : 'relative'}`}>
      {/* Nuvia Icon / Toggle */}
      {!isFullScreen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-500 group ${
            isOpen ? 'bg-zinc-900 rotate-90' : 'bg-white'
          }`}
        >
          {/* Talking Animation Glow */}
          {isSpeaking && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-emerald-500 rounded-[24px] blur-xl"
            />
          )}

          <div className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isOpen ? 'bg-white/10' : 'bg-zinc-900'
          }`}>
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Sparkles className={`w-6 h-6 text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
            )}
          </div>
          
          {/* Status Indicator */}
          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-4 border-zinc-50 flex items-center justify-center ${
            isVoiceActive ? 'bg-emerald-500' : 'bg-zinc-300'
          }`}>
            {isVoiceActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
          </div>

          {/* Talking Animation Waveform (Mini) */}
          {isSpeaking && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 h-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [4, 12, 4],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-1 bg-emerald-500 rounded-full"
                />
              ))}
            </div>
          )}

          {/* Listening Animation (Mini) */}
          {isUserSpeaking && !isSpeaking && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 h-4">
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
            </div>
          )}
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={isFullScreen ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={isFullScreen ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 20, x: 20 }}
            className={`${isFullScreen ? 'h-full w-full' : 'absolute bottom-20 right-0 w-[400px] h-[600px]'} flex flex-col bg-zinc-950 md:rounded-[32px] border-t md:border border-white/10 shadow-2xl overflow-hidden relative`}
          >
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      {/* Active Voice Overlay */}
      <AnimatePresence>
        {isVoiceActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-between p-8"
          >
            {/* Top: Status */}
            <div className="text-center mt-8">
              <h3 className="text-white font-black text-2xl mb-2 tracking-tight">Nuvia</h3>
              <p className={`text-xs font-bold uppercase tracking-widest ${isSpeaking ? 'text-emerald-400 animate-pulse' : isUserSpeaking ? 'text-blue-400 animate-pulse' : 'text-zinc-500'}`}>
                {isConnecting ? 'Connecting...' : isSpeaking ? 'Speaking...' : isUserSpeaking ? 'Listening...' : 'Active'}
              </p>
            </div>

            {/* Center: Large Orb */}
            <div className="relative w-64 h-64 flex items-center justify-center my-12">
              {/* Pulsating Outer Glow Rings - More Intense */}
              <AnimatePresence>
                {isSpeaking && (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={`ring-${i}`}
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ 
                          scale: [1, 2.5 + (aiVolume * 2)], 
                          opacity: [0.4, 0] 
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          delay: i * 0.5,
                          ease: "easeOut"
                        }}
                        className="absolute inset-0 rounded-full border-2 border-emerald-500/30 blur-sm"
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 blur-3xl transition-all duration-500 ${isSpeaking ? 'scale-150 opacity-60' : isUserSpeaking ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`} />
              
              <div 
                className="absolute inset-8 rounded-full bg-zinc-900 border border-white/10 z-10 flex flex-col items-center justify-center overflow-hidden shadow-2xl cursor-pointer"
                onClick={() => {
                  if (isSpeaking) {
                    audioQueueRef.current = [];
                    isPlayingRef.current = false;
                    setIsSpeaking(false);
                    if (currentSourceRef.current) {
                      try { currentSourceRef.current.stop(); } catch(e) {}
                      currentSourceRef.current = null;
                    }
                    if (sessionRef.current) {
                      try {
                        sessionRef.current.sendRealtimeInput({ clientContent: { turnComplete: true } });
                      } catch (e) {}
                    }
                  }
                }}
              >
                <motion.img 
                  src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300" 
                  alt="Nuvia AI"
                  animate={isSpeaking ? {
                    scale: [1.05, 1.15, 1.05],
                    rotate: [-2, 2, -2],
                    y: [-5, 5, -5]
                  } : isUserSpeaking ? {
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                  } : {
                    scale: 1,
                    rotate: 0,
                    y: 0,
                    opacity: 1
                  }}
                  transition={{
                    duration: isSpeaking ? 3 : 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Dark overlay for contrast when active */}
                <div className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${isSpeaking || isUserSpeaking ? 'opacity-100' : 'opacity-0'}`} />

                {/* Audio Visualization Waves (Speaking) */}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-8 flex items-end gap-1.5 h-12 z-20"
                    >
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={`speak-${i}`}
                          animate={{
                            height: [4, 12 + Math.random() * 32 * (aiVolume * 3 + 0.5), 4],
                          }}
                          transition={{
                            duration: 0.2 + Math.random() * 0.2,
                            repeat: Infinity,
                            delay: i * 0.05,
                            ease: "easeInOut"
                          }}
                          className="w-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Listening Visualization (User Speaking) */}
                <AnimatePresence>
                  {isUserSpeaking && !isSpeaking && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center z-20"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2 + (userVolume * 2), 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-24 h-24 rounded-full border-4 border-blue-400/50 shadow-[0_0_30px_rgba(96,165,250,0.6)] flex items-center justify-center"
                      >
                        <Mic className="w-8 h-8 text-blue-400" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isSpeaking && (
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.8, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-emerald-500/10 rounded-full"
                  />
                )}
              </div>

              {/* Listening Rings for User */}
              {isUserSpeaking && (
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                      className="absolute w-full h-full rounded-full border-2 border-blue-500/40"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom: Transcription & Controls */}
            <div className="w-full max-w-md flex flex-col items-center gap-12">
              <div className="h-32 w-full overflow-hidden relative flex flex-col justify-end">
                <div className="w-full text-center">
                  <p className="text-white text-lg md:text-xl font-medium leading-relaxed opacity-90">
                    {messages.length > 0 ? messages[messages.length - 1].content : "Hi Dr. Richardson, how can I help you today?"}
                  </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-zinc-950 to-transparent" />
              </div>

              <button 
                onClick={toggleVoice}
                className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 group"
              >
                <X className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Avatar Section */}
      <div className="p-3 md:p-4 border-b border-white/5 flex items-center justify-between relative z-10 bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10 shadow-lg relative overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100" 
                alt="Nuvia AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-black tracking-tight text-sm md:text-base">Nuvia</h3>
              <div className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Intelligence Layer</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {['chat', 'proactive', 'tasks', 'knowledge'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode as any)}
                  className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all ${
                    activeMode === mode ? 'bg-white text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Popover */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-6 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[60] p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Assistant Persona</h4>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-4 h-4 text-zinc-500 hover:text-white" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tone</p>
                <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-lg">
                  {['formal', 'friendly', 'concise'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setPersona(prev => ({ ...prev, tone: t as any }))}
                      className={`py-1.5 rounded text-[8px] font-black uppercase transition-all ${
                        persona.tone === t ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Verbosity</p>
                <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-lg">
                  {['low', 'medium', 'high'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setPersona(prev => ({ ...prev, verbosity: v as any }))}
                      className={`py-1.5 rounded text-[8px] font-black uppercase transition-all ${
                        persona.verbosity === v ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Speak Responses</p>
                <button 
                  onClick={() => setSpeakResponses(!speakResponses)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${speakResponses ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${speakResponses ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeMode === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 no-scrollbar">
                    {messages.map((msg, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`p-4 rounded-2xl ${
                            msg.role === 'user' 
                              ? 'bg-emerald-500 text-white rounded-tr-none shadow-lg shadow-emerald-500/10' 
                              : 'bg-white/5 text-zinc-200 border border-white/10 rounded-tl-none'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            {(msg as any).isLive && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Live Transcription</span>
                              </div>
                            )}
                          </div>
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {msg.citations.map((cite, ci) => (
                                <span key={ci} className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                  <Info className="w-2.5 h-2.5" />
                                  {cite}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
            )}

            {activeMode === 'knowledge' && (
              <motion.div
                key="knowledge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden p-4 md:p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <h4 className="text-white font-bold text-lg">Knowledge Base</h4>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text"
                    placeholder="Search clinical protocols, billing rules..."
                    value={kbSearch}
                    onChange={(e) => setKbSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                  {KNOWLEDGE_BASE.filter(entry => 
                    entry.title.toLowerCase().includes(kbSearch.toLowerCase()) || 
                    entry.content.toLowerCase().includes(kbSearch.toLowerCase()) ||
                    entry.tags.some(t => t.toLowerCase().includes(kbSearch.toLowerCase()))
                  ).map((entry) => (
                    <div key={entry.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          entry.category === 'clinical' ? 'bg-emerald-500/10 text-emerald-500' :
                          entry.category === 'billing' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-zinc-500/10 text-zinc-500'
                        }`}>
                          {entry.category}
                        </span>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Updated: {entry.lastUpdated}</span>
                      </div>
                      <h5 className="text-white font-bold text-sm mb-2 group-hover:text-blue-400 transition-colors">{entry.title}</h5>
                      <p className="text-zinc-400 text-xs leading-relaxed mb-3">{entry.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map(tag => (
                          <span key={tag} className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-zinc-950/50 border-t border-white/5 flex flex-col items-center">
            {voiceError && (
              <div className="mb-4 w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">{voiceError.message}</p>
              </div>
            )}
            
            <div className="w-full max-w-2xl flex items-center gap-3">
              <button 
                onClick={toggleVoice}
                className="w-14 h-14 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 group"
              >
                <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="flex-1 relative flex items-center bg-zinc-900 border border-white/10 rounded-full px-4 py-2 focus-within:border-emerald-500/50 transition-colors">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message or use voice command..." 
                  className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-zinc-600"
                />
                <button 
                  onClick={toggleDictation}
                  className={`p-2 rounded-full transition-colors mr-2 ${isDictating ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                  title="Voice Command"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleSend}
                  className={`p-2 rounded-full transition-colors ${input.trim() ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-500'}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-4">
              Tap the microphone to start a voice conversation
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Overlay */}
      <AnimatePresence>
        {pendingConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-zinc-950/90 backdrop-blur-md p-8 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="text-white font-bold text-lg">Confirm AI Action</h4>
                </div>
                <button onClick={() => setPendingConfirmation(null)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Proposed Action</p>
                  <p className="text-white font-bold text-sm">{pendingConfirmation.title}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Details</p>
                  <p className="text-zinc-400 text-xs leading-relaxed">{pendingConfirmation.content}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPendingConfirmation(null)}
                  className="py-3 bg-white/5 text-zinc-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Edit Draft
                </button>
                <button 
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: `Action confirmed: ${pendingConfirmation.title} has been executed and logged.` }]);
                    setPendingConfirmation(null);
                  }}
                  className="py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Confirm & Execute
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NuviaAssistant;
