import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export type Message = {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
};

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [currentModelTurn, setCurrentModelTurn] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopAudio = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, []);

  const connect = useCallback(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    try {
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are Cura, a highly professional, empathetic, and HIPAA-aware clinical AI assistant. Your goal is to help users manage their health queries with accuracy and care. Always maintain a calm, reassuring tone. If a user mentions a medical emergency, advise them to call emergency services immediately. Do not provide definitive diagnoses, but offer guidance based on clinical best practices.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            console.log("Connected to Gemini Live");
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              setIsInterrupted(true);
              setCurrentModelTurn("");
            }

            if (message.serverContent?.modelTurn) {
              const parts = message.serverContent.modelTurn.parts;
              const textPart = parts.find(p => p.text);
              if (textPart?.text) {
                setCurrentModelTurn(prev => prev + textPart.text);
              }
              
              const audioPart = parts.find(p => p.inlineData);
              if (audioPart?.inlineData?.data) {
                // Audio playback logic would go here
                // For this demo, we focus on the conversational flow
              }
            }

            if (message.serverContent?.turnComplete) {
              setTranscript(prev => [
                ...prev,
                { role: 'model', text: currentModelTurn, timestamp: Date.now() }
              ]);
              setCurrentModelTurn("");
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopAudio();
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            setIsConnected(false);
          }
        }
      });

      sessionRef.current = session;

      // Setup Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      // In a real app, we'd load a worklet to stream PCM data
      // For now, we'll simulate the audio level for UI feedback
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        if (!isConnected) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 128);
        requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

    } catch (err) {
      console.error("Failed to connect:", err);
    }
  }, [isConnected, currentModelTurn, stopAudio]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    stopAudio();
    setIsConnected(false);
  }, [stopAudio]);

  return {
    isConnected,
    connect,
    disconnect,
    transcript,
    currentModelTurn,
    audioLevel,
    isInterrupted
  };
}
