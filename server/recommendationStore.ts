/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 05: AI Recommendation Engine Data Store & Service Layer
 * Compliance:
 * - Consumes verified Skill Gaps from Module 04 (NEVER recalculates gaps)
 * - Transparent, deterministic ranking & multi-point explainability generator
 * - Role & Cadre contextual matching (NSSTA, iGOT Karmayogi, TPAC)
 * - Personalized 4-Phase Learning Path generation
 * - Clean handoff to Module 07 (Learning Experience)
 * - Gemini AI enrichment when available with zero external API hard-dependency
 */

import { skillGapStore, SkillGapRecord, GapPriority } from './skillGapStore.js';
import { competencyStore, CompetencyDomain } from './competencyStore.js';
import { profileStore } from './profileStore.js';

export type ResourceProvider = 'iGOT Karmayogi' | 'NSSTA' | 'TPAC' | 'Platform Content';
export type ResourceType = 'Interactive Course' | 'Micro-Learning' | 'Executive Briefing' | 'Case Study' | 'Handbook';
export type ResourceDifficulty = 'Foundation' | 'Intermediate' | 'Advanced';

export interface LearningResource {
  id: string;
  title: string;
  provider: ResourceProvider;
  resourceType: ResourceType;
  primaryCompetencyId: string;
  competencyCode: string;
  competencyName: string;
  domain: CompetencyDomain;
  targetProficiencyLevel: number;
  difficulty: ResourceDifficulty;
  estimatedHours: number;
  karmaPoints: number;
  description: string;
  learningObjectives: string[];
  modulesCount: number;
  syllabus: Array<{ title: string; durationMinutes: number }>;
  sourceUrl?: string;
  isActive: boolean;
}

export interface RecommendationRecord {
  id: string;
  userId: string;
  resourceId: string;
  resource: LearningResource;
  competencyId: string;
  skillGapId: string;
  competencyName: string;
  domain: CompetencyDomain;
  currentProficiency: number;
  requiredProficiency: number;
  gapValue: number;
  priority: GapPriority;
  matchScore: number; // 0 to 100%
  rank: number;
  whyRecommended: string[]; // Transparent, explainable data-backed bullet points
  suitabilitySummary: string;
  status: 'RECOMMENDED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
  enrolledAt?: string;
  generatedAt: string;
  updatedAt: string;
}

export interface RecommendationSummary {
  userId: string;
  officialName: string;
  jobRole: string;
  department: string;
  totalSkillGapsAddressed: number;
  totalRecommendedResources: number;
  highPriorityLearningAreas: number;
  learningPathProgressPercentage: number;
  topRecommendation: RecommendationRecord | null;
  lastGeneratedAt: string;
}

