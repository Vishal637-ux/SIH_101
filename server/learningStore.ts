/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 07: Learning Management Data Store & Service Layer
 * 
 * Responsibilities:
 * - Learner enrollment and persistent learning progress tracking
 * - Learning path aggregation from Module 05 recommendations and Module 06 external resources
 * - Internal interactive course player data (modules, practical exercises, virtual labs)
 * - Immutable learning history audit trail
 * - Assessment / Quiz handoff to Module 09 (Step 7)
 * - Grounded civil service AI learning assistant
 */

import { recommendationStore, LearningResource } from './recommendationStore.js';
import { integrationStore, NormalizedLearningResource, IntegrationSource } from './integrationStore.js';
import { profileStore } from './profileStore.js';

export type LearningStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface PracticalExercise {
  id: string;
  title: string;
  scenario: string;
  instruction: string;
  solutionHint: string;
  estimatedMinutes: number;
}

export interface LearningItemDetail {
  moduleIndex: number;
  title: string;
  durationMinutes: number;
  contentBody: string;
  keyTakeaways: string[];
  statutoryReference?: string;
  practicalExercise?: PracticalExercise;
}

export interface LearningResourceDetail extends NormalizedLearningResource {
  curriculumDetails: LearningItemDetail[];
  virtualLabSnippet?: {
    labTitle: string;
    description: string;
    interactivePrompt: string;
    sampleData: string;
  };
  quizQuestions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }>;
}

