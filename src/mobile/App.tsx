import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  appointments,
  billingQualifications,
  messages,
  notifications,
  patients,
  tasks as seedTasks,
} from './data';
import type { Patient, TaskItem } from './types';

let ExpoSpeechRecognitionModule: any = null;

try {
  ExpoSpeechRecognitionModule = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch {
  ExpoSpeechRecognitionModule = null;
}

type TabId =
  | 'dashboard'
  | 'patients'
  | 'telehealth'
  | 'messages'
  | 'nuvia'
  | 'tasks'
  | 'rpm'
  | 'labs'
  | 'billing'
  | 'profile'
  | 'shift-summary'
  | 'education'
  | 'onboarding';

const colors = {
  bg: '#08120f',
  panel: '#f4f6f2',
  card: '#ffffff',
  line: '#d8e1da',
  text: '#102019',
  subtext: '#607063',
  muted: '#7f8d83',
  primary: '#10b981',
  primaryDark: '#0f8a62',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#2563eb',
  darkPanel: '#0d1813',
};

const tabs: { id: TabId | 'more'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'dashboard', label: 'Home', icon: 'grid-outline' },
  { id: 'patients', label: 'Patients', icon: 'people-outline' },
  { id: 'nuvia', label: 'Nuvia Co-Pilot', icon: 'sparkles-outline' },
  { id: 'telehealth', label: 'Visit', icon: 'videocam-outline' },
  { id: 'more', label: 'More', icon: 'ellipsis-horizontal' },
];

const moreTabs: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  { id: 'tasks', label: 'Clinical Tasks', icon: 'checkbox-outline', description: 'Manage care workflow' },
  { id: 'rpm', label: 'RPM Monitoring', icon: 'pulse-outline', description: 'Remote Patient Monitoring' },
  { id: 'labs', label: 'Lab Reports', icon: 'flask-outline', description: 'View and analyze labs' },
  { id: 'billing', label: 'Billing & Claims', icon: 'card-outline', description: 'Manage revenue cycle' },
  { id: 'shift-summary', label: 'Shift Summary', icon: 'time-outline', description: 'Daily clinical overview' },
];

const nuviaAvatarUri =
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200';

const nuviaProactiveAlerts = [
  { id: '1', title: 'CMS Qualification', description: 'Mrs. Smith needs 6 more minutes for CPT 99490.', action: 'Log CCM Time', icon: 'time-outline' as const, tone: '#fb923c' },
  { id: '2', title: 'Abnormal Lab', description: 'New creatinine 1.8 detected for Patient #492.', action: 'Review Labs', icon: 'warning-outline' as const, tone: '#ef4444' },
  { id: '3', title: 'Shift Handover', description: 'Dr. Rao needs review of potassium levels in Patient X.', action: 'Contact Dr. Rao', icon: 'swap-horizontal-outline' as const, tone: '#60a5fa' },
];

const nuviaTasks = [
  { id: 't1', type: 'Draft SOAP Note', patient: 'John Doe', meta: 'Clinical Team • High Priority', status: 'Pending' },
  { id: 't2', type: 'RPM Billing Log', patient: 'Sarah Jenkins', meta: 'Clinical Team • Medium Priority', status: 'In Progress' },
  { id: 't3', type: 'Patient Outreach', patient: 'Robert Wilson', meta: 'Patient • Low Priority', status: 'Pending' },
];

const nuviaKnowledge = [
  { id: 'k1', category: 'clinical', title: 'CHF Escalation Pathway', body: 'Confirm symptoms, compare RPM trends, and schedule same-day telehealth when weight gain and dyspnea worsen.', tags: ['CHF', 'RPM', 'triage'] },
  { id: 'k2', category: 'billing', title: 'CCM 99490 Qualification', body: 'Document cumulative care management time, patient consent, and clinical coordination activities before claim submission.', tags: ['CCM', 'CMS', 'billing'] },
  { id: 'k3', category: 'operations', title: 'Shift Handover Checklist', body: 'Highlight abnormal labs, pending follow-up, unresolved tasks, and next outreach owners before shift close.', tags: ['handover', 'tasks', 'ops'] },
];

type NuviaMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  citations?: string[];
};

const rpmPrograms = [
  {
    id: 'chf',
    name: 'Heart Failure (CHF)',
    icon: 'heart-outline' as const,
    tone: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    patients: [
      { id: '1', name: 'John Doe', status: 'Critical', alert: 'Weight gain 3lbs in 24h', adherence: '85%', lastSync: '2 mins ago' },
      { id: '3', name: 'Robert Wilson', status: 'Stable', adherence: '92%', lastSync: '1 hr ago' },
    ],
  },
  {
    id: 'htn',
    name: 'Hypertension',
    icon: 'pulse-outline' as const,
    tone: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    patients: [
      { id: '2', name: 'Sarah Jenkins', status: 'Warning', alert: 'BP 145/92 consecutive days', adherence: '78%', lastSync: '5 mins ago' },
      { id: '4', name: 'Emily Davis', status: 'Stable', adherence: '100%', lastSync: '1 min ago' },
    ],
  },
  {
    id: 'copd',
    name: 'COPD Monitoring',
    icon: 'cloud-outline' as const,
    tone: '#10b981',
    bg: '#ecfdf5',
    border: '#bbf7d0',
    patients: [{ id: '5', name: 'Michael Brown', status: 'Stable', adherence: '88%', lastSync: '3 hrs ago' }],
  },
  {
    id: 'dm',
    name: 'Diabetes Care',
    icon: 'thermometer-outline' as const,
    tone: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
    patients: [{ id: '6', name: 'Lisa Taylor', status: 'Warning', alert: 'Fasting glucose > 130', adherence: '82%', lastSync: '10 mins ago' }],
  },
];

type LabReportCard = {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  date: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
  summary: string;
  analysis: string;
  findings: { parameter: string; value: string; reference: string; status: 'Normal' | 'Abnormal' | 'Critical' }[];
};

const labReportCards: LabReportCard[] = [
  {
    id: 'lab-hba1c',
    patientId: '1',
    patientName: 'John Doe',
    type: 'Comprehensive Metabolic Panel',
    date: '2026-04-16',
    status: 'Abnormal',
    summary: 'A1c and fasting glucose remain above goal. Nuvia recommends reviewing adherence and tightening diabetes follow-up.',
    analysis:
      'Glucose control remains mildly uncontrolled with no severe electrolyte disturbance. Pair the elevated glycemic markers with RPM and medication adherence trends before adjusting the care plan.',
    findings: [
      { parameter: 'HbA1c', value: '7.2%', reference: 'Below 7.0%', status: 'Abnormal' },
      { parameter: 'Glucose', value: '126 mg/dL', reference: '65-99 mg/dL', status: 'Abnormal' },
      { parameter: 'Creatinine', value: '0.92 mg/dL', reference: '0.60-1.35 mg/dL', status: 'Normal' },
    ],
  },
  {
    id: 'lab-egfr',
    patientId: '1',
    patientName: 'John Doe',
    type: 'Renal Function Panel',
    date: '2026-04-13',
    status: 'Normal',
    summary: 'Kidney function is stable with no concerning change from prior readings.',
    analysis:
      'Renal markers are within acceptable range and consistent with prior baseline. Continue routine surveillance given chronic cardiovascular risk.',
    findings: [
      { parameter: 'eGFR', value: '85 mL/min', reference: 'Above 60 mL/min', status: 'Normal' },
      { parameter: 'BUN', value: '18 mg/dL', reference: '7-25 mg/dL', status: 'Normal' },
      { parameter: 'Creatinine', value: '0.88 mg/dL', reference: '0.60-1.35 mg/dL', status: 'Normal' },
    ],
  },
  {
    id: 'lab-ldl',
    patientId: '3',
    patientName: 'Robert Wilson',
    type: 'Lipid Panel',
    date: '2026-04-10',
    status: 'Critical',
    summary: 'LDL remains elevated in a high-risk patient. Escalate cardiovascular follow-up and medication review.',
    analysis:
      'The lipid profile is concerning in the context of AFib and elevated hospitalization risk. Consider same-week outreach and verify statin adherence before the next telehealth check-in.',
    findings: [
      { parameter: 'LDL', value: '142 mg/dL', reference: 'Below 100 mg/dL', status: 'Critical' },
      { parameter: 'HDL', value: '39 mg/dL', reference: 'Above 40 mg/dL', status: 'Abnormal' },
      { parameter: 'Triglycerides', value: '155 mg/dL', reference: 'Below 150 mg/dL', status: 'Abnormal' },
    ],
  },
];

type BillingRequirement = {
  label: string;
  current: number | string;
  target: number | string;
  isMet: boolean;
};

type BillingCard = {
  id: string;
  patientId: string;
  patientName: string;
  program: 'CCM' | 'RPM' | 'RTM' | 'BHI' | 'APCM';
  code: string;
  description: string;
  status: 'Qualified' | 'In Progress' | 'Unqualified';
  progress: number;
  requirements: BillingRequirement[];
  lastUpdated: string;
};

const billingCards: BillingCard[] = [
  {
    id: 'q1',
    patientId: '1',
    patientName: 'John Doe',
    program: 'RPM',
    code: '99454',
    description: 'RPM Device Supply & Readings',
    status: 'Qualified',
    progress: 100,
    requirements: [
      { label: 'Days of Readings', current: 18, target: 16, isMet: true },
      { label: 'Device Active', current: 'Yes', target: 'Yes', isMet: true },
    ],
    lastUpdated: '2026-05-05',
  },
  {
    id: 'q2',
    patientId: '1',
    patientName: 'John Doe',
    program: 'RPM',
    code: '99457',
    description: 'RPM Interactive Communication (20m)',
    status: 'In Progress',
    progress: 75,
    requirements: [
      { label: 'Interactive Time', current: 15, target: 20, isMet: false },
      { label: 'Provider Review', current: 'Yes', target: 'Yes', isMet: true },
    ],
    lastUpdated: '2026-05-06',
  },
  {
    id: 'q3',
    patientId: '2',
    patientName: 'Jane Smith',
    program: 'CCM',
    code: '99490',
    description: 'CCM Clinical Staff Time (20m)',
    status: 'In Progress',
    progress: 40,
    requirements: [
      { label: 'Clinical Time', current: 8, target: 20, isMet: false },
      { label: 'Care Plan Update', current: 'No', target: 'Yes', isMet: false },
    ],
    lastUpdated: '2026-05-06',
  },
  {
    id: 'q4',
    patientId: '3',
    patientName: 'Robert Wilson',
    program: 'RTM',
    code: '98980',
    description: 'RTM Treatment Management (20m)',
    status: 'Qualified',
    progress: 100,
    requirements: [
      { label: 'Management Time', current: 25, target: 20, isMet: true },
      { label: 'Data Review', current: 'Yes', target: 'Yes', isMet: true },
    ],
    lastUpdated: '2026-05-05',
  },
  {
    id: 'q5',
    patientId: '2',
    patientName: 'Jane Smith',
    program: 'BHI',
    code: '99484',
    description: 'BHI Care Management (20m)',
    status: 'Unqualified',
    progress: 10,
    requirements: [
      { label: 'Clinical Time', current: 2, target: 20, isMet: false },
      { label: 'Assessment Done', current: 'No', target: 'Yes', isMet: false },
    ],
    lastUpdated: '2026-05-02',
  },
];

const educationCards = [
  {
    title: 'CHF Home Monitoring',
    subtitle: 'Weight, sodium intake, and symptom escalation guidance',
    cta: 'Share handout',
  },
  {
    title: 'Diabetes Daily Routine',
    subtitle: 'Glucose checks, meal structure, and medication reminders',
    cta: 'Send by message',
  },
  {
    title: 'COPD Rescue Planning',
    subtitle: 'Recognize flare signals and use inhalers correctly',
    cta: 'Assign lesson',
  },
];

const onboardingSteps = [
  { title: 'Insurance and CMS eligibility', status: 'Complete' },
  { title: 'Consent for RPM and CCM enrollment', status: 'Ready' },
  { title: 'Device shipment and activation', status: 'Pending' },
  { title: 'Telehealth orientation visit', status: 'Pending' },
];

const shiftSummaryItems = [
  '3 high-risk patients escalated for same-day outreach',
  '12 claims moved closer to qualification',
  '2 telehealth visits completed with documentation ready',
  '1 new RPM onboarding packet prepared',
];

const shiftSummaryPatients = [
  {
    name: 'John Doe',
    conditions: 'CHF, Hypertension',
    status: 'High Risk',
    updates: 'Weight increased by 3 lbs with elevated BP trend. Same-day outreach recommended before next RPM review.',
    cms: 'CCM: 18/20m',
    riskFlags: ['Weight Gain', 'BP Elevated'],
    keyUpdates: 'Medication adherence discussed. Escalation note prepared for incoming shift.',
  },
  {
    name: 'Sarah Jenkins',
    conditions: 'Diabetes, RPM',
    status: 'Review Needed',
    updates: 'A1C trend needs follow-up after medication adjustment. Labs review remains open for the next team.',
    cms: 'RPM: 15/20m',
    riskFlags: ['Labs Pending'],
    keyUpdates: 'Counseled on device adherence and flagged for follow-up in 24 hours.',
  },
  {
    name: 'Robert Wilson',
    conditions: 'AFib, RTM',
    status: 'Threshold Met',
    updates: 'Completed RTM threshold and documented management time. Stable after alert review.',
    cms: 'CCM: 22/20m',
    riskFlags: [],
    keyUpdates: 'No acute concerns. Billing threshold met and documentation finalized.',
  },
];

const shiftBillingRows = [
  { prog: 'CCM', mins: '22 min', target: '20 min', status: 'Yes', desc: 'Chronic Care Management' },
  { prog: 'RPM', mins: '18 min', target: '20 min', status: 'No', desc: 'Remote Patient Monitoring' },
  { prog: 'BHI', mins: '10 min', target: '20 min', status: 'No', desc: 'Behavioral Health Integration' },
  { prog: 'APCM', mins: 'Activity', target: 'Tier 2', status: 'In Progress', desc: 'Principal Care Management' },
];

const shiftPendingHandoff = [
  { task: 'Follow-up call: John Doe', dueDate: '05-07-2026' },
  { task: 'Review Labs: Sarah Jenkins', dueDate: '05-07-2026' },
  { task: 'RPM Non-adherence follow-up', dueDate: '05-07-2026' },
];

const shiftSuggestedTasks = [
  { task: 'Schedule follow-up weight check: John Doe', dueDate: '05-07-2026', reason: 'Weight trending upward (+3lbs)' },
  { task: 'Review A1C trends: Sarah Jenkins', dueDate: '05-08-2026', reason: 'Medication adjusted this shift' },
];

const shiftHistoryEntries = [
  { date: 'May 5, 2026', type: 'Day Shift', patients: 12, mins: '145m', revenue: '$1,240', status: 'Finalized' },
  { date: 'May 4, 2026', type: 'Night Shift', patients: 8, mins: '90m', revenue: '$850', status: 'Finalized' },
  { date: 'May 3, 2026', type: 'Weekend Shift', patients: 15, mins: '180m', revenue: '$1,600', status: 'Finalized' },
];

const shiftHistoryUsers = [
  { name: 'Dr. Richardson', role: 'Cardiologist', patients: 45, time: '32h', revenue: '$4,200', status: 'Active', dept: 'Cardiology' },
  { name: 'Nurse Sarah', role: 'RPM Lead', patients: 120, time: '40h', revenue: '$8,500', status: 'Active', dept: 'RPM Team' },
  { name: 'Dr. Miller', role: 'ER Physician', patients: 65, time: '36h', revenue: '$6,800', status: 'Active', dept: 'Emergency' },
];

const shiftHistoryPatients = [
  { name: 'John Doe', id: 'P-102', continuity: 'High (3 visits)', time: '45m', revenue: '$120', status: 'Stable', dept: 'Cardiology' },
  { name: 'Sarah Jenkins', id: 'P-105', continuity: 'Med (2 visits)', time: '30m', revenue: '$85', status: 'High Risk', dept: 'RPM Team' },
  { name: 'Robert Wilson', id: 'P-110', continuity: 'Low (1 visit)', time: '20m', revenue: '$50', status: 'Stable', dept: 'Emergency' },
];

const profileInfoRows = [
  { label: 'Full Name', value: 'Dr. Richardson' },
  { label: 'Professional Role', value: 'Cardiologist' },
  { label: 'Email Address', value: 'richardson@vantum.clinic' },
  { label: 'Phone Number', value: '(555) 123-4567' },
  { label: 'Location', value: 'San Francisco, CA' },
  { label: 'NPI Number', value: '1234567890' },
];

const profileSettingsRows = [
  { title: 'Notification Preferences', body: 'Manage how you receive alerts and messages.' },
  { title: 'Billing & Subscription', body: 'View your clinic plan and billing history.' },
  { title: 'App Preferences', body: 'Customize your dashboard and mobile workspace.' },
];

const profileSecurityRows = [
  { title: 'Change Password', body: 'Update your login credentials.' },
  { title: 'Two-Factor Authentication', body: 'Add an extra layer of security to your account.' },
  { title: 'Active Sessions', body: 'Manage your logged-in devices.' },
];

function Logo() {
  return (
    <View style={styles.logo}>
      <MaterialCommunityIcons name="heart-pulse" size={20} color="#fff" />
    </View>
  );
}