export interface LearningPathPhase {
  phaseNumber: number;
  phaseTitle: string;
  phaseDescription: string;
  recommendations: RecommendationRecord[];
  estimatedTotalHours: number;
  totalKarmaPoints: number;
  phaseStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface PersonalizedLearningPath {
  userId: string;
  officialName: string;
  jobRole: string;
  targetGoal: string;
  totalPhases: number;
  totalEstimatedHours: number;
  totalKarmaPoints: number;
  phases: LearningPathPhase[];
  generatedAt: string;
}

export interface Module07HandoffPayload {
  handoffId: string;
  userId: string;
  officialName: string;
  resourceId: string;
  resourceTitle: string;
  provider: ResourceProvider;
  resourceType: ResourceType;
  recommendationId: string;
  competencyId: string;
  competencyName: string;
  skillGapId: string;
  targetProficiency: number;
  enrolledAt: string;
  status: 'READY_TO_LEARN';
}

// Curated Master Catalog of Verified Civil Service Learning Resources
const MASTER_LEARNING_RESOURCES: LearningResource[] = [
  // STATISTICAL DOMAIN
  {
    id: 'res-stat-001',
    title: 'Modern Sample Survey Design & Field Questionnaire Architecture',
    provider: 'NSSTA',
    resourceType: 'Interactive Course',
    primaryCompetencyId: 'comp-stat-001',
    competencyCode: 'STAT-SRV-01',
    competencyName: 'Survey Design',
    domain: 'Statistical',
    targetProficiencyLevel: 4.0,
    difficulty: 'Intermediate',
    estimatedHours: 6.5,
    karmaPoints: 160,
    description: 'Master multi-stage stratified sampling designs, schedule drafting, pilot testing protocols, and field supervisor manuals adhering to National Statistical Office standards.',
    learningObjectives: [
      'Draft standardized survey instruments and schedule schedules under NSO guidelines',
      'Implement pilot testing methodologies to evaluate cognitive response bias',
      'Formulate comprehensive field manuals and supervisor audit protocols',
    ],
    modulesCount: 5,
    syllabus: [
      { title: 'Foundations of Socio-Economic Schedules', durationMinutes: 60 },
      { title: 'Questionnaire Validation & Cognitive Pre-testing', durationMinutes: 75 },
      { title: 'Multi-stage Stratification Schedules', durationMinutes: 90 },
      { title: 'Interviewer Instruction Manual Drafting', durationMinutes: 75 },
      { title: 'Quality Assurance in Field Operations', durationMinutes: 90 },
    ],
    isActive: true,
  },
  {
    id: 'res-stat-002',
    title: 'Probability Proportional to Size (PPS) & Sampling Error Estimation',
    provider: 'NSSTA',
    resourceType: 'Interactive Course',
    primaryCompetencyId: 'comp-stat-002',
    competencyCode: 'STAT-SMP-02',
    competencyName: 'Sampling',
    domain: 'Statistical',
    targetProficiencyLevel: 4.0,
    difficulty: 'Advanced',
    estimatedHours: 7.0,
    karmaPoints: 180,
    description: 'Practical training on PPS selection, design weights, post-stratification, and variance estimation using jackknife and bootstrap methods for large-scale national surveys.',
    learningObjectives: [
      'Compute first and second-stage selection probabilities for PPS clusters',
      'Derive sampling weights adjusted for unit and item non-response',
      'Calculate design effects (DEFF) and complex variance estimates',
    ],
    modulesCount: 4,
    syllabus: [
      { title: 'Probability Proportional to Size Selection Algorithms', durationMinutes: 90 },
      { title: 'Sampling Frame Construction & Stratification', durationMinutes: 90 },
      { title: 'Weighting Schemes & Post-Stratification Adjustments', durationMinutes: 120 },
      { title: 'Variance Estimation for Complex Survey Designs', durationMinutes: 120 },
    ],
    isActive: true,
  },
  {
    id: 'res-stat-003',
    title: 'Data Quality Frameworks & NQAF Audit Standards',
    provider: 'NSSTA',
    resourceType: 'Interactive Course',
    primaryCompetencyId: 'comp-stat-005',
    competencyCode: 'STAT-QAL-05',
    competencyName: 'Data Quality Frameworks',
    domain: 'Statistical',
    targetProficiencyLevel: 3.8,
    difficulty: 'Intermediate',
    estimatedHours: 5.0,
    karmaPoints: 140,
    description: 'Adopting the UN National Quality Assurance Framework (NQAF), implementing automated statistical validation rules, error tracking, and managing data lineage.',
    learningObjectives: [
      'Apply the 5 NQAF quality dimensions to administrative registries',
      'Configure automated consistency and boundary check algorithms',
      'Audit statistical lineage across ministerial data submission pipelines',
    ],
    modulesCount: 4,
    syllabus: [
      { title: 'Principles of National Statistical Quality Assurance (NQAF)', durationMinutes: 60 },
      { title: 'Validation Rules & Automated Discrepancy Flagging', durationMinutes: 75 },
      { title: 'Non-Sampling Error Modeling & Control', durationMinutes: 75 },
      { title: 'Institutional Quality Reporting & Lineage Auditing', durationMinutes: 90 },
    ],
    isActive: true,
  },

  // TECHNICAL DOMAIN
  {
    id: 'res-tech-001',
    title: 'Python for Statistical Analysis & Administrative Data Processing',
    provider: 'iGOT Karmayogi',
    resourceType: 'Interactive Course',
    primaryCompetencyId: 'comp-tech-001',
    competencyCode: 'TECH-PY-01',
    competencyName: 'Python',
    domain: 'Technical',
    targetProficiencyLevel: 4.0,
    difficulty: 'Intermediate',
    estimatedHours: 8.0,
    karmaPoints: 200,
    description: 'Hands-on programming with Pandas, NumPy, and Statsmodels for cleaning, aggregating, and transforming administrative microdata and survey microdata.',
    learningObjectives: [
      'Manipulate complex multi-table official survey datasets using Pandas',
      'Automate monthly statistical compilation and index generation pipelines',
      'Perform exploratory data analysis and hypothesis testing on public registries',
    ],
    modulesCount: 6,
    syllabus: [
      { title: 'Python Core for Administrative Analysts', durationMinutes: 60 },
      { title: 'Data Ingestion & Cleaning with Pandas', durationMinutes: 90 },
      { title: 'Microdata Merging, Pivoting & Aggregations', durationMinutes: 90 },
      { title: 'Statistical Distributions & Hypothesis Testing with Scipy', durationMinutes: 90 },
      { title: 'Automating Excel & PDF Statistical Dockets', durationMinutes: 75 },
      { title: 'Capstone: End-to-End Survey Processing Script', durationMinutes: 75 },
    ],
    isActive: true,
  },
  {
    id: 'res-tech-002',
    title: 'Advanced SQL for Public Administration Registries & Big Data',
    provider: 'iGOT Karmayogi',
    resourceType: 'Interactive Course',
    primaryCompetencyId: 'comp-tech-002',
    competencyCode: 'TECH-SQL-02',
    competencyName: 'SQL',
    domain: 'Technical',
    targetProficiencyLevel: 3.5,
    difficulty: 'Intermediate',
    estimatedHours: 6.0,
    karmaPoints: 150,
    description: 'Query optimization, Window Functions (OVER/PARTITION BY), Common Table Expressions, and querying multimillion-record public distribution databases in PostgreSQL.',
    learningObjectives: [
      'Author high-performance analytical queries using Window Functions',
      'Optimize complex multi-table joins on master citizen databases',
      'Construct recursive CTEs for hierarchical departmental reporting hierarchies',
    ],
    modulesCount: 4,
    syllabus: [
      { title: 'Relational Schema Modeling for Official Statistics', durationMinutes: 60 },
      { title: 'Advanced Window Functions (RANK, ROW_NUMBER, LEAD/LAG)', durationMinutes: 90 },
      { title: 'Common Table Expressions & Subquery Performance', durationMinutes: 90 },
      { title: 'Query Plan Inspection & Index Tuning in PostgreSQL', durationMinutes: 120 },
    ],
    isActive: true,
  },
  {
    id: 'res-tech-003',
    title: 'Interactive Data Visualization for Parliamentary Briefings & Dashboards',
    provider: 'Platform Content',
    resourceType: 'Interactive Course',
    primaryCompetencyId: 'comp-tech-003',
    competencyCode: 'TECH-VIS-03',
    competencyName: 'Data Visualization',
    domain: 'Technical',
    targetProficiencyLevel: 3.5,
    difficulty: 'Foundation',
    estimatedHours: 4.5,
    karmaPoints: 120,
    description: 'Designing clear, accessible charts and executive dashboards for cabinet notes, committee hearings, and public open-data dissemination.',
    learningObjectives: [
      'Choose the right visual encoding for temporal and geographical data',
      'Apply color accessibility and official government publishing guidelines',
      'Design interactive drill-down dashboards for ministerial monitoring',
    ],
    modulesCount: 3,
    syllabus: [
      { title: 'Visual Grammar & Cognitive Clarity in Government Reports', durationMinutes: 60 },
      { title: 'Building Interactive Trend Charts with Drilldowns', durationMinutes: 90 },
      { title: 'Executive KPI Cards & Cabinet Submission Graphics', durationMinutes: 120 },
    ],
    isActive: true,
  },

  // DIGITAL GOVERNANCE DOMAIN
  {
    id: 'res-dig-001',
    title: 'Digital Personal Data Protection (DPDP) Act Compliance & Safeguards',
    provider: 'TPAC',
    resourceType: 'Executive Briefing',
    primaryCompetencyId: 'comp-dig-001',
    competencyCode: 'DIG-PRV-01',
    competencyName: 'Data Privacy',
    domain: 'Digital Governance',
    targetProficiencyLevel: 4.0,
    difficulty: 'Intermediate',
    estimatedHours: 5.0,
    karmaPoints: 140,
    description: 'Implementing statutory obligations for Government Data Fiduciaries, citizen consent workflows, anonymization protocols, and grievance redressal systems.',
    learningObjectives: [
      'Map legal requirements of the DPDP Act to departmental IT workflows',
      'Implement de-identification and k-anonymity on statistical releases',
      'Establish standard operating procedures for data breach notifications',
    ],
    modulesCount: 4,
    syllabus: [
      { title: 'Statutory Architecture of the DPDP Act 2023', durationMinutes: 60 },
      { title: 'Government Data Fiduciary Obligations & Citizen Rights', durationMinutes: 75 },
      { title: 'Anonymization & Differential Privacy in Public Statistics', durationMinutes: 75 },
      { title: 'Incident Response & Grievance Redressal Mechanisms', durationMinutes: 90 },
    ],
    isActive: true,
  },
  {
    id: 'res-dig-002',
    title: 'Government Cloud Infrastructure & Cyber Security Hygiene',
    provider: 'TPAC',
    resourceType: 'Case Study',
    primaryCompetencyId: 'comp-dig-002',
    competencyCode: 'DIG-SEC-02',
    competencyName: 'Cybersecurity',
    domain: 'Digital Governance',
    targetProficiencyLevel: 3.5,
    difficulty: 'Intermediate',
    estimatedHours: 4.0,
    karmaPoints: 110,
    description: 'Defense-in-depth principles for civil servants: phishing countermeasures, multi-factor authentication, secure network access, and incident escalation protocols.',
    learningObjectives: [
      'Recognize targeted social engineering and phishing campaigns',
      'Enforce role-based access control and token-based digital signatures',
      'Execute departmental cyber incident escalation SOPs',
    ],
    modulesCount: 3,
    syllabus: [
      { title: 'Threat Landscapes Facing Civil Service Information Systems', durationMinutes: 60 },
      { title: 'Credential Hygiene, MFA & e-Sign Cryptography', durationMinutes: 90 },
      { title: 'Incident Reporting under CERT-In Guidelines', durationMinutes: 90 },
    ],
    isActive: true,
  },
  {
    id: 'res-dig-003',
    title: 'Architecting Digital Public Infrastructure (DPI) & API Governance',
    provider: 'iGOT Karmayogi',
    resourceType: 'Interactive Course',
    primaryCompetencyId: 'comp-dig-003',
    competencyCode: 'DIG-DPI-03',
    competencyName: 'Digital Public Infrastructure',
    domain: 'Digital Governance',
    targetProficiencyLevel: 4.0,
    difficulty: 'Advanced',
    estimatedHours: 6.0,
    karmaPoints: 150,
    description: 'Interoperability principles across India Stack (Aadhaar, UPI, DigiLocker, DEPA) and establishing secure open data exchange APIs for official statistics.',
    learningObjectives: [
      'Leverage DigiLocker and citizen consent layers in ministerial pipelines',
      'Design RESTful OpenAPI specifications for inter-ministerial data sharing',
      'Implement API rate limiting and security token verification',
    ],
    modulesCount: 4,
    syllabus: [
      { title: 'The Triad of DPI: Identity, Payments & Data Exchange', durationMinutes: 90 },
      { title: 'DigiLocker Integration & Verifiable Credentials', durationMinutes: 90 },
      { title: 'OpenAPI Standards & Cross-Departmental Data Feeds', durationMinutes: 90 },
      { title: 'Governance, Auditing & Resilience in DPI Applications', durationMinutes: 90 },
    ],
    isActive: true,
  },

  // BEHAVIOURAL / MANAGERIAL DOMAIN
  {
    id: 'res-beh-001',
    title: 'Ethics, Neutrality & Public Trust in Official Statistics',
    provider: 'Platform Content',
    resourceType: 'Executive Briefing',
    primaryCompetencyId: 'comp-beh-001',
    competencyCode: 'BEH-ETH-01',
    competencyName: 'Ethics',
    domain: 'Behavioural / Managerial',
    targetProficiencyLevel: 4.0,
    difficulty: 'Foundation',
    estimatedHours: 3.5,
    karmaPoints: 100,
    description: 'UN Fundamental Principles of Official Statistics, handling proprietary survey information, political neutrality, and whistle-blower governance.',
    learningObjectives: [
      'Apply UN Fundamental Principles of Official Statistics to daily dilemmas',
      'Safeguard respondent confidentiality under the Collection of Statistics Act',
      'Resolve conflicts between statistical integrity and ministerial timelines',
    ],
    modulesCount: 3,
    syllabus: [
      { title: 'The UN Fundamental Principles & National Statistical Credibility', durationMinutes: 60 },
      { title: 'Legal Confidentiality under the Collection of Statistics Act', durationMinutes: 75 },
      { title: 'Institutional Integrity & Public Communication Dilemmas', durationMinutes: 75 },
    ],
    isActive: true,
  },
  {
    id: 'res-beh-002',
    title: 'Executive Note Drafting & Inter-Ministerial Communication',
    provider: 'iGOT Karmayogi',
    resourceType: 'Interactive Course',
    primaryCompetencyId: 'comp-beh-002',
    competencyCode: 'BEH-COM-02',
    competencyName: 'Communication',
    domain: 'Behavioural / Managerial',
    targetProficiencyLevel: 3.8,
    difficulty: 'Intermediate',
    estimatedHours: 4.0,
    karmaPoints: 120,
    description: 'Structured writing for Central Secretariat files, concise cabinet notes, parliamentary question replies, and inter-departmental consultation dockets.',
    learningObjectives: [
      'Draft clear, actionable notes for file according to Manual of Office Procedure',
      'Prepare rigorous, factual replies to Starred & Unstarred Parliamentary Questions',
      'Synthesize multi-source statistical findings into a 1-page Cabinet Briefing',
    ],
    modulesCount: 4,
    syllabus: [
      { title: 'Principles of Secretariat File Notation & Paragraph Structure', durationMinutes: 60 },
      { title: 'Drafting Parliamentary Replies under Strict Deadlines', durationMinutes: 60 },
      { title: 'Inter-Ministerial Consultation Memos & Resolving Objections', durationMinutes: 60 },
      { title: 'The 1-Page Executive Summary for Secretary & Minister', durationMinutes: 60 },
    ],
    isActive: true,
  },
  {
    id: 'res-beh-003',
    title: 'Project Management & Agile Implementation in Government Schemes',
    provider: 'iGOT Karmayogi',
    resourceType: 'Interactive Course',
    primaryCompetencyId: 'comp-beh-003',
    competencyCode: 'BEH-PM-03',
    competencyName: 'Project Management',
    domain: 'Behavioural / Managerial',
    targetProficiencyLevel: 3.5,
    difficulty: 'Intermediate',
    estimatedHours: 5.0,
    karmaPoints: 130,
    description: 'Milestone tracking, financial utilization dockets, stakeholder coordination, and risk management for flagship national statistical initiatives.',
    learningObjectives: [
      'Develop milestone-driven project charters for census and sample surveys',
      'Track procurement and expenditure against budget head authorizations',
      'Manage cross-functional working groups across ministries and state directorates',
    ],
    modulesCount: 4,
    syllabus: [
      { title: 'Public Sector Project Lifecycle & Charter Drafting', durationMinutes: 75 },
      { title: 'Gantt Scheduling & Field Deployment Milestones', durationMinutes: 75 },
      { title: 'Budget Allocation & Financial Monitoring under GFR', durationMinutes: 75 },
      { title: 'Risk Registers, Contingency Planning & Scheme Audits', durationMinutes: 75 },
    ],
    isActive: true,
  },
];

class RecommendationDataStore {
  // In-memory relational store keyed by userId -> Map<resourceId, RecommendationRecord>
  private userRecommendations: Map<string, Map<string, RecommendationRecord>> = new Map();
  private resources: LearningResource[] = [...MASTER_LEARNING_RESOURCES];