export interface LearningProgressRecord {
  id: string; // prog-{userId}-{resourceId}
  userId: string;
  resourceId: string;
  resourceTitle: string;
  source: IntegrationSource;
  provider: string;
  competencyId: string;
  competencyName: string;
  status: LearningStatus;
  progressPercentage: number; // 0 to 100
  completedModules: number[]; // indices of completed modules
  completedExercises: string[]; // IDs of completed exercises
  currentModuleIndex: number;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string;
  totalTimeSpentMinutes: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningHistoryRecord {
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle: string;
  source: IntegrationSource;
  provider: string;
  competencyId: string;
  competencyName: string;
  activityType: 'ENROLL' | 'START' | 'MODULE_COMPLETE' | 'EXERCISE_COMPLETE' | 'COURSE_COMPLETE' | 'QUIZ_HANDOFF';
  progressDelta: number;
  newProgressPercentage: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserLearningPathView {
  userId: string;
  officialName: string;
  jobRole: string;
  totalEnrolled: number;
  totalCompleted: number;
  inProgressCount: number;
  overallProgressPercentage: number;
  learningHoursLogged: number;
  phases: Array<{
    phaseNumber: number;
    phaseTitle: string;
    phaseDescription: string;
    items: Array<{
      resource: NormalizedLearningResource;
      progress: LearningProgressRecord;
      matchScore: number;
      priority: string;
    }>;
  }>;
}

// Curriculum extensions for official statistics and civil service learning
const RESOURCE_DETAILED_CONTENT: Record<string, Partial<LearningResourceDetail>> = {
  'res-stat-002': {
    curriculumDetails: [
      {
        moduleIndex: 0,
        title: 'Probability Proportional to Size (PPS) Selection Algorithms',
        durationMinutes: 90,
        contentBody: 'In large-scale multi-stage national sample surveys (such as the Periodic Labour Force Survey and NSS Consumer Expenditure Surveys), primary sampling units (villages or urban frame survey blocks) exhibit tremendous variance in measure of size (population or household counts). Equal probability selection of PSUs creates drastic sample size dispersion and unstable estimators. PPS selection utilizes Hansen-Hurwitz and Horvitz-Thompson probability formulations where the inclusion probability $\\pi_i$ of unit $i$ is proportional to its auxiliary size variable $M_i$. Systematic PPS using random starts and cumulative size ranges ensures uniform first-stage representation across demographic strata.',
        keyTakeaways: [
          'Measure of size $M_i$ must be strictly positive and updated from recent population census dockets.',
          'Inclusion probability for unit $i$ is defined as $\\pi_i = n \\times \\frac{M_i}{\\sum M_k}$.',
          'Self-weighting designs are achieved when second-stage selection probabilities balance the unequal first-stage probabilities.',
        ],
        statutoryReference: 'MoSPI NSS Survey Design Manual (Doc. No. 582, Rev. 2023)',
        practicalExercise: {
          id: 'ex-stat-002-1',
          title: 'Calculate First-Stage PPS Selection Probability for NSS FSU',
          scenario: 'A district stratum comprises 400 First Stage Units (villages) with total census households $M = 320,000$. A sample of $n = 16$ FSUs is allocated.',
          instruction: 'Compute the inclusion probability $\\pi_i$ for a village having $M_i = 4,000$ households.',
          solutionHint: '$\\pi_i = 16 \\times (4,000 / 320,000) = 16 \\times 0.0125 = 0.20$ (20% probability of selection).',
          estimatedMinutes: 20,
        },
      },
      {
        moduleIndex: 1,
        title: 'Sampling Frame Construction & Stratification',
        durationMinutes: 90,
        contentBody: 'A rigorous sampling frame forms the bedrock of official statistics. In India, the Urban Frame Survey (UFS) maps urban areas into identifiable blocks of 100-150 households, updated quinquennially by NSSO Field Operations Division. Rural frames rely on District Census Handbooks (DCHB). Stratification separates heterogeneous universes into homogeneous sub-universes (e.g. dividing districts by agro-climatic zones, altitude, or urbanization level). Within each stratum, proportional or Neyman optimum allocation ensures minimum variance for key target indicators.',
        keyTakeaways: [
          'Exhaustiveness and non-overlapping block boundaries prevent both under-coverage and duplicate listing.',
          'Neyman optimal allocation distributes sample size proportional to stratum size and stratum standard deviation: $n_h \\propto N_h S_h$.',
          'Post-stratification can rectify differential non-response biases across vulnerable sub-populations.',
        ],
        statutoryReference: 'UN Fundamental Principles of Official Statistics, Principle 3 (Methodology)',
      },
      {
        moduleIndex: 2,
        title: 'Weighting Schemes & Post-Stratification Adjustments',
        durationMinutes: 120,
        contentBody: 'Every sample record carries an inflation factor or design multiplier $W_i = 1 / \\pi_i$. When unit non-response occurs, design weights must undergo adjustment via weighting class cells or raking ratio estimation against external demographic totals (Census / Registrar General of India projections). Post-stratification aligns marginal sample distributions with known administrative benchmarks, thereby eliminating residual survey biases.',
        keyTakeaways: [
          'Design weight is the inverse of the inclusion probability: $W_{ij} = \\frac{1}{\\pi_i \\times \\pi_{j|i}}$.',
          'Non-response weight adjustment factor: $f_{nr} = \\frac{\\sum_{s} W_k}{\\sum_{resp} W_k}$.',
          'Extreme weights must be trimmed with caution to balance bias versus variance inflation.',
        ],
        statutoryReference: 'National Statistical Commission (NSC) Recommendation on Weight Calibration',
      },
      {
        moduleIndex: 3,
        title: 'Variance Estimation for Complex Survey Designs',
        durationMinutes: 120,
        contentBody: 'Standard simple random sampling variance formulas vastly underestimate standard errors in stratified cluster multi-stage designs. Design effect ($DEFF = Var_{complex} / Var_{SRS}$) frequently ranges between 1.5 and 4.0. To compute authentic confidence intervals and standard errors for official releases, resampled variance estimation—specifically Jackknife repeated replications (JRR) and balanced repeated replications (BRR)—must be systematically executed across replicate weights.',
        keyTakeaways: [
          'Ignoring cluster design induces false precision and spurious statistical significance.',
          'Design effect $DEFF = 1 + (\\bar{m} - 1)\\rho$, where $\\rho$ is the intra-cluster correlation coefficient.',
          'MoSPI publications mandate reporting Relative Standard Errors (RSE) alongside point estimates.',
        ],
        statutoryReference: 'Collection of Statistics Act, 2008 & Rules 2011',
      },
    ],
    virtualLabSnippet: {
      labTitle: 'PPS Sampling & Replicate Variance Laboratory',
      description: 'Simulate Horvitz-Thompson estimators across 1,000 synthetic PSU clusters with variable population density.',
      interactivePrompt: 'Adjust the cluster intra-correlation $\\rho$ and observe the corresponding change in Design Effect (DEFF) and 95% Confidence Intervals.',
      sampleData: 'PSU_ID: 101-140 | Households: [120, 480, 290, 850] | First-Stage Prob: [0.03, 0.12, 0.07, 0.21]',
    },
    quizQuestions: [
      {
        id: 'q-stat-002-1',
        question: 'Under what condition does PPS selection of PSUs combined with equal probability sub-sampling yield an overall self-weighting sample?',
        options: [
          'When the number of ultimate units selected from each sampled PSU is kept constant',
          'When the total population of all PSUs is strictly equal',
          'When sampling is conducted with replacement at the second stage only',
          'When non-response is exactly zero across all strata',
        ],
        correctAnswerIndex: 0,
        explanation: 'When inclusion probability at first stage is proportional to $M_i$, selecting a fixed number $m$ of units at second stage makes the overall selection probability $(n M_i / M) \\times (m / M_i) = n m / M$, which is constant across all units.',
      },
      {
        id: 'q-stat-002-2',
        question: 'What is the primary operational consequence of ignoring cluster sampling design and using SRS variance formulas for official statistics releases?',
        options: [
          'Standard errors are overestimated and confidence intervals are too wide',
          'Standard errors are underestimated, leading to spuriously narrow confidence intervals and false precision',
          'Point estimates of the population mean become severely biased',
          'Survey design weights cannot be calculated',
        ],
        correctAnswerIndex: 1,
        explanation: 'Cluster sampling almost always exhibits positive intra-cluster correlation ($\\rho > 0$), making $DEFF > 1$. Standard SRS formulas fail to capture between-cluster variance, leading to underestimated standard errors.',
      },
      {
        id: 'q-stat-002-3',
        question: 'According to MoSPI survey standards, an indicator estimate with Relative Standard Error (RSE) exceeding 30% should generally be:',
        options: [
          'Published as a flagship lead headline',
          'Flagged with an asterisk denoting unreliable sample precision or suppressed',
          'Multiplied by a correction factor of 2.0',
          'Replaced with the unweighted sample average',
        ],
        correctAnswerIndex: 1,
        explanation: 'Official statistics standards prescribe that estimates with RSE between 20% and 30% be interpreted with caution, and those exceeding 30% be suppressed or clearly footnoted as unreliable due to sample size constraints.',
      },
    ],
  },
  'res-dig-001': {
    curriculumDetails: [
      {
        moduleIndex: 0,
        title: 'Statutory Architecture of the DPDP Act 2023',
        durationMinutes: 60,
        contentBody: 'The Digital Personal Data Protection Act, 2023 establishes a statutory legal framework for the processing of digital personal data that recognizes both the right of individuals to protect their personal data and the need to process such personal data for lawful administrative and public purposes. Section 7 provides legitimate uses where processing by the State is permissible for providing subsidies, benefits, services, certificates, or licenses.',
        keyTakeaways: [
          'Clear delineation between Data Principal (citizen), Data Fiduciary (Government Department), and Data Processor.',
          'Mandate to provide itemized notice and request granular, revocable consent in multiple constitutional languages.',
          'Immunity exemptions under Section 7 strictly limited to sovereign functions and statutory benefit delivery.',
        ],
        statutoryReference: 'The Gazette of India, Act No. 22 of 2023 (DPDP Act)',
      },
      {
        moduleIndex: 1,
        title: 'Government Data Fiduciary Obligations & Citizen Rights',
        durationMinutes: 75,
        contentBody: 'Government departments acting as Significant Data Fiduciaries (SDFs) must appoint an India-based Data Protection Officer (DPO), conduct independent Data Protection Impact Assessments (DPIA), maintain comprehensive data logs, and establish an effective grievance redressal mechanism responding to citizen requests within prescribed statutory timelines.',
        keyTakeaways: [
          'Data principals hold the right to access summaries of personal data processed and identities of third parties shared.',
          'Right to correction, completion, updating, and erasure of personal data that has served its administrative purpose.',
          'Strict prohibition of behavioral tracking or targeted processing of children data under Section 9.',
        ],
        statutoryReference: 'DPDP Rules 2024 (MeitY)',
      },
      {
        moduleIndex: 2,
        title: 'Anonymization & Differential Privacy in Public Statistics',
        durationMinutes: 75,
        contentBody: 'To release public microdata and departmental statistics without breaching individual privacy, statistical agencies must deploy robust de-identification protocols. Traditional suppression of direct identifiers (names, Aadhaar numbers) is insufficient against linkage attacks. Implementing k-anonymity (k >= 5), l-diversity, and epsilon-differential privacy protects survey respondents from quasi-identifier re-identification.',
        keyTakeaways: [
          'Quasi-identifiers (age, gender, pin code, occupation) can uniquely identify individuals when cross-referenced.',
          'k-anonymity guarantees that each combination of quasi-identifiers appears at least k times in the dataset.',
          'Differential privacy injects calibrated Laplacian or Gaussian noise into summary query outputs.',
        ],
        statutoryReference: 'National Data Governance Framework Policy (NDGFP)',
      },
      {
        moduleIndex: 3,
        title: 'Incident Response & Grievance Redressal Mechanisms',
        durationMinutes: 90,
        contentBody: 'In the event of a personal data breach, Section 8(6) mandates that the Data Fiduciary notify both the Data Protection Board of India and each affected Data Principal without unreasonable delay. Standard Operating Procedures (SOP) must dictate containment within 6 hours, forensic logs isolation, and standardized breach impact assessment.',
        keyTakeaways: [
          'Immediate notification to Data Protection Board of India with details of breach vector and mitigation steps.',
          'Citizen grievance escalation matrix must resolve complaints before Board intervention.',
          'Financial penalties under Schedule 1 up to ₹250 Crores for failure to take reasonable security safeguards.',
        ],
        statutoryReference: 'CERT-In Mandate on Cyber Security Incidents & DPDP Board Directives',
      },
    ],
    quizQuestions: [
      {
        id: 'q-dig-001-1',
        question: 'Under the DPDP Act 2023, when personal data is processed by a government department for issuing a statutory pension or subsidy under Section 7, which legal ground applies?',
        options: [
          'Explicit notarized citizen consent only',
          'Certain legitimate uses specified under Section 7 of the Act',
          'Complete unconditional statutory exemption from all provisions',
          'International commercial processing ground',
        ],
        correctAnswerIndex: 1,
        explanation: 'Section 7 specifies legitimate uses where explicit consent is not required, including the provision of subsidies, benefits, certificates, and services by the State.',
      },
      {
        id: 'q-dig-001-2',
        question: 'What is the primary distinction between quasi-identifiers and direct identifiers in survey microdata?',
        options: [
          'Direct identifiers are numbers while quasi-identifiers are alphabetic',
          'Quasi-identifiers (e.g. age, pin code, occupation) do not identify a person alone, but can uniquely identify someone when linked with external public databases',
          'Quasi-identifiers can never be used in statistical tabulations',
          'Direct identifiers are protected while quasi-identifiers are freely public',
        ],
        correctAnswerIndex: 1,
        explanation: 'Quasi-identifiers such as birth date, pin code, and household size appear innocuous individually, but when combined and cross-matched against voter lists or property records, they can re-identify specific survey respondents.',
      },
    ],
  },
  'res-beh-001': {
    curriculumDetails: [
      {
        moduleIndex: 0,
        title: 'Fundamental Principles of Public Procurement (GFR Rule 144)',
        durationMinutes: 60,
        contentBody: 'Rule 144 of the General Financial Rules (GFR) 2017 outlines the fundamental principles of public buying: efficiency, economy, transparency, fairness, and prevention of corrupt practices. Every procuring officer is accountable for maintaining financial propriety akin to a person of ordinary prudence managing their own personal funds.',
        keyTakeaways: [
          'Specifications must not be tailored to benefit a particular brand, vendor, or commercial entity.',
          'Splitting tender requirements to evade financial sanction thresholds is strictly prohibited.',
          'Technical requirements must be open, competitive, and verifiable against national standards.',
        ],
        statutoryReference: 'General Financial Rules (GFR) 2017, Ministry of Finance',
      },
      {
        moduleIndex: 1,
        title: 'Government e-Marketplace (GeM 4.0) Direct Purchase & Reverse Auctions',
        durationMinutes: 90,
        contentBody: 'Rule 149 of GFR makes procurement through the Government e-Marketplace (GeM) mandatory for goods and services available on the portal. Thresholds: Direct purchase up to ₹25,000; L1 comparison amongst at least 3 manufacturers between ₹25,000 and ₹5,00,000; Electronic bidding or reverse auction above ₹5,00,000.',
        keyTakeaways: [
          'Direct purchase up to ₹25,000 permissible based on price reasonableness.',
          'Between ₹25,000 and ₹5 Lakh: L1 comparison across minimum 3 distinct manufacturers.',
          'Above ₹5 Lakh: mandatory online bidding or e-Reverse Auction with standardized SLA dockets.',
        ],
        statutoryReference: 'Cabinet Note on Mandatory Adoption of GeM for Central Ministries',
      },
    ],
    quizQuestions: [
      {
        id: 'q-beh-001-1',
        question: 'Under GFR 2017 Rule 149, what is the mandatory procurement threshold for conducting electronic bidding or reverse auction on GeM?',
        options: [
          'Above ₹25,000',
          'Above ₹1,00,000',
          'Above ₹5,00,000',
          'Above ₹50,00,000 only',
        ],
        correctAnswerIndex: 2,
        explanation: 'Under GFR Rule 149, procurement above ₹5,00,000 requires mandatory electronic bidding or reverse auction through GeM.',
      },
    ],
  },
};

class LearningDataStore {
  // Key: `${userId}:${resourceId}`
  private progressMap: Map<string, LearningProgressRecord> = new Map();
  private historyList: LearningHistoryRecord[] = [];
  private dynamicResources: Map<string, LearningResourceDetail> = new Map();

  constructor() {
    this.seedDefaultProgress();
  }

  private seedDefaultProgress() {
    // Seed initial progress for demo user off-001
    const p1: LearningProgressRecord = {
      id: 'prog-off-001-res-dig-001',
      userId: 'off-001',
      resourceId: 'res-dig-001',
      resourceTitle: 'Digital Personal Data Protection (DPDP) Act Compliance & Safeguards',
      source: 'TPAC',
      provider: 'TPAC',
      competencyId: 'comp-dig-001',
      competencyName: 'Data Privacy',
      status: 'IN_PROGRESS',
      progressPercentage: 50,
      completedModules: [0, 1],
      completedExercises: [],
      currentModuleIndex: 2,
      startedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      completedAt: null,
      lastAccessedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      totalTimeSpentMinutes: 135,
      notes: 'Reviewed statutory requirements and government fiduciary duties under DPDP Act.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    };

    const p2: LearningProgressRecord = {
      id: 'prog-off-001-res-stat-002',
      userId: 'off-001',
      resourceId: 'res-stat-002',
      resourceTitle: 'Probability Proportional to Size (PPS) & Sampling Error Estimation',
      source: 'NSSTA',
      provider: 'NSSTA',
      competencyId: 'comp-stat-002',
      competencyName: 'Sampling',
      status: 'IN_PROGRESS',
      progressPercentage: 25,
      completedModules: [0],
      completedExercises: ['ex-stat-002-1'],
      currentModuleIndex: 1,
      startedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      completedAt: null,
      lastAccessedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      totalTimeSpentMinutes: 90,
      notes: 'Completed PPS Selection Algorithms module and exercise.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    };

    this.progressMap.set('off-001:res-dig-001', p1);
    this.progressMap.set('off-001:res-stat-002', p2);

    // Initial audit logs
    this.historyList.push({
      id: 'hist-001',
      userId: 'off-001',
      resourceId: 'res-dig-001',
      resourceTitle: p1.resourceTitle,
      source: 'TPAC',
      provider: 'TPAC',
      competencyId: 'comp-dig-001',
      competencyName: 'Data Privacy',
      activityType: 'START',
      progressDelta: 25,
      newProgressPercentage: 25,
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    });

    this.historyList.push({
      id: 'hist-002',
      userId: 'off-001',
      resourceId: 'res-dig-001',
      resourceTitle: p1.resourceTitle,
      source: 'TPAC',
      provider: 'TPAC',
      competencyId: 'comp-dig-001',
      competencyName: 'Data Privacy',
      activityType: 'MODULE_COMPLETE',
      progressDelta: 25,
      newProgressPercentage: 50,
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    });

    this.historyList.push({
      id: 'hist-003',
      userId: 'off-001',
      resourceId: 'res-stat-002',
      resourceTitle: p2.resourceTitle,
      source: 'NSSTA',
      provider: 'NSSTA',
      competencyId: 'comp-stat-002',
      competencyName: 'Sampling',
      activityType: 'EXERCISE_COMPLETE',
      progressDelta: 25,
      newProgressPercentage: 25,
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    });
  }

  // 1. Get or create progress for a user and resource
  public getOrCreateProgress(userId: string, resourceId: string): LearningProgressRecord {
    const key = `${userId}:${resourceId}`;
    let prog = this.progressMap.get(key);

    if (!prog) {
      // Find resource details from recommendationStore or integrationStore
      const recResource = recommendationStore.getResourceById(resourceId);
      const intResource = integrationStore.getResourceById(resourceId);

      const title = recResource?.title || intResource?.title || 'Civil Service Learning Resource';
      const provider = recResource?.provider || intResource?.provider || 'Platform Content';
      const source: IntegrationSource =
        intResource?.source ||
        (recResource?.provider === 'iGOT Karmayogi'
          ? 'IGOT'
          : recResource?.provider === 'NSSTA'
          ? 'NSSTA'
          : recResource?.provider === 'TPAC'
          ? 'TPAC'
          : 'INTERNAL');
      const compId = recResource?.primaryCompetencyId || intResource?.primaryCompetencyId || 'comp-general';
      const compName = recResource?.competencyName || intResource?.competencyName || 'General Administration';

      const now = new Date().toISOString();
      prog = {
        id: `prog-${userId}-${resourceId}`,
        userId,
        resourceId,
        resourceTitle: title,
        source,
        provider,
        competencyId: compId,
        competencyName: compName,
        status: 'NOT_STARTED',
        progressPercentage: 0,
        completedModules: [],
        completedExercises: [],
        currentModuleIndex: 0,
        startedAt: null,
        completedAt: null,
        lastAccessedAt: now,
        totalTimeSpentMinutes: 0,
        createdAt: now,
        updatedAt: now,
      };

      this.progressMap.set(key, prog);
    }

    return prog;
  }

  // 2. Enroll official in resource
  public enrollOfficial(userId: string, resourceId: string): LearningProgressRecord {
    const prog = this.getOrCreateProgress(userId, resourceId);

    if (prog.status === 'NOT_STARTED') {
      const now = new Date().toISOString();
      prog.status = 'IN_PROGRESS';
      prog.startedAt = now;
      prog.lastAccessedAt = now;
      prog.updatedAt = now;
      this.progressMap.set(`${userId}:${resourceId}`, prog);

      // Log history
      this.logActivity(userId, prog, 'ENROLL', 0, 0);
    }

    return prog;
  }

  // 3. Update Progress (called when modules/exercises are checked, or explicit progress update)
  public updateProgress(
    userId: string,
    resourceId: string,
    updates: {
      progressPercentage?: number;
      completedModuleIndex?: number;
      completedExerciseId?: string;
      currentModuleIndex?: number;
      timeSpentDeltaMinutes?: number;
      markCompleted?: boolean;
      notes?: string;
    }
  ): LearningProgressRecord {
    const prog = this.getOrCreateProgress(userId, resourceId);
    const prevPercentage = prog.progressPercentage;
    const now = new Date().toISOString();

    if (updates.notes !== undefined) {
      prog.notes = updates.notes;
    }

    if (updates.timeSpentDeltaMinutes) {
      prog.totalTimeSpentMinutes += updates.timeSpentDeltaMinutes;
    }

    if (updates.currentModuleIndex !== undefined) {
      prog.currentModuleIndex = updates.currentModuleIndex;
    }

    let activityType: LearningHistoryRecord['activityType'] = 'START';

    if (updates.completedModuleIndex !== undefined) {
      if (!prog.completedModules.includes(updates.completedModuleIndex)) {
        prog.completedModules.push(updates.completedModuleIndex);
        prog.completedModules.sort((a, b) => a - b);
        activityType = 'MODULE_COMPLETE';
      }
    }

    if (updates.completedExerciseId) {
      if (!prog.completedExercises.includes(updates.completedExerciseId)) {
        prog.completedExercises.push(updates.completedExerciseId);
        activityType = 'EXERCISE_COMPLETE';
      }
    }

    // Auto-calculate progress percentage if not explicitly provided
    if (updates.progressPercentage !== undefined) {
      prog.progressPercentage = Math.min(100, Math.max(0, updates.progressPercentage));
    } else {
      // Calculate based on completed modules count vs total syllabus
      const resource = this.getDetailedResource(resourceId);
      const totalUnits = resource?.syllabus?.length || 4;
      const calculated = Math.round((prog.completedModules.length / totalUnits) * 100);
      prog.progressPercentage = Math.min(100, Math.max(prog.progressPercentage, calculated));
    }

    if (prog.progressPercentage > 0 && prog.status === 'NOT_STARTED') {
      prog.status = 'IN_PROGRESS';
      if (!prog.startedAt) prog.startedAt = now;
    }

    if (updates.markCompleted || prog.progressPercentage >= 100) {
      prog.status = 'COMPLETED';
      prog.progressPercentage = 100;
      prog.completedAt = now;
      activityType = 'COURSE_COMPLETE';
    }

    prog.lastAccessedAt = now;
    prog.updatedAt = now;
    this.progressMap.set(`${userId}:${resourceId}`, prog);

    const delta = prog.progressPercentage - prevPercentage;
    if (delta > 0 || activityType === 'COURSE_COMPLETE') {
      this.logActivity(userId, prog, activityType, delta, prog.progressPercentage);
    }

    return prog;
  }

  // 4. Retrieve Detailed Resource with Curriculum, Lab & Quiz
  public getDetailedResource(resourceId: string): LearningResourceDetail | null {
    if (this.dynamicResources.has(resourceId)) {
      return this.dynamicResources.get(resourceId)!;
    }

    // Check recommendationStore first
    const recRes = recommendationStore.getResourceById(resourceId);
    const intRes = integrationStore.getResourceById(resourceId);

    const baseRes = recRes || intRes;
    if (!baseRes) return null;

    const source: IntegrationSource =
      (baseRes as any).source ||
      (baseRes.provider === 'iGOT Karmayogi' ? 'IGOT' : baseRes.provider === 'NSSTA' ? 'NSSTA' : baseRes.provider === 'TPAC' ? 'TPAC' : 'INTERNAL');

    // Merge detailed content or synthesize default standard modules
    const extraContent = RESOURCE_DETAILED_CONTENT[baseRes.id] || {};

    const defaultCurriculum: LearningItemDetail[] = (baseRes.syllabus || []).map((s, idx) => ({
      moduleIndex: idx,
      title: s.title,
      durationMinutes: s.durationMinutes,
      contentBody: `Statutory framework and operational civil service guidelines for ${s.title}. This module instructs officers on compliance directives, procedural workflows, and inter-departmental documentation standards for ${baseRes.domain}.`,
      keyTakeaways: [
        `Understand statutory provisions governing ${s.title}`,
        `Apply standard operating procedures defined by ${baseRes.provider}`,
        `Maintain full audit compliance with departmental records`,
      ],
      statutoryReference: `${baseRes.provider} Official Guidelines & Administrative Manual (Sec. ${idx + 1})`,
    }));

    const defaultQuiz = [
      {
        id: `q-${baseRes.id}-1`,
        question: `What is the primary operational mandate taught in "${baseRes.title}"?`,
        options: [
          `Strict compliance with statutory administrative procedures and data integrity`,
          `Ad-hoc bypass of departmental documentation`,
          `Commercial monetization of official survey information`,
          `Elimination of quality assurance checks to accelerate timelines`,
        ],
        correctAnswerIndex: 0,
        explanation: `Civil service standards mandate strict compliance with statutory procedures, data integrity, and ethical public administration.`,
      },
      {
        id: `q-${baseRes.id}-2`,
        question: `How does proficiency in ${baseRes.competencyName} directly benefit an official's ministerial workflow?`,
        options: [
          `Ensures evidence-based file notations and audit-compliant reporting`,
          `Increases administrative paper bureaucracy without verification`,
          `Bypasses manual validation requirements`,
          `Delegates all decision-making to external consultants`,
        ],
        correctAnswerIndex: 0,
        explanation: `Evidence-based notations and audit compliance represent the foundational standard for ${baseRes.competencyName}.`,
      },
    ];

    const detailed: LearningResourceDetail = {
      id: baseRes.id,
      externalId: (baseRes as any).externalId || baseRes.id,
      source,
      title: baseRes.title,
      description: baseRes.description,
      provider: baseRes.provider as any,
      resourceType: baseRes.resourceType as any,
      primaryCompetencyId: baseRes.primaryCompetencyId,
      competencyCode: baseRes.competencyCode,
      competencyName: baseRes.competencyName,
      domain: baseRes.domain as any,
      targetProficiencyLevel: baseRes.targetProficiencyLevel,
      estimatedHours: baseRes.estimatedHours,
      difficulty: baseRes.difficulty as any,
      language: (baseRes as any).language || 'English',
      externalUrl: (baseRes as any).externalUrl || (baseRes as any).sourceUrl || 'https://igotkarmayogi.gov.in',
      learningObjectives: baseRes.learningObjectives || [],
      syllabus: baseRes.syllabus || [],
      karmaPoints: baseRes.karmaPoints || 100,
      lastSyncedAt: (baseRes as any).lastSyncedAt || new Date().toISOString(),
      isActive: true,
      syncVersion: (baseRes as any).syncVersion || 1,
      curriculumDetails: extraContent.curriculumDetails || defaultCurriculum,
      virtualLabSnippet: extraContent.virtualLabSnippet,
      quizQuestions: extraContent.quizQuestions || defaultQuiz,
    };

    return detailed;
  }

  // 5. Get User Learning Path View
  public getUserLearningPath(userId: string): UserLearningPathView {
    const profile = profileStore.getProfile(userId);
    const recPath = recommendationStore.getPersonalizedLearningPath(userId);

    const allUserProgress = this.getAllUserProgress(userId);
    const completedCount = allUserProgress.filter(p => p.status === 'COMPLETED').length;
    const inProgressCount = allUserProgress.filter(p => p.status === 'IN_PROGRESS').length;

    let totalPercentageSum = 0;
    let totalItems = 0;

    const phases = recPath.phases.map(phase => {
      const items = phase.recommendations.map(rec => {
        const progress = this.getOrCreateProgress(userId, rec.resourceId);
        totalPercentageSum += progress.progressPercentage;
        totalItems++;

        const normRes = this.getDetailedResource(rec.resourceId)!;

        return {
          resource: normRes,
          progress,
          matchScore: rec.matchScore,
          priority: rec.priority,
        };
      });

      return {
        phaseNumber: phase.phaseNumber,
        phaseTitle: phase.phaseTitle,
        phaseDescription: phase.phaseDescription,
        items,
      };
    });

    const overallProgress = totalItems > 0 ? Math.round(totalPercentageSum / totalItems) : 0;
    const totalMinutes = allUserProgress.reduce((acc, curr) => acc + (curr.totalTimeSpentMinutes || 0), 0);

    return {
      userId,
      officialName: profile ? profile.fullName : 'Civil Servant',
      jobRole: profile ? profile.jobRole : 'Official',
      totalEnrolled: allUserProgress.length,
      totalCompleted: completedCount,
      inProgressCount,
      overallProgressPercentage: overallProgress,
      learningHoursLogged: Number((totalMinutes / 60).toFixed(1)),
      phases,
    };
  }

  // 6. Get all resources with attached user progress
  public getResourcesWithProgress(
    userId: string,
    filters?: {
      source?: string;
      domain?: string;
      status?: string;
      search?: string;
    }
  ): Array<{ resource: NormalizedLearningResource; progress: LearningProgressRecord }> {
    const allNormalized = integrationStore.getNormalizedResources({
      source: filters?.source,
      domain: filters?.domain,
      search: filters?.search,
    });

    let results = allNormalized.map(res => {
      const prog = this.getOrCreateProgress(userId, res.id);
      return {
        resource: res,
        progress: prog,
      };
    });

    if (filters?.status && filters.status !== 'ALL') {
      results = results.filter(item => item.progress.status === filters.status);
    }

    return results;
  }

  // 7. Get user's learning history audit trail
  public getUserHistory(userId: string): LearningHistoryRecord[] {
    return this.historyList
      .filter(h => h.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // 8. Get all progress records for a user
  public getAllUserProgress(userId: string): LearningProgressRecord[] {
    const list: LearningProgressRecord[] = [];
    for (const [key, val] of this.progressMap.entries()) {
      if (key.startsWith(`${userId}:`)) {
        list.push(val);
      }
    }
    return list;
  }

  // Internal helper to log learning history
  private logActivity(
    userId: string,
    prog: LearningProgressRecord,
    activityType: LearningHistoryRecord['activityType'],
    progressDelta: number,
    newProgressPercentage: number,
    metadata?: Record<string, any>
  ) {
    const item: LearningHistoryRecord = {
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      resourceId: prog.resourceId,
      resourceTitle: prog.resourceTitle,
      source: prog.source,
      provider: prog.provider,
      competencyId: prog.competencyId,
      competencyName: prog.competencyName,
      activityType,
      progressDelta,
      newProgressPercentage,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.historyList.unshift(item);
    if (this.historyList.length > 200) this.historyList.pop();
  }

  // Integration with Module 08 Content Management (Add or update published resources)
  public addDynamicResource(resource: LearningResourceDetail) {
    this.dynamicResources.set(resource.id, resource);
  }

  public getResourceById(resourceId: string): LearningResourceDetail | null {
    return this.getDetailedResource(resourceId);
  }
}

export const learningStore = new LearningDataStore();
