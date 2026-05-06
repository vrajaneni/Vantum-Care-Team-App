import { GoogleGenAI, Type, Modality } from "@google/genai";
import { KNOWLEDGE_BASE } from "../constants/knowledgeBase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async generateSOAPNote(transcript: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional clinical SOAP note based on the following telehealth visit transcript:
      
      Transcript:
      ${transcript}
      
      Format the output as a JSON object with keys: subjective, objective, assessment, plan.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subjective: { type: Type.STRING },
            objective: { type: Type.STRING },
            assessment: { type: Type.STRING },
            plan: { type: Type.STRING },
          },
          required: ["subjective", "objective", "assessment", "plan"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  },

  async textToSpeech(text: string, voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Zephyr') {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  },

  async analyzeLabReport(labData: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following lab report data and provide a clinical summary, highlighting abnormal values and suggesting potential follow-up actions.
      
      Lab Data:
      ${labData}
      
      Format the output as a JSON object with keys: summary, abnormalValues (array of objects with parameter, value, interpretation), recommendations (array of strings).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            abnormalValues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  parameter: { type: Type.STRING },
                  value: { type: Type.STRING },
                  interpretation: { type: Type.STRING },
                },
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "abnormalValues", "recommendations"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  },

  async getPatientRiskSnapshot(patientData: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a clinical risk snapshot for the following patient:
      ${JSON.stringify(patientData)}
      
      Include:
      1. Risk score (0-100)
      2. Chronic condition summary
      3. Care gaps
      4. Medication adherence risk
      5. Predicted hospitalization probability (percentage)
      
      Format as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            conditionSummary: { type: Type.STRING },
            careGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            medicationRisk: { type: Type.STRING },
            hospitalizationProb: { type: Type.NUMBER },
          },
          required: ["riskScore", "conditionSummary", "careGaps", "medicationRisk", "hospitalizationProb"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  },

  async analyzeVitals(vitalsData: any[]) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following patient vitals history and identify trends, abnormal readings, and potential clinical concerns.
      
      Vitals Data:
      ${JSON.stringify(vitalsData)}
      
      Format the output as a JSON object with keys: summary, flags (array of strings), and trendAnalysis.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            flags: { type: Type.ARRAY, items: { type: Type.STRING } },
            trendAnalysis: { type: Type.STRING },
          },
          required: ["summary", "flags", "trendAnalysis"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  },

  async suggestCarePlanUpdates(patientData: any, currentCarePlan: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the patient's current conditions, risk factors, and existing care plan, suggest new care goals and interventions to optimize their health outcomes.
      
      Patient Data:
      ${JSON.stringify(patientData)}
      
      Current Care Plan:
      ${JSON.stringify(currentCarePlan)}
      
      Format the output as a JSON object with keys: suggestedGoals (array of strings) and suggestedInterventions (array of strings).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedInterventions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["suggestedGoals", "suggestedInterventions"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  },

  async generateContent(prompt: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "";
  },

  async processNLP(userInput: string, context?: { page?: string, patient?: any, allPatients?: any[], chatHistory?: {role: string, content: string}[] }) {
    // Basic pre-search of knowledge base to provide context
    const relevantKB = KNOWLEDGE_BASE.filter(entry => 
      userInput.toLowerCase().includes(entry.category) || 
      entry.tags.some(tag => userInput.toLowerCase().includes(tag.toLowerCase())) ||
      entry.title.toLowerCase().split(' ').some(word => word.length > 3 && userInput.toLowerCase().includes(word))
    ).slice(0, 3);

    const historyText = context?.chatHistory && context.chatHistory.length > 0
      ? context.chatHistory.map(m => `${m.role === 'user' ? 'User' : 'Nuvia'}: ${m.content}`).join('\n')
      : 'No previous history.';

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following user input and identify the primary intent and extract key entities.
      
      Recent Conversation History:
      ${historyText}

      User Input:
      "${userInput}"
      
      Current Context:
      - Page: ${context?.page || 'Dashboard'}
      - Selected Patient: ${context?.patient ? JSON.stringify(context.patient) : 'None'}
      - All Patients Summary: ${context?.allPatients ? context.allPatients.map(p => `${p.name} (ID: ${p.id}, Condition: ${p.condition})`).join(', ') : 'Not provided'}
      
      Possible Intents:
      - ask_question: User is asking a general or medical question.
      - request_demo: User wants to see a demo of the platform or a feature.
      - get_support: User needs help with the app, technical issues, or clinical support.
      - navigate_to: User wants to go to a specific module (e.g., "show me my patients", "go to billing").
      - show_patient: User wants to see details for a specific patient.
      - start_telehealth: User wants to start a video visit.
      - explain_data: User wants an explanation of specific patient data (labs, vitals, meds).
      - schedule_task: User wants to create or schedule a task (e.g., "Create a follow-up task for Jane Smith regarding her RPM onboarding").
      - add_clinical_note: User wants to dictate or add a clinical note for a patient.
      - schedule_appointment: User wants to schedule an appointment for a patient.
      - add_medication: User wants to add a medication to a patient's record.
      - other: Any other intent.
      
      Relevant Knowledge Base Context:
      ${relevantKB.length > 0 ? JSON.stringify(relevantKB) : "No direct matches found in knowledge base."}
      
      Instructions:
      1. Identify the intent based on the User Input and Recent Conversation History.
      2. Extract entities (patientName, moduleName, questionTopic, etc.). Use the Conversation History to resolve pronouns or implied context (e.g., if the user says "what about her blood pressure?", infer "her" from the history).
      3. If the intent is 'explain_data', identify which patient and which data type (labs, vitals, meds) they are asking about.
      4. Formulate a highly accurate clinical or operational response that directly addresses the latest User Input while maintaining conversational continuity. Use the provided context and Knowledge Base.
      5. Format the output as a JSON object with keys: intent, confidence, entities, and suggestedResponse.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            entities: { 
              type: Type.OBJECT,
              properties: {
                patientName: { type: Type.STRING },
                moduleName: { type: Type.STRING },
                questionTopic: { type: Type.STRING },
                supportType: { type: Type.STRING },
                dateTime: { type: Type.STRING },
                dataType: { type: Type.STRING },
                taskTitle: { type: Type.STRING },
                taskDescription: { type: Type.STRING },
                taskAssignedTo: { type: Type.STRING },
                taskDueDate: { type: Type.STRING },
                noteContent: { type: Type.STRING },
                noteType: { type: Type.STRING },
                appointmentDate: { type: Type.STRING },
                appointmentType: { type: Type.STRING },
                medicationName: { type: Type.STRING },
                medicationDosage: { type: Type.STRING },
                medicationFrequency: { type: Type.STRING }
              }
            },
            suggestedResponse: { type: Type.STRING },
          },
          required: ["intent", "confidence", "entities", "suggestedResponse"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  },

  async explainPage(pageName: string, patient?: any, pendingActions?: string[]) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Nuvia, a clinical AI assistant. The user has just navigated to the "${pageName}" page.
      
      Context:
      - Current Page: ${pageName}
      - Selected Patient: ${patient ? JSON.stringify(patient) : 'None'}
      - Pending Actions on this page: ${pendingActions?.join(', ') || 'None'}
      
      Task:
      Provide a brief, professional, and helpful voice-ready explanation of this page. 
      If there are pending actions, mention them naturally. 
      If a patient is selected, provide a very brief health summary relevant to this page.
      
      Keep it under 3 sentences. Be empathetic and clinical.`,
    });
    return response.text || "";
  },

  async getProactiveSuggestions(pageName: string, patient?: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Nuvia, a proactive clinical AI assistant. The user is currently viewing the "${pageName}" module.
      
      Context:
      - Current Page: ${pageName}
      - Selected Patient: ${patient ? JSON.stringify(patient) : 'None'}
      
      Task:
      Based on the current page and patient data (if any), suggest 1-2 highly relevant, proactive clinical actions.
      For example, if viewing vitals for a CHF patient and weight is up, suggest checking medication adherence or scheduling a follow-up.
      If viewing the dashboard, suggest reviewing patients with critical alerts.
      
      Format the output as a JSON object with a 'suggestions' array containing objects with 'title', 'description', and 'actionType' (e.g., 'schedule_task', 'navigate_to', 'add_clinical_note').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  actionType: { type: Type.STRING },
                  actionPayload: { type: Type.STRING }
                }
              }
            }
          },
          required: ["suggestions"],
        },
      },
    });
    return JSON.parse(response.text || "{}");
  },

  async searchKnowledgeBase(query: string) {
    // More advanced search could be implemented here
    return KNOWLEDGE_BASE.filter(entry => 
      entry.title.toLowerCase().includes(query.toLowerCase()) || 
      entry.content.toLowerCase().includes(query.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }
};