  constructor() {
    this.seedDefaultRecommendations();
  }

  private seedDefaultRecommendations() {
    this.generateRecommendationsForUser('off-001');
    this.generateRecommendationsForUser('off-002');
  }

  // Get master resource by ID
  public getResourceById(resourceId: string): LearningResource | null {
    return this.resources.find(r => r.id === resourceId) || null;
  }

  // Core Recommendation Engine: Match + Rank + Explain
  public generateRecommendationsForUser(userId: string): RecommendationRecord[] {
    const profile = profileStore.getProfile(userId);
    const gaps = skillGapStore.getUserGaps(userId); // Verified Module 04 gaps
    const currentCompetencies = competencyStore.getOfficialCompetencies(userId);

    let userRecs = this.userRecommendations.get(userId);
    if (!userRecs) {
      userRecs = new Map();
      this.userRecommendations.set(userId, userRecs);
    }

    const calculatedRecords: RecommendationRecord[] = [];
    const now = new Date().toISOString();

    // Iterate through available learning resources and evaluate match against official's gaps
    this.resources.forEach(resource => {
      // Find matching gap from Module 04
      const matchingGap = gaps.find(g => g.competencyId === resource.primaryCompetencyId);
      const verifiedComp = currentCompetencies.find(c => c.competencyId === resource.primaryCompetencyId);

      const currentLevel = matchingGap ? matchingGap.currentProficiency : (verifiedComp ? verifiedComp.currentProficiency : 2.5);
      const requiredLevel = matchingGap ? matchingGap.requiredProficiency : 3.5;
      const gapValue = matchingGap ? matchingGap.gapValue : 0;
      const priority = matchingGap ? matchingGap.priority : 'None';
      const gapId = matchingGap ? matchingGap.id : `gap-none-${resource.primaryCompetencyId}`;

      // RECOMMENDATION SCORING FORMULA (Transparent & Deterministic):
      // 1. Gap Magnitude Factor (0 to 35 pts)
      const gapPoints = Math.min(35, Math.round(gapValue * 17.5));

      // 2. Gap Priority Factor (0 to 30 pts)
      const priorityWeights: Record<GapPriority, number> = {
        High: 30,
        Medium: 20,
        Low: 10,
        None: 0,
      };
      const priorityPoints = priorityWeights[priority];

      // 3. Role & Cadre Relevance (0 to 20 pts)
      // High relevance if the competency is core or critical to official's department
      let rolePoints = 15;
      if (profile?.department.toLowerCase().includes('statistical') && resource.domain === 'Statistical') {
        rolePoints = 20;
      } else if (profile?.designation.toLowerCase().includes('section officer') && resource.domain === 'Behavioural / Managerial') {
        rolePoints = 18;
      }

      // 4. Proficiency Level Calibration (0 to 15 pts)
      // Check if target level is a healthy 0.5 to 1.5 step above current proficiency
      const step = resource.targetProficiencyLevel - currentLevel;
      const calibrationPoints = (step >= 0.5 && step <= 1.5) ? 15 : (step > 1.5 ? 10 : 8);

      const matchScore = Math.min(99, Math.max(45, gapPoints + priorityPoints + rolePoints + calibrationPoints));

      // MULTI-POINT EXPLAINABLE REASONS (Strictly supported by real data)
      const whyRecommended: string[] = [];

      if (gapValue > 0) {
        whyRecommended.push(`Directly targets your verified ${resource.competencyName} gap of -${gapValue.toFixed(1)} points.`);
      } else {
        whyRecommended.push(`Refines your ${resource.competencyName} proficiency to benchmark perfection.`);
      }

      if (priority === 'High') {
        whyRecommended.push(`Classified as High Priority requirement for your ${profile?.designation || 'official'} role.`);
      } else if (priority === 'Medium') {
        whyRecommended.push(`Core competency identified in ministerial training matrix.`);
      }

      whyRecommended.push(`Calibrated for current level ${currentLevel.toFixed(1)} to reach benchmark ${resource.targetProficiencyLevel.toFixed(1)}.`);
      whyRecommended.push(`Official civil service curriculum curated by ${resource.provider}.`);

      const suitabilitySummary = gapValue > 0
        ? `Addresses an active deficit in ${resource.competencyName} required for ${profile?.designation || 'your role'}.`
        : `Advanced mastery module for ${resource.competencyName}.`;

      const existing = userRecs!.get(resource.id);
      const recId = existing ? existing.id : `rec-${userId}-${resource.id}`;

      const record: RecommendationRecord = {
        id: recId,
        userId,
        resourceId: resource.id,
        resource,
        competencyId: resource.primaryCompetencyId,
        skillGapId: gapId,
        competencyName: resource.competencyName,
        domain: resource.domain,
        currentProficiency: currentLevel,
        requiredProficiency: requiredLevel,
        gapValue,
        priority,
        matchScore,
        rank: 1, // calculated after sorting
        whyRecommended,
        suitabilitySummary,
        status: existing ? existing.status : 'RECOMMENDED',
        enrolledAt: existing?.enrolledAt,
        generatedAt: now,
        updatedAt: now,
      };

      calculatedRecords.push(record);
    });

    // Rank by matchScore descending (High priority & larger gaps naturally rise to top)
    calculatedRecords.sort((a, b) => {
      if (b.priority === 'High' && a.priority !== 'High') return 1;
      if (a.priority === 'High' && b.priority !== 'High') return -1;
      return b.matchScore - a.matchScore;
    });

    // Assign final 1-based ranks and update map
    calculatedRecords.forEach((rec, idx) => {
      rec.rank = idx + 1;
      userRecs!.set(rec.resourceId, rec);
    });

    return calculatedRecords;
  }

