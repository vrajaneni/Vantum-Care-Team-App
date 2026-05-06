export type PatientRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CMSProgram = 'CCM' | 'RPM' | 'RTM' | 'BHI' | 'APCM';

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
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  startTime: string;
  endTime: string;
  type: 'Telehealth' | 'In-Person';
  status: 'Scheduled' | 'Ready' | 'In-Progress' | 'Completed' | 'Cancelled';
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  patientName?: string;
  assignedTo: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  category: 'Clinical' | 'Administrative' | 'Billing' | 'Follow-up';
}

export interface BillingQualification {
  id: string;
  patientId: string;
  patientName: string;
  program: CMSProgram;
  code: string;
  description: string;
  status: 'Qualified' | 'In Progress' | 'Unqualified';
  progress: number;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  value: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
}

export interface MessageThread {
  id: string;
  patientName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  tone: 'info' | 'warning' | 'critical';
  time: string;
}
