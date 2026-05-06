export interface KnowledgeBaseEntry {
  id: string;
  category: 'clinical' | 'operational' | 'billing' | 'policy';
  title: string;
  content: string;
  tags: string[];
  lastUpdated: string;
}

export const KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    id: 'kb_001',
    category: 'clinical',
    title: 'Hypertension Management Protocol (JNC 8)',
    content: 'For patients >= 60 years, initiate pharmacologic treatment to lower BP at SBP >= 150 mmHg or DBP >= 90 mmHg. Goal < 150/90. For patients < 60 years, initiate at SBP >= 140 or DBP >= 90. Goal < 140/90. Initial drugs: thiazide-type diuretic, CCB, ACEI, or ARB.',
    tags: ['hypertension', 'BP', 'protocol', 'JNC8'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'kb_002',
    category: 'billing',
    title: 'CPT 99490 - Chronic Care Management (CCM)',
    content: 'Requires at least 20 minutes of clinical staff time directed by a physician or other qualified healthcare professional, per calendar month. Requires 2 or more chronic conditions expected to last at least 12 months. Patient consent required.',
    tags: ['CCM', 'billing', 'CPT', '99490'],
    lastUpdated: '2024-02-01'
  },
  {
    id: 'kb_003',
    category: 'billing',
    title: 'CPT 99454 - RPM Device Supply',
    content: 'Remote monitoring of physiologic parameter(s); device(s) supply with daily recording(s) or programmed alert(s) transmission, each 30 days. Requires at least 16 days of data transmission within a 30-day period.',
    tags: ['RPM', 'billing', 'CPT', '99454'],
    lastUpdated: '2024-02-10'
  },
  {
    id: 'kb_004',
    category: 'operational',
    title: 'Nuvia Assistant Voice Commands',
    content: 'Nuvia supports voice commands for: "Navigate to [Module]", "Show patient [Name]", "Summarize history for [Name]", "Add clinical note for [Name]", "Schedule task [Title]", "Prescribe [Medication]".',
    tags: ['nuvia', 'commands', 'voice', 'help'],
    lastUpdated: '2024-03-01'
  },
  {
    id: 'kb_005',
    category: 'clinical',
    title: 'CHF Monitoring Guidelines',
    content: 'Daily weight monitoring is critical. A weight gain of >3 lbs in 1 day or >5 lbs in 1 week should be flagged as a potential exacerbation. Monitor for dyspnea, edema, and fatigue.',
    tags: ['CHF', 'heart failure', 'weight', 'monitoring'],
    lastUpdated: '2024-01-20'
  },
  {
    id: 'kb_006',
    category: 'policy',
    title: 'HIPAA Compliance - Data Storage',
    content: 'All Patient Health Information (PHI) must be encrypted at rest and in transit. Access must be logged and restricted based on the principle of least privilege. Use of personal devices for PHI is strictly prohibited unless managed by MDM.',
    tags: ['HIPAA', 'security', 'privacy', 'PHI'],
    lastUpdated: '2023-12-01'
  }
];