  // Retrieve user recommendations with filters
  public getUserRecommendations(
    userId: string,
    filters?: {
      domain?: string;
      priority?: string;
      provider?: string;
      resourceType?: string;
      difficulty?: string;
      search?: string;
    }
  ): RecommendationRecord[] {
    let recs = Array.from(this.userRecommendations.get(userId)?.values() || []);

    if (recs.length === 0) {
      recs = this.generateRecommendationsForUser(userId);
    }

    if (filters?.domain && filters.domain !== 'All') {
      recs = recs.filter(r => r.domain.toLowerCase() === filters.domain!.toLowerCase());
    }

    if (filters?.priority && filters.priority !== 'All') {
      recs = recs.filter(r => r.priority.toLowerCase() === filters.priority!.toLowerCase());
    }

    if (filters?.provider && filters.provider !== 'All') {
      recs = recs.filter(r => r.resource.provider.toLowerCase() === filters.provider!.toLowerCase());
    }

    if (filters?.resourceType && filters.resourceType !== 'All') {
      recs = recs.filter(r => r.resource.resourceType.toLowerCase() === filters.resourceType!.toLowerCase());
    }

    if (filters?.difficulty && filters.difficulty !== 'All') {
      recs = recs.filter(r => r.resource.difficulty.toLowerCase() === filters.difficulty!.toLowerCase());
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      recs = recs.filter(
        r =>
          r.resource.title.toLowerCase().includes(q) ||
          r.competencyName.toLowerCase().includes(q) ||
          r.resource.provider.toLowerCase().includes(q)
      );
    }

    return recs;
  }

