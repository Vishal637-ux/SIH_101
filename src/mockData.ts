import { OfficialProfile, CompetencyItem, LearningPathwayItem, BookToContentExtraction, WorkforceInsight } from './types';

export const SAMPLE_PROFILES: OfficialProfile[] = [
  {
    id: 'off-001',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@gov.in',
    cadre: 'Central Secretariat Service (CSS)',
    designation: 'Assistant Section Officer (ASO)',
    ministry: 'Ministry of Personnel, Public Grievances & Pensions',
    department: 'Department of Administrative Reforms & Public Grievances (DARPG)',
    experienceYears: 6,
    currentBand: 'Pay Level 7',
    targetRole: 'Section Officer / Under Secretary',
    targetGoal: 'Master Public Financial Rules (GFR 2017) & GeM e-Procurement Compliance',
    karmaPoints: 480,
    streakDays: 14,
    completedCourses: 8,
  },
  {
    id: 'off-002',
    name: 'Dr. Meera Verma',
    email: 'meera.verma@gov.in',
    cadre: 'Indian Administrative Service (IAS)',
    designation: 'Deputy Secretary (Policy & Planning)',
    ministry: 'Ministry of Electronics & Information Technology (MeitY)',
    department: 'Digital Governance & Emerging Technologies Division',
    experienceYears: 11,
    currentBand: 'Pay Level 12',
    targetRole: 'Director (e-Governance Frameworks)',
    targetGoal: 'Implement DPDP Act 2023 & Cross-Departmental AI Integration Standards',
    karmaPoints: 920,
    streakDays: 28,
    completedCourses: 15,
  },
];

export const INITIAL_COMPETENCIES: CompetencyItem[] = [
  {
    id: 'comp-1',
    name: 'Public Procurement & GeM Rules',
    domain: 'Domain',
    currentLevel: 2.2,
    requiredLevel: 4.5,
    gapScore: 2.3,
    urgency: 'High',
    impactExplanation: 'Crucial for error-free drafting of tender documents, purchase orders on GeM, and CAG audit compliance.',
  },
  {
    id: 'comp-2',
    name: 'Digital Governance & Data Privacy Compliance',
    domain: 'Functional',
    currentLevel: 2.5,
    requiredLevel: 4.0,
    gapScore: 1.5,
    urgency: 'High',
    impactExplanation: 'Required for implementing paperless workflows, citizen consent mechanisms, and cybersecurity directives.',
  },
  {
    id: 'comp-3',
    name: 'Public Policy Formulation & Regulatory Impact',
    domain: 'Functional',
    currentLevel: 3.0,
    requiredLevel: 4.2,
    gapScore: 1.2,
    urgency: 'Medium',
    impactExplanation: 'Needed for drafting cabinet notes, consultative papers, and inter-departmental impact assessments.',
  },
  {
    id: 'comp-4',
    name: 'Ethical Leadership & Citizen Centricity',
    domain: 'Behavioral',
    currentLevel: 3.6,
    requiredLevel: 4.5,
    gapScore: 0.9,
    urgency: 'Medium',
    impactExplanation: 'Supports transparent grievance redressal, public accountability, and impartial conflict arbitration.',
  },
  {
    id: 'comp-5',
    name: 'Data-Driven Decision Making & Analytics',
    domain: 'Functional',
    currentLevel: 2.8,
    requiredLevel: 4.2,
    gapScore: 1.4,
    urgency: 'Medium',
    impactExplanation: 'Essential for tracking scheme KPIs via dashboards and statistical sampling validation.',
  },
];