function riskColor(risk: Patient['riskLevel']) {
  if (risk === 'CRITICAL') return colors.danger;
  if (risk === 'HIGH') return '#f97316';
  if (risk === 'MEDIUM') return colors.warning;
  return colors.primary;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function Card({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <View style={[styles.card, dark && styles.cardDark]}>{children}</View>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('doctor@vantum.health');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState<TaskItem | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isSuggestingTasks, setIsSuggestingTasks] = useState(false);
  const [draftTaskTitle, setDraftTaskTitle] = useState('');
  const [draftTaskDescription, setDraftTaskDescription] = useState('');
  const [draftTaskPriority, setDraftTaskPriority] = useState<TaskItem['priority']>('Medium');
  const [draftTaskCategory, setDraftTaskCategory] = useState<TaskItem['category']>('Clinical');
  const [draftAssignToType, setDraftAssignToType] = useState<'Clinical Team' | 'Patient'>('Clinical Team');
  const [draftAssigneeName, setDraftAssigneeName] = useState('Dr. Richardson');
  const [draftDueDate, setDraftDueDate] = useState('Today');
  const [draftPatientName, setDraftPatientName] = useState('None');
  const [openTaskSelect, setOpenTaskSelect] = useState<null | 'assignType' | 'assignee' | 'dueDate' | 'patient' | 'priority' | 'category'>(null);
  const [nuviaMode, setNuviaMode] = useState<'chat' | 'proactive' | 'tasks' | 'knowledge'>('chat');
  const [nuviaInput, setNuviaInput] = useState('');
  const [nuviaKnowledgeSearch, setNuviaKnowledgeSearch] = useState('');
  const [nuviaMessages, setNuviaMessages] = useState<NuviaMessage[]>([
    {
      id: 'nuvia-m1',
      role: 'assistant',
      text: 'Good morning, Dr. Richardson. I analyzed overnight data and flagged three patients for immediate review.',
      citations: ['JNC 8 Guidelines', 'CMS CCM Requirements'],
    },
    {
      id: 'nuvia-m2',
      role: 'user',
      text: 'Show me the highest-priority outreach and any billing actions I should complete first.',
    },
    {
      id: 'nuvia-m3',
      role: 'assistant',
      text: 'Start with John Doe for CHF outreach, then complete the remaining RPM and CCM qualification work. I also flagged one abnormal lab and one shift handoff item.',
      citations: ['RPM Alert Review', 'Billing Qualification Engine'],
    },
  ]);
  const [isNuviaThinking, setIsNuviaThinking] = useState(false);
  const [expandedRpmProgram, setExpandedRpmProgram] = useState('chf');
  const [isNuviaRecording, setIsNuviaRecording] = useState(false);
  const [nuviaVoiceError, setNuviaVoiceError] = useState('');
  const [isTelehealthActive, setIsTelehealthActive] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>(seedTasks);
  const [profileTab, setProfileTab] = useState<'info' | 'settings' | 'security'>('info');
  const [telehealthMode, setTelehealthMode] = useState<'B2B' | 'B2C'>('B2C');
  const [telehealthTab, setTelehealthTab] = useState<'schedule' | 'waiting_room' | 'analytics' | 'availability' | 'history'>('schedule');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingType, setBookingType] = useState<'B2B' | 'B2C'>('B2C');
  const [telehealthHistorySearch, setTelehealthHistorySearch] = useState('');
  const [slotDuration, setSlotDuration] = useState('30');
  const [availabilitySchedule, setAvailabilitySchedule] = useState([
    { day: 'Monday', active: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', active: true, start: '10:00', end: '14:00' },
    { day: 'Thursday', active: true, start: '09:00', end: '17:00' },
    { day: 'Friday', active: true, start: '09:00', end: '12:00' },
    { day: 'Saturday', active: false, start: '09:00', end: '17:00' },
    { day: 'Sunday', active: false, start: '09:00', end: '17:00' },
  ]);
  const [labsSearchQuery, setLabsSearchQuery] = useState('');
  const [labsPatientFilter, setLabsPatientFilter] = useState<string | null>(null);
  const [labsStatusFilter, setLabsStatusFilter] = useState<'All' | 'Normal' | 'Abnormal' | 'Critical'>('All');
  const [labsDateFilter, setLabsDateFilter] = useState<'All' | 'Last 7 Days' | 'Last 30 Days'>('All');
  const [selectedLabReport, setSelectedLabReport] = useState<LabReportCard | null>(null);
  const [showLabShareModal, setShowLabShareModal] = useState(false);
  const [labShareTarget, setLabShareTarget] = useState<'patient' | 'team'>('patient');
  const [showLabUploadModal, setShowLabUploadModal] = useState(false);
  const [labUploadPatientId, setLabUploadPatientId] = useState<string | null>(null);
  const [showLabAiChat, setShowLabAiChat] = useState(false);
  const [labAiInput, setLabAiInput] = useState('');
  const [billingSearchQuery, setBillingSearchQuery] = useState('');
  const [billingProgramFilter, setBillingProgramFilter] = useState<'All' | 'CCM' | 'RPM' | 'RTM' | 'BHI' | 'APCM'>('All');
  const [billingStatusFilter, setBillingStatusFilter] = useState<'All' | 'Qualified' | 'In Progress' | 'Unqualified'>('All');
  const [showBillingReportModal, setShowBillingReportModal] = useState(false);
  const [expandedShiftPatient, setExpandedShiftPatient] = useState<string | null>('John Doe');
  const [showShiftHandoffModal, setShowShiftHandoffModal] = useState(false);
  const [shiftHandoffStep, setShiftHandoffStep] = useState<'options' | 'ai_brief' | 'recording' | 'confirm'>('options');
  const [shiftHandoffNotes, setShiftHandoffNotes] = useState(
    'Shift Overview: 14 patients seen, 8 visits completed. High-priority handoff for John Doe and Sarah Jenkins. Pending tasks include lab review and RPM adherence outreach.',
  );
  const [isShiftRecording, setIsShiftRecording] = useState(false);
  const [shiftTab, setShiftTab] = useState<'current' | 'history'>('current');
  const [shiftHistorySearch, setShiftHistorySearch] = useState('');
  const [shiftHistoryDept, setShiftHistoryDept] = useState('All Departments');
  const [shiftHistoryDateFilter, setShiftHistoryDateFilter] = useState('');
  const [shiftHistoryViewMode, setShiftHistoryViewMode] = useState<'day' | 'user' | 'patient'>('day');

  const selectedPatient = useMemo(
    () => patients.find((item) => item.id === selectedPatientId) ?? null,
    [selectedPatientId],
  );
  const nuviaInputRef = useRef<TextInput | null>(null);
  useEffect(() => {
    if (!ExpoSpeechRecognitionModule) return;

    const subscriptions = [
      ExpoSpeechRecognitionModule.addListener('start', () => {
        setIsNuviaRecording(true);
        setNuviaVoiceError('');
        setNuviaMode('chat');
        nuviaInputRef.current?.focus();
      }),
      ExpoSpeechRecognitionModule.addListener('end', () => {
        setIsNuviaRecording(false);
        nuviaInputRef.current?.focus();
      }),
      ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
        const transcript = event.results?.[0]?.transcript?.trim();
        if (!transcript) return;
        setNuviaInput(transcript);
      }),
      ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
        setIsNuviaRecording(false);
        setNuviaVoiceError(event.message || 'Speech recognition is unavailable on this device.');
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription?.remove?.());
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Active Patients', value: String(patients.length), tone: colors.primary, tab: 'patients' as TabId },
      {
        label: 'Open Tasks',
        value: String(tasks.filter((item) => item.status !== 'Completed').length),
        tone: colors.info,
        tab: 'tasks' as TabId,
      },
      {
        label: 'RPM Alerts',
        value: String(patients.reduce((sum, item) => sum + (item.rpmAlerts ?? 0), 0)),
        tone: colors.danger,
        tab: 'rpm' as TabId,
      },
      {
        label: 'Qualified Claims',
        value: String(billingQualifications.filter((item) => item.status === 'Qualified').length),
        tone: colors.warning,
        tab: 'billing' as TabId,
      },
    ],
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    const query = taskSearch.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.patientName?.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query);
      const matchesStatus = taskStatusFilter === 'All' || task.status === taskStatusFilter;
      const matchesPriority = taskPriorityFilter === 'All' || task.priority === taskPriorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [taskPriorityFilter, taskSearch, taskStatusFilter, tasks]);

  const taskStats = useMemo(
    () => ({
      pending: tasks.filter((task) => task.status === 'Pending').length,
      inProgress: tasks.filter((task) => task.status === 'In Progress').length,
      completed: tasks.filter((task) => task.status === 'Completed').length,
    }),
    [tasks],
  );

  const filteredLabReports = useMemo(() => {
    const query = labsSearchQuery.trim().toLowerCase();
    return labReportCards.filter((report) => {
      const matchesSearch =
        !query ||
        report.patientName.toLowerCase().includes(query) ||
        report.type.toLowerCase().includes(query) ||
        report.status.toLowerCase().includes(query);
      const matchesPatient = labsPatientFilter ? report.patientId === labsPatientFilter : true;
      const matchesStatus = labsStatusFilter === 'All' || report.status === labsStatusFilter;

      let matchesDate = true;
      if (labsDateFilter !== 'All') {
        const reportDate = new Date(report.date);
        const now = new Date('2026-04-18T00:00:00');
        const diffDays = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
        matchesDate = labsDateFilter === 'Last 7 Days' ? diffDays <= 7 : diffDays <= 30;
      }

      return matchesSearch && matchesPatient && matchesStatus && matchesDate;
    });
  }, [labsDateFilter, labsPatientFilter, labsSearchQuery, labsStatusFilter]);

  const filteredBillingCards = useMemo(() => {
    const query = billingSearchQuery.trim().toLowerCase();
    return billingCards.filter((item) => {
      const matchesSearch =
        !query || item.patientName.toLowerCase().includes(query) || item.code.toLowerCase().includes(query);
      const matchesProgram = billingProgramFilter === 'All' || item.program === billingProgramFilter;
      const matchesStatus = billingStatusFilter === 'All' || item.status === billingStatusFilter;
      return matchesSearch && matchesProgram && matchesStatus;
    });
  }, [billingProgramFilter, billingSearchQuery, billingStatusFilter]);

  const billingStats = useMemo(
    () => ({
      qualified: billingCards.filter((item) => item.status === 'Qualified').length,
      inProgress: billingCards.filter((item) => item.status === 'In Progress').length,
      unqualified: billingCards.filter((item) => item.status === 'Unqualified').length,
    }),
    [],
  );

  const filteredShiftHistoryDays = useMemo(() => {
    const query = shiftHistorySearch.trim().toLowerCase();
    return shiftHistoryEntries.filter((item) => {
      const matchesSearch = !query || item.date.toLowerCase().includes(query) || item.type.toLowerCase().includes(query);
      const matchesDept = shiftHistoryDept === 'All Departments' || item.type.includes(shiftHistoryDept);
      const matchesDate = !shiftHistoryDateFilter || item.date.includes(shiftHistoryDateFilter);
      return matchesSearch && matchesDept && matchesDate;
    });
  }, [shiftHistoryDateFilter, shiftHistoryDept, shiftHistorySearch]);

  const filteredShiftHistoryUsers = useMemo(() => {
    const query = shiftHistorySearch.trim().toLowerCase();
    return shiftHistoryUsers.filter((item) => {
      const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.role.toLowerCase().includes(query);
      const matchesDept = shiftHistoryDept === 'All Departments' || item.dept === shiftHistoryDept;
      return matchesSearch && matchesDept;
    });
  }, [shiftHistoryDept, shiftHistorySearch]);

  const filteredShiftHistoryPatients = useMemo(() => {
    const query = shiftHistorySearch.trim().toLowerCase();
    return shiftHistoryPatients.filter((item) => {
      const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query);
      const matchesDept = shiftHistoryDept === 'All Departments' || item.dept === shiftHistoryDept;
      return matchesSearch && matchesDept;
    });
  }, [shiftHistoryDept, shiftHistorySearch]);

  const navigate = (tab: TabId) => {
    setActiveTab(tab);
    setShowMore(false);
    if (tab !== 'patients' && tab !== 'telehealth') {
      setSelectedPatientId(null);
      setIsTelehealthActive(false);
    }
  };

  const handleSignIn = () => {
    setIsAuthLoading(true);
    setTimeout(() => {
      setIsAuthLoading(false);
      setAuthenticated(true);
    }, 600);
  };

  const handleNuviaMicPress = async () => {
    if (!ExpoSpeechRecognitionModule) {
      setNuviaVoiceError('Speech recognition is not available in this runtime yet. Rebuild the app to enable the mic.');
      return;
    }

    if (isNuviaRecording) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    setNuviaMode('chat');
    setNuviaVoiceError('');

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setNuviaVoiceError('Microphone or speech permission was denied.');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      addsPunctuation: true,
    });
  };

  const openPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
    setShowMore(false);
  };

  const startVisit = (patientId?: string) => {
    if (patientId) setSelectedPatientId(patientId);
    setActiveTab('telehealth');
    setIsTelehealthActive(true);
    setShowMore(false);
  };

  const pushNuviaAssistantMessage = (text: string, citations?: string[]) => {
    setNuviaMessages((current) => [
      ...current,
      { id: `nuvia-${Date.now()}-${current.length}`, role: 'assistant', text, citations },
    ]);
  };

  const buildNuviaResponse = (prompt: string) => {
    const query = prompt.toLowerCase();

    if (query.includes('billing') || query.includes('claim') || query.includes('cms')) {
      return {
        text: 'RPM 99457 for John Doe still needs 5 more minutes, and Jane Smith still needs CCM care-plan work before 99490 qualifies. Open Billing & Claims next to clear those gaps.',
        citations: ['CMS Qualification Engine', 'Billing Workflow'],
      };
    }

    if (query.includes('lab')) {
      return {
        text: 'The most urgent lab follow-up is Robert Wilson’s elevated LDL trend, with John Doe’s metabolic panel also needing review. I can take you straight to Lab Reports if you want to drill in.',
        citations: ['Lab Reports', 'Nuvia AI Analysis'],
      };
    }

    if (query.includes('rpm') || query.includes('remote')) {
      return {
        text: 'CHF and hypertension are driving the highest RPM risk right now. John Doe has weight gain with elevated blood pressure, and Sarah Jenkins still needs adherence follow-up.',
        citations: ['RPM Monitoring', 'Patient Risk Signals'],
      };
    }

    if (query.includes('visit') || query.includes('schedule') || query.includes('telehealth')) {
      return {
        text: 'Your next telehealth priorities are John Doe in the ready queue and Robert Wilson for follow-up scheduling. I recommend moving into Visit to start or schedule those encounters.',
        citations: ['Visit Schedule', 'Waiting Room'],
      };
    }

    if (query.includes('handoff') || query.includes('shift')) {
      return {
        text: 'The current handoff still needs abnormal lab review for Sarah Jenkins and outreach follow-up for John Doe. Shift Summary has the full pending handoff list and the AI brief.',
        citations: ['Shift Summary', 'Handoff Checklist'],
      };
    }

    return {
      text: 'I can help with outreach, billing qualification, labs, RPM, or visit scheduling. Ask for a workflow, or tap one of the proactive cards to jump directly into that module.',
      citations: ['Nuvia Co-Pilot'],
    };
  };

  const handleNuviaSend = () => {
    const prompt = nuviaInput.trim();
    if (!prompt || isNuviaThinking) return;

    setNuviaMode('chat');
    setNuviaVoiceError('');
    setNuviaMessages((current) => [...current, { id: `nuvia-${Date.now()}`, role: 'user', text: prompt }]);
    setNuviaInput('');
    setIsNuviaThinking(true);

    const response = buildNuviaResponse(prompt);
    setTimeout(() => {
      pushNuviaAssistantMessage(response.text, response.citations);
      setIsNuviaThinking(false);
    }, 350);
  };

  const handleNuviaAlertAction = (alertId: string) => {
    setNuviaMode('chat');
    if (alertId === '1') {
      setBillingProgramFilter('CCM');
      setBillingStatusFilter('In Progress');
      navigate('billing');
      pushNuviaAssistantMessage(
        'Opened Billing & Claims with CCM items that still need time and documentation before submission.',
        ['CMS Qualification Engine'],
      );
      return;
    }

    if (alertId === '2') {
      const report = labReportCards.find((item) => item.status === 'Critical') ?? labReportCards[0];
      setLabsStatusFilter(report?.status ?? 'Abnormal');
      if (report) {
        setLabsPatientFilter(report.patientId);
        setSelectedLabReport(report);
      }
      navigate('labs');
      pushNuviaAssistantMessage(
        `Opened Lab Reports for ${report?.patientName ?? 'the flagged patient'} so you can review the abnormal results immediately.`,
        ['Lab Reports', 'Nuvia AI Analysis'],
      );
      return;
    }

    setShiftTab('current');
    navigate('shift-summary');
    pushNuviaAssistantMessage(
      'Opened Shift Summary so you can review the handoff notes, suggested tasks, and pending follow-up before the next shift.',
      ['Shift Handover Checklist'],
    );
  };

  const handleNuviaTaskAction = (taskId: string) => {
    if (taskId === 't1') {
      openPatient('1');
      pushNuviaAssistantMessage(
        'I opened John Doe so you can draft the note with the latest patient context, RPM trends, and care actions in view.',
        ['Patient Care Workspace'],
      );
      return;
    }

    if (taskId === 't2') {
      setBillingProgramFilter('RPM');
      setBillingStatusFilter('In Progress');
      navigate('billing');
      pushNuviaAssistantMessage(
        'Billing & Claims is open with RPM items filtered to in-progress so you can finish the remaining qualification work.',
        ['Billing Qualification Engine'],
      );
      return;
    }

    navigate('messages');
    pushNuviaAssistantMessage(
      'Messages is open so you can complete the patient outreach workflow and capture follow-up directly from the conversation thread.',
      ['Patient Messaging'],
    );
  };

  const handleNuviaKnowledgeAction = (knowledgeId: string) => {
    const article = nuviaKnowledge.find((item) => item.id === knowledgeId);
    if (!article) return;
    setNuviaMode('chat');
    setNuviaInput(`Summarize ${article.title} for today's workflow.`);
    pushNuviaAssistantMessage(article.body, [article.title]);
    nuviaInputRef.current?.focus();
  };

  const toggleTask = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' }
          : task,
      ),
    );
  };

  const handleSuggestTasks = () => {
    setIsSuggestingTasks(true);
    setTimeout(() => {
      setTasks((current) => [
        {
          id: `t-${Date.now()}`,
          title: 'Review CHF outreach candidates',
          description: 'AI identified RPM patients needing same-day outreach and billing follow-up.',
          patientName: 'Sarah Jenkins',
          assignedTo: 'Clinical Team',
          dueDate: '2026-04-18',
          priority: 'High',
          status: 'Pending',
          category: 'Clinical',
        },
        ...current,
      ]);
      setIsSuggestingTasks(false);
    }, 600);
  };

  const handleCreateTask = () => {
    if (!draftTaskTitle.trim()) return;
    const nextTask: TaskItem = {
      id: editingTaskId ?? `t-${Date.now()}`,
      title: draftTaskTitle.trim(),
      description: draftTaskDescription.trim() || 'New clinical workflow task.',
      patientName: draftPatientName === 'None' ? undefined : draftPatientName,
      assignedTo: draftAssigneeName,
      dueDate: draftDueDate,
      priority: draftTaskPriority,
      status: editingTaskId ? tasks.find((task) => task.id === editingTaskId)?.status ?? 'Pending' : 'Pending',
      category: draftTaskCategory,
    };

    setTasks((current) =>
      editingTaskId ? current.map((task) => (task.id === editingTaskId ? nextTask : task)) : [nextTask, ...current],
    );
    setDraftTaskTitle('');
    setDraftTaskDescription('');
    setDraftTaskPriority('Medium');
    setDraftTaskCategory('Clinical');
    setDraftAssignToType('Clinical Team');
    setDraftAssigneeName('Dr. Richardson');
    setDraftDueDate('Today');
    setDraftPatientName('None');
    setOpenTaskSelect(null);
    setEditingTaskId(null);
    setShowTaskModal(false);
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setDraftTaskTitle(task.title);
    setDraftTaskDescription(task.description);
    setDraftTaskPriority(task.priority);
    setDraftTaskCategory(task.category);
    setDraftAssignToType(task.patientName ? 'Patient' : 'Clinical Team');
    setDraftAssigneeName(task.assignedTo);
    setDraftDueDate(task.dueDate);
    setDraftPatientName(task.patientName ?? 'None');
    setOpenTaskSelect(null);
    setShowTaskModal(true);
  };

  const renderDashboard = () => (
    <View style={styles.stack}>
      <SectionHeader title="Operational Snapshot" subtitle="AI co-pilot care journey" />
      <View style={styles.grid}>
        {stats.map((stat) => (
          <Pressable key={stat.label} style={styles.metricCard} onPress={() => setActiveTab(stat.tab)}>
            <View style={[styles.metricDotWrap, { backgroundColor: `${stat.tone}18` }]}>
              <View style={[styles.metricDot, { backgroundColor: stat.tone }]} />
            </View>
            <Text style={styles.metricLabel}>{stat.label}</Text>
            <Text style={styles.metricValue}>{stat.value}</Text>
          </Pressable>
        ))}
      </View>

      <Card>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {[
            { label: 'New Visit', icon: 'videocam-outline' as keyof typeof Ionicons.glyphMap, action: () => navigate('telehealth') },
            { label: 'Add Patient', icon: 'person-add-outline' as keyof typeof Ionicons.glyphMap, action: () => navigate('onboarding') },
            { label: 'Education', icon: 'book-outline' as keyof typeof Ionicons.glyphMap, action: () => navigate('education') },
            { label: 'Shift Summary', icon: 'time-outline' as keyof typeof Ionicons.glyphMap, action: () => navigate('shift-summary') },
          ].map((item) => (
            <Pressable key={item.label} style={styles.quickAction} onPress={item.action}>
              <Ionicons name={item.icon} size={20} color={colors.text} />
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Today's Schedule</Text>
          <Ionicons name="calendar-outline" size={18} color={colors.muted} />
        </View>
        {appointments.map((appointment) => (
          <Pressable key={appointment.id} style={styles.listCard} onPress={() => openPatient(appointment.patientId)}>
            <View>
              <Text style={styles.listTitle}>
                {new Date(appointment.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </Text>
              <Text style={styles.listMeta}>{appointment.type}</Text>
            </View>
            <View style={styles.fill}>
              <Text style={styles.listTitle}>{appointment.patientName}</Text>
              <Text style={styles.listMeta}>{appointment.status}</Text>
            </View>
            {appointment.status === 'Ready' ? (
              <View style={styles.joinPill}>
                <Text style={styles.joinPillText}>Join</Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            )}
          </Pressable>
        ))}
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardTitle}>Patient Queue</Text>
            <Text style={styles.cardSubtext}>Risk-prioritized list</Text>
          </View>
          <Pressable onPress={() => navigate('patients')}>
            <Text style={styles.linkText}>View all</Text>
          </Pressable>
        </View>
        {patients.slice(0, 4).map((patient) => (
          <Pressable key={patient.id} style={styles.queueRow} onPress={() => openPatient(patient.id)}>
            <View style={styles.inlineStart}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{patient.name.split(' ').map((part) => part[0]).join('')}</Text>
              </View>
              <View style={styles.fill}>
                <View style={styles.rowBetween}>
                  <Text style={styles.listTitle}>{patient.name}</Text>
                  <View style={[styles.badge, { backgroundColor: `${riskColor(patient.riskLevel)}18` }]}>
                    <Text style={[styles.badgeText, { color: riskColor(patient.riskLevel) }]}>{patient.riskLevel}</Text>
                  </View>
                </View>
                <Text style={styles.listMeta}>{patient.programs.join(' | ')}</Text>
                <Text style={styles.listMeta}>
                  {patient.rpmAlerts ? `${patient.rpmAlerts} RPM alerts` : 'No active RPM alerts'}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </Card>

      <LinearGradient colors={['#08120f', '#123322']} style={styles.hero}>
        <View style={styles.inline}>
          <View style={styles.nuviaAvatar}>
            <Logo />
          </View>
          <View style={styles.fill}>
            <Text style={styles.heroTitle}>Nuvia Insights</Text>
            <Text style={styles.heroKicker}>Operational Intelligence</Text>
          </View>
        </View>

        <Pressable style={styles.nuviaItem} onPress={() => navigate('rpm')}>
          <View style={styles.rowBetween}>
            <Text style={[styles.nuviaLabel, { color: '#fb923c' }]}>Risk Alert</Text>
            <Ionicons name="warning-outline" size={14} color="#fb923c" />
          </View>
          <Text style={styles.nuviaBody}>
            5 patients in RPM are showing signs of CHF worsening. Nuvia recommends immediate outreach.
          </Text>
          <View style={styles.nuviaChip}>
            <Text style={[styles.nuviaChipText, { color: '#fb923c' }]}>Review List</Text>
          </View>
        </Pressable>

        <Pressable style={styles.nuviaItem} onPress={() => navigate('billing')}>
          <View style={styles.rowBetween}>
            <Text style={[styles.nuviaLabel, { color: '#34d399' }]}>Billing Tip</Text>
            <Ionicons name="trending-up-outline" size={14} color="#34d399" />
          </View>
          <Text style={styles.nuviaBody}>
            12 CCM patients are within 2 minutes of meeting 99490 requirements. Documentation is nearly complete.
          </Text>
          <View style={styles.nuviaChip}>
            <Text style={[styles.nuviaChipText, { color: '#34d399' }]}>Finalize Notes</Text>
          </View>
        </Pressable>

        <Pressable style={styles.nuviaItem} onPress={() => navigate('labs')}>
          <View style={styles.rowBetween}>
            <Text style={[styles.nuviaLabel, { color: '#60a5fa' }]}>Clinical Insight</Text>
            <Ionicons name="medkit-outline" size={14} color="#60a5fa" />
          </View>
          <Text style={styles.nuviaBody}>
            Recent lab results for John Doe indicate possible electrolyte imbalance. Correlate with RPM trends.
          </Text>
        </Pressable>
      </LinearGradient>
    </View>
  );

  const renderPatients = () => (
    <View style={styles.stack}>
      <SectionHeader
        title={selectedPatient ? selectedPatient.name : 'Patient Queue'}
        subtitle={selectedPatient ? 'Mobile patient detail' : 'Risk-prioritized list'}
      />
      {selectedPatient ? (
        <>
          <Pressable style={styles.backButton} onPress={() => setSelectedPatientId(null)}>
            <Ionicons name="arrow-back" size={16} color={colors.text} />
            <Text style={styles.backText}>Back to queue</Text>
          </Pressable>

          <Card>
            <View style={styles.rowBetween}>
              <View style={styles.inline}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {selectedPatient.name.split(' ').map((part) => part[0]).join('')}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>{selectedPatient.name}</Text>
                  <Text style={styles.cardSubtext}>
                    {selectedPatient.dob} • {selectedPatient.gender}
                  </Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: `${riskColor(selectedPatient.riskLevel)}18` }]}>
                <Text style={[styles.badgeText, { color: riskColor(selectedPatient.riskLevel) }]}>
                  {selectedPatient.riskLevel}
                </Text>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Medication</Text>
                <Text style={styles.kpiValue}>{selectedPatient.medicationAdherence}%</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Predicted Hospitalization</Text>
                <Text style={styles.kpiValue}>{selectedPatient.predictedHospitalization}%</Text>
              </View>
            </View>

            <View style={styles.tagWrap}>
              {selectedPatient.programs.map((program) => (
                <View key={program} style={styles.tag}>
                  <Text style={styles.tagText}>{program}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.label}>Conditions</Text>
            <Text style={styles.body}>{selectedPatient.conditions.join(', ')}</Text>

            <LinearGradient colors={['#eefbf5', '#ffffff']} style={styles.insightCard}>
              <Text style={styles.insightLabel}>Nuvia summary</Text>
              <Text style={styles.body}>
                {selectedPatient.name} is trending {selectedPatient.riskLevel === 'LOW' ? 'stable' : 'higher risk'} based
                on adherence, RPM signals, and chronic conditions. Recommended next step: review care plan and confirm
                follow-up timing.
              </Text>
            </LinearGradient>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Care Actions</Text>
            <View style={styles.inline}>
              <Pressable style={styles.heroPrimary} onPress={() => startVisit(selectedPatient.id)}>
                <Text style={styles.heroPrimaryText}>Start Visit</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => navigate('messages')}>
                <Text style={styles.secondaryButtonText}>Message</Text>
              </Pressable>
            </View>
            {['Start telehealth visit', 'Review labs and RPM data', 'Update care plan goals', 'Document billing time'].map(
              (item) => (
                <View key={item} style={styles.actionRow}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.body}>{item}</Text>
                </View>
              ),
            )}
          </Card>
        </>
      ) : (
        patients.map((patient) => (
          <Pressable key={patient.id} style={styles.patientCard} onPress={() => setSelectedPatientId(patient.id)}>
            <View style={styles.inline}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{patient.name.split(' ').map((part) => part[0]).join('')}</Text>
              </View>
              <View style={styles.fill}>
                <View style={styles.rowBetween}>
                  <Text style={styles.listTitle}>{patient.name}</Text>
                  <View style={[styles.badge, { backgroundColor: `${riskColor(patient.riskLevel)}18` }]}>
                    <Text style={[styles.badgeText, { color: riskColor(patient.riskLevel) }]}>{patient.riskLevel}</Text>
                  </View>
                </View>
                <Text style={styles.listMeta}>{patient.conditions.join(', ')}</Text>
                <Text style={styles.listMeta}>
                  {patient.programs.join(' • ')} {patient.rpmAlerts ? `• ${patient.rpmAlerts} alerts` : ''}
                </Text>
              </View>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );

  const renderSimpleList = (
    title: string,
    subtitle: string,
    rows: { title: string; meta: string; body?: string; right?: string }[],
  ) => (
    <View style={styles.stack}>
      <SectionHeader title={title} subtitle={subtitle} />
      {rows.map((row) => (
        <Card key={`${title}-${row.title}-${row.meta}`}>
          <View style={styles.rowBetween}>
            <View style={styles.fill}>
              <Text style={styles.cardTitle}>{row.title}</Text>
              <Text style={styles.cardSubtext}>{row.meta}</Text>
            </View>
            {row.right ? <Text style={styles.rightText}>{row.right}</Text> : null}
          </View>
          {row.body ? <Text style={styles.body}>{row.body}</Text> : null}
        </Card>
      ))}
    </View>
  );

  const renderNuvia = () => {
    const knowledgeRows = nuviaKnowledge.filter((item) => {
      const query = nuviaKnowledgeSearch.trim().toLowerCase();
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.body.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    return (
      <View style={styles.stack}>
        <Card dark>
          <View style={styles.nuviaHeader}>
            <View style={styles.inline}>
              <View style={styles.nuviaHeaderAvatarWrap}>
                <Image source={{ uri: nuviaAvatarUri }} style={styles.nuviaHeaderAvatar} />
              </View>
              <View style={styles.fill}>
                <View style={styles.inline}>
                  <Text style={styles.nuviaHeaderTitle}>Nuvia</Text>
                  <View style={styles.nuviaHeaderBadge}>
                    <Text style={styles.nuviaHeaderBadgeText}>Intelligence Layer</Text>
                  </View>
                </View>
                <View style={styles.nuviaModeRow}>
                  {(['chat', 'proactive', 'tasks', 'knowledge'] as const).map((mode) => (
                    <Pressable
                      key={mode}
                      style={[styles.nuviaModeChip, nuviaMode === mode && styles.nuviaModeChipActive]}
                      onPress={() => setNuviaMode(mode)}
                    >
                      <Text style={[styles.nuviaModeText, nuviaMode === mode && styles.nuviaModeTextActive]}>{mode}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {nuviaMode === 'chat' && (
            <View style={styles.nuviaPanel}>
              {nuviaMessages.map((message) => (
                <View
                  key={message.id}
                  style={message.role === 'assistant' ? styles.nuviaAssistantBubble : styles.nuviaUserBubble}
                >
                  <Text style={message.role === 'assistant' ? styles.nuviaBubbleText : styles.nuviaUserBubbleText}>
                    {message.text}
                  </Text>
                  {message.role === 'assistant' && message.citations?.length ? (
                    <View style={styles.nuviaCitationRow}>
                      {message.citations.map((citation) => (
                        <Text key={`${message.id}-${citation}`} style={styles.nuviaCitation}>{citation}</Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}
              {isNuviaThinking ? (
                <View style={styles.nuviaAssistantBubble}>
                  <Text style={styles.nuviaBubbleText}>Nuvia is analyzing patient signals and preparing the next action...</Text>
                </View>
              ) : null}
            </View>
          )}

          {nuviaMode === 'proactive' && (
            <View style={styles.nuviaPanel}>
              {nuviaProactiveAlerts.map((alert) => (
                <View key={alert.id} style={styles.nuviaAlertCard}>
                  <View style={styles.rowBetween}>
                    <View style={styles.inline}>
                      <View style={[styles.nuviaAlertIcon, { backgroundColor: `${alert.tone}20` }]}>
                        <Ionicons name={alert.icon} size={16} color={alert.tone} />
                      </View>
                      <Text style={styles.nuviaAlertTitle}>{alert.title}</Text>
                    </View>
                    <Pressable style={[styles.nuviaActionChip, { borderColor: `${alert.tone}55` }]} onPress={() => handleNuviaAlertAction(alert.id)}>
                      <Text style={[styles.nuviaAlertAction, { color: alert.tone }]}>{alert.action}</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.nuviaAlertBody}>{alert.description}</Text>
                </View>
              ))}
            </View>
          )}

          {nuviaMode === 'tasks' && (
            <View style={styles.nuviaPanel}>
              {nuviaTasks.map((task) => (
                <View key={task.id} style={styles.nuviaTaskCard}>
                  <View style={styles.rowBetween}>
                    <View style={styles.fill}>
                      <Text style={styles.nuviaTaskTitle}>{task.type}</Text>
                      <Text style={styles.nuviaTaskPatient}>{task.patient}</Text>
                    </View>
                    <View style={styles.nuviaTaskStatusPill}>
                      <Text style={styles.nuviaTaskStatusText}>{task.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.nuviaTaskMeta}>{task.meta}</Text>
                  <Pressable style={styles.nuviaTaskActionButton} onPress={() => handleNuviaTaskAction(task.id)}>
                    <Text style={styles.nuviaTaskActionText}>Open workflow</Text>
                    <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {nuviaMode === 'knowledge' && (
            <View style={styles.nuviaPanel}>
              <View style={styles.nuviaSearchWrap}>
                <Ionicons name="search-outline" size={16} color="#6b7280" />
                <TextInput
                  value={nuviaKnowledgeSearch}
                  onChangeText={setNuviaKnowledgeSearch}
                  placeholder="Search clinical protocols, billing rules..."
                  placeholderTextColor="#6b7280"
                  style={styles.nuviaSearchInput}
                />
              </View>
              {knowledgeRows.map((item) => (
                <Pressable key={item.id} style={styles.nuviaKnowledgeCard} onPress={() => handleNuviaKnowledgeAction(item.id)}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.nuviaKnowledgeCategory}>{item.category}</Text>
                    <Text style={styles.nuviaKnowledgeUpdated}>Updated</Text>
                  </View>
                  <Text style={styles.nuviaKnowledgeTitle}>{item.title}</Text>
                  <Text style={styles.nuviaKnowledgeBody}>{item.body}</Text>
                  <View style={styles.nuviaKnowledgeTags}>
                    {item.tags.map((tag) => (
                      <Text key={tag} style={styles.nuviaKnowledgeTag}>#{tag}</Text>
                    ))}
                  </View>
                  <View style={styles.nuviaKnowledgeFooter}>
                    <Text style={styles.nuviaKnowledgeAction}>Use in chat</Text>
                    <Ionicons name="sparkles-outline" size={14} color="#34d399" />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.nuviaComposer}>
            <Pressable style={[styles.nuviaMicButton, isNuviaRecording && styles.nuviaMicButtonActive]} onPress={handleNuviaMicPress}>
              <Ionicons name={isNuviaRecording ? 'mic' : 'mic-outline'} size={20} color="#ffffff" />
            </Pressable>
            <View style={styles.nuviaComposerInputWrap}>
              <TextInput
                ref={nuviaInputRef}
                value={nuviaInput}
                onChangeText={setNuviaInput}
                placeholder="Type a message or use voice command..."
                placeholderTextColor="#6b7280"
                style={styles.nuviaComposerInput}
                onSubmitEditing={handleNuviaSend}
                returnKeyType="send"
              />
              <Pressable style={[styles.nuviaSendButton, (!nuviaInput.trim() || isNuviaThinking) && styles.nuviaSendButtonDisabled]} onPress={handleNuviaSend}>
                <Ionicons name="send" size={16} color="#ffffff" />
              </Pressable>
            </View>
          </View>
          {nuviaVoiceError ? <Text style={styles.nuviaVoiceError}>{nuviaVoiceError}</Text> : null}
          <Text style={styles.nuviaComposerHint}>
            {isNuviaRecording ? 'Listening for your voice command...' : 'Tap the microphone to start a voice conversation'}
          </Text>
        </Card>
      </View>
    );
  };

  const renderTasks = () => (
    <View style={styles.stack}>
      <View style={styles.tasksHeader}>
        <View style={styles.tasksHeaderCopy}>
          <Text style={styles.sectionTitle}>Clinical Tasks</Text>
          <Text style={styles.sectionSubtitle}>Manage your care workflow</Text>
        </View>
        <View style={styles.tasksHeaderActions}>
          <Pressable style={styles.tasksGhostButton} onPress={handleSuggestTasks}>
            <Ionicons name={isSuggestingTasks ? 'hourglass-outline' : 'sparkles-outline'} size={14} color={colors.primaryDark} />
            <Text style={styles.tasksGhostButtonText}>{isSuggestingTasks ? 'Suggesting' : 'Suggest'}</Text>
          </Pressable>
          <Pressable
            style={styles.tasksPrimaryButton}
            onPress={() => {
              setEditingTaskId(null);
              setDraftTaskTitle('');
              setDraftTaskDescription('');
              setDraftTaskPriority('Medium');
              setDraftTaskCategory('Clinical');
              setDraftAssignToType('Clinical Team');
              setDraftAssigneeName('Dr. Richardson');
              setDraftDueDate('Today');
              setDraftPatientName('None');
              setOpenTaskSelect(null);
              setShowTaskModal(true);
            }}
          >
            <Ionicons name="add-outline" size={16} color="#ffffff" />
            <Text style={styles.tasksPrimaryButtonText}>Create</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tasksStatsRow}>
        <View style={styles.taskStatCard}>
          <View style={styles.taskStatTopRow}>
            <View style={[styles.taskStatIconWrap, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="time-outline" size={16} color="#ea580c" />
            </View>
            <Text style={styles.taskStatLabel} numberOfLines={1}>Pending</Text>
          </View>
          <View style={styles.taskStatBottomRow}>
            <Text style={styles.taskStatValue}>{taskStats.pending}</Text>
            <Text style={styles.taskStatMeta}>Requires attention</Text>
          </View>
        </View>
        <View style={styles.taskStatCard}>
          <View style={styles.taskStatTopRow}>
            <View style={[styles.taskStatIconWrap, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="pulse-outline" size={16} color="#2563eb" />
            </View>
            <Text style={styles.taskStatLabel} numberOfLines={1}>In Progress</Text>
          </View>
          <View style={styles.taskStatBottomRow}>
            <Text style={styles.taskStatValue}>{taskStats.inProgress}</Text>
            <Text style={[styles.taskStatMeta, { color: '#2563eb' }]}>Active workflows</Text>
          </View>
        </View>
        <View style={styles.taskStatCard}>
          <View style={styles.taskStatTopRow}>
            <View style={[styles.taskStatIconWrap, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primaryDark} />
            </View>
            <Text style={styles.taskStatLabel} numberOfLines={1}>Completed</Text>
          </View>
          <View style={styles.taskStatBottomRow}>
            <Text style={styles.taskStatValue}>{taskStats.completed}</Text>
            <Text style={styles.taskStatMeta}>Tasks finalized</Text>
          </View>
        </View>
      </View>

      <Card>
        <View style={styles.tasksFilterWrap}>
          <View style={styles.searchShell}>
            <Ionicons name="search-outline" size={16} color={colors.muted} />
            <TextInput
              value={taskSearch}
              onChangeText={setTaskSearch}
              placeholder="Search tasks or patients..."
              placeholderTextColor={colors.muted}
              style={styles.searchShellInput}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((status) => (
              <Pressable
                key={status}
                style={[styles.filterChip, taskStatusFilter === status && styles.filterChipActive]}
                onPress={() => setTaskStatusFilter(status)}
              >
                <Text style={[styles.filterChipText, taskStatusFilter === status && styles.filterChipTextActive]}>{status}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['All', 'High', 'Medium', 'Low'] as const).map((priority) => (
              <Pressable
                key={priority}
                style={[styles.filterChip, taskPriorityFilter === priority && styles.filterChipActive]}
                onPress={() => setTaskPriorityFilter(priority)}
              >
                <Text style={[styles.filterChipText, taskPriorityFilter === priority && styles.filterChipTextActive]}>{priority} Priority</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Card>

      {visibleTasks.length > 0 ? (
        visibleTasks.map((task) => {
          const statusTone =
            task.status === 'Completed' ? colors.primaryDark : task.status === 'In Progress' ? colors.info : colors.warning;
          const priorityTone = task.priority === 'High' ? colors.danger : task.priority === 'Medium' ? '#f97316' : colors.info;
          return (
            <Card key={task.id}>
              <View style={styles.tasksCardRow}>
                <Pressable style={styles.taskCheckButton} onPress={() => toggleTask(task.id)}>
                  <Ionicons
                    name={task.status === 'Completed' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={task.status === 'Completed' ? colors.primaryDark : colors.line}
                  />
                </Pressable>

                <View style={styles.fill}>
                  <View style={styles.tasksCardHeader}>
                    <Text style={[styles.cardTitle, task.status === 'Completed' && styles.taskTitleCompleted]}>{task.title}</Text>
                    <View style={styles.tasksBadgeRow}>
                      <View style={[styles.taskTinyBadge, { backgroundColor: `${priorityTone}18` }]}>
                        <Text style={[styles.taskTinyBadgeText, { color: priorityTone }]}>{task.priority}</Text>
                      </View>
                      <View style={styles.taskTinyBadge}>
                        <Text style={styles.taskTinyBadgeTextNeutral}>{task.category}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.body}>{task.description}</Text>

                  <View style={styles.tasksMetaRow}>
                    {task.patientName ? (
                      <View style={styles.tasksMetaItem}>
                        <Ionicons name="person-outline" size={12} color={colors.muted} />
                        <Text style={styles.tasksMetaText}>{task.patientName}</Text>
                      </View>
                    ) : null}
                    <View style={styles.tasksMetaItem}>
                      <Ionicons name="calendar-outline" size={12} color={colors.muted} />
                      <Text style={styles.tasksMetaText}>Due {task.dueDate}</Text>
                    </View>
                    <View style={styles.tasksMetaItem}>
                      <Ionicons name="pricetag-outline" size={12} color={colors.muted} />
                      <Text style={styles.tasksMetaText}>{task.assignedTo}</Text>
                    </View>
                  </View>

                  <View style={styles.rowBetween}>
                    <View style={[styles.badge, { backgroundColor: `${statusTone}18` }]}>
                      <Text style={[styles.badgeText, { color: statusTone }]}>{task.status}</Text>
                    </View>
                    <View style={styles.tasksCardActions}>
                      <Pressable style={styles.tasksHistoryButton} onPress={() => handleEditTask(task)}>
                        <Text style={styles.tasksHistoryButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable style={styles.tasksHistoryButton} onPress={() => setShowTaskHistory(task)}>
                        <Text style={styles.tasksHistoryButtonText}>History</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          );
        })
      ) : (
        <Card>
          <View style={styles.tasksEmptyState}>
            <Ionicons name="clipboard-outline" size={36} color={colors.line} />
            <Text style={styles.cardTitle}>No tasks found</Text>
            <Text style={styles.body}>Try changing the search text or task filters.</Text>
          </View>
        </Card>
      )}
    </View>
  );

  const renderRpm = () => (
    <View style={styles.stack}>
      <View>
        <Text style={styles.sectionTitle}>RPM Monitoring</Text>
        <Text style={styles.sectionSubtitle}>Remote patient programs</Text>
      </View>

      <Card dark>
        <LinearGradient colors={['#09090b', '#18181b']} style={styles.rpmHero}>
          <View style={styles.inline}>
            <View style={styles.rpmAvatarWrap}>
              <Image source={{ uri: nuviaAvatarUri }} style={styles.rpmAvatar} />
            </View>
            <View style={styles.fill}>
              <Text style={styles.rpmHeroTitle}>Nuvia Assistant</Text>
              <Text style={styles.rpmHeroKicker}>Active Monitoring</Text>
            </View>
          </View>
          <Text style={styles.rpmHeroBody}>
            I&apos;ve analyzed your RPM programs. There are <Text style={styles.rpmHeroBodyStrong}>2 critical alerts</Text> requiring attention today.
          </Text>
          <View style={styles.rpmHeroActions}>
            <Pressable style={styles.rpmHeroPrimary}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#ffffff" />
              <Text style={styles.rpmHeroPrimaryText}>Draft Messages</Text>
            </Pressable>
            <Pressable style={styles.rpmHeroSecondary}>
              <Ionicons name="call-outline" size={14} color="#ffffff" />
              <Text style={styles.rpmHeroSecondaryText}>Schedule Calls</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </Card>

      {rpmPrograms.map((program) => {
        const expanded = expandedRpmProgram === program.id;
        return (
          <Card key={program.id}>
            <Pressable
              style={styles.rpmProgramHeader}
              onPress={() => setExpandedRpmProgram((current) => (current === program.id ? '' : program.id))}
            >
              <View style={styles.inline}>
                <View style={[styles.rpmProgramIcon, { backgroundColor: program.bg }]}>
                  <Ionicons name={program.icon} size={22} color={program.tone} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{program.name}</Text>
                  <Text style={styles.rpmProgramMeta}>{program.patients.length} Enrolled</Text>
                </View>
              </View>
              <View style={styles.inline}>
                {program.patients.some((patient) => patient.status === 'Critical' || patient.status === 'Warning') ? (
                  <View style={styles.rpmAlertDot} />
                ) : null}
                <View style={styles.rpmChevronWrap}>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
                </View>
              </View>
            </Pressable>

            {expanded ? (
              <View style={styles.rpmPatientsList}>
                {program.patients.map((patient) => {
                  const statusTone =
                    patient.status === 'Critical' ? colors.danger : patient.status === 'Warning' ? '#f97316' : colors.primaryDark;
                  return (
                    <View key={patient.id} style={styles.rpmPatientCard}>
                      <View style={styles.rowBetween}>
                        <View style={styles.inline}>
                          <View style={styles.rpmPatientAvatar}>
                            <Text style={styles.rpmPatientAvatarText}>
                              {patient.name
                                .split(' ')
                                .map((part) => part[0])
                                .join('')}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.cardTitle}>{patient.name}</Text>
                            <View style={styles.inline}>
                              <Ionicons name="time-outline" size={12} color={colors.muted} />
                              <Text style={styles.rpmPatientSync}>{patient.lastSync}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={[styles.badge, { backgroundColor: `${statusTone}18` }]}>
                          <Text style={[styles.badgeText, { color: statusTone }]}>{patient.status}</Text>
                        </View>
                      </View>

                      {'alert' in patient && patient.alert ? (
                        <View style={styles.rpmAlertCard}>
                          <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                          <Text style={styles.rpmAlertText}>{patient.alert}</Text>
                        </View>
                      ) : null}

                      <View style={styles.rowBetween}>
                        <View style={styles.inline}>
                          <Text style={styles.rpmPatientSync}>Adherence:</Text>
                          <Text style={styles.rpmAdherenceValue}>{patient.adherence}</Text>
                        </View>
                        <Pressable style={styles.rpmReviewButton}>
                          <Text style={styles.rpmReviewButtonText}>Review</Text>
                          <Ionicons name="chevron-forward" size={12} color={colors.text} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );

  const renderLabs = () => (
    <View style={styles.stack}>
      <View style={styles.labsHeader}>
        <View style={styles.fill}>
          <Text style={styles.sectionTitle}>Lab Reports</Text>
          <Text style={styles.sectionSubtitle}>Nuvia Diagnostic Hub</Text>
        </View>
        <Pressable style={styles.labsAddButton} onPress={() => setShowLabUploadModal(true)}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <View style={styles.labsSearchRow}>
        <View style={[styles.searchShell, styles.fill]}>
          <Ionicons name="search-outline" size={16} color={colors.muted} />
          <TextInput
            value={labsSearchQuery}
            onChangeText={setLabsSearchQuery}
            placeholder="Search reports..."
            placeholderTextColor={colors.muted}
            style={styles.searchShellInput}
          />
        </View>
        <Pressable
          style={[styles.labsFilterButton, labsPatientFilter && styles.labsFilterButtonActive]}
          onPress={() => setLabsPatientFilter((current) => (current ? null : patients[0]?.id ?? null))}
        >
          <Ionicons name="filter-outline" size={18} color={labsPatientFilter ? '#ffffff' : colors.subtext} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.labsPillsRow}>
        <Pressable
          style={[styles.labsPatientPill, !labsPatientFilter && styles.labsPatientPillActive]}
          onPress={() => setLabsPatientFilter(null)}
        >
          <Text style={[styles.labsPatientPillText, !labsPatientFilter && styles.labsPatientPillTextActive]}>All Patients</Text>
        </Pressable>
        {patients.map((patient) => {
          const active = labsPatientFilter === patient.id;
          return (
            <Pressable
              key={patient.id}
              style={[styles.labsPatientPill, active && styles.labsPatientPillActive]}
              onPress={() => setLabsPatientFilter(patient.id)}
            >
              <Text style={[styles.labsPatientPillText, active && styles.labsPatientPillTextActive]}>{patient.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Card>
        <View style={styles.labsFilterGroups}>
          <View style={styles.fill}>
            <Text style={styles.labsFilterLabel}>Status</Text>
            <View style={styles.labsMiniFilters}>
              {(['All', 'Normal', 'Abnormal', 'Critical'] as const).map((item) => {
                const active = labsStatusFilter === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.labsMiniFilter, active && styles.labsMiniFilterActive]}
                    onPress={() => setLabsStatusFilter(item)}
                  >
                    <Text style={[styles.labsMiniFilterText, active && styles.labsMiniFilterTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fill}>
            <Text style={styles.labsFilterLabel}>Timeframe</Text>
            <View style={styles.labsMiniFilters}>
              {(['All', 'Last 7 Days', 'Last 30 Days'] as const).map((item) => {
                const active = labsDateFilter === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.labsMiniFilter, active && styles.labsMiniFilterActive]}
                    onPress={() => setLabsDateFilter(item)}
                  >
                    <Text style={[styles.labsMiniFilterText, active && styles.labsMiniFilterTextActive]}>
                      {item === 'All' ? 'All' : item.replace('Last ', '')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Card>

      <View style={styles.stack}>
        {filteredLabReports.length ? (
          filteredLabReports.map((report) => {
            const statusTone =
              report.status === 'Critical' ? colors.danger : report.status === 'Abnormal' ? '#f97316' : colors.primaryDark;
            return (
              <Pressable key={report.id} onPress={() => setSelectedLabReport(report)}>
                <Card>
                  <View style={styles.rowBetween}>
                    <View style={styles.inline}>
                      <View style={styles.labsReportIcon}>
                        <Ionicons name="document-text-outline" size={20} color={colors.subtext} />
                      </View>
                      <View>
                        <Text style={styles.listTitle}>{report.type}</Text>
                        <Text style={styles.labsReportPatient}>{report.patientName}</Text>
                      </View>
                    </View>
                    <View style={styles.inline}>
                      <Pressable
                        style={styles.labsShareButton}
                        onPress={() => {
                          setSelectedLabReport(report);
                          setShowLabShareModal(true);
                        }}
                      >
                        <Ionicons name="share-social-outline" size={16} color={colors.subtext} />
                      </Pressable>
                      <View style={[styles.badge, { backgroundColor: `${statusTone}18` }]}>
                        <Text style={[styles.badgeText, { color: statusTone }]}>{report.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.labsSummaryCard}>
                    <View style={styles.inline}>
                      <View style={styles.labsNuviaMark}>
                        <Image source={{ uri: nuviaAvatarUri }} style={styles.labsNuviaAvatar} />
                      </View>
                      <Text style={styles.labsSummaryLabel}>Nuvia Summary</Text>
                    </View>
                    <Text style={styles.body}>{report.summary}</Text>
                  </View>

                  <View style={styles.rowBetween}>
                    <Text style={styles.historyMeta}>{report.date}</Text>
                    <View style={styles.inline}>
                      <View style={styles.labsNuviaMark}>
                        <Image source={{ uri: nuviaAvatarUri }} style={styles.labsNuviaAvatar} />
                      </View>
                      <Text style={styles.labsAnalyzedText}>Nuvia Analyzed</Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })
        ) : (
          <Card>
            <View style={styles.tasksEmptyState}>
              <Ionicons name="flask-outline" size={36} color={colors.line} />
              <Text style={styles.cardTitle}>No reports found</Text>
              <Text style={styles.body}>Try changing the search text or lab filters.</Text>
            </View>
          </Card>
        )}
      </View>
    </View>
  );

  const renderBilling = () => (
    <View style={styles.stack}>
      <View style={styles.tasksHeader}>
        <View style={styles.tasksHeaderCopy}>
          <Text style={styles.sectionTitle}>Billing & Claims</Text>
          <Text style={styles.sectionSubtitle}>CPT Qualification Engine</Text>
        </View>
        <Pressable style={styles.tasksPrimaryButton} onPress={() => setShowBillingReportModal(true)}>
          <Ionicons name="document-text-outline" size={14} color="#ffffff" />
          <Text style={styles.tasksPrimaryButtonText}>Generate Claim Report</Text>
        </Pressable>
      </View>

      <View style={styles.tasksStatsRow}>
        {[
          { label: 'Qualified', value: billingStats.qualified, meta: 'Ready for submission', tone: colors.primary, icon: 'checkmark-circle-outline' as const },
          { label: 'In Progress', value: billingStats.inProgress, meta: 'Work remaining', tone: colors.info, icon: 'time-outline' as const },
          { label: 'Unqualified', value: billingStats.unqualified, meta: 'Action required', tone: colors.danger, icon: 'alert-circle-outline' as const },
        ].map((item) => (
          <View key={item.label} style={styles.taskStatCard}>
            <View style={styles.taskStatTopRow}>
              <View style={[styles.taskStatIconWrap, { backgroundColor: `${item.tone}15` }]}>
                <Ionicons name={item.icon} size={16} color={item.tone} />
              </View>
              <Text style={styles.taskStatLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
            <View style={styles.taskStatBottomRow}>
              <Text style={styles.taskStatValue}>{item.value}</Text>
              <Text style={[styles.taskStatMeta, { color: item.tone }]}>{item.meta}</Text>
            </View>
          </View>
        ))}
      </View>

      <Card>
        <View style={styles.tasksFilterWrap}>
          <View style={styles.searchShell}>
            <Ionicons name="search-outline" size={16} color={colors.muted} />
            <TextInput
              value={billingSearchQuery}
              onChangeText={setBillingSearchQuery}
              placeholder="Search patient or code..."
              placeholderTextColor={colors.muted}
              style={styles.searchShellInput}
            />
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.billingFilterRow}>
              {(['All', 'RPM', 'CCM', 'RTM', 'BHI', 'APCM'] as const).map((item) => {
                const active = billingProgramFilter === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setBillingProgramFilter(item)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {item === 'All' ? 'All Programs' : item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.billingFilterRow}>
              {(['All', 'Qualified', 'In Progress', 'Unqualified'] as const).map((item) => {
                const active = billingStatusFilter === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setBillingStatusFilter(item)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Card>

      <View style={styles.stack}>
        {filteredBillingCards.map((qual) => {
          const programTone =
            qual.program === 'RPM' ? colors.primaryDark : qual.program === 'CCM' ? colors.info : qual.program === 'RTM' ? '#7c3aed' : colors.subtext;
          const statusTone =
            qual.status === 'Qualified' ? colors.primaryDark : qual.status === 'In Progress' ? colors.info : colors.danger;
          return (
            <Card key={qual.id}>
              <View style={styles.billingHeaderRow}>
                <View style={styles.billingMainInfo}>
                  <View style={[styles.billingProgramIcon, { backgroundColor: `${programTone}15` }]}>
                    <Ionicons name="pulse-outline" size={22} color={programTone} />
                  </View>
                  <View style={styles.billingCopy}>
                    <View style={styles.billingNameRow}>
                      <Text style={styles.cardTitle}>{qual.patientName}</Text>
                      <View style={styles.billingProgramBadge}>
                        <Text style={styles.billingProgramBadgeText}>{qual.program}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardSubtext}>{qual.code} - {qual.description}</Text>
                  </View>
                </View>
                <View style={styles.billingStatusRow}>
                  <View style={styles.billingStatusWrap}>
                    <Text style={styles.billingStatusLabel}>Qualification</Text>
                    <Text style={[styles.billingStatusValue, { color: statusTone }]}>{qual.status}</Text>
                  </View>
                  <View style={[styles.billingStatusIcon, { backgroundColor: statusTone }]}>
                    <Ionicons
                      name={qual.status === 'Qualified' ? 'checkmark' : qual.status === 'In Progress' ? 'time-outline' : 'alert'}
                      size={20}
                      color="#ffffff"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.stack}>
                <View style={styles.rowBetween}>
                  <Text style={styles.billingProgressLabel}>Progress to Qualification</Text>
                  <Text style={styles.billingProgressLabel}>{qual.progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${qual.progress}%`, backgroundColor: statusTone }]} />
                </View>

                <View style={styles.billingRequirementGrid}>
                  {qual.requirements.map((req) => (
                    <View key={`${qual.id}-${req.label}`} style={styles.billingRequirementCard}>
                      <View style={styles.fill}>
                        <Text style={styles.billingRequirementLabel}>{req.label}</Text>
                        {!req.isMet ? <Text style={styles.billingRequirementWork}>Work Remaining</Text> : null}
                      </View>
                      <View style={styles.billingRequirementValueWrap}>
                        <Text style={[styles.billingRequirementValue, req.isMet ? styles.billingRequirementValueMet : null]}>
                          {req.current} / {req.target}
                        </Text>
                        {req.isMet ? (
                          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                        ) : (
                          <View style={styles.billingRequirementPendingDot} />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );

  const renderTelehealth = () => {
    if (isTelehealthActive && selectedPatient) {
      return (
        <View style={styles.stack}>
          <SectionHeader title="Telehealth Room" subtitle="Active provider session" />
          <LinearGradient colors={['#0d1d28', '#1f465c']} style={styles.videoPanel}>
            <Ionicons name="videocam" size={52} color="#ffffff" />
            <Text style={styles.videoTitle}>{selectedPatient.name}</Text>
            <Text style={styles.videoBody}>Live visit controls, chart context, and note prompts are ready on mobile.</Text>
          </LinearGradient>
          <Card>
            <Text style={styles.cardTitle}>Live Visit Controls</Text>
            {['Mute audio', 'Start documentation', 'Review meds', 'Open patient timeline'].map((item) => (
              <View key={item} style={styles.actionRow}>
                <Ionicons name="radio-button-on-outline" size={18} color={colors.info} />
                <Text style={styles.body}>{item}</Text>
              </View>
            ))}
            <Pressable
              style={styles.dangerButton}
              onPress={() => {
                setIsTelehealthActive(false);
                setSelectedPatientId(null);
              }}
            >
              <Text style={styles.dangerButtonText}>End Call</Text>
            </Pressable>
          </Card>
        </View>
      );
    }

    const upcomingVisits = [
      { id: '1', patient: 'John Doe', time: '09:00 AM', type: 'CCM Check-in', status: 'Confirmed', urgency: 'High', intakeComplete: true, mode: 'B2C' as const },
      { id: '2', patient: 'Sarah Jenkins', time: '10:30 AM', type: 'RPM Interactive', status: 'Pending', urgency: 'Normal', intakeComplete: false, mode: 'B2C' as const },
      { id: '3', patient: 'Dr. Michael Smith', time: '11:45 AM', type: 'Specialist Consult', status: 'Confirmed', urgency: 'Normal', intakeComplete: true, mode: 'B2B' as const },
      { id: '4', patient: 'Robert Wilson', time: '01:15 PM', type: 'Telehealth Consult', status: 'Confirmed', urgency: 'Normal', intakeComplete: true, mode: 'B2C' as const },
    ];

    const waitingRoom = [
      { id: 'w1', patient: 'Alice Brown', status: 'Ready', waitTime: '4m', intake: 'Complete', vitals: 'Stable', mode: 'B2C' as const },
      { id: 'w2', patient: 'Charlie Davis', status: 'In Intake', waitTime: '12m', intake: 'Processing', vitals: 'Pending', mode: 'B2C' as const },
      { id: 'w3', patient: 'Dr. Sarah Connor', status: 'Ready', waitTime: '2m', intake: 'N/A', vitals: 'N/A', mode: 'B2B' as const },
    ];

    const isProfessional = telehealthMode === 'B2B';
    const visibleVisits = upcomingVisits.filter((item) => item.mode === telehealthMode);
    const visibleWaiting = waitingRoom.filter((item) => item.mode === telehealthMode);

    return (
      <View style={styles.stack}>
        <SectionHeader title="Telehealth Module" subtitle="Ready visits and mobile room controls" />
        <View style={styles.segmentedControl}>
          <Pressable
            style={[styles.segmentButton, telehealthMode === 'B2C' && styles.segmentButtonActive]}
            onPress={() => setTelehealthMode('B2C')}
          >
            <Text style={[styles.segmentText, telehealthMode === 'B2C' && styles.segmentTextActive]}>Patient Care</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentButton, telehealthMode === 'B2B' && styles.segmentButtonActive]}
            onPress={() => setTelehealthMode('B2B')}
          >
            <Text style={[styles.segmentText, telehealthMode === 'B2B' && styles.segmentTextActive]}>Professional</Text>
          </Pressable>
        </View>

        <LinearGradient colors={isProfessional ? ['#123e7a', '#0A192F'] : ['#20252a', '#0b1114']} style={styles.videoPanel}>
          <View style={styles.rowBetween}>
            <View style={styles.inline}>
              <View style={[styles.telehealthHeroIcon, { backgroundColor: isProfessional ? '#2563eb' : colors.primary }]}>
                <Ionicons name={isProfessional ? 'people-outline' : 'sparkles-outline'} size={20} color="#ffffff" />
              </View>
              <View style={styles.fill}>
                <Text style={styles.videoTitle}>{isProfessional ? 'Professional Network' : 'Telehealth Co-Pilot'}</Text>
                <Text style={styles.videoBody}>CMS compliant | Feb 24</Text>
              </View>
            </View>
          </View>
          <View style={styles.telehealthStatsRow}>
            <View style={styles.telehealthStatCard}>
              <Text style={styles.telehealthStatLabel}>{isProfessional ? 'Consults' : 'Visits'}</Text>
              <Text style={styles.telehealthStatValue}>{isProfessional ? '4' : '8'}</Text>
              <Text style={styles.telehealthStatMeta}>{isProfessional ? '2 Specialists' : '3 CCM | 2 RPM'}</Text>
            </View>
            <View style={styles.telehealthStatCard}>
              <Text style={styles.telehealthStatLabel}>{isProfessional ? 'Value' : 'Billing'}</Text>
              <Text style={styles.telehealthStatValue}>{isProfessional ? 'High' : '$1.2k'}</Text>
              <Text style={styles.telehealthStatMeta}>{isProfessional ? 'Strong conversion' : 'CPT 99490 & 99457'}</Text>
            </View>
            <View style={styles.telehealthStatCard}>
              <Text style={styles.telehealthStatLabel}>{isProfessional ? 'Reviews' : 'Alerts'}</Text>
              <Text style={styles.telehealthStatValue}>2</Text>
              <Text style={styles.telehealthStatMeta}>{isProfessional ? 'Reports ready' : 'High BP detected'}</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.telehealthTabRow}>
          {[
            { id: 'schedule' as const, label: 'Schedule' },
            { id: 'waiting_room' as const, label: 'Waiting' },
            { id: 'analytics' as const, label: 'Analytics' },
            { id: 'availability' as const, label: 'Availability' },
            { id: 'history' as const, label: 'History' },
          ].map((tab) => {
            const active = telehealthTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                style={[styles.telehealthTabChip, active && styles.telehealthTabChipActive]}
                onPress={() => setTelehealthTab(tab.id)}
              >
                <Text style={[styles.telehealthTabChipText, active && styles.telehealthTabChipTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {telehealthTab === 'schedule' && (
          <View style={styles.stack}>
            <Pressable
              style={styles.scheduleVisitButton}
              onPress={() => {
                setBookingType(telehealthMode);
                setBookingStep(1);
                setShowBookingModal(true);
              }}
            >
              <Ionicons name="add-outline" size={18} color="#ffffff" />
              <Text style={styles.scheduleVisitButtonText}>Schedule Visit</Text>
            </Pressable>
            {visibleVisits.map((item) => (
              <Card key={item.id}>
                <View style={styles.rowBetween}>
                  <View style={styles.inline}>
                    <View style={[styles.telehealthListIcon, { backgroundColor: isProfessional ? '#dbeafe' : '#dcfce7' }]}>
                      <Ionicons name="people-outline" size={18} color={isProfessional ? '#2563eb' : colors.primaryDark} />
                    </View>
                    <View>
                      <Text style={styles.cardTitle}>{item.patient}</Text>
                      <Text style={styles.cardSubtext}>{item.time} | {item.type}</Text>
                    </View>
                  </View>
                  <Pressable style={styles.roundAction} onPress={() => startVisit(item.id)}>
                    <Ionicons name="videocam-outline" size={16} color="#ffffff" />
                  </Pressable>
                </View>
                <View style={styles.inline}>
                  <View style={[styles.badge, { backgroundColor: item.status === 'Confirmed' ? `${colors.primary}18` : `${colors.warning}18` }]}>
                    <Text style={[styles.badgeText, { color: item.status === 'Confirmed' ? colors.primary : colors.warning }]}>{item.status}</Text>
                  </View>
                  {item.urgency === 'High' && (
                    <View style={[styles.badge, { backgroundColor: `${colors.danger}18` }]}>
                      <Text style={[styles.badgeText, { color: colors.danger }]}>Urgent</Text>
                    </View>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {telehealthTab === 'waiting_room' && (
          <View style={styles.stack}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionSubtitle}>Active Queue</Text>
              <Text style={styles.waitingCount}>{visibleWaiting.length} Waiting</Text>
            </View>
            {visibleWaiting.map((item) => (
              <Card key={item.id}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.cardTitle}>{item.patient}</Text>
                    <Text style={styles.cardSubtext}>Wait time: {item.waitTime}</Text>
                  </View>
                  <Pressable
                    style={[styles.admitButton, item.status !== 'Ready' && styles.admitButtonDisabled]}
                    disabled={item.status !== 'Ready'}
                    onPress={() => startVisit(item.id)}
                  >
                    <Text style={[styles.admitButtonText, item.status !== 'Ready' && styles.admitButtonTextDisabled]}>Admit</Text>
                  </Pressable>
                </View>
                <View style={styles.inline}>
                  <View style={styles.miniPill}>
                    <Text style={styles.miniPillText}>Intake: {item.intake}</Text>
                  </View>
                  <View style={styles.miniPill}>
                    <Text style={styles.miniPillText}>Vitals: {item.vitals}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {telehealthTab === 'analytics' && (
          <View style={styles.grid}>
            {[
              { label: 'Total Visits', value: '1,248', trend: '+12%' },
              { label: 'Avg Wait', value: '8.4m', trend: '-2.1m' },
              { label: 'Satisfaction', value: '4.9/5', trend: '+0.2' },
              { label: 'Revenue', value: '$42.5k', trend: '+18%' },
            ].map((stat) => (
              <View key={stat.label} style={styles.metricCard}>
                <Text style={styles.metricValueSmall}>{stat.value}</Text>
                <Text style={styles.metricLabel}>{stat.label}</Text>
                <Text style={styles.metricTrend}>{stat.trend}</Text>
              </View>
            ))}
          </View>
        )}

        {telehealthTab === 'availability' && (
          <View style={styles.stack}>
            <Card>
              <Text style={styles.cardTitle}>Slot Duration</Text>
              <View style={styles.slotGrid}>
                {['15', '30', '45', '60'].map((slot) => {
                  const active = slotDuration === slot;
                  return (
                    <Pressable
                      key={slot}
                      style={[styles.slotPill, active && styles.slotPillActive]}
                      onPress={() => setSlotDuration(slot)}
                    >
                      <Text style={[styles.slotPillText, active && styles.slotPillTextActive]}>{slot}m</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Card>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Weekly Hours</Text>
                <View style={styles.autoSyncPill}>
                  <Text style={styles.autoSyncText}>Auto-Sync Active</Text>
                </View>
              </View>

              {availabilitySchedule.map((slot, index) => (
                <View key={slot.day} style={styles.availabilityRow}>
                  <View style={styles.rowBetween}>
                    <View style={styles.inline}>
                      <Pressable
                        style={[styles.toggleTrack, slot.active && styles.toggleTrackActive]}
                        onPress={() =>
                          setAvailabilitySchedule((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, active: !item.active } : item,
                            ),
                          )
                        }
                      >
                        <View style={[styles.toggleThumb, slot.active && styles.toggleThumbActive]} />
                      </Pressable>
                      <Text style={[styles.availabilityDay, !slot.active && styles.availabilityDayInactive]}>{slot.day}</Text>
                    </View>
                  </View>

                  {slot.active && (
                    <View style={styles.availabilityTimeRow}>
                      <TextInput
                        value={slot.start}
                        onChangeText={(value) =>
                          setAvailabilitySchedule((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, start: value } : item)),
                          )
                        }
                        style={styles.timeInput}
                      />
                      <Text style={styles.timeSeparator}>to</Text>
                      <TextInput
                        value={slot.end}
                        onChangeText={(value) =>
                          setAvailabilitySchedule((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, end: value } : item)),
                          )
                        }
                        style={styles.timeInput}
                      />
                    </View>
                  )}
                </View>
              ))}
            </Card>

            <Pressable style={styles.saveAvailabilityButton}>
              <Text style={styles.saveAvailabilityButtonText}>Save Availability</Text>
            </Pressable>
          </View>
        )}

        {telehealthTab === 'history' && (
          <View style={styles.stack}>
            <View style={styles.searchShell}>
              <Ionicons name="search-outline" size={16} color={colors.muted} />
              <TextInput
                value={telehealthHistorySearch}
                onChangeText={setTelehealthHistorySearch}
                placeholder="Search past visits..."
                placeholderTextColor={colors.muted}
                style={styles.historySearchInput}
              />
            </View>
            {[
              { date: 'Feb 22', patient: 'Michael Ross', type: 'CCM Check-in', duration: '18m', status: 'Billed' },
              { date: 'Feb 21', patient: 'Emily Blunt', type: 'Telehealth Consult', duration: '25m', status: 'Signed' },
              { date: 'Feb 20', patient: 'David Tennant', type: 'RPM Interactive', duration: '12m', status: 'Signed' },
            ]
              .filter((item) => {
                const query = telehealthHistorySearch.trim().toLowerCase();
                if (!query) return true;
                return (
                  item.patient.toLowerCase().includes(query) ||
                  item.type.toLowerCase().includes(query) ||
                  item.status.toLowerCase().includes(query)
                );
              })
              .map((item) => (
              <Card key={`${item.patient}-${item.date}`}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.cardTitle}>{item.patient}</Text>
                    <Text style={styles.historyMeta}>{item.date} | {item.duration}</Text>
                  </View>
                  <View style={[styles.historyStatusPill, item.status === 'Billed' ? styles.historyStatusPillBilled : styles.historyStatusPillSigned]}>
                    <Text style={[styles.historyStatusText, item.status === 'Billed' ? styles.historyStatusTextBilled : styles.historyStatusTextSigned]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.body}>{item.type}</Text>
                  <Pressable style={styles.soapAction}>
                    <Ionicons name="document-text-outline" size={14} color={telehealthMode === 'B2B' ? colors.info : colors.primaryDark} />
                    <Text style={[styles.soapActionText, { color: telehealthMode === 'B2B' ? colors.info : colors.primaryDark }]}>SOAP</Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderShiftSummary = () => (
    <View style={styles.stack}>
      <View style={styles.shiftTabRow}>
        <Pressable style={[styles.shiftTabButton, shiftTab === 'current' && styles.shiftTabButtonActive]} onPress={() => setShiftTab('current')}>
          <Text style={[styles.shiftTabText, shiftTab === 'current' && styles.shiftTabTextActive]}>Current Shift</Text>
        </Pressable>
        <Pressable style={[styles.shiftTabButton, shiftTab === 'history' && styles.shiftTabButtonActive]} onPress={() => setShiftTab('history')}>
          <Text style={[styles.shiftTabText, shiftTab === 'history' && styles.shiftTabTextActive]}>Shift History</Text>
        </Pressable>
      </View>

      {shiftTab === 'current' ? (
        <>
          <Card dark>
            <LinearGradient colors={['#09090b', '#18181b']} style={styles.shiftHero}>
              <View style={styles.shiftHeroTopRow}>
                <View style={styles.shiftHeroTitleWrap}>
                  <View style={styles.inline}>
                    <View style={styles.shiftHeroAvatarWrap}>
                      <Image source={{ uri: nuviaAvatarUri }} style={styles.shiftHeroAvatar} />
                    </View>
                    <View style={styles.fill}>
                      <Text style={styles.shiftHeroTitle}>Nuvia Shift Summary</Text>
                      <Text style={styles.shiftHeroKicker}>Clinical Intelligence Report</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.shiftHeroLivePill}>
                  <View style={styles.shiftHeroLiveDot} />
                  <Text style={styles.shiftHeroLiveText}>Live Analysis Active</Text>
                </View>
              </View>

              <View style={styles.shiftHeroStats}>
                {[
                  { label: 'Shift Duration', value: '8h 15m' },
                  { label: 'Interactions', value: '24' },
                  { label: 'CMS Minutes', value: '270m' },
                  { label: 'Escalations', value: '3' },
                ].map((item) => (
                  <View key={item.label} style={styles.shiftHeroStatCard}>
                    <Text style={styles.shiftHeroStatValue}>{item.value}</Text>
                    <Text style={styles.shiftHeroStatLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Shift Overview</Text>
            <Text style={styles.body}>
              Overall productive shift. Managed 14 patients with a focus on high-risk CHF and Diabetes cases. Successfully addressed 2
              critical RPM alerts and adjusted medications for 3 patients. All CMS documentation for the period is up to date.
            </Text>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Patient-Level Summary</Text>
            <View style={styles.stack}>
              {shiftSummaryPatients.map((patient) => {
                const expanded = expandedShiftPatient === patient.name;
                const tone = patient.status === 'High Risk' ? colors.danger : patient.status === 'Threshold Met' ? colors.primaryDark : colors.info;
                return (
                  <Pressable
                    key={patient.name}
                    style={[styles.shiftPatientCard, expanded && styles.shiftPatientCardExpanded]}
                    onPress={() => setExpandedShiftPatient(expanded ? null : patient.name)}
                  >
                    <View style={styles.rowBetween}>
                      <View style={styles.inline}>
                        <View style={[styles.shiftPatientIcon, { backgroundColor: `${tone}15` }]}>
                          <Ionicons name="person-outline" size={16} color={tone} />
                        </View>
                        <View style={styles.fill}>
                          <Text style={styles.listTitle}>{patient.name}</Text>
                          <Text style={styles.historyMeta}>{patient.conditions}</Text>
                        </View>
                      </View>
                      <View style={styles.inline}>
                        <View style={[styles.badge, { backgroundColor: `${tone}18` }]}>
                          <Text style={[styles.badgeText, { color: tone }]}>{patient.status}</Text>
                        </View>
                        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
                      </View>
                    </View>

                    <Text style={styles.body}>{patient.updates}</Text>

                    {expanded ? (
                      <View style={styles.stackTight}>
                        {patient.riskFlags.length ? (
                          <View>
                            <Text style={styles.shiftMiniHeaderDanger}>Risk Flags</Text>
                            <View style={styles.shiftFlagRow}>
                              {patient.riskFlags.map((flag) => (
                                <View key={flag} style={styles.shiftFlagPill}>
                                  <Text style={styles.shiftFlagPillText}>{flag}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        ) : null}

                        <View style={styles.shiftKeyUpdateCard}>
                          <Text style={styles.shiftMiniHeader}>Key Updates</Text>
                          <Text style={styles.body}>{patient.keyUpdates}</Text>
                        </View>

                        <View style={styles.shiftCmsPillRow}>
                          <Ionicons name="time-outline" size={16} color={colors.primaryDark} />
                          <Text style={styles.shiftCmsPillLabel}>CMS Minutes Logged</Text>
                          <Text style={styles.shiftCmsPillValue}>{patient.cms}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.rowBetween}>
                        <Text style={styles.shiftCollapsedCms}>{patient.cms}</Text>
                        <Text style={styles.shiftCollapsedHint}>Click to expand</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card dark>
            <LinearGradient colors={['#09090b', '#18181b']} style={styles.darkHeroInner}>
              <View style={styles.shiftSectionHeaderWrap}>
                <View style={styles.fill}>
                  <Text style={styles.darkHeroTitle}>CMS Billing Summary</Text>
                  <Text style={styles.shiftHeroKicker}>Compliance & Reimbursement Tracking</Text>
                </View>
                <View style={styles.shiftValidatedPill}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#34d399" />
                  <Text style={styles.shiftValidatedText}>Validated</Text>
                </View>
              </View>

              <View style={styles.stack}>
                {shiftBillingRows.map((row) => {
                  const statusColor = row.status === 'Yes' ? '#10b981' : row.status === 'No' ? '#ef4444' : '#3b82f6';
                  const statusCopy = row.status === 'Yes' ? 'Ready to Bill' : row.status === 'No' ? 'Ineligible' : 'Review Needed';
                  return (
                    <View key={row.prog} style={styles.shiftBillingCard}>
                      <View style={styles.shiftBillingTopRow}>
                        <View style={styles.fill}>
                          <Text style={styles.shiftBillingProg}>{row.prog}</Text>
                          <Text style={styles.shiftBillingDesc}>{row.desc}</Text>
                        </View>
                        <View style={[styles.shiftBillingStatusPill, { backgroundColor: `${statusColor}22` }]}>
                          <Text style={[styles.shiftBillingStatusText, { color: statusColor }]}>{statusCopy}</Text>
                        </View>
                      </View>
                      <View style={styles.shiftBillingMetrics}>
                        <View>
                          <Text style={styles.shiftBillingMetricLabel}>Minutes</Text>
                          <Text style={styles.shiftBillingMetricValue}>{row.mins}</Text>
                        </View>
                        <View>
                          <Text style={styles.shiftBillingMetricLabel}>Target</Text>
                          <Text style={styles.shiftBillingMetricValue}>{row.target}</Text>
                        </View>
                        <View>
                          <Text style={styles.shiftBillingMetricLabel}>Status</Text>
                          <Text style={[styles.shiftBillingMetricStatus, { color: statusColor }]}>{row.status}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </LinearGradient>
          </Card>

          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Pending Handoff</Text>
              <Text style={styles.sectionSubtitle}>3 Items</Text>
            </View>
            <View style={styles.stack}>
              {shiftPendingHandoff.map((item) => (
                <View key={item.task} style={styles.shiftHandoffCard}>
                  <View style={styles.inline}>
                    <Ionicons name="time-outline" size={16} color="#f97316" />
                    <Text style={styles.listTitle}>{item.task}</Text>
                  </View>
                  <View style={styles.inline}>
                    <Ionicons name="calendar-outline" size={12} color={colors.muted} />
                    <Text style={styles.tasksMetaText}>Due: {item.dueDate}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.shiftDivider} />

            <View style={styles.shiftSuggestedHeader}>
              <View style={styles.inline}>
                <View style={styles.shiftHeroAvatarWrapSmall}>
                  <Image source={{ uri: nuviaAvatarUri }} style={styles.shiftHeroAvatar} />
                </View>
                <View style={styles.fill}>
                  <Text style={styles.shiftSuggestedTitle}>Nuvia Suggested Tasks</Text>
                  <Text style={styles.shiftSuggestedSub}>AI Care Optimization</Text>
                </View>
              </View>
              <View style={styles.shiftSuggestionCount}>
                <Text style={styles.shiftSuggestionCountText}>{shiftSuggestedTasks.length} Suggestions</Text>
              </View>
            </View>

            <View style={styles.stack}>
              {shiftSuggestedTasks.map((item) => (
                <View key={item.task} style={styles.shiftSuggestedCard}>
                  <View style={styles.rowBetween}>
                    <View style={styles.inlineStartFill}>
                      <View style={styles.shiftSuggestedIcon}>
                        <Ionicons name="flash-outline" size={14} color={colors.primaryDark} />
                      </View>
                      <Text style={styles.cardTitleCompact}>{item.task}</Text>
                    </View>
                    <Pressable style={styles.shiftSuggestedAdd}>
                      <Ionicons name="add" size={14} color="#ffffff" />
                    </Pressable>
                  </View>
                  <View style={styles.shiftKeyUpdateCard}>
                    <Text style={styles.shiftMiniHeader}>Clinical Rationale</Text>
                    <Text style={styles.body}>{item.reason}</Text>
                  </View>
                  <View style={styles.inline}>
                    <Ionicons name="calendar-outline" size={12} color={colors.muted} />
                    <Text style={styles.tasksMetaText}>Suggested Due: {item.dueDate}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          <Card>
            <View style={styles.inline}>
              <View style={styles.shiftHeroAvatarWrapSmall}>
                <Image source={{ uri: nuviaAvatarUri }} style={styles.shiftHeroAvatar} />
              </View>
              <View style={styles.fill}>
                <Text style={styles.cardTitle}>Nuvia Handoff Notes</Text>
                <Text style={styles.sectionSubtitle}>AI-Synthesized Briefing</Text>
              </View>
            </View>
            <View style={styles.shiftKeyUpdateCard}>
              <Text style={styles.body}>{shiftHandoffNotes}</Text>
            </View>
          </Card>

          <Card dark>
            <LinearGradient colors={['#09090b', '#18181b']} style={styles.darkHeroInner}>
              <Text style={styles.darkHeroTitle}>Finalize & Handoff</Text>
              <Text style={styles.darkHeroBody}>
                By approving, you confirm this summary is accurate. It will be timestamped and digitally signed for the incoming team.
              </Text>
              <Pressable style={styles.shiftFinalizeButton} onPress={() => setShowShiftHandoffModal(true)}>
                <Ionicons name="arrow-forward-outline" size={16} color="#ffffff" />
                <Text style={styles.shiftFinalizeButtonText}>Next Shift Handoff</Text>
              </Pressable>
            </LinearGradient>
          </Card>
        </>
      ) : (
        <View style={styles.stack}>
          <View style={styles.tasksHeaderCopy}>
            <Text style={styles.sectionTitle}>Shift History</Text>
            <Text style={styles.cardSubtext}>Audit-ready records and productivity trends</Text>
          </View>

          <Card>
            <View style={styles.shiftHistoryControls}>
              <View style={styles.searchShell}>
                <Ionicons name="search-outline" size={16} color={colors.muted} />
                <TextInput
                  value={shiftHistorySearch}
                  onChangeText={setShiftHistorySearch}
                  placeholder="Search history..."
                  placeholderTextColor={colors.muted}
                  style={styles.searchShellInput}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shiftHistoryFilterRow}>
                {['All Departments', 'Cardiology', 'Emergency', 'RPM Team'].map((item) => {
                  const active = shiftHistoryDept === item;
                  return (
                    <Pressable key={item} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setShiftHistoryDept(item)}>
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shiftHistoryFilterRow}>
                {[
                  { id: '', label: 'All Dates' },
                  { id: 'May 5, 2026', label: 'May 5' },
                  { id: 'May 4, 2026', label: 'May 4' },
                  { id: 'May 3, 2026', label: 'May 3' },
                ].map((item) => {
                  const active = shiftHistoryDateFilter === item.id;
                  return (
                    <Pressable key={item.label} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setShiftHistoryDateFilter(item.id)}>
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.shiftHistoryModeRow}>
                {[
                  { id: 'day' as const, label: 'Day-wise' },
                  { id: 'user' as const, label: 'User-wise' },
                  { id: 'patient' as const, label: 'Patient-wise' },
                ].map((item) => {
                  const active = shiftHistoryViewMode === item.id;
                  return (
                    <Pressable key={item.id} style={[styles.shiftHistoryModeButton, active && styles.shiftHistoryModeButtonActive]} onPress={() => setShiftHistoryViewMode(item.id)}>
                      <Text style={[styles.shiftHistoryModeText, active && styles.shiftHistoryModeTextActive]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Card>

          <View style={styles.grid}>
            {[
              { label: 'Avg Productivity', value: '91%', tone: colors.primaryDark },
              { label: 'Total Revenue', value: '$42,850', tone: colors.info },
              { label: 'Risk Escalations', value: '12', tone: colors.danger },
            ].map((item) => (
              <View key={item.label} style={styles.metricCard}>
                <Text style={[styles.metricValueSmall, { color: item.tone }]}>{item.value}</Text>
                <Text style={styles.metricLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {shiftHistoryViewMode === 'day'
            ? filteredShiftHistoryDays.map((item) => (
                <Card key={`${item.date}-${item.type}`}>
                  <View style={styles.rowBetween}>
                    <View style={styles.fill}>
                      <Text style={styles.cardTitle}>{item.date}</Text>
                      <Text style={styles.cardSubtext}>{item.type}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#ecfdf5' }]}>
                      <Text style={[styles.badgeText, { color: colors.primaryDark }]}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.shiftHistoryMetrics}>
                    <View style={styles.shiftHistoryMetricCard}>
                      <Text style={styles.shiftHistoryMetricValue}>{item.patients}</Text>
                      <Text style={styles.shiftHistoryMetricLabel}>Patients</Text>
                    </View>
                    <View style={styles.shiftHistoryMetricCard}>
                      <Text style={styles.shiftHistoryMetricValue}>{item.mins}</Text>
                      <Text style={styles.shiftHistoryMetricLabel}>Time Logged</Text>
                    </View>
                    <View style={styles.shiftHistoryMetricCard}>
                      <Text style={styles.shiftHistoryMetricValue}>{item.revenue}</Text>
                      <Text style={styles.shiftHistoryMetricLabel}>Revenue</Text>
                    </View>
                  </View>
                </Card>
              ))
            : shiftHistoryViewMode === 'user'
              ? filteredShiftHistoryUsers.map((item) => (
                  <Card key={item.name}>
                    <View style={styles.rowBetween}>
                      <View style={styles.fill}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardSubtext}>{item.role}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: '#ecfdf5' }]}>
                        <Text style={[styles.badgeText, { color: colors.primaryDark }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.shiftHistoryMetrics}>
                      <View style={styles.shiftHistoryMetricCard}>
                        <Text style={styles.shiftHistoryMetricValue}>{item.patients}</Text>
                        <Text style={styles.shiftHistoryMetricLabel}>Patients</Text>
                      </View>
                      <View style={styles.shiftHistoryMetricCard}>
                        <Text style={styles.shiftHistoryMetricValue}>{item.time}</Text>
                        <Text style={styles.shiftHistoryMetricLabel}>Time Logged</Text>
                      </View>
                      <View style={styles.shiftHistoryMetricCard}>
                        <Text style={styles.shiftHistoryMetricValue}>{item.revenue}</Text>
                        <Text style={styles.shiftHistoryMetricLabel}>Revenue</Text>
                      </View>
                    </View>
                  </Card>
                ))
              : filteredShiftHistoryPatients.map((item) => (
                  <Card key={item.id}>
                    <View style={styles.rowBetween}>
                      <View style={styles.fill}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardSubtext}>{item.id}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: item.status === 'High Risk' ? '#fef2f2' : '#ecfdf5' }]}>
                        <Text style={[styles.badgeText, { color: item.status === 'High Risk' ? colors.danger : colors.primaryDark }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.shiftHistoryMetrics}>
                      <View style={styles.shiftHistoryMetricCard}>
                        <Text style={styles.shiftHistoryMetricValue}>{item.continuity}</Text>
                        <Text style={styles.shiftHistoryMetricLabel}>Care Continuity</Text>
                      </View>
                      <View style={styles.shiftHistoryMetricCard}>
                        <Text style={styles.shiftHistoryMetricValue}>{item.time}</Text>
                        <Text style={styles.shiftHistoryMetricLabel}>Time Logged</Text>
                      </View>
                      <View style={styles.shiftHistoryMetricCard}>
                        <Text style={styles.shiftHistoryMetricValue}>{item.revenue}</Text>
                        <Text style={styles.shiftHistoryMetricLabel}>Revenue</Text>
                      </View>
                    </View>
                  </Card>
                ))}
        </View>
      )}
    </View>
  );

  const renderEducation = () => (
    <View style={styles.stack}>
      <SectionHeader title="Patient Education" subtitle="Shareable lessons and handouts" />
      {educationCards.map((item) => (
        <Card key={item.title}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.body}>{item.subtitle}</Text>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{item.cta}</Text>
          </Pressable>
        </Card>
      ))}
    </View>
  );

  const renderOnboarding = () => (
    <View style={styles.stack}>
      <SectionHeader title="Patient Onboarding" subtitle="New patient intake and enrollment" />
      <Card>
        <Text style={styles.cardTitle}>New Intake Checklist</Text>
        {onboardingSteps.map((step) => (
          <View key={step.title} style={styles.rowBetween}>
            <Text style={styles.body}>{step.title}</Text>
            <View style={[styles.badge, { backgroundColor: `${step.status === 'Complete' ? colors.primary : colors.warning}18` }]}>
              <Text style={[styles.badgeText, { color: step.status === 'Complete' ? colors.primary : colors.warning }]}>
                {step.status}
              </Text>
            </View>
          </View>
        ))}
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Suggested Next Step</Text>
        <Text style={styles.body}>Collect consent, schedule orientation, and prepare the RPM device activation workflow.</Text>
        <Pressable style={styles.heroPrimary}>
          <Text style={styles.heroPrimaryText}>Begin Enrollment</Text>
        </Pressable>
      </Card>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.stack}>
      <SectionHeader title="Profile" subtitle="Provider account and settings" />

      <View style={styles.profileHero}>
        <View style={styles.profileHeroAvatar}>
          <Text style={styles.profileHeroAvatarText}>DR</Text>
          <View style={styles.profileVerified}>
            <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
          </View>
        </View>
        <View style={styles.profileHeroContent}>
          <View style={styles.profilePillRow}>
            <View style={styles.profilePillPrimary}>
              <Text style={styles.profilePillPrimaryText}>Verified Provider</Text>
            </View>
            <View style={styles.profilePillMuted}>
              <Text style={styles.profilePillMutedText}>Cardiologist</Text>
            </View>
          </View>
          <Text style={styles.profileHeroTitle}>Dr. Richardson</Text>
          <Text style={styles.profileHeroMeta}>Vantum Health Center | San Francisco, CA | Member since Jan 2024</Text>
        </View>
        <Pressable style={styles.profileSignOutTop} onPress={() => setAuthenticated(false)}>
          <Ionicons name="log-out-outline" size={16} color="#dc2626" />
          <Text style={styles.profileSignOutTopText}>Sign Out</Text>
        </Pressable>
      </View>

      <Card>
        <View style={styles.profileTabRow}>
          {[
            { id: 'info' as const, label: 'Profile Info', icon: 'person-outline' as const },
            { id: 'settings' as const, label: 'App Settings', icon: 'settings-outline' as const },
            { id: 'security' as const, label: 'Security', icon: 'shield-checkmark-outline' as const },
          ].map((tab) => {
            const active = profileTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                style={[styles.profileTabButton, active && styles.profileTabButtonActive]}
                onPress={() => setProfileTab(tab.id)}
              >
                <Ionicons name={tab.icon} size={16} color={active ? '#ffffff' : colors.subtext} />
                <Text style={[styles.profileTabText, active && styles.profileTabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {profileTab === 'info' && (
          <View style={styles.stack}>
            {profileInfoRows.map((item) => (
              <View key={item.label} style={styles.profileInfoCard}>
                <Text style={styles.profileInfoLabel}>{item.label}</Text>
                <Text style={styles.profileInfoValue}>{item.value}</Text>
              </View>
            ))}
            <View style={styles.profileBioCard}>
              <Text style={styles.profileInfoLabel}>Professional Bio</Text>
              <Text style={styles.body}>
                Dedicated cardiologist with over 12 years of experience managing complex cardiovascular conditions and
                remote patient monitoring programs.
              </Text>
            </View>
            <View style={styles.inline}>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.heroPrimary}>
                <Text style={styles.heroPrimaryText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        )}

        {profileTab === 'settings' && (
          <View style={styles.stack}>
            {profileSettingsRows.map((item) => (
              <Pressable key={item.title} style={styles.profileOptionRow}>
                <View style={styles.profileOptionIcon}>
                  <Ionicons name="settings-outline" size={18} color={colors.subtext} />
                </View>
                <View style={styles.fill}>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Text style={styles.listMeta}>{item.body}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        )}

        {profileTab === 'security' && (
          <View style={styles.stack}>
            {profileSecurityRows.map((item) => (
              <Pressable key={item.title} style={styles.profileOptionRow}>
                <View style={styles.profileOptionIcon}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.subtext} />
                </View>
                <View style={styles.fill}>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Text style={styles.listMeta}>{item.body}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        )}
      </Card>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'dashboard') return renderDashboard();
    if (activeTab === 'patients') return renderPatients();
    if (activeTab === 'telehealth') return renderTelehealth();
    if (activeTab === 'messages') {
      return renderSimpleList(
        'Messaging',
        'Patient and staff communication threads',
        messages.map((item) => ({
          title: item.patientName,
          meta: `${item.timestamp} • ${item.unread} unread`,
          body: item.lastMessage,
        })),
      );
    }
    if (activeTab === 'nuvia') {
      return renderNuvia();
    }
    if (activeTab === 'tasks') return renderTasks();
    if (activeTab === 'rpm') return renderRpm();
    if (activeTab === 'labs') return renderLabs();
    if (activeTab === 'billing') return renderBilling();
    if (activeTab === 'shift-summary') return renderShiftSummary();
    if (activeTab === 'education') return renderEducation();
    if (activeTab === 'onboarding') return renderOnboarding();
    return renderProfile();
  };

  if (!authenticated) {
    return (
      <SafeAreaView style={styles.authRoot}>
        <StatusBar style="light" />
        <View style={styles.authScreen}>
          <View style={styles.authShell}>
            <View style={styles.authBrandBlock}>
              <View style={styles.authLogo}>
                <View style={styles.authLogoSheen} />
                <Text style={styles.authLogoMark}>V</Text>
                <View style={styles.authLogoPulse}>
                  <View style={[styles.authLogoPulseSeg, styles.authLogoPulseSegShort]} />
                  <View style={[styles.authLogoPulseSeg, styles.authLogoPulseSegRise]} />
                  <View style={[styles.authLogoPulseSeg, styles.authLogoPulseSegDip]} />
                  <View style={[styles.authLogoPulseSeg, styles.authLogoPulseSegFlat]} />
                </View>
              </View>
              <Text style={styles.authBrand}>Vantum Clinic</Text>
              <Text style={styles.authTag}>AI Co-Pilot Care Journey</Text>
            </View>

            <View style={styles.authCard}>
              <View style={styles.authHeading}>
                <Text style={styles.authTitle}>Welcome Back</Text>
                <Text style={styles.authBody}>Sign in to access your assigned patient panel.</Text>
              </View>

              <View style={styles.authForm}>
                <View style={styles.authFieldBlock}>
                  <Text style={styles.authFieldLabel}>Work Email</Text>
                  <View style={styles.authInputWrap}>
                    <Ionicons name="mail-outline" size={18} color={colors.muted} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="doctor@hospital.com"
                      placeholderTextColor={colors.muted}
                      style={styles.authInput}
                    />
                  </View>
                </View>

                <View style={styles.authFieldBlock}>
                  <Text style={styles.authFieldLabel}>Password</Text>
                  <View style={styles.authInputWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  style={styles.authInput}
                />
                    <Pressable hitSlop={10} onPress={() => setShowPassword((current) => !current)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>

                <Pressable style={styles.authForgotWrap}>
                  <Text style={styles.authForgotText}>Forgot Password?</Text>
                </Pressable>
              </View>

              <Pressable style={styles.authButton} onPress={handleSignIn} disabled={isAuthLoading}>
                {isAuthLoading ? (
                  <View style={styles.authLoadingWrap}>
                    <View style={styles.authLoadingDot} />
                    <Text style={styles.authButtonText}>Signing In</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.authButtonText}>Sign In</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                  </>
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.authFooter}>
            <View style={styles.authFooterItem}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.text} />
              <Text style={styles.authFooterText}>HIPAA Compliant</Text>
            </View>
            <View style={styles.authFooterItem}>
              <Ionicons name="lock-closed-outline" size={14} color={colors.text} />
              <Text style={styles.authFooterText}>256-bit AES</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View style={styles.inline}>
          <Logo />
          <View>
            <Text style={styles.topTitle}>Dr. Richardson</Text>
            <Text style={styles.topSub}>Provider workspace</Text>
          </View>
        </View>
        <View style={styles.topActions}>
          <Pressable style={styles.notificationButton} onPress={() => setShowNotifications(true)}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <View style={styles.notificationDot} />
          </Pressable>
          <Pressable
            style={[styles.profileAction, activeTab === 'profile' && styles.profileActionActive]}
            onPress={() => {
              setSelectedPatientId(null);
              setIsTelehealthActive(false);
              navigate('profile');
            }}
          >
            <Text style={[styles.profileActionText, activeTab === 'profile' && styles.profileActionTextActive]}>DR</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      <View style={styles.bottomBar}>
        {tabs.map((tab) => {
          const active = tab.id !== 'more' && tab.id === activeTab;
          const isAi = tab.id === 'nuvia';
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, isAi && styles.tabAi]}
              onPress={() => {
                if (tab.id === 'more') {
                  setShowMore(true);
                  return;
                }
                navigate(tab.id);
              }}
            >
              {isAi ? (
                <>
                  <View style={[styles.tabAiCard, active && styles.tabAiCardActive]}>
                    <LinearGradient colors={['#1ecf90', '#0f8a62']} style={styles.tabAiGradient}>
                      <View style={styles.tabAiGlow} />
                      <Image source={{ uri: nuviaAvatarUri }} style={styles.tabAiAvatar} />
                    </LinearGradient>
                  </View>
                  <Text style={styles.tabAiText}>{tab.label}</Text>
                </>
              ) : (
                <>
                  <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                    <Ionicons name={tab.icon} size={active ? 22 : 20} color={active ? colors.primary : '#8ca196'} />
                  </View>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      <Modal visible={showNotifications} transparent animationType="slide" onRequestClose={() => setShowNotifications(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Pressable onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.map((item) => (
                <View key={item.id} style={styles.notificationCard}>
                  <View
                    style={[
                      styles.notificationTone,
                      {
                        backgroundColor:
                          item.tone === 'critical'
                            ? colors.danger
                            : item.tone === 'warning'
                              ? colors.warning
                              : colors.info,
                      },
                    ]}
                  />
                  <View style={styles.fill}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.listTitle}>{item.title}</Text>
                      <Text style={styles.listMeta}>{item.time}</Text>
                    </View>
                    <Text style={styles.body}>{item.body}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showMore} transparent animationType="slide" onRequestClose={() => setShowMore(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.moreSheet}>
            <View style={styles.rowBetween}>
              <Text style={styles.moreSheetTitle}>More Modules</Text>
              <Pressable onPress={() => setShowMore(false)} style={styles.moreSheetClose}>
                <Ionicons name="close" size={20} color="#a1a1aa" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {moreTabs.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.moreRow, activeTab === item.id && styles.moreRowActive]}
                  onPress={() => navigate(item.id)}
                >
                  <View style={[styles.moreIcon, activeTab === item.id && styles.moreIconActive]}>
                    <Ionicons name={item.icon} size={20} color={activeTab === item.id ? '#ffffff' : '#a1a1aa'} />
                  </View>
                  <View style={styles.fill}>
                    <Text style={[styles.moreRowTitle, activeTab === item.id && styles.moreRowTitleActive]}>{item.label}</Text>
                    <Text style={[styles.moreRowDescription, activeTab === item.id && styles.moreRowDescriptionActive]}>{item.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={activeTab === item.id ? '#ffffff' : '#71717a'} />
                </Pressable>
              ))}
              <View style={styles.moreSheetSpacer} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowBookingModal(false);
          setBookingStep(1);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.bookingSheet}>
            <View style={styles.bookingHandle} />
            <View style={styles.rowBetween}>
              <Text style={styles.bookingTitle}>Schedule Visit</Text>
              <Pressable
                onPress={() => {
                  setShowBookingModal(false);
                  setBookingStep(1);
                }}
                style={styles.bookingClose}
              >
                <Ionicons name="close" size={20} color={colors.subtext} />
              </Pressable>
            </View>

            <View style={styles.segmentedControl}>
              <Pressable
                style={[styles.segmentButton, bookingType === 'B2C' && styles.segmentButtonActive]}
                onPress={() => setBookingType('B2C')}
              >
                <Text style={[styles.segmentText, bookingType === 'B2C' && styles.segmentTextActive]}>Patient Care</Text>
              </Pressable>
              <Pressable
                style={[styles.segmentButton, bookingType === 'B2B' && styles.segmentButtonActive]}
                onPress={() => setBookingType('B2B')}
              >
                <Text style={[styles.segmentText, bookingType === 'B2B' && styles.segmentTextActive]}>Professional</Text>
              </Pressable>
            </View>

            {bookingStep === 1 ? (
              <View style={styles.stack}>
                <View style={styles.bookingField}>
                  <Text style={styles.bookingLabel}>{bookingType === 'B2B' ? 'Specialist / Provider' : 'Patient Name'}</Text>
                  <View style={styles.bookingInputShell}>
                    <Text style={styles.bookingInputValue}>{bookingType === 'B2B' ? 'Dr. Emily Chen' : 'John Doe'}</Text>
                  </View>
                </View>
                <View style={styles.bookingField}>
                  <Text style={styles.bookingLabel}>Visit Reason</Text>
                  <View style={styles.bookingInputShell}>
                    <Text style={styles.bookingInputValue}>{bookingType === 'B2B' ? 'Referral Review' : 'CCM Follow-up'}</Text>
                  </View>
                </View>
                <View style={styles.bookingField}>
                  <Text style={styles.bookingLabel}>Preferred Date</Text>
                  <View style={styles.bookingInputShell}>
                    <Text style={styles.bookingInputValue}>Today</Text>
                  </View>
                </View>

                <Pressable style={styles.bookingPrimaryButton} onPress={() => setBookingStep(2)}>
                  <Text style={styles.bookingPrimaryButtonText}>Find Availability</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.stack}>
                {[
                  { name: 'Dr. Emily Chen', time: 'Today, 2:00 PM' },
                  { name: 'Dr. Marcus Thorne', time: 'Tomorrow, 9:30 AM' },
                ].map((provider) => (
                  <View key={provider.name} style={styles.bookingSlotCard}>
                    <Text style={styles.bookingSlotName}>{provider.name}</Text>
                    <Text style={styles.bookingSlotTime}>{provider.time}</Text>
                  </View>
                ))}

                <View style={styles.bookingAiCard}>
                  <View style={styles.inline}>
                    <Ionicons name="sparkles-outline" size={16} color={colors.primaryDark} />
                    <Text style={styles.bookingAiTitle}>AI Scheduler</Text>
                  </View>
                  <Text style={styles.bookingAiBody}>Optimized for care continuity and billing requirements.</Text>
                </View>

                <View style={styles.bookingActionRow}>
                  <Pressable style={styles.bookingSecondaryButton} onPress={() => setBookingStep(1)}>
                    <Text style={styles.bookingSecondaryButtonText}>Back</Text>
                  </Pressable>
                  <Pressable
                    style={styles.bookingPrimaryButton}
                    onPress={() => {
                      setShowBookingModal(false);
                      setBookingStep(1);
                    }}
                  >
                    <Text style={styles.bookingPrimaryButtonText}>Confirm Visit</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showTaskModal} transparent animationType="slide" onRequestClose={() => setShowTaskModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.taskModalSheet}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.bookingTitle}>{editingTaskId ? 'Edit Task' : 'Create New Task'}</Text>
                <Text style={styles.sectionSubtitle}>{editingTaskId ? 'Update task details' : 'Add to your clinical workflow'}</Text>
              </View>
              <Pressable
                onPress={() => {
                  setShowTaskModal(false);
                  setEditingTaskId(null);
                }}
                style={styles.bookingClose}
              >
                <Ionicons name="close" size={20} color={colors.subtext} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.taskModalScroll}>
              <View style={styles.bookingField}>
                <Text style={styles.bookingLabel}>Task Title</Text>
                <TextInput
                  value={draftTaskTitle}
                  onChangeText={setDraftTaskTitle}
                  placeholder="e.g. Review lab results"
                  placeholderTextColor={colors.muted}
                  style={styles.taskModalInput}
                />
              </View>

              <View style={styles.bookingField}>
                <Text style={styles.bookingLabel}>Description</Text>
                <TextInput
                  value={draftTaskDescription}
                  onChangeText={setDraftTaskDescription}
                  placeholder="Add more details..."
                  placeholderTextColor={colors.muted}
                  multiline
                  style={styles.taskModalTextarea}
                />
              </View>

              <View style={styles.taskModalTwoCol}>
                <View style={[styles.bookingField, styles.fill]}>
                  <Text style={styles.bookingLabel}>Priority</Text>
                  <Pressable style={styles.taskSelectShell} onPress={() => setOpenTaskSelect(openTaskSelect === 'priority' ? null : 'priority')}>
                    <Text style={styles.taskSelectValue}>{draftTaskPriority}</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.muted} />
                  </Pressable>
                  {openTaskSelect === 'priority' ? (
                    <View style={styles.taskSelectMenu}>
                      {(['High', 'Medium', 'Low'] as const).map((priority) => (
                        <Pressable key={priority} style={styles.taskSelectOption} onPress={() => {
                          setDraftTaskPriority(priority);
                          setOpenTaskSelect(null);
                        }}>
                          <Text style={styles.taskSelectOptionText}>{priority}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>

                <View style={[styles.bookingField, styles.fill]}>
                  <Text style={styles.bookingLabel}>Category</Text>
                  <Pressable style={styles.taskSelectShell} onPress={() => setOpenTaskSelect(openTaskSelect === 'category' ? null : 'category')}>
                    <Text style={styles.taskSelectValue}>{draftTaskCategory}</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.muted} />
                  </Pressable>
                  {openTaskSelect === 'category' ? (
                    <View style={styles.taskSelectMenu}>
                      {(['Clinical', 'Administrative', 'Billing', 'Follow-up'] as const).map((category) => (
                        <Pressable key={category} style={styles.taskSelectOption} onPress={() => {
                          setDraftTaskCategory(category);
                          setOpenTaskSelect(null);
                        }}>
                          <Text style={styles.taskSelectOptionText}>{category}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.taskModalTwoCol}>
                <View style={[styles.bookingField, styles.taskModalWideCol]}>
                  <Text style={styles.bookingLabel}>Assign To</Text>
                  <Pressable style={styles.taskSelectShell} onPress={() => setOpenTaskSelect(openTaskSelect === 'assignType' ? null : 'assignType')}>
                    <Text style={styles.taskSelectValue}>{draftAssignToType}</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.muted} />
                  </Pressable>
                  {openTaskSelect === 'assignType' ? (
                    <View style={styles.taskSelectMenu}>
                      {(['Clinical Team', 'Patient'] as const).map((option) => (
                        <Pressable
                          key={option}
                          style={styles.taskSelectOption}
                          onPress={() => {
                            setDraftAssignToType(option);
                            setDraftAssigneeName(option === 'Patient' ? 'John Doe' : 'Dr. Richardson');
                            setOpenTaskSelect(null);
                          }}
                        >
                          <Text style={styles.taskSelectOptionText}>{option}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>

                <View style={[styles.bookingField, styles.taskModalNarrowCol]}>
                  <Text style={styles.bookingLabel}>Assignee Name</Text>
                  {draftAssignToType === 'Patient' && !editingTaskId ? (
                    <>
                      <Pressable style={styles.taskSelectShell} onPress={() => setOpenTaskSelect(openTaskSelect === 'assignee' ? null : 'assignee')}>
                        <Text style={styles.taskSelectValue}>{draftAssigneeName}</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.muted} />
                      </Pressable>
                      {openTaskSelect === 'assignee' ? (
                        <View style={styles.taskSelectMenu}>
                          {['John Doe', 'Jane Smith', 'Robert Wilson'].map((option) => (
                            <Pressable key={option} style={styles.taskSelectOption} onPress={() => {
                              setDraftAssigneeName(option);
                              setOpenTaskSelect(null);
                            }}>
                              <Text style={styles.taskSelectOptionText}>{option}</Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </>
                  ) : (
                    <TextInput
                      value={draftAssigneeName}
                      onChangeText={setDraftAssigneeName}
                      placeholder="e.g. Nurse Kelly"
                      placeholderTextColor={colors.muted}
                      style={styles.taskModalInput}
                    />
                  )}
                </View>
              </View>

              <View style={styles.taskModalTwoCol}>
                <View style={[styles.bookingField, styles.fill]}>
                  <Text style={styles.bookingLabel}>Due Date</Text>
                  <Pressable style={styles.taskSelectShell} onPress={() => setOpenTaskSelect(openTaskSelect === 'dueDate' ? null : 'dueDate')}>
                    <Text style={styles.taskSelectValue}>{draftDueDate}</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.muted} />
                  </Pressable>
                  {openTaskSelect === 'dueDate' ? (
                    <View style={styles.taskSelectMenu}>
                      {['Today', 'Tomorrow', 'Apr 20, 2026'].map((option) => (
                        <Pressable key={option} style={styles.taskSelectOption} onPress={() => {
                          setDraftDueDate(option);
                          setOpenTaskSelect(null);
                        }}>
                          <Text style={styles.taskSelectOptionText}>{option}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>

                <View style={[styles.bookingField, styles.fill]}>
                  <Text style={styles.bookingLabel}>Patient (Optional)</Text>
                  <Pressable style={styles.taskSelectShell} onPress={() => setOpenTaskSelect(openTaskSelect === 'patient' ? null : 'patient')}>
                    <Text style={styles.taskSelectValue}>{draftPatientName}</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.muted} />
                  </Pressable>
                  {openTaskSelect === 'patient' ? (
                    <View style={styles.taskSelectMenu}>
                      {['None', 'John Doe', 'Jane Smith', 'Robert Wilson'].map((option) => (
                        <Pressable key={option} style={styles.taskSelectOption} onPress={() => {
                          setDraftPatientName(option);
                          setOpenTaskSelect(null);
                        }}>
                          <Text style={styles.taskSelectOptionText}>{option}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>

              <Pressable style={styles.taskModalPrimaryButton} onPress={handleCreateTask}>
                <Text style={styles.bookingPrimaryButtonText}>{editingTaskId ? 'Update Task' : 'Create Task'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!showTaskHistory} transparent animationType="slide" onRequestClose={() => setShowTaskHistory(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.taskModalSheet}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.bookingTitle}>Task History</Text>
                <Text style={styles.sectionSubtitle}>{showTaskHistory?.title ?? ''}</Text>
              </View>
              <Pressable onPress={() => setShowTaskHistory(null)} style={styles.bookingClose}>
                <Ionicons name="close" size={20} color={colors.subtext} />
              </Pressable>
            </View>

            {showTaskHistory ? (
              <View style={styles.stack}>
                {[
                  { action: 'Task Created', user: 'System', date: showTaskHistory.dueDate },
                  { action: `Assigned to ${showTaskHistory.assignedTo}`, user: 'Admin', date: showTaskHistory.dueDate },
                  { action: `Status changed to ${showTaskHistory.status}`, user: 'Dr. Richardson', date: showTaskHistory.dueDate },
                ].map((entry) => (
                  <View key={`${entry.action}-${entry.user}`} style={styles.taskHistoryRow}>
                    <View style={styles.taskHistoryDot} />
                    <View style={styles.fill}>
                      <Text style={styles.tasksHistoryButtonText}>{entry.action}</Text>
                      <Text style={styles.tasksMetaText}>By {entry.user}</Text>
                    </View>
                    <Text style={styles.tasksMetaText}>{entry.date}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={showLabUploadModal} transparent animationType="slide" onRequestClose={() => setShowLabUploadModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.taskModalSheet}>
            <View style={styles.rowBetween}>
              <Text style={styles.bookingTitle}>Upload Lab Report</Text>
              <Pressable onPress={() => setShowLabUploadModal(false)} style={styles.bookingClose}>
                <Ionicons name="close" size={20} color={colors.subtext} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.labDetailScroll}>
              <View style={styles.bookingField}>
                <Text style={styles.bookingLabel}>Select Patient</Text>
                <View style={styles.stack}>
                  {patients.map((patient) => {
                    const active = labUploadPatientId === patient.id;
                    return (
                      <Pressable
                        key={patient.id}
                        style={[styles.labUploadPatientCard, active && styles.labUploadPatientCardActive]}
                        onPress={() => setLabUploadPatientId(patient.id)}
                      >
                        <View style={styles.inline}>
                          <Ionicons name="person-outline" size={16} color={active ? '#ffffff' : colors.subtext} />
                          <Text style={[styles.labUploadPatientText, active && styles.labUploadPatientTextActive]}>{patient.name}</Text>
                        </View>
                        {active ? <Ionicons name="checkmark-circle" size={18} color="#ffffff" /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.labUploadActionGrid}>
                <Pressable style={[styles.labUploadActionCard, !labUploadPatientId && styles.labUploadActionCardDisabled]}>
                  <View style={[styles.labUploadActionIcon, !labUploadPatientId && styles.labUploadActionIconDisabled]}>
                    <Ionicons name="cloud-upload-outline" size={24} color={labUploadPatientId ? colors.primaryDark : '#9ca3af'} />
                  </View>
                  <Text style={[styles.labUploadActionTitle, !labUploadPatientId && styles.labUploadActionTitleDisabled]}>Upload PDF</Text>
                </Pressable>

                <Pressable style={[styles.labUploadActionCard, !labUploadPatientId && styles.labUploadActionCardDisabled]}>
                  <View style={[styles.labUploadActionIcon, !labUploadPatientId && styles.labUploadActionIconDisabled]}>
                    <Ionicons name="scan-outline" size={24} color={labUploadPatientId ? colors.info : '#9ca3af'} />
                  </View>
                  <Text style={[styles.labUploadActionTitle, !labUploadPatientId && styles.labUploadActionTitleDisabled]}>Scan Report</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedLabReport} animationType="slide" onRequestClose={() => setSelectedLabReport(null)}>
        <SafeAreaView style={styles.root}>
          <View style={styles.labDetailHeader}>
            <Pressable onPress={() => setSelectedLabReport(null)} style={styles.bookingClose}>
              <Ionicons name="arrow-back" size={20} color={colors.subtext} />
            </Pressable>
            <View style={styles.fill}>
              <Text style={styles.labDetailTitle}>{selectedLabReport?.type}</Text>
              <Text style={styles.sectionSubtitle}>{selectedLabReport?.patientName}</Text>
            </View>
            <Pressable style={styles.labsAddButtonSmall} onPress={() => setShowLabShareModal(true)}>
              <Ionicons name="share-social-outline" size={18} color="#ffffff" />
            </Pressable>
          </View>

          {selectedLabReport ? (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.labDetailContent} showsVerticalScrollIndicator={false}>
              <LinearGradient colors={['#09090b', '#18181b']} style={styles.labInsightHero}>
                <Ionicons name="sparkles-outline" size={18} color="#34d399" />
                <Text style={styles.labsSummaryLabelDark}>Nuvia AI Analysis</Text>
                <Text style={styles.labInsightTitle}>Clinical Summary</Text>
                <Text style={styles.labInsightBody}>{selectedLabReport.analysis}</Text>
                <Pressable style={styles.labAskButton} onPress={() => setShowLabAiChat((current) => !current)}>
                  <Ionicons name="sparkles-outline" size={14} color="#ffffff" />
                  <Text style={styles.labAskButtonText}>{showLabAiChat ? 'Close Chat' : 'Ask Nuvia'}</Text>
                </Pressable>
              </LinearGradient>

              {showLabAiChat ? (
                <Card>
                  <Text style={styles.labsFilterLabel}>Nuvia Follow-up</Text>
                  <View style={styles.stack}>
                    <Text style={styles.body}>Ask any question about these results...</Text>
                    <View style={styles.searchShell}>
                      <TextInput
                        value={labAiInput}
                        onChangeText={setLabAiInput}
                        placeholder="Ask Nuvia..."
                        placeholderTextColor={colors.muted}
                        style={styles.searchShellInput}
                      />
                      <Pressable style={styles.nuviaSendButton}>
                        <Ionicons name="send" size={14} color="#ffffff" />
                      </Pressable>
                    </View>
                  </View>
                </Card>
              ) : null}

              <Card>
                <Text style={styles.labsTableHeader}>Analyzed Results</Text>
                {selectedLabReport.findings.map((finding) => {
                  const tone =
                    finding.status === 'Critical' ? colors.danger : finding.status === 'Abnormal' ? '#f97316' : colors.primaryDark;
                  return (
                    <View key={`${selectedLabReport.id}-${finding.parameter}`} style={styles.labFindingRow}>
                      <View style={styles.fill}>
                        <Text style={styles.listTitle}>{finding.parameter}</Text>
                        <Text style={styles.listMeta}>Ref Range: {finding.reference}</Text>
                      </View>
                      <View style={styles.labFindingValue}>
                        <Text style={styles.labFindingNumber}>{finding.value}</Text>
                        <Text style={[styles.labFindingStatus, { color: tone }]}>{finding.status}</Text>
                      </View>
                    </View>
                  );
                })}
              </Card>

              <View style={styles.grid}>
                <View style={styles.metricCard}>
                  <Text style={styles.labsFilterLabel}>Date</Text>
                  <Text style={styles.listTitle}>{selectedLabReport.date}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.labsFilterLabel}>Status</Text>
                  <Text
                    style={[
                      styles.listTitle,
                      {
                        color:
                          selectedLabReport.status === 'Critical'
                            ? colors.danger
                            : selectedLabReport.status === 'Abnormal'
                              ? '#f97316'
                              : colors.primaryDark,
                      },
                    ]}
                  >
                    {selectedLabReport.status}
                  </Text>
                </View>
              </View>

              <View style={styles.labsActionCard}>
                <Text style={styles.labsActionHeader}>Action Items</Text>
                {['Discuss results with patient during next visit', 'Monitor glucose levels daily via RPM'].map((item) => (
                  <View key={item} style={styles.actionRow}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    <Text style={styles.body}>{item}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>

      <Modal visible={showLabShareModal} transparent animationType="slide" onRequestClose={() => setShowLabShareModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.taskModalSheet}>
            <View style={styles.rowBetween}>
              <Text style={styles.bookingTitle}>Share Summary</Text>
              <Pressable onPress={() => setShowLabShareModal(false)} style={styles.bookingClose}>
                <Ionicons name="close" size={20} color={colors.subtext} />
              </Pressable>
            </View>

            <View style={styles.stack}>
              <Pressable
                style={[styles.labShareOption, labShareTarget === 'patient' && styles.labShareOptionActive]}
                onPress={() => setLabShareTarget('patient')}
              >
                <View style={[styles.labShareIcon, labShareTarget === 'patient' && styles.labShareIconActive]}>
                  <Ionicons name="person-outline" size={18} color={labShareTarget === 'patient' ? '#ffffff' : colors.subtext} />
                </View>
                <View style={styles.fill}>
                  <Text style={[styles.listTitle, labShareTarget === 'patient' && styles.labShareOptionTitleActive]}>Share with Patient</Text>
                  <Text style={[styles.listMeta, labShareTarget === 'patient' && styles.labShareOptionMetaActive]}>Send user-friendly summary</Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.labShareOption, labShareTarget === 'team' && styles.labShareOptionActive]}
                onPress={() => setLabShareTarget('team')}
              >
                <View style={[styles.labShareIcon, labShareTarget === 'team' && styles.labShareIconActive]}>
                  <Ionicons name="people-outline" size={18} color={labShareTarget === 'team' ? '#ffffff' : colors.subtext} />
                </View>
                <View style={styles.fill}>
                  <Text style={[styles.listTitle, labShareTarget === 'team' && styles.labShareOptionTitleActive]}>Share with Care Team</Text>
                  <Text style={[styles.listMeta, labShareTarget === 'team' && styles.labShareOptionMetaActive]}>Send clinical analysis</Text>
                </View>
              </Pressable>

              <Pressable style={styles.taskModalPrimaryButton} onPress={() => setShowLabShareModal(false)}>
                <Text style={styles.bookingPrimaryButtonText}>Share Report</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showBillingReportModal} transparent animationType="slide" onRequestClose={() => setShowBillingReportModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.taskModalSheet}>
            <View style={styles.rowBetween}>
              <View style={styles.fill}>
                <Text style={styles.bookingTitle}>CMS Claim Qualification Report</Text>
                <Text style={styles.sectionSubtitle}>Generated for May 6, 2026</Text>
              </View>
              <Pressable onPress={() => setShowBillingReportModal(false)} style={styles.bookingClose}>
                <Ionicons name="close" size={20} color={colors.subtext} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.labDetailScroll}>
              <View style={styles.stack}>
                <View>
                  <View style={styles.billingReportHeaderRow}>
                    <View style={[styles.billingReportDot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.billingReportHeaderText}>Qualified Claims</Text>
                  </View>
                  <View style={styles.stack}>
                    {billingCards
                      .filter((item) => item.status === 'Qualified')
                      .map((item) => (
                        <View key={item.id} style={styles.billingReportCardQualified}>
                          <View>
                            <Text style={styles.listTitle}>{item.patientName}</Text>
                            <Text style={styles.billingReportMetaQualified}>{item.code} - {item.program}</Text>
                          </View>
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        </View>
                      ))}
                  </View>
                </View>

                <View>
                  <View style={styles.billingReportHeaderRow}>
                    <View style={[styles.billingReportDot, { backgroundColor: colors.info }]} />
                    <Text style={styles.billingReportHeaderText}>Remaining Work (In Progress)</Text>
                  </View>
                  <View style={styles.stack}>
                    {billingCards
                      .filter((item) => item.status === 'In Progress')
                      .map((item) => (
                        <View key={item.id} style={styles.billingReportCardProgress}>
                          <View style={styles.rowBetween}>
                            <Text style={styles.listTitle}>{item.patientName}</Text>
                            <Text style={styles.billingReportMetaProgress}>{item.code} - {item.program}</Text>
                          </View>
                          <View style={styles.stackTight}>
                            {item.requirements
                              .filter((req) => !req.isMet)
                              .map((req) => (
                                <View key={`${item.id}-${req.label}`} style={styles.inline}>
                                  <Ionicons name="time-outline" size={12} color={colors.info} />
                                  <Text style={styles.billingMissingText}>
                                    Missing: {req.label} ({req.current} / {req.target})
                                  </Text>
                                </View>
                              ))}
                          </View>
                        </View>
                      ))}
                  </View>
                </View>

                <View>
                  <View style={styles.billingReportHeaderRow}>
                    <View style={[styles.billingReportDot, { backgroundColor: colors.danger }]} />
                    <Text style={styles.billingReportHeaderText}>Unqualified Claims</Text>
                  </View>
                  <View style={styles.stack}>
                    {billingCards
                      .filter((item) => item.status === 'Unqualified')
                      .map((item) => (
                        <View key={item.id} style={styles.billingReportCardUnqualified}>
                          <View>
                            <Text style={styles.listTitle}>{item.patientName}</Text>
                            <Text style={styles.billingReportMetaUnqualified}>{item.code} - {item.program}</Text>
                          </View>
                          <Ionicons name="alert-circle" size={20} color={colors.danger} />
                        </View>
                      ))}
                  </View>
                </View>

                <Pressable style={styles.billingDownloadButton} onPress={() => setShowBillingReportModal(false)}>
                  <Ionicons name="download-outline" size={18} color="#ffffff" />
                  <Text style={styles.billingDownloadButtonText}>Download Full Report</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showShiftHandoffModal} transparent animationType="fade" onRequestClose={() => setShowShiftHandoffModal(false)}>
        <View style={styles.modalBackdropCenter}>
          <View style={styles.shiftModalSheet}>
            <View style={styles.inline}>
              <View style={styles.shiftHeroAvatarWrap}>
                <Image source={{ uri: nuviaAvatarUri }} style={styles.shiftHeroAvatar} />
              </View>
              <Text style={styles.shiftModalTitle}>Nuvia Handoff Intelligence</Text>
            </View>

            {shiftHandoffStep === 'options' ? (
              <View style={styles.stack}>
                <Text style={styles.shiftModalBody}>
                  I&apos;ve prepared a structured verbal briefing for the incoming shift. Would you like to review the AI brief or record a custom handoff?
                </Text>
                <Pressable style={styles.shiftModalPrimary} onPress={() => setShiftHandoffStep('ai_brief')}>
                  <Ionicons name="flash-outline" size={16} color="#ffffff" />
                  <Text style={styles.shiftModalPrimaryText}>Review AI Verbal Briefing</Text>
                </Pressable>
                <Pressable style={styles.shiftModalSecondary} onPress={() => setShiftHandoffStep('recording')}>
                  <Ionicons name="mic-outline" size={16} color="#ffffff" />
                  <Text style={styles.shiftModalSecondaryText}>Record Custom Handoff</Text>
                </Pressable>
                <Pressable
                  style={styles.shiftModalGhost}
                  onPress={() => {
                    setShowShiftHandoffModal(false);
                    setShiftHandoffStep('options');
                  }}
                >
                  <Text style={styles.shiftModalGhostText}>Skip & Exit</Text>
                </Pressable>
              </View>
            ) : null}

            {shiftHandoffStep === 'ai_brief' ? (
              <View style={styles.stack}>
                <View style={styles.shiftModalCard}>
                  <Text style={styles.shiftModalMiniHeader}>AI Generated Verbal Briefing</Text>
                  <Text style={styles.shiftModalBody}>{shiftHandoffNotes}</Text>
                </View>
                <View style={styles.bookingActionRow}>
                  <Pressable style={styles.bookingSecondaryButton} onPress={() => setShiftHandoffStep('options')}>
                    <Text style={styles.bookingSecondaryButtonText}>Back</Text>
                  </Pressable>
                  <Pressable style={styles.bookingPrimaryButton} onPress={() => setShiftHandoffStep('confirm')}>
                    <Text style={styles.bookingPrimaryButtonText}>Confirm Briefing</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {shiftHandoffStep === 'recording' ? (
              <View style={styles.stack}>
                <View style={styles.shiftRecordingWrap}>
                  <View style={[styles.shiftRecordingCircle, isShiftRecording && styles.shiftRecordingCircleActive]}>
                    <Ionicons name="mic" size={28} color={isShiftRecording ? '#ffffff' : '#71717a'} />
                  </View>
                  <Text style={styles.shiftModalBody}>{isShiftRecording ? 'Recording handoff...' : 'Ready to record'}</Text>
                </View>
                {!isShiftRecording ? (
                  <Pressable style={styles.shiftModalRecord} onPress={() => setIsShiftRecording(true)}>
                    <Text style={styles.shiftModalPrimaryText}>Start Recording</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.shiftModalPrimary}
                    onPress={() => {
                      setIsShiftRecording(false);
                      setShiftHandoffNotes('Custom voice handoff recorded. Duration: 45s. Summary: John Doe stable, Sarah Jenkins meds adjusted.');
                      setShiftHandoffStep('confirm');
                    }}
                  >
                    <Text style={styles.shiftModalPrimaryText}>Stop & Save</Text>
                  </Pressable>
                )}
                <Pressable style={styles.shiftModalGhost} onPress={() => setShiftHandoffStep('options')}>
                  <Text style={styles.shiftModalGhostText}>Cancel</Text>
                </Pressable>
              </View>
            ) : null}

            {shiftHandoffStep === 'confirm' ? (
              <View style={styles.stack}>
                <View style={styles.shiftConfirmIcon}>
                  <Ionicons name="checkmark-circle" size={36} color="#10b981" />
                </View>
                <Text style={styles.shiftConfirmTitle}>Handoff Ready</Text>
                <Text style={styles.shiftModalBody}>Your handoff briefing has been prepared and will be delivered to the incoming team.</Text>
                <Pressable
                  style={styles.shiftModalPrimary}
                  onPress={() => {
                    setShowShiftHandoffModal(false);
                    setShiftHandoffStep('options');
                  }}
                >
                  <Text style={styles.shiftModalPrimaryText}>Finish & Exit Shift</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.panel },
  authRoot: { flex: 1, backgroundColor: colors.bg },
  authScreen: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 24, backgroundColor: colors.panel },
  authShell: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  authBrandBlock: { alignItems: 'center', marginBottom: 24, gap: 10 },
  authLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  authLogoSheen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(255,255,255,0.12)' },
  authLogoMark: { color: '#ffffff', fontSize: 28, fontWeight: '900', letterSpacing: -1, lineHeight: 30, marginTop: -4 },
  authLogoPulse: { position: 'absolute', bottom: 12, left: 11, right: 11, height: 12, flexDirection: 'row', alignItems: 'center' },
  authLogoPulseSeg: { backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 999 },
  authLogoPulseSegShort: { width: 10, height: 2 },
  authLogoPulseSegRise: { width: 10, height: 2, transform: [{ translateY: 0 }, { rotate: '45deg' }] },
  authLogoPulseSegDip: { width: 14, height: 2, transform: [{ translateY: -1 }, { rotate: '-55deg' }] },
  authLogoPulseSegFlat: { width: 12, height: 2 },
  authBrand: { color: colors.text, fontSize: 32, fontWeight: '800' },
  authTag: { color: colors.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.8 },
  authCard: { backgroundColor: '#ffffff', borderRadius: 40, padding: 28, gap: 18, borderWidth: 1, borderColor: '#eef3ef', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 6 },
  authHeading: { gap: 4 },
  authTitle: { color: colors.text, fontSize: 28, fontWeight: '800' },
  authBody: { color: colors.subtext, fontSize: 14, lineHeight: 20 },
  authForm: { gap: 16 },
  authFieldBlock: { gap: 8 },
  authFieldLabel: { color: '#9ca3af', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 4 },
  authInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8faf8', borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14 },
  authInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 },
  authForgotWrap: { alignItems: 'flex-end' },
  authForgotText: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  authButton: { backgroundColor: colors.text, borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, shadowColor: colors.text, shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  authLoadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authLoadingDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: '#ffffff', opacity: 0.9 },
  authButtonText: { color: '#fff', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  authFooter: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 24, opacity: 0.4 },
  authFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authFooterText: { color: colors.text, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  logo: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  topTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  topSub: { color: colors.subtext, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 2 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notificationButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  profileAction: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  profileActionActive: { backgroundColor: colors.primary },
  profileActionText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  profileActionTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  stack: { gap: 16 },
  stackTight: { gap: 6 },
  modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 },
  sectionHeader: { gap: 4 },
  sectionTitle: { color: colors.text, fontSize: 28, fontWeight: '800' },
  sectionSubtitle: { color: colors.subtext, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { width: '47%', backgroundColor: colors.card, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 10 },
  metricDotWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  metricDot: { width: 12, height: 12, borderRadius: 6 },
  metricLabel: { color: colors.subtext, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  metricValue: { color: colors.text, fontSize: 28, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: 26, padding: 18, borderWidth: 1, borderColor: colors.line, gap: 12 },
  cardDark: { backgroundColor: colors.darkPanel, borderColor: '#163125' },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  cardSubtext: { color: colors.subtext, fontSize: 13, lineHeight: 18 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickAction: { width: '47%', backgroundColor: '#f2f5f1', borderRadius: 20, padding: 14, gap: 8 },
  quickActionLabel: { color: colors.text, fontWeight: '700', fontSize: 13 },
  listCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 18, backgroundColor: '#f7faf7' },
  queueRow: { paddingVertical: 6 },
  listTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  listMeta: { color: colors.subtext, fontSize: 12, lineHeight: 18 },
  fill: { flex: 1 },
  joinPill: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  joinPillText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  secondaryButton: { flex: 1, backgroundColor: '#eff4f0', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { color: colors.text, fontWeight: '800' },
  segmentedControl: { backgroundColor: 'rgba(216,225,218,0.6)', borderRadius: 16, padding: 4, flexDirection: 'row' },
  segmentButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  segmentButtonActive: { backgroundColor: '#ffffff' },
  segmentText: { color: colors.subtext, fontSize: 12, fontWeight: '700' },
  segmentTextActive: { color: colors.text },
  hero: { borderRadius: 28, padding: 18, gap: 14 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroKicker: { color: '#7b8a82', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.4, fontWeight: '800', marginTop: 2 },
  heroBody: { color: '#c7e8da', fontSize: 13, lineHeight: 18 },
  heroPrimary: { flex: 1, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  heroPrimaryText: { color: '#fff', fontWeight: '800' },
  heroSecondary: { flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  heroSecondaryText: { color: '#fff', fontWeight: '700' },
  nuviaAvatar: { borderRadius: 16, overflow: 'hidden' },
  nuviaItem: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 14, gap: 8 },
  nuviaLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '800' },
  nuviaBody: { color: '#d4ddd8', fontSize: 13, lineHeight: 18 },
  nuviaChip: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginTop: 2 },
  nuviaChipText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '800' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inlineStart: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  telehealthHeroIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  telehealthStatsRow: { flexDirection: 'row', gap: 10 },
  telehealthStatCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 12, gap: 4 },
  telehealthStatLabel: { color: '#c7d2fe', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  telehealthStatValue: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  telehealthStatMeta: { color: '#cbd5e1', fontSize: 10, lineHeight: 14 },
  telehealthTabRow: { gap: 8, paddingVertical: 4 },
  telehealthTabChip: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  telehealthTabChipActive: { backgroundColor: colors.text, borderColor: colors.text },
  telehealthTabChipText: { color: colors.subtext, fontSize: 12, fontWeight: '700' },
  telehealthTabChipTextActive: { color: '#ffffff' },
  scheduleVisitButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.text, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  scheduleVisitButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  telehealthListIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  roundAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  waitingCount: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  admitButton: { backgroundColor: colors.text, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  admitButtonDisabled: { backgroundColor: '#e5e7eb' },
  admitButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  admitButtonTextDisabled: { color: colors.muted },
  miniPill: { backgroundColor: '#f3f5f3', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  miniPillText: { color: colors.subtext, fontSize: 10, fontWeight: '700' },
  metricValueSmall: { color: colors.text, fontSize: 22, fontWeight: '800' },
  metricTrend: { color: colors.primaryDark, fontSize: 11, fontWeight: '700' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotPill: { backgroundColor: '#f3f5f3', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, minWidth: 68, alignItems: 'center' },
  slotPillActive: { backgroundColor: colors.text },
  slotPillText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  slotPillTextActive: { color: '#ffffff' },
  autoSyncPill: { backgroundColor: '#ecfdf5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  autoSyncText: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  availabilityRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eef3ef', gap: 12 },
  availabilityDay: { color: colors.text, fontSize: 14, fontWeight: '700' },
  availabilityDayInactive: { color: colors.muted },
  toggleTrack: { width: 48, height: 28, borderRadius: 999, backgroundColor: '#d1d5db', padding: 3, justifyContent: 'center' },
  toggleTrackActive: { backgroundColor: colors.primary },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#ffffff' },
  toggleThumbActive: { transform: [{ translateX: 20 }] },
  availabilityTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 60 },
  timeInput: { flex: 1, backgroundColor: '#f7faf7', borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontSize: 12, fontWeight: '700' },
  timeSeparator: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  saveAvailabilityButton: { backgroundColor: colors.text, borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  saveAvailabilityButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  searchShell: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  searchShellInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 },
  tasksHeader: { gap: 12 },
  tasksHeaderCopy: { flexShrink: 1, gap: 4 },
  tasksHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  tasksGhostButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ecfdf5', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  tasksGhostButtonText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  tasksPrimaryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.text, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  tasksPrimaryButtonText: { color: '#ffffff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  tasksStatsRow: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between', gap: 8 },
  taskStatCard: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: colors.line, borderRadius: 24, paddingHorizontal: 10, paddingVertical: 10, gap: 6 },
  taskStatTopRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  taskStatBottomRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  taskStatIconWrap: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  taskStatLabel: { color: '#9ca3af', fontSize: 7, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, flex: 1 },
  taskStatValue: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 24 },
  taskStatMeta: { color: colors.primaryDark, fontSize: 9, fontWeight: '700', flexShrink: 1 },
  tasksFilterWrap: { gap: 12 },
  filterRow: { gap: 8 },
  filterChip: { backgroundColor: '#f3f4f6', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  filterChipActive: { backgroundColor: colors.text },
  filterChipText: { color: colors.subtext, fontSize: 10, fontWeight: '700' },
  filterChipTextActive: { color: '#ffffff' },
  tasksCardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  taskCheckButton: { paddingTop: 2 },
  tasksCardHeader: { gap: 10, marginBottom: 6 },
  tasksBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  taskTinyBadge: { backgroundColor: '#f3f4f6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  taskTinyBadgeText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  taskTinyBadgeTextNeutral: { color: colors.subtext, fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: colors.muted },
  tasksMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10, marginBottom: 10 },
  tasksMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tasksMetaText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  tasksCardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tasksHistoryButton: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  tasksHistoryButtonText: { color: colors.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  tasksEmptyState: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  historySearchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 },
  historyMeta: { color: colors.subtext, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  historyStatusPill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  historyStatusPillBilled: { backgroundColor: '#ecfdf5' },
  historyStatusPillSigned: { backgroundColor: '#f3f4f6' },
  historyStatusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  historyStatusTextBilled: { color: colors.primaryDark },
  historyStatusTextSigned: { color: colors.subtext },
  soapAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  soapActionText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  patientCard: { backgroundColor: colors.card, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.line },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e7ece8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text, fontWeight: '800' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#edf2ee', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  backText: { color: colors.text, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', gap: 12 },
  kpiCard: { flex: 1, backgroundColor: '#f6f8f6', borderRadius: 18, padding: 14, gap: 6 },
  kpiLabel: { color: colors.subtext, fontSize: 11, fontWeight: '700' },
  kpiValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#e8fbf2', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  label: { color: colors.subtext, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  insightCard: { borderRadius: 22, padding: 16, gap: 8 },
  insightLabel: { color: colors.primaryDark, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1, fontWeight: '800' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rightText: { color: colors.primaryDark, fontWeight: '800', fontSize: 16 },
  linkText: { color: colors.primaryDark, fontWeight: '800', fontSize: 13 },
  rpmHero: { borderRadius: 28, padding: 18, gap: 14 },
  rpmAvatarWrap: { width: 40, height: 40, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.primary },
  rpmAvatar: { width: '100%', height: '100%' },
  rpmHeroTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  rpmHeroKicker: { color: '#34d399', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  rpmHeroBody: { color: '#d4d4d8', fontSize: 13, lineHeight: 19 },
  rpmHeroBodyStrong: { color: '#ffffff', fontWeight: '800' },
  rpmHeroActions: { flexDirection: 'row', gap: 10 },
  rpmHeroPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 12 },
  rpmHeroPrimaryText: { color: '#ffffff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  rpmHeroSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingVertical: 12 },
  rpmHeroSecondaryText: { color: '#ffffff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  rpmProgramHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rpmProgramIcon: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rpmProgramMeta: { color: colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  rpmAlertDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.danger },
  rpmChevronWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  rpmPatientsList: { marginTop: 14, gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 14 },
  rpmPatientCard: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 20, padding: 14, gap: 12 },
  rpmPatientAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  rpmPatientAvatarText: { color: colors.subtext, fontSize: 12, fontWeight: '800' },
  rpmPatientSync: { color: colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  rpmAlertCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 14, padding: 10 },
  rpmAlertText: { flex: 1, color: '#b91c1c', fontSize: 12, lineHeight: 17, fontWeight: '600' },
  rpmAdherenceValue: { color: colors.text, fontSize: 12, fontWeight: '800' },
  rpmReviewButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  rpmReviewButtonText: { color: colors.text, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  labsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  labsAddButton: { width: 48, height: 48, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  labsAddButtonSmall: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  labsSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  labsFilterButton: { width: 48, height: 48, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  labsFilterButtonActive: { backgroundColor: colors.primary },
  labsPillsRow: { gap: 8, paddingVertical: 2 },
  labsPatientPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#f3f4f6' },
  labsPatientPillActive: { backgroundColor: colors.text },
  labsPatientPillText: { color: colors.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  labsPatientPillTextActive: { color: '#ffffff' },
  labsFilterGroups: { flexDirection: 'row', gap: 12 },
  labsFilterLabel: { color: '#9ca3af', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  labsMiniFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  labsMiniFilter: { flex: 1, minWidth: 58, backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center' },
  labsMiniFilterActive: { backgroundColor: colors.text },
  labsMiniFilterText: { color: colors.subtext, fontSize: 9, fontWeight: '800' },
  labsMiniFilterTextActive: { color: '#ffffff' },
  labsReportIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  labsReportPatient: { color: '#6b7280', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  labsShareButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  labsSummaryCard: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5', borderRadius: 18, padding: 14, gap: 8 },
  labsNuviaMark: { width: 16, height: 16, borderRadius: 8, overflow: 'hidden' },
  labsNuviaAvatar: { width: '100%', height: '100%' },
  labsSummaryLabel: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  labsSummaryLabelDark: { color: '#34d399', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  labsAnalyzedText: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  labDetailHeader: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: '#ffffff' },
  labDetailTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  labDetailContent: { padding: 20, paddingBottom: 36, gap: 16 },
  labDetailScroll: { gap: 16, paddingBottom: 12 },
  labInsightHero: { borderRadius: 32, padding: 20, gap: 8 },
  labInsightTitle: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  labInsightBody: { color: '#d4d4d8', fontSize: 13, lineHeight: 20 },
  labAskButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  labAskButtonText: { color: '#ffffff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  labsTableHeader: { color: '#6b7280', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  labFindingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eef3ef' },
  labFindingValue: { alignItems: 'flex-end', gap: 2 },
  labFindingNumber: { color: colors.text, fontSize: 13, fontWeight: '800' },
  labFindingStatus: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  labsActionCard: { backgroundColor: '#ecfdf5', borderRadius: 28, borderWidth: 1, borderColor: '#bbf7d0', padding: 18, gap: 12 },
  labsActionHeader: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  labUploadPatientCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14 },
  labUploadPatientCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  labUploadPatientText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  labUploadPatientTextActive: { color: '#ffffff' },
  labUploadActionGrid: { flexDirection: 'row', gap: 12 },
  labUploadActionCard: { flex: 1, borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 28, paddingVertical: 24, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', gap: 10 },
  labUploadActionCardDisabled: { opacity: 0.45, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  labUploadActionIcon: { width: 48, height: 48, borderRadius: 18, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  labUploadActionIconDisabled: { backgroundColor: '#e5e7eb' },
  labUploadActionTitle: { color: colors.text, fontSize: 12, fontWeight: '800' },
  labUploadActionTitleDisabled: { color: '#9ca3af' },
  labShareOption: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#f7faf7', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#eef3ef' },
  labShareOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  labShareIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  labShareIconActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  labShareOptionTitleActive: { color: '#ffffff' },
  labShareOptionMetaActive: { color: 'rgba(255,255,255,0.75)' },
  billingFilterRow: { gap: 8, paddingVertical: 2 },
  billingHeaderRow: { gap: 12, marginBottom: 6 },
  billingMainInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  billingCopy: { flex: 1, minWidth: 0, gap: 4 },
  billingNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  billingStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  billingProgramIcon: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  billingProgramBadge: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  billingProgramBadgeText: { color: colors.subtext, fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  billingStatusWrap: { flex: 1, gap: 2 },
  billingStatusLabel: { color: '#9ca3af', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  billingStatusValue: { fontSize: 12, fontWeight: '800' },
  billingStatusIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  billingProgressLabel: { color: '#9ca3af', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  billingRequirementGrid: { gap: 10, paddingTop: 4 },
  billingRequirementCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  billingRequirementLabel: { color: colors.subtext, fontSize: 11, fontWeight: '700' },
  billingRequirementWork: { color: colors.info, fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
  billingRequirementValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  billingRequirementValue: { color: colors.text, fontSize: 10, fontWeight: '800' },
  billingRequirementValueMet: { color: colors.primaryDark },
  billingRequirementPendingDot: { width: 12, height: 12, borderRadius: 999, borderWidth: 2, borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  billingReportHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  billingReportDot: { width: 8, height: 8, borderRadius: 999 },
  billingReportHeaderText: { color: colors.text, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  billingReportCardQualified: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14 },
  billingReportMetaQualified: { color: colors.primaryDark, fontSize: 10, fontWeight: '800' },
  billingReportCardProgress: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#dbeafe', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14, gap: 8 },
  billingReportMetaProgress: { color: colors.info, fontSize: 10, fontWeight: '800' },
  billingMissingText: { color: colors.subtext, fontSize: 10, lineHeight: 14 },
  billingReportCardUnqualified: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14 },
  billingReportMetaUnqualified: { color: colors.danger, fontSize: 10, fontWeight: '800' },
  billingDownloadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.text, borderRadius: 20, paddingVertical: 16, marginTop: 6 },
  billingDownloadButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  shiftHero: { borderRadius: 30, padding: 20, gap: 18 },
  shiftTabRow: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 4, gap: 4 },
  shiftTabButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  shiftTabButtonActive: { backgroundColor: '#ffffff' },
  shiftTabText: { color: colors.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  shiftTabTextActive: { color: colors.text },
  shiftHeroTopRow: { gap: 12 },
  shiftHeroTitleWrap: { flex: 1, minWidth: 0 },
  shiftHeroAvatarWrap: { width: 44, height: 44, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.primary },
  shiftHeroAvatarWrapSmall: { width: 32, height: 32, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.primary },
  shiftHeroAvatar: { width: '100%', height: '100%' },
  shiftHeroTitle: { color: '#ffffff', fontSize: 22, fontWeight: '800', flexShrink: 1 },
  shiftHeroKicker: { color: '#71717a', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 2 },
  shiftHeroLivePill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  shiftHeroLiveDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#10b981' },
  shiftHeroLiveText: { color: '#a1a1aa', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  shiftHeroStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shiftHeroStatCard: { width: '47%', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: 14, gap: 4 },
  shiftHeroStatValue: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  shiftHeroStatLabel: { color: '#71717a', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  shiftPatientCard: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 26, padding: 16, gap: 12 },
  shiftPatientCardExpanded: { borderColor: '#86efac', shadowColor: colors.primary, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  shiftPatientIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  shiftMiniHeader: { color: colors.subtext, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  shiftMiniHeaderDanger: { color: colors.danger, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  shiftFlagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  shiftFlagPill: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  shiftFlagPillText: { color: '#dc2626', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  shiftKeyUpdateCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#eef2f7', borderRadius: 18, padding: 14, gap: 4 },
  shiftCmsPillRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  shiftCmsPillLabel: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9, flex: 1 },
  shiftCmsPillValue: { color: '#047857', fontSize: 12, fontWeight: '800' },
  shiftCollapsedCms: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  shiftCollapsedHint: { color: colors.muted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  shiftValidatedPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  shiftValidatedText: { color: '#34d399', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  shiftSectionHeaderWrap: { gap: 12 },
  shiftBillingCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 16, gap: 12 },
  shiftBillingTopRow: { gap: 12 },
  shiftBillingProg: { color: '#ffffff', fontSize: 18, fontWeight: '800', flexShrink: 1 },
  shiftBillingDesc: { color: '#71717a', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  shiftBillingStatusPill: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  shiftBillingStatusText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  shiftBillingMetrics: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  shiftBillingMetricLabel: { color: '#71717a', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  shiftBillingMetricValue: { color: '#e4e4e7', fontSize: 12, fontWeight: '700' },
  shiftBillingMetricStatus: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  shiftHandoffCard: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 18, padding: 14, gap: 8 },
  shiftDivider: { height: 1, backgroundColor: '#eef2f7', marginVertical: 4 },
  shiftSuggestedTitle: { color: colors.primaryDark, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.1 },
  shiftSuggestedSub: { color: colors.muted, fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  shiftSuggestedHeader: { gap: 10 },
  shiftSuggestionCount: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  shiftSuggestionCountText: { color: colors.primaryDark, fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  shiftSuggestedCard: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#eef2f7', borderRadius: 24, padding: 16, gap: 12 },
  shiftSuggestedIcon: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  shiftSuggestedAdd: { width: 28, height: 28, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  inlineStartFill: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 },
  cardTitleCompact: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1, flexShrink: 1 },
  shiftFinalizeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, marginTop: 6 },
  shiftFinalizeButtonText: { color: '#ffffff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  shiftHistoryMetrics: { flexDirection: 'row', gap: 10, marginTop: 8 },
  shiftHistoryMetricCard: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#eef2f7', borderRadius: 16, padding: 12, gap: 4 },
  shiftHistoryMetricValue: { color: colors.text, fontSize: 14, fontWeight: '800' },
  shiftHistoryMetricLabel: { color: colors.subtext, fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  shiftHistoryControls: { gap: 12 },
  shiftHistoryFilterRow: { gap: 8, paddingVertical: 2 },
  shiftHistoryModeRow: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: '#f3f4f6', borderRadius: 14, padding: 4, gap: 4, flexWrap: 'wrap' },
  shiftHistoryModeButton: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10 },
  shiftHistoryModeButtonActive: { backgroundColor: '#ffffff' },
  shiftHistoryModeText: { color: colors.subtext, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  shiftHistoryModeTextActive: { color: colors.text },
  shiftModalSheet: { backgroundColor: '#09090b', borderRadius: 36, padding: 24, gap: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  shiftModalTitle: { color: '#ffffff', fontSize: 24, fontWeight: '800', flex: 1 },
  shiftModalBody: { color: '#a1a1aa', fontSize: 13, lineHeight: 20 },
  shiftModalPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 16 },
  shiftModalPrimaryText: { color: '#ffffff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  shiftModalSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 18, paddingVertical: 16 },
  shiftModalSecondaryText: { color: '#ffffff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  shiftModalGhost: { alignItems: 'center', paddingVertical: 10 },
  shiftModalGhostText: { color: '#71717a', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.9 },
  shiftModalCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: 16, gap: 8 },
  shiftModalMiniHeader: { color: '#34d399', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  shiftRecordingWrap: { alignItems: 'center', gap: 14, paddingVertical: 12 },
  shiftRecordingCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#18181b', alignItems: 'center', justifyContent: 'center' },
  shiftRecordingCircleActive: { backgroundColor: '#ef4444' },
  shiftModalRecord: { backgroundColor: '#ef4444', borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  shiftConfirmIcon: { alignSelf: 'center' },
  shiftConfirmTitle: { color: '#ffffff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    fontSize: 14,
  },
  videoPanel: { borderRadius: 28, padding: 24, alignItems: 'center', gap: 10 },
  videoTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  videoBody: { color: '#d7e7f4', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  progressTrack: { height: 10, borderRadius: 999, backgroundColor: '#e9efea', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
  darkHeroInner: { borderRadius: 22, padding: 18, gap: 12 },
  darkHeroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  darkHeroBody: { color: '#c7e8da', fontSize: 14, lineHeight: 20 },
  dangerButton: { backgroundColor: '#fbe8e8', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  dangerButtonText: { color: '#b42318', fontWeight: '800' },
  profileHero: { alignItems: 'center', gap: 16, paddingVertical: 8 },
  profileHeroAvatar: { width: 128, height: 128, borderRadius: 40, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  profileHeroAvatarText: { color: '#ffffff', fontSize: 36, fontWeight: '800' },
  profileVerified: { position: 'absolute', right: -4, bottom: -4, width: 36, height: 36, borderRadius: 14, backgroundColor: colors.primary, borderWidth: 4, borderColor: colors.panel, alignItems: 'center', justifyContent: 'center' },
  profileHeroContent: { alignItems: 'center', gap: 8 },
  profilePillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  profilePillPrimary: { backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  profilePillPrimaryText: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  profilePillMuted: { backgroundColor: '#eef2ef', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.line },
  profilePillMutedText: { color: colors.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  profileHeroTitle: { color: colors.text, fontSize: 32, fontWeight: '800', textAlign: 'center' },
  profileHeroMeta: { color: colors.subtext, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  profileSignOutTop: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff1f2', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  profileSignOutTopText: { color: '#dc2626', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  profileTabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6 },
  profileTabButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f3f5f3', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  profileTabButtonActive: { backgroundColor: colors.text },
  profileTabText: { color: colors.subtext, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  profileTabTextActive: { color: '#ffffff' },
  profileInfoCard: { backgroundColor: '#f7faf7', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#eef3ef', gap: 6 },
  profileInfoLabel: { color: colors.subtext, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  profileInfoValue: { color: colors.text, fontSize: 15, fontWeight: '700' },
  profileBioCard: { backgroundColor: '#f7faf7', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#eef3ef', gap: 10 },
  profileOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#f7faf7', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#eef3ef' },
  profileOptionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: 'rgba(8,18,15,0.96)',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tab: { flex: 1, alignItems: 'center', gap: 6 },
  tabAi: { marginTop: -26 },
  tabIconWrap: { width: 40, height: 40, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tabIconWrapActive: { backgroundColor: 'rgba(16,185,129,0.12)' },
  tabText: { color: '#8ca196', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  tabTextActive: { color: '#d7f6e8' },
  tabAiCard: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: colors.bg,
    padding: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  tabAiCardActive: {
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
  },
  tabAiGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabAiGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabAiAvatar: { width: '100%', height: '100%' },
  tabAiText: {
    color: '#34d399',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 2,
  },
  nuviaHeader: { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  nuviaHeaderAvatarWrap: { width: 44, height: 44, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  nuviaHeaderAvatar: { width: '100%', height: '100%' },
  nuviaHeaderTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  nuviaHeaderBadge: { backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  nuviaHeaderBadgeText: { color: '#34d399', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  nuviaModeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  nuviaModeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'transparent' },
  nuviaModeChipActive: { backgroundColor: '#ffffff' },
  nuviaModeText: { color: '#71717a', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  nuviaModeTextActive: { color: '#09090b' },
  nuviaPanel: { gap: 12, paddingTop: 8 },
  nuviaAssistantBubble: { alignSelf: 'flex-start', maxWidth: '90%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, borderTopLeftRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14, gap: 10 },
  nuviaBubbleText: { color: '#e4e4e7', fontSize: 13, lineHeight: 20 },
  nuviaCitationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nuviaCitation: { color: '#71717a', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  nuviaUserBubble: { alignSelf: 'flex-end', maxWidth: '90%', backgroundColor: colors.primary, borderRadius: 20, borderTopRightRadius: 8, padding: 14 },
  nuviaUserBubbleText: { color: '#ffffff', fontSize: 13, lineHeight: 20 },
  nuviaAlertCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14, gap: 10 },
  nuviaAlertIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nuviaAlertTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  nuviaActionChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  nuviaAlertAction: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  nuviaAlertBody: { color: '#a1a1aa', fontSize: 12, lineHeight: 18 },
  nuviaTaskCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14, gap: 8 },
  nuviaTaskTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  nuviaTaskPatient: { color: '#a1a1aa', fontSize: 12, marginTop: 2 },
  nuviaTaskMeta: { color: '#71717a', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  nuviaTaskStatusPill: { backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  nuviaTaskStatusText: { color: '#34d399', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  nuviaTaskActionButton: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(16,185,129,0.14)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)', borderRadius: 14, paddingVertical: 11 },
  nuviaTaskActionText: { color: '#ffffff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  nuviaSearchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 12 },
  nuviaSearchInput: { flex: 1, color: '#ffffff', fontSize: 13, paddingVertical: 0 },
  nuviaKnowledgeCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14, gap: 8 },
  nuviaKnowledgeCategory: { color: '#34d399', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  nuviaKnowledgeUpdated: { color: '#71717a', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  nuviaKnowledgeTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  nuviaKnowledgeBody: { color: '#a1a1aa', fontSize: 12, lineHeight: 18 },
  nuviaKnowledgeTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  nuviaKnowledgeTag: { color: '#71717a', fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  nuviaKnowledgeFooter: { marginTop: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nuviaKnowledgeAction: { color: '#34d399', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  nuviaComposer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  nuviaMicButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  nuviaMicButtonActive: { backgroundColor: '#ef4444' },
  nuviaComposerInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#18181b', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingLeft: 16, paddingRight: 8, paddingVertical: 8 },
  nuviaComposerInput: { flex: 1, color: '#ffffff', fontSize: 13, paddingVertical: 0 },
  nuviaSendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  nuviaSendButtonDisabled: { opacity: 0.45 },
  nuviaVoiceError: { color: '#f87171', fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 8 },
  nuviaComposerHint: { color: '#52525b', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginTop: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, minHeight: '45%', maxHeight: '80%', gap: 16 },
  bookingSheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, minHeight: '45%', gap: 18 },
  taskModalSheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, minHeight: '45%', maxHeight: '85%', gap: 18 },
  taskModalScroll: { gap: 16, paddingBottom: 20 },
  bookingHandle: { width: 48, height: 6, borderRadius: 999, backgroundColor: '#e5e7eb', alignSelf: 'center' },
  bookingTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  bookingClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  bookingField: { gap: 8 },
  bookingLabel: { color: '#9ca3af', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  taskModalTwoCol: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  taskModalWideCol: { flex: 1.2 },
  taskModalNarrowCol: { flex: 0.8 },
  bookingInputShell: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14 },
  bookingInputValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
  taskModalInput: { backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, color: colors.text, fontSize: 14 },
  taskModalTextarea: { backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, color: colors.text, fontSize: 14, minHeight: 110, textAlignVertical: 'top' },
  taskSelectShell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, minHeight: 50 },
  taskSelectValue: { color: colors.text, fontSize: 13, fontWeight: '700', flex: 1, paddingRight: 8 },
  taskSelectMenu: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, overflow: 'hidden' },
  taskSelectOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  taskSelectOptionText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  bookingPrimaryButton: { flex: 1, backgroundColor: colors.text, borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  taskModalPrimaryButton: { width: '100%', backgroundColor: colors.text, borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 8 },
  bookingPrimaryButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  bookingSlotCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingSlotName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  bookingSlotTime: { color: colors.primaryDark, fontSize: 11, fontWeight: '800', backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  bookingAiCard: { backgroundColor: '#ecfdf5', borderRadius: 16, borderWidth: 1, borderColor: '#bbf7d0', padding: 14, gap: 8 },
  bookingAiTitle: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  bookingAiBody: { color: '#166534', fontSize: 12, lineHeight: 18 },
  bookingActionRow: { flexDirection: 'row', gap: 12 },
  bookingSecondaryButton: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  bookingSecondaryButtonText: { color: colors.subtext, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  taskHistoryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  taskHistoryDot: { width: 12, height: 12, borderRadius: 999, backgroundColor: colors.primary, marginTop: 4 },
  notificationCard: { flexDirection: 'row', gap: 12, backgroundColor: '#f7faf7', borderRadius: 18, padding: 14, marginBottom: 12 },
  notificationTone: { width: 10, borderRadius: 999 },
  moreSheet: { backgroundColor: '#18181b', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, minHeight: '45%', maxHeight: '80%', gap: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  moreSheetTitle: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  moreSheetClose: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  moreRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 16, marginBottom: 12 },
  moreRowActive: { backgroundColor: colors.primary },
  moreIcon: { width: 48, height: 48, borderRadius: 18, backgroundColor: '#27272a', alignItems: 'center', justifyContent: 'center' },
  moreIconActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  moreRowTitle: { color: '#d4d4d8', fontSize: 15, fontWeight: '700' },
  moreRowTitleActive: { color: '#ffffff' },
  moreRowDescription: { color: '#71717a', fontSize: 11, lineHeight: 16 },
  moreRowDescriptionActive: { color: 'rgba(255,255,255,0.7)' },
  moreSheetSpacer: { height: 24 },
});