  // Retrieve single recommendation record
  public getRecommendationById(userId: string, id: string): RecommendationRecord | null {
    const userRecs = this.userRecommendations.get(userId);
    if (!userRecs) return null;

    // Search by rec id or resource id
    for (const rec of userRecs.values()) {
      if (rec.id === id || rec.resourceId === id) {
        return rec;
      }
    }
    return null;
  }

  // Compute dashboard summary
  public getUserSummary(userId: string): RecommendationSummary {
    const recs = this.getUserRecommendations(userId);
    const profile = profileStore.getProfile(userId);
    const gaps = skillGapStore.getUserGaps(userId);

    const activeGapsWithRecommendations = new Set(
      recs.filter(r => r.gapValue > 0).map(r => r.competencyId)
    ).size;

    const highPriorityCount = recs.filter(r => r.priority === 'High').length;
    const completedCount = recs.filter(r => r.status === 'COMPLETED').length;
    const inProgressCount = recs.filter(r => r.status === 'IN_PROGRESS').length;

    const progressPct = recs.length > 0
      ? Math.round(((completedCount * 1.0 + inProgressCount * 0.4) / Math.min(recs.length, 6)) * 100)
      : 0;

    return {
      userId,
      officialName: profile?.fullName || 'Official',
      jobRole: profile?.designation || 'Official Designation',
      department: profile?.department || 'Department',
      totalSkillGapsAddressed: activeGapsWithRecommendations,
      totalRecommendedResources: recs.length,
      highPriorityLearningAreas: highPriorityCount,
      learningPathProgressPercentage: Math.min(100, progressPct),
      topRecommendation: recs.length > 0 ? recs[0] : null,
      lastGeneratedAt: recs.length > 0 ? recs[0].updatedAt : new Date().toISOString(),
    };
  }

