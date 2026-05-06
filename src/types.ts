export enum PatientRisk {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum CMSProgram {
  CCM = 'CCM',
  RPM = 'RPM',
  RTM = 'RTM',
  BHI = 'BHI',
  APCM = 'APCM'
}

export interface Task {
  id: string;
  patientId: string;
  title: string;
  description: string;
  assignedTo: string; // 'Clinical Team' | 'Patient' | Name
  status: 'Pending' | 'In-Progress' | 'Completed' | 'Deferred';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  history: { date: string; action: string; user: string }[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Discontinued' | 'Taken' | 'Missed';
  adherence: number;
  refillDue?: string;
  prescribedBy: string;
  aiSuggested?: boolean;
}

export interface CarePlanGoal {
  id: string;
  text: string;
  status: 'In Progress' | 'Met' | 'Not Met';
  targetDate: string;
}

export interface SDOHData {
  category: 'Housing' | 'Food' | 'Transportation' | 'Financial' | 'Social Support';
  status: 'Stable' | 'At Risk' | 'Critical';
  notes: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  riskScore: number;
  riskLevel: PatientRisk;
  programs: CMSProgram[];
  conditions: string[];
  lastVisit: string;
  nextAppointment?: string;
  rpmAlerts?: number;
  predictedHospitalization: number;
  medicationAdherence: number;
  tasks?: Task[];
  medications?: Medication[];
  carePlanGoals?: CarePlanGoal[];
  sdoh?: SDOHData[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  startTime: string;
  endTime: string;
  type: 'Telehealth' | 'In-Person';
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
  aiAnalysis?: string;
}

export interface RPMData {
  id: string;
  patientId: string;
  type: 'BP' | 'Glucose' | 'Weight' | 'O2' | 'ECG';
  value: number;
  unit: string;
  timestamp: string;
  isAlert: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isAI?: boolean;
}