export const PRESET_BOOKS = [
  {
    title: 'Compendium of Public Procurement & GeM 4.0 Guidelines',
    sourceOrg: 'Ministry of Finance & GeM Authority',
    pages: 142,
    sampleExtract: `CHAPTER 4: STATUTORY PRINCIPLES OF PUBLIC PROCUREMENT UNDER GFR
Rule 144 of the General Financial Rules (GFR), 2017 stipulates that every authority delegated with the financial power of procuring goods in the public interest shall have the responsibility and accountability to bring efficiency, economy, and transparency in matters relating to public procurement and for fair and equitable treatment of suppliers and promotion of competition in public procurement.

Rule 149 Mandate on Government e-Marketplace (GeM):
Procurement through GeM is mandatory for all Central Ministries, Departments, and attached offices for goods and services available on the portal.
1. Direct Purchase: Purchases up to ₹25,000 can be made directly through any of the available suppliers on the GeM portal, meeting the requisite quality, specification and delivery period.
2. L1 Purchase: Purchases above ₹25,000 and up to ₹5,00,000 can be made through the GeM Seller having the lowest price among the available sellers (at least three different manufacturers/brands).
3. Bidding / Reverse Auction: For purchases above ₹5,00,000, buyer must mandatorily conduct an online bidding or reverse auction.
4. Consignee Receipt and Acceptance Certificate (CRAC): Buyer must inspect and issue CRAC within 10 days of delivery. Timely payments must be made to suppliers within 10 days of CRAC issuance, failing which penal interest may apply.
5. Single Source / Proprietary Article: Strict prohibition exists against tailoring technical specifications to favor any proprietary brand. In unavoidable instances where proprietary goods are required, a formal Proprietary Article Certificate (PAC) approved by the Competent Financial Authority is mandatory.`,
  },
  {
    title: 'Handbook on Digital Personal Data Protection (DPDP) in Public Administration',
    sourceOrg: 'Ministry of Electronics & Information Technology (MeitY)',
    pages: 98,
    sampleExtract: `SECTION 2: DATA FIDUCIARY OBLIGATIONS IN GOVERNMENT AGENCIES
Under the Digital Personal Data Protection Act, 2023, public administrative bodies processing citizen personal data for welfare delivery, biometric authentication, and license issuance act as Data Fiduciaries.

Core Directives for Officials:
1. Lawful Basis and Purpose Limitation: Personal data may only be processed for the specific public service or statutory purpose for which it was collected or mandated by law.
2. Notice and Verifiable Consent: Prior to data collection, clear notices in plain official language (including regional languages) must explain what data is collected and for what scheme delivery.
3. Reasonable Security Safeguards: Administrative and technical safeguards must prevent personal data breaches. Any breach must be formally reported to the Data Protection Board of India and the affected citizens without undue delay.
4. Data Minimization: Collecting ancillary citizen attributes beyond the direct operational need of the welfare scheme constitutes a regulatory infraction.`,
  },
  {
    title: 'Code of Conduct, Administrative Vigilance & Citizen Grievance Redressal',
    sourceOrg: 'Central Vigilance Commission & DARPG',
    pages: 112,
    sampleExtract: `PRINCIPLES OF IMPARTIALITY AND PUBLIC TRUST
Every member of the civil services shall at all times maintain absolute integrity, devotion to duty, and do nothing which is unbecoming of a public servant.

Key Operational Standards:
1. Impartial Decision Making: Decisions involving public licenses, tenders, or subsidies must be free from any personal, pecuniary, or familial interest. Conflict of interest must be formally recused in writing.
2. Citizen Charters: Every department shall publish realistic timeframes for public services under CPGRAMS (Centralized Public Grievance Redress and Monitoring System).
3. Whistleblower Protection: Protection mechanisms must be preserved for staff reporting deviations in public fund usage or regulatory breaches.`,
  },
];

export const WORKFORCE_INSIGHTS: WorkforceInsight[] = [
  {
    department: 'Procurement & Finance Section',
    officialCount: 142,
    averageReadiness: 76,
    topSkillGaps: ['GeM 4.0 Reverse Auction', 'GFR Contract Disputes', 'Statutory Audit Reply'],
    completionRate: 88,
  },
  {
    department: 'Digital Governance Division',
    officialCount: 94,
    averageReadiness: 69,
    topSkillGaps: ['DPDP Act 2023 Compliance', 'API Integration Safeguards', 'Cloud Migration'],
    completionRate: 82,
  },
  {
    department: 'Public Grievance Redressal Cell',
    officialCount: 68,
    averageReadiness: 84,
    topSkillGaps: ['Citizen Empathy & Mediation', 'CPGRAMS SLA Optimization'],
    completionRate: 94,
  },
  {
    department: 'Policy Formulation & Cabinet Unit',
    officialCount: 52,
    averageReadiness: 71,
    topSkillGaps: ['Regulatory Impact Analysis', 'Cabinet Note Drafting'],
    completionRate: 79,
  },
];