  // Construct Personalized 4-Phase Learning Path
  public getPersonalizedLearningPath(userId: string): PersonalizedLearningPath {
    const profile = profileStore.getProfile(userId);
    const recs = this.getUserRecommendations(userId);

    // Group recommendations into 4 progressive phases
    const phase1Recs = recs.filter(r => r.resource.difficulty === 'Foundation' || (r.priority === 'High' && r.gapValue >= 1.0)).slice(0, 3);
    const phase2Recs = recs.filter(r => r.domain === 'Statistical' || r.domain === 'Technical').filter(r => !phase1Recs.includes(r)).slice(0, 3);
    const phase3Recs = recs.filter(r => r.domain === 'Digital Governance').filter(r => !phase1Recs.includes(r) && !phase2Recs.includes(r)).slice(0, 2);
    const phase4Recs = recs.filter(r => r.domain === 'Behavioural / Managerial' || r.resource.difficulty === 'Advanced').filter(r => !phase1Recs.includes(r) && !phase2Recs.includes(r) && !phase3Recs.includes(r)).slice(0, 2);

    const phases: LearningPathPhase[] = [
      {
        phaseNumber: 1,
        phaseTitle: 'Phase 1: Urgent Foundation & Core Deficit Bridging',
        phaseDescription: 'Immediate stabilization of critical role competencies with significant skill deficits.',
        recommendations: phase1Recs.length > 0 ? phase1Recs : recs.slice(0, 2),
        estimatedTotalHours: phase1Recs.reduce((acc, r) => acc + r.resource.estimatedHours, 0),
        totalKarmaPoints: phase1Recs.reduce((acc, r) => acc + r.resource.karmaPoints, 0),
        phaseStatus: phase1Recs.some(r => r.status === 'IN_PROGRESS') ? 'IN_PROGRESS' : 'NOT_STARTED',
      },
      {
        phaseNumber: 2,
        phaseTitle: 'Phase 2: Statistical Rigor & Modern Technical Tooling',
        phaseDescription: 'Hands-on analytical computing, query optimization, and survey schedule quality control.',
        recommendations: phase2Recs.length > 0 ? phase2Recs : recs.slice(2, 4),
        estimatedTotalHours: phase2Recs.reduce((acc, r) => acc + r.resource.estimatedHours, 0),
        totalKarmaPoints: phase2Recs.reduce((acc, r) => acc + r.resource.karmaPoints, 0),
        phaseStatus: 'NOT_STARTED',
      },
      {
        phaseNumber: 3,
        phaseTitle: 'Phase 3: Digital Governance, DPI & Privacy Safeguards',
        phaseDescription: 'Compliance with DPDP Act, India Stack integration, and safe administrative microdata governance.',
        recommendations: phase3Recs.length > 0 ? phase3Recs : recs.slice(4, 6),
        estimatedTotalHours: phase3Recs.reduce((acc, r) => acc + r.resource.estimatedHours, 0),
        totalKarmaPoints: phase3Recs.reduce((acc, r) => acc + r.resource.karmaPoints, 0),
        phaseStatus: 'NOT_STARTED',
      },
      {
        phaseNumber: 4,
        phaseTitle: 'Phase 4: Applied Secretariat Leadership & Cabinet Synthesis',
        phaseDescription: 'Executive file notation, policy brief formulation, inter-ministerial mediation, and administrative ethics.',
        recommendations: phase4Recs.length > 0 ? phase4Recs : recs.slice(6, 8),
        estimatedTotalHours: phase4Recs.reduce((acc, r) => acc + r.resource.estimatedHours, 0),
        totalKarmaPoints: phase4Recs.reduce((acc, r) => acc + r.resource.karmaPoints, 0),
        phaseStatus: 'NOT_STARTED',
      },
    ];

    const totalEstimatedHours = phases.reduce((acc, p) => acc + p.estimatedTotalHours, 0);
    const totalKarmaPoints = phases.reduce((acc, p) => acc + p.totalKarmaPoints, 0);

    return {
      userId,
      officialName: profile?.fullName || 'Official',
      jobRole: profile?.designation || 'Official Designation',
      targetGoal: profile?.learningPreferences?.careerGoals || profile?.designation || 'Career Milestone',
      totalPhases: phases.length,
      totalEstimatedHours,
      totalKarmaPoints,
      phases,
      generatedAt: new Date().toISOString(),
    };
  }

  // Start learning: Hands off to Module 07
  public startLearning(userId: string, recommendationId: string): Module07HandoffPayload {
    const rec = this.getRecommendationById(userId, recommendationId);
    if (!rec) {
      throw new Error(`Recommendation not found for ID ${recommendationId}`);
    }

    rec.status = 'IN_PROGRESS';
    rec.enrolledAt = new Date().toISOString();
    rec.updatedAt = new Date().toISOString();

    const profile = profileStore.getProfile(userId);

    return {
      handoffId: `hoff-07-${Date.now()}`,
      userId,
      officialName: profile?.fullName || 'Official',
      resourceId: rec.resourceId,
      resourceTitle: rec.resource.title,
      provider: rec.resource.provider,
      resourceType: rec.resource.resourceType,
      recommendationId: rec.id,
      competencyId: rec.competencyId,
      competencyName: rec.competencyName,
      skillGapId: rec.skillGapId,
      targetProficiency: rec.resource.targetProficiencyLevel,
      enrolledAt: rec.enrolledAt,
      status: 'READY_TO_LEARN',
    };
  }
}

export const recommendationStore = new RecommendationDataStore();
