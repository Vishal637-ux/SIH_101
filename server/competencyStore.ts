/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 03: Competency Management & Assessment Data Store
 * Architecture & Specification Compliance:
 * - 4 Official Domains: Statistical, Technical, Digital Governance, Behavioural / Managerial
 * - Versioned Competency Framework (v1.2.0)
 * - Configurable Role-to-Competency Mappings
 * - Assessment Session Lifecycle (NOT_STARTED, IN_PROGRESS, COMPLETED)
 * - Deterministic Evaluation & Competency Mapping (No mock random scores)
 * - Historical Assessment Logging (Never overwriting past attempts)
 * - Clean structured handoff to Module 04 (Skill-Gap Analysis)
 */

export type CompetencyDomain = 
  | 'Statistical'
  | 'Technical'
  | 'Digital Governance'
  | 'Behavioural / Managerial';

export type ProficiencyBand = 
  | 'Foundation'
  | 'Developing'
  | 'Competent'
  | 'Proficient'
  | 'Expert';

export interface CompetencyDefinition {
  id: string;
  code: string;
  name: string;
  domain: CompetencyDomain;
  description: string;
  standardBenchmarks: Record<number, string>; // 1 to 5 levels
  frameworkVersion: string;
  isActive: boolean;
}

export interface CompetencyRequirement {
  id: string;
  jobRole: string;
  department: string;
  competencyId: string;
  requiredProficiency: number; // 1.0 to 5.0
  priority: 'Critical' | 'Core' | 'Supportive';
  frameworkVersion: string;
}

export interface AssessmentQuestionData {
  id: string;
  question: string;
  questionType: 'MCQ' | 'SCENARIO' | 'KNOWLEDGE' | 'SKILL_APPLICATION';
  competencyId: string;
  competencyName: string;
  domain: CompetencyDomain;
  scenarioContext?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
}

export interface AssessmentSession {
  id: string;
  userId: string;
  officialName: string;
  jobRole: string;
  department: string;
  frameworkVersion: string;
  assessmentType: 'ROLE_BASELINE' | 'PERIODIC_REVIEW' | 'MODULE_EVALUATION' | 'REASSESSMENT';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  attemptNumber: number;
  competenciesCovered: Array<{
    id: string;
    name: string;
    domain: CompetencyDomain;
  }>;
  totalQuestions: number;
  answeredCount: number;
  questions: Array<{
    id: string;
    question: string;
    questionType: 'MCQ' | 'SCENARIO' | 'KNOWLEDGE' | 'SKILL_APPLICATION';
    competencyId: string;
    competencyName: string;
    domain: CompetencyDomain;
    scenarioContext?: string;
    options: string[];
    selectedAnswerIndex?: number;
    correctAnswerIndex?: number; // only populated upon completion
    isCorrect?: boolean;
    explanation?: string; // only populated upon completion
  }>;
  overallScore?: number; // 0 - 100
  startedAt: string;
  completedAt?: string;
  competencyResults?: CompetencyAssessmentResultItem[];
}

export interface CompetencyAssessmentResultItem {
  competencyId: string;
  competencyName: string;
  domain: CompetencyDomain;
  questionsCount: number;
  correctCount: number;
  scorePercentage: number;
  evaluatedProficiency: number; // 1.0 to 5.0
  proficiencyBand: ProficiencyBand;
  evidenceReference: string;
}

export interface OfficialCompetencyRecord {
  id: string;
  userId: string;
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  domain: CompetencyDomain;
  currentProficiency: number; // 1.0 to 5.0
  proficiencyBand: ProficiencyBand;
  lastAssessedAt: string;
  assessmentSessionId: string;
  attemptNumber: number;
  evidenceSummary: string;
}

export interface CompetencyHistoryRecord {
  id: string;
  userId: string;
  assessmentSessionId: string;
  attemptNumber: number;
  assessmentDate: string;
  assessmentType: string;
  overallScore: number;
  totalQuestions: number;
  correctAnswers: number;
  competencySnapshots: Array<{
    competencyId: string;
    competencyName: string;
    domain: CompetencyDomain;
    scorePercentage: number;
    proficiencyLevel: number;
    proficiencyBand: ProficiencyBand;
  }>;
}

// ============================================================================
// APPROVED COMPETENCY FRAMEWORK CATALOG (v1.2.0)
// ============================================================================

export const FRAMEWORK_VERSION = 'v1.2.0';

export const COMPETENCY_FRAMEWORK: CompetencyDefinition[] = [
  // 1. STATISTICAL DOMAIN
  {
    id: 'comp-stat-001',
    code: 'STAT-SRV-01',
    name: 'Survey Design',
    domain: 'Statistical',
    description: 'Design of national household, enterprise, and agricultural sample surveys, schedule formulation, and field instructions.',
    standardBenchmarks: {
      1: 'Familiar with standard survey questionnaire terms and field manuals.',
      2: 'Can draft survey questionnaire modules under senior statistical guidance.',
      3: 'Designs multi-stage survey schedules, pilot testing protocols, and interviewer manuals.',
      4: 'Formulates complex socio-economic survey instruments, cognitive testing, and validation logic.',
      5: 'Authoritative architect of national statistical survey frameworks adhering to UN-ISIC/SDG norms.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-stat-002',
    code: 'STAT-SMP-02',
    name: 'Sampling',
    domain: 'Statistical',
    description: 'Sample allocation, probability proportional to size (PPS), stratification, weighting, and sampling error estimation.',
    standardBenchmarks: {
      1: 'Understands basic random sampling and non-response concepts.',
      2: 'Calculates standard sample sizes for simple random and stratified samples.',
      3: 'Implements two-stage stratified sampling designs with PPS selection and design weights.',
      4: 'Executes complex domain sample allocations, post-stratification, and jackknife/bootstrap variance estimation.',
      5: 'Develops national master sampling frames (e.g., Urban Frame Survey) and international sampling methodologies.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-stat-003',
    code: 'STAT-NAC-03',
    name: 'National Accounts',
    domain: 'Statistical',
    description: 'SNA 2008 compilation, Gross State Domestic Product (GSDP), Gross Value Added (GVA), Supply-Use Tables, and capital formation.',
    standardBenchmarks: {
      1: 'Understands basic macroeconomic indicators (GDP, GVA, NDP, NNI).',
      2: 'Assists in compiling administrative data inputs and financial statement ratios.',
      3: 'Computes institutional sector accounts and GVA using MCA21, ASI, and budget dockets.',
      4: 'Reconciles Supply-Use Tables, constant vs current price deflators, and chain volume measures.',
      5: 'Leads national base year revisions and integration with UN System of National Accounts.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-stat-004',
    code: 'STAT-PRC-04',
    name: 'Price Statistics',
    domain: 'Statistical',
    description: 'Compilation of Consumer Price Index (CPI), Wholesale Price Index (WPI), Index of Industrial Production (IIP), and Laspeyres/Fisher formulas.',
    standardBenchmarks: {
      1: 'Familiar with base year concepts and monthly price collection routines.',
      2: 'Carries out price quotation validation, outlet substitution, and basic relatives.',
      3: 'Computes sub-group and headline indices using chained Laspeyres and geometric means.',
      4: 'Manages base year basket revisions, quality adjustments (hedonics), and seasonal outlier imputation.',
      5: 'National technical committee member establishing price collection standards and inflation measures.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-stat-005',
    code: 'STAT-QAL-05',
    name: 'Data Quality Frameworks',
    domain: 'Statistical',
    description: 'Adoption of UN National Quality Assurance Framework (NQAF), data audit trails, validation rules, and statistical error control.',
    standardBenchmarks: {
      1: 'Aware of data validation checks and error flagging in data entry.',
      2: 'Performs range, consistency, and logical inter-field checks in datasets.',
      3: 'Applies NQAF dimensions (relevance, accuracy, timeliness, accessibility, comparability).',
      4: 'Conducts statistical audits, data lineage verification, and non-sampling error modeling.',
      5: 'Institutionalizes National Statistical Quality Assurance Policies across all line ministries.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-stat-006',
    code: 'STAT-SDG-06',
    name: 'SDG Indicators',
    domain: 'Statistical',
    description: 'Tracking, metadata computation, and disaggregation for UN Sustainable Development Goals National Indicator Framework (NIF).',
    standardBenchmarks: {
      1: 'Familiar with 17 SDGs and national goal targets.',
      2: 'Calculates Tier-1 indicator values from official ministerial reporting.',
      3: 'Maintains National Indicator Framework datasets with geospatial and gender disaggregation.',
      4: 'Develops statistical methodologies for Tier-2 and Tier-3 proxy indicators.',
      5: 'Represents official statistics in UN-ESCAP and international SDG monitoring forums.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-stat-007',
    code: 'STAT-MET-07',
    name: 'Metadata Standards',
    domain: 'Statistical',
    description: 'Statistical Data and Metadata Exchange (SDMX), DDI, code lists, standard classifications (NIC, NCO, NPC).',
    standardBenchmarks: {
      1: 'Aware of classification codes (National Industrial Classification).',
      2: 'Maps survey items to standard codes and classifications.',
      3: 'Implements SDMX data structure definitions and metadata registry submissions.',
      4: 'Engineers automated classification crosswalks and open data metadata catalogs.',
      5: 'Leads national statistical harmonization and international SDMX interoperability.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },

  // 2. TECHNICAL DOMAIN
  {
    id: 'comp-tech-001',
    code: 'TECH-PYT-01',
    name: 'Python',
    domain: 'Technical',
    description: 'Data analysis and automation with Python (Pandas, NumPy, SciPy, Statsmodels, Matplotlib).',
    standardBenchmarks: {
      1: 'Basic syntax, data structures, and script execution.',
      2: 'Data wrangling with Pandas (filtering, merging, groupby, imputation).',
      3: 'Automated statistical pipelines, time-series modeling, and regression diagnostics.',
      4: 'Modular package development, vectorized optimization, and machine learning models.',
      5: 'Enterprise-grade microservices and high-throughput statistical compute engines.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-tech-002',
    code: 'TECH-SQL-02',
    name: 'SQL',
    domain: 'Technical',
    description: 'Relational database querying, multi-table joins, subqueries, window functions, and data warehouse aggregation.',
    standardBenchmarks: {
      1: 'Basic SELECT, WHERE, ORDER BY, and simple aggregate queries.',
      2: 'Multi-table INNER/LEFT JOINs, GROUP BY, HAVING, and standard datetime functions.',
      3: 'Complex subqueries, Common Table Expressions (CTEs), and Window Functions (ROW_NUMBER, LEAD/LAG).',
      4: 'Query optimization, indexed views, partitioned statistical warehouses, and stored procedures.',
      5: 'Database architecture, sharding, and enterprise query engine optimization.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-tech-003',
    code: 'TECH-VIS-03',
    name: 'Data Visualization',
    domain: 'Technical',
    description: 'Transforming complex administrative and survey data into clear statistical dashboards, charts, and public bulletins.',
    standardBenchmarks: {
      1: 'Generates standard bar, line, and pie charts in spreadsheet tools.',
      2: 'Creates interactive visualizations using Power BI, Tableau, or Seaborn.',
      3: 'Designs multi-dimensional policy dashboards with drill-downs and statistical confidence intervals.',
      4: 'Builds customized D3.js or Plotly dashboards with thematic cartography and real-time feeds.',
      5: 'Defines institutional visualization standards and ministerial presentation guidelines.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-tech-004',
    code: 'TECH-RST-04',
    name: 'R',
    domain: 'Technical',
    description: 'Statistical computing, survey weighting packages (survey, srvyr), ggplot2, and R Markdown reporting.',
    standardBenchmarks: {
      1: 'Executes basic R scripts, descriptive statistics, and vectors/dataframes.',
      2: 'Data manipulation with Tidyverse (dplyr, tidyr) and visualization with ggplot2.',
      3: 'Analyzes complex survey designs with svydesign, calculating weighted estimates and SE.',
      4: 'Develops Shiny web applications, custom R packages, and reproducible Quarto documents.',
      5: 'Directs statistical computing methodology across research institutes.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-tech-005',
    code: 'TECH-OPN-05',
    name: 'Open Data',
    domain: 'Technical',
    description: 'Publishing machine-readable datasets on data.gov.in, open API standards, anonymization, and data licensing.',
    standardBenchmarks: {
      1: 'Understands basic open data formats (CSV, JSON) and licensing.',
      2: 'Prepares and validates metadata for data.gov.in submissions.',
      3: 'Executes micro-data anonymization, top-coding, and k-anonymity protocols.',
      4: 'Automates Open Data pipelines via REST APIs with dynamic schema validation.',
      5: 'Frames national open data sharing policies and governance protocols.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },

  // 3. DIGITAL GOVERNANCE DOMAIN
  {
    id: 'comp-dig-001',
    code: 'DIG-PRV-01',
    name: 'Data Privacy',
    domain: 'Digital Governance',
    description: 'Compliance with Digital Personal Data Protection (DPDP) Act 2023, consent management, anonymization, and data fiduciary obligations.',
    standardBenchmarks: {
      1: 'Understands personal data definitions and privacy principles.',
      2: 'Implements consent notice workflows and purpose limitation in official forms.',
      3: 'Performs Data Protection Impact Assessments (DPIA) and breach mitigation.',
      4: 'Architects privacy-by-design systems and confidential statistical aggregation.',
      5: 'National authority framing government data protection regulations.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-dig-002',
    code: 'DIG-SEC-02',
    name: 'Cybersecurity',
    domain: 'Digital Governance',
    description: 'CERT-In guidelines, ISO 27001, access controls, multi-factor authentication, and secure government workflow protocols.',
    standardBenchmarks: {
      1: 'Follows password hygiene, phishing vigilance, and e-mail security rules.',
      2: 'Implements role-based access control (RBAC) and data classification levels.',
      3: 'Executes vulnerability remediation, audit logging, and secure file handling under e-Office.',
      4: 'Conducts security architecture reviews, threat modeling, and incident response drills.',
      5: 'Chief Information Security Officer (CISO) level governance and defensive posture.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-dig-003',
    code: 'DIG-DPI-03',
    name: 'Digital Public Infrastructure',
    domain: 'Digital Governance',
    description: 'India Stack integrations (Aadhaar, UPI, DigiLocker, CPGRAMS, e-Office, GeM 4.0, PM GatiShakti).',
    standardBenchmarks: {
      1: 'Proficient user of government portal workflows (e-Office, GeM, SPARROW).',
      2: 'Coordinates data exchange through DigiLocker and API Setu endpoints.',
      3: 'Designs end-to-end citizen service delivery leveraging DPI building blocks.',
      4: 'Architects interoperable cross-ministerial digital pipelines and service meshes.',
      5: 'National strategist for Digital India and global DPI adoption.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },

  // 4. BEHAVIOURAL / MANAGERIAL DOMAIN
  {
    id: 'comp-beh-001',
    code: 'BEH-ETH-01',
    name: 'Ethics',
    domain: 'Behavioural / Managerial',
    description: 'Adherence to Central Civil Services (Conduct) Rules 1964, impartiality, integrity, transparency, and statistical confidentiality.',
    standardBenchmarks: {
      1: 'Complies strictly with official code of conduct and confidentiality pledges.',
      2: 'Identifies potential conflicts of interest and exercises ethical discretion.',
      3: 'Champions integrity and statistical transparency in team operations and public reporting.',
      4: 'Mentors officers in complex ethical dilemmas, statutory compliance, and whistle-blower norms.',
      5: 'Institutional moral leader upholding the highest standards of democratic civil service.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-beh-002',
    code: 'BEH-COM-02',
    name: 'Communication',
    domain: 'Behavioural / Managerial',
    description: 'Precision in drafting cabinet notes, official memoranda, non-technical statistical briefs, and parliamentary replies.',
    standardBenchmarks: {
      1: 'Drafts clear official notes and routine communications following office procedure.',
      2: 'Prepares comprehensive briefing notes, meeting minutes, and factual rejoinders.',
      3: 'Translates intricate quantitative insights into crisp executive summaries for senior leadership.',
      4: 'Represents the department in inter-ministerial deliberations and media briefings.',
      5: 'Master communicator shaping national policy discourse and legislative presentations.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-beh-003',
    code: 'BEH-PRJ-03',
    name: 'Project Management',
    domain: 'Behavioural / Managerial',
    description: 'Milestone scheduling, procurement timelines under GFR 2017, resource allocation, and multi-agency coordination.',
    standardBenchmarks: {
      1: 'Tracks daily operational tasks and adheres to sectional deadlines.',
      2: 'Prepares activity Gantt charts, expenditure tracking, and procurement dossiers.',
      3: 'Manages multi-month survey or IT deployment lifecycles, risk registers, and vendor SLAs.',
      4: 'Directs multi-crore national projects, monitoring inter-dependencies and resource bottlenecks.',
      5: 'Program Director steering national transformational schemes across all states.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  },
  {
    id: 'comp-beh-004',
    code: 'BEH-DEC-04',
    name: 'Decision Making',
    domain: 'Behavioural / Managerial',
    description: 'Evidence-based judgment, risk appraisal, regulatory compliance, and timely administrative problem solving.',
    standardBenchmarks: {
      1: 'Escalates issues with relevant factual data and policy references.',
      2: 'Evaluates straightforward administrative options against rules and precedents.',
      3: 'Takes decisive action in ambiguous operational scenarios balancing rules with public interest.',
      4: 'Solves systemic bottlenecks by formulating novel operational guidelines and workflow reforms.',
      5: 'Strategic crisis manager and high-level arbitrator in inter-departmental disputes.'
    },
    frameworkVersion: FRAMEWORK_VERSION,
    isActive: true,
  }
];

// ============================================================================
// CONFIGURABLE ROLE-TO-COMPETENCY REQUIREMENTS MAPPING
// ============================================================================

export const ROLE_REQUIREMENTS: CompetencyRequirement[] = [
  // Role: Assistant Section Officer (ASO)
  { id: 'req-aso-01', jobRole: 'Assistant Section Officer (ASO)', department: 'Department of Administrative Reforms & Public Grievances (DARPG)', competencyId: 'comp-stat-005', requiredProficiency: 3.5, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-aso-02', jobRole: 'Assistant Section Officer (ASO)', department: 'Department of Administrative Reforms & Public Grievances (DARPG)', competencyId: 'comp-tech-002', requiredProficiency: 3.0, priority: 'Core', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-aso-03', jobRole: 'Assistant Section Officer (ASO)', department: 'Department of Administrative Reforms & Public Grievances (DARPG)', competencyId: 'comp-tech-003', requiredProficiency: 3.2, priority: 'Core', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-aso-04', jobRole: 'Assistant Section Officer (ASO)', department: 'Department of Administrative Reforms & Public Grievances (DARPG)', competencyId: 'comp-dig-001', requiredProficiency: 3.8, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-aso-05', jobRole: 'Assistant Section Officer (ASO)', department: 'Department of Administrative Reforms & Public Grievances (DARPG)', competencyId: 'comp-dig-002', requiredProficiency: 3.5, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-aso-06', jobRole: 'Assistant Section Officer (ASO)', department: 'Department of Administrative Reforms & Public Grievances (DARPG)', competencyId: 'comp-dig-003', requiredProficiency: 4.0, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-aso-07', jobRole: 'Assistant Section Officer (ASO)', department: 'Department of Administrative Reforms & Public Grievances (DARPG)', competencyId: 'comp-beh-001', requiredProficiency: 4.0, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-aso-08', jobRole: 'Assistant Section Officer (ASO)', department: 'Department of Administrative Reforms & Public Grievances (DARPG)', competencyId: 'comp-beh-002', requiredProficiency: 3.8, priority: 'Core', frameworkVersion: FRAMEWORK_VERSION },

  // Role: Statistical Analyst / Assistant Director (Statistics)
  { id: 'req-stat-01', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-stat-001', requiredProficiency: 4.0, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-stat-02', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-stat-002', requiredProficiency: 4.0, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-stat-03', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-stat-003', requiredProficiency: 3.5, priority: 'Core', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-stat-04', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-stat-005', requiredProficiency: 4.2, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-stat-05', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-tech-001', requiredProficiency: 3.8, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-stat-06', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-tech-002', requiredProficiency: 4.0, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-stat-07', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-tech-003', requiredProficiency: 3.8, priority: 'Core', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-stat-08', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-dig-001', requiredProficiency: 3.5, priority: 'Core', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-stat-09', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-beh-002', requiredProficiency: 3.5, priority: 'Core', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-stat-10', jobRole: 'Statistical Analyst', department: 'National Statistical Office (NSO)', competencyId: 'comp-beh-004', requiredProficiency: 3.5, priority: 'Core', frameworkVersion: FRAMEWORK_VERSION },

  // Role: Deputy Secretary / Director
  { id: 'req-ds-01', jobRole: 'Deputy Secretary', department: 'Ministry of Statistics and Programme Implementation (MoSPI)', competencyId: 'comp-stat-003', requiredProficiency: 4.2, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-ds-02', jobRole: 'Deputy Secretary', department: 'Ministry of Statistics and Programme Implementation (MoSPI)', competencyId: 'comp-stat-006', requiredProficiency: 4.0, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-ds-03', jobRole: 'Deputy Secretary', department: 'Ministry of Statistics and Programme Implementation (MoSPI)', competencyId: 'comp-tech-003', requiredProficiency: 4.0, priority: 'Core', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-ds-04', jobRole: 'Deputy Secretary', department: 'Ministry of Statistics and Programme Implementation (MoSPI)', competencyId: 'comp-dig-001', requiredProficiency: 4.5, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-ds-05', jobRole: 'Deputy Secretary', department: 'Ministry of Statistics and Programme Implementation (MoSPI)', competencyId: 'comp-dig-003', requiredProficiency: 4.5, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-ds-06', jobRole: 'Deputy Secretary', department: 'Ministry of Statistics and Programme Implementation (MoSPI)', competencyId: 'comp-beh-001', requiredProficiency: 4.8, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-ds-07', jobRole: 'Deputy Secretary', department: 'Ministry of Statistics and Programme Implementation (MoSPI)', competencyId: 'comp-beh-003', requiredProficiency: 4.5, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION },
  { id: 'req-ds-08', jobRole: 'Deputy Secretary', department: 'Ministry of Statistics and Programme Implementation (MoSPI)', competencyId: 'comp-beh-004', requiredProficiency: 4.5, priority: 'Critical', frameworkVersion: FRAMEWORK_VERSION }
];

// ============================================================================
// OFFICIAL ASSESSMENT QUESTION BANK (Statutory, Scenario, Technical, Digital)
// ============================================================================

export const QUESTION_BANK: AssessmentQuestionData[] = [
  // 1. STATISTICAL - Data Quality Frameworks
  {
    id: 'q-stat-01',
    question: 'Under the UN National Quality Assurance Framework (NQAF) adopted by MoSPI, what is the primary prerequisite before releasing official sample survey results?',
    questionType: 'KNOWLEDGE',
    competencyId: 'comp-stat-005',
    competencyName: 'Data Quality Frameworks',
    domain: 'Statistical',
    scenarioContext: 'An official statistics division is finalizing the Periodic Labour Force Survey (PLFS) quarterly bulletin.',
    options: [
      'Publishing raw unedited microdata directly on social media.',
      'Reconciliation against non-sampling error parameters, design weights, and variance boundary audits.',
      'Awaiting prior informal verbal clearance from non-statistical commercial stakeholders.',
      'Overwriting outlier observations with the arithmetic mean without recording imputation flags.'
    ],
    correctIndex: 1,
    explanation: 'NQAF mandates transparent quality control, documented sampling weights reconciliation, and clear imputation logs for non-sampling errors.',
    difficultyLevel: 3,
  },
  {
    id: 'q-stat-02',
    question: 'When an administrative data source exhibits inconsistent categorical classifications across quarters, what is the standard statistical remedy?',
    questionType: 'SCENARIO',
    competencyId: 'comp-stat-005',
    competencyName: 'Data Quality Frameworks',
    domain: 'Statistical',
    scenarioContext: 'Quarterly enterprise registrations in an administrative portal changed activity categorization codes midway through the financial year.',
    options: [
      'Discard all prior quarterly series and report only the current single month.',
      'Develop an official classification correspondence table (crosswalk) and apply dual-reporting during transition.',
      'Manually guess codes without publishing a methodological footnote.',
      'Force all entries into an arbitrary catch-all "Others" code.'
    ],
    correctIndex: 1,
    explanation: 'Methodological continuity requires formal classification crosswalks and dual-reporting footnotes to preserve time-series comparability.',
    difficultyLevel: 3,
  },

  // 2. TECHNICAL - SQL
  {
    id: 'q-tech-01',
    question: 'Which SQL clause is strictly required to partition calculation windows across administrative zones while retaining individual record granularity?',
    questionType: 'SKILL_APPLICATION',
    competencyId: 'comp-tech-002',
    competencyName: 'SQL',
    domain: 'Technical',
    scenarioContext: 'A reporting officer needs to calculate each district’s grievance disposal rank within its respective state without collapsing rows into a single group.',
    options: [
      'GROUP BY state_id HAVING count(*) > 1',
      'OVER (PARTITION BY state_id ORDER BY disposal_days ASC)',
      'ORDER BY state_id CASCADE',
      'WHERE state_id IN (SELECT DISTINCT state_id FROM records)'
    ],
    correctIndex: 1,
    explanation: 'SQL Window Functions use the OVER (PARTITION BY ... ORDER BY ...) clause to compute rankings and aggregates per group while maintaining individual row details.',
    difficultyLevel: 3,
  },
  {
    id: 'q-tech-02',
    question: 'When joining a master civil registry table of 10 million citizens with a monthly welfare benefit receipt table, what ensures optimal query performance in PostgreSQL?',
    questionType: 'SKILL_APPLICATION',
    competencyId: 'comp-tech-002',
    competencyName: 'SQL',
    domain: 'Technical',
    scenarioContext: 'Executing large-scale data matching between scheme beneficiaries and the civil service registry.',
    options: [
      'Disabling all indexes on foreign keys to save storage.',
      'Ensuring composite B-Tree indexes on join keys and reviewing the EXPLAIN ANALYZE execution plan.',
      'Using SELECT * with multiple CROSS JOIN clauses.',
      'Running sequential table scans without an indexed foreign key.'
    ],
    correctIndex: 1,
    explanation: 'Optimal join performance requires indexed join attributes and query plan inspection via EXPLAIN ANALYZE to avoid expensive sequential disk scans.',
    difficultyLevel: 4,
  },

  // 3. TECHNICAL - Data Visualization
  {
    id: 'q-tech-03',
    question: 'In a high-level ministerial dashboard displaying 5-year public expenditure trends alongside 95% confidence intervals, which visual representation is statistically appropriate?',
    questionType: 'SKILL_APPLICATION',
    competencyId: 'comp-tech-003',
    competencyName: 'Data Visualization',
    domain: 'Technical',
    scenarioContext: 'Drafting visual exhibits for the Annual Departmental Performance Appraisal.',
    options: [
      'A 3D pie chart with exploding slices and heavy drop shadows.',
      'A continuous time-series line chart with shaded confidence bands or error bars clearly labeled with unit scales.',
      'A decorative radar chart with unlabeled concentric circles.',
      'A doughnut chart with 35 colored categories.'
    ],
    correctIndex: 1,
    explanation: 'Continuous time-series with transparent error bands maintain data-ink ratio integrity and accurately portray uncertainty without 3D distortions.',
    difficultyLevel: 3,
  },

  // 4. DIGITAL GOVERNANCE - Data Privacy (DPDP Act 2023)
  {
    id: 'q-dig-01',
    question: 'Under Section 6 of the Digital Personal Data Protection (DPDP) Act 2023, what constitutes valid consent when collecting citizen information for a digital public grievance service?',
    questionType: 'KNOWLEDGE',
    competencyId: 'comp-dig-001',
    competencyName: 'Data Privacy',
    domain: 'Digital Governance',
    scenarioContext: 'Redesigning the user registration and verification form on a citizen portal.',
    options: [
      'A pre-ticked checkbox hidden within a 50-page terms and conditions document.',
      'Free, specific, informed, unconditional, and unambiguous agreement with a clear notice specifying the exact purpose.',
      'Implied consent assumed whenever any citizen visits the government website URL.',
      'Verbal understanding without any audit trail or timestamp.'
    ],
    correctIndex: 1,
    explanation: 'Section 6 of the DPDP Act 2023 requires that consent must be free, specific, informed, unconditional, and an unambiguous indication of the Data Principal’s wishes.',
    difficultyLevel: 3,
  },
  {
    id: 'q-dig-02',
    question: 'A government department suffers an accidental leakage of personal citizen survey identifiers. As a Data Fiduciary under the DPDP Act 2023, what is the mandatory immediate action?',
    questionType: 'SCENARIO',
    competencyId: 'comp-dig-001',
    competencyName: 'Data Privacy',
    domain: 'Digital Governance',
    scenarioContext: 'An unsecured database backup was temporarily exposed during a server migration.',
    options: [
      'Quietly delete the backup log files and ignore the incident.',
      'Notify the Data Protection Board of India and affected Data Principals in the prescribed form and manner.',
      'Publish an announcement in an offline newspaper after six months.',
      'Blame the third-party hardware vendor without conducting any internal remediation.'
    ],
    correctIndex: 1,
    explanation: 'The DPDP Act mandates immediate breach intimation to the Data Protection Board of India and each affected individual upon discovering a personal data breach.',
    difficultyLevel: 4,
  },

  // 5. DIGITAL GOVERNANCE - Digital Public Infrastructure & Cybersecurity
  {
    id: 'q-dig-03',
    question: 'Under CERT-In cyber security guidelines and Government of India e-mail policy, what is the required protocol for transmitting classified official draft cabinet proposals?',
    questionType: 'KNOWLEDGE',
    competencyId: 'comp-dig-002',
    competencyName: 'Cybersecurity',
    domain: 'Digital Governance',
    scenarioContext: 'Inter-ministerial consultation on a secret cabinet memorandum.',
    options: [
      'Sending documents as unencrypted attachments via commercial public webmail services (e.g. Gmail/Yahoo).',
      'Using designated secure NIC e-Office infrastructure with digital signature token authentication and encryption.',
      'Sharing links via public unauthenticated cloud drives.',
      'Photocopying files and leaving them unattended in shared office hallways.'
    ],
    correctIndex: 1,
    explanation: 'Official communications of classified nature must strictly use secure NIC Gov email/e-Office infrastructure with 2FA/Digital Signatures (DSC) pursuant to DoPT security protocols.',
    difficultyLevel: 3,
  },
  {
    id: 'q-dig-04',
    question: 'In the context of India Stack and Digital Public Infrastructure, what role does DigiLocker / API Setu play in citizen service verification?',
    questionType: 'KNOWLEDGE',
    competencyId: 'comp-dig-003',
    competencyName: 'Digital Public Infrastructure',
    domain: 'Digital Governance',
    scenarioContext: 'Modernizing citizen welfare verification.',
    options: [
      'It acts as a physical courier service for notarized paper affidavits.',
      'It provides paperless, consent-driven electronic document issuance and real-time algorithmic verification directly from trusted issuer repositories.',
      'It permanently locks all citizen records from any administrative access.',
      'It replaces judicial courts in arbitrating property deeds.'
    ],
    correctIndex: 1,
    explanation: 'DigiLocker and API Setu enable consent-based, machine-readable digital credential verification directly from the original statutory issuer.',
    difficultyLevel: 2,
  },

  // 6. BEHAVIOURAL / MANAGERIAL - Ethics & Decision Making
  {
    id: 'q-beh-01',
    question: 'According to Central Civil Services (Conduct) Rules 1964, what must a government official do if a procurement tender involves a commercial supplier owned by a close personal relative?',
    questionType: 'SCENARIO',
    competencyId: 'comp-beh-001',
    competencyName: 'Ethics',
    domain: 'Behavioural / Managerial',
    scenarioContext: 'An official is assigned as the convener of a Departmental Purchase Committee under Rule 149 of GFR 2017.',
    options: [
      'Approve the lowest bid quietly without disclosing the conflict of interest.',
      'Formally recuse oneself in writing from the evaluation committee and submit the matter to the competent sanctioning authority.',
      'Advise the relative to change their business name to avoid detection.',
      'Demand personal commissions in exchange for expedited file clearance.'
    ],
    correctIndex: 1,
    explanation: 'Rule 4 of the CCS (Conduct) Rules explicitly requires full transparent disclosure and recusal whenever an officer’s official decision affects relatives.',
    difficultyLevel: 2,
  },
  {
    id: 'q-beh-02',
    question: 'An urgent parliamentary question requires data on public grievance disposal within 24 hours. The primary database displays an unexplained anomaly in the resolved count. What is the most responsible course of action?',
    questionType: 'SCENARIO',
    competencyId: 'comp-beh-004',
    competencyName: 'Decision Making',
    domain: 'Behavioural / Managerial',
    scenarioContext: 'Preparing an urgent Starred Parliament Question reply under strict timeline.',
    options: [
      'Fabricate an estimated number that sounds pleasing to avoid inquiry.',
      'Immediately isolate the anomalous query filter, consult system database logs to reconcile verified counts, and submit the vetted data with an explanatory briefing note.',
      'Refuse to answer the parliamentary question entirely.',
      'Forward conflicting numbers without any verification or explanatory caveat.'
    ],
    correctIndex: 1,
    explanation: 'Integrity in parliamentary reporting demands immediate data verification, root-cause diagnostics, and transparent technical reconciliation with senior leadership.',
    difficultyLevel: 3,
  },
  {
    id: 'q-beh-03',
    question: 'When drafting a non-technical summary of a complex statistical study for the Joint Secretary, which communication approach is recommended?',
    questionType: 'KNOWLEDGE',
    competencyId: 'comp-beh-002',
    competencyName: 'Communication',
    domain: 'Behavioural / Managerial',
    scenarioContext: 'Preparing an executive decision note for administrative policy reform.',
    options: [
      'Copy-pasting 80 pages of raw mathematical formulas without executive conclusions.',
      'Synthesizing core findings into bulleted policy implications, key quantitative metrics, and actionable recommendations with clear cross-references.',
      'Omitting all quantitative evidence and writing vague poetic prose.',
      'Using undefined statistical acronyms without standard glossary definitions.'
    ],
    correctIndex: 1,
    explanation: 'Effective civil service communication requires crisp synthesis, evidence-backed recommendations, and structured brevity for executive decision-makers.',
    difficultyLevel: 2,
  }
];

// Helper to determine proficiency band from numeric level
export function getProficiencyBand(level: number): ProficiencyBand {
  if (level >= 4.5) return 'Expert';
  if (level >= 3.8) return 'Proficient';
  if (level >= 2.8) return 'Competent';
  if (level >= 1.8) return 'Developing';
  return 'Foundation';
}

// In-Memory Database Storage for Module 03
class CompetencyDataStore {
  private framework: CompetencyDefinition[] = [...COMPETENCY_FRAMEWORK];
  private requirements: CompetencyRequirement[] = [...ROLE_REQUIREMENTS];
  private questions: AssessmentQuestionData[] = [...QUESTION_BANK];

  // Sessions map: sessionId -> AssessmentSession
  private sessions: Map<string, AssessmentSession> = new Map();

  // Official competencies map: userId -> OfficialCompetencyRecord[]
  private officialCompetencies: Map<string, OfficialCompetencyRecord[]> = new Map();

  // Competency history map: userId -> CompetencyHistoryRecord[]
  private competencyHistory: Map<string, CompetencyHistoryRecord[]> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed initial baseline competencies for default official "off-001" (Rajesh Sharma)
    const initialRecordsOff001: OfficialCompetencyRecord[] = [
      {
        id: 'oc-001-stat-05',
        userId: 'off-001',
        competencyId: 'comp-stat-005',
        competencyCode: 'STAT-QAL-05',
        competencyName: 'Data Quality Frameworks',
        domain: 'Statistical',
        currentProficiency: 2.8,
        proficiencyBand: 'Competent',
        lastAssessedAt: '2026-08-15T10:30:00Z',
        assessmentSessionId: 'sess-init-001',
        attemptNumber: 1,
        evidenceSummary: 'Initial Baseline Diagnostic Assessment'
      },
      {
        id: 'oc-001-tech-02',
        userId: 'off-001',
        competencyId: 'comp-tech-002',
        competencyCode: 'TECH-SQL-02',
        competencyName: 'SQL',
        domain: 'Technical',
        currentProficiency: 2.5,
        proficiencyBand: 'Developing',
        lastAssessedAt: '2026-08-15T10:30:00Z',
        assessmentSessionId: 'sess-init-001',
        attemptNumber: 1,
        evidenceSummary: 'Initial Baseline Diagnostic Assessment'
      },
      {
        id: 'oc-001-tech-03',
        userId: 'off-001',
        competencyId: 'comp-tech-003',
        competencyCode: 'TECH-VIS-03',
        competencyName: 'Data Visualization',
        domain: 'Technical',
        currentProficiency: 3.0,
        proficiencyBand: 'Competent',
        lastAssessedAt: '2026-08-15T10:30:00Z',
        assessmentSessionId: 'sess-init-001',
        attemptNumber: 1,
        evidenceSummary: 'Initial Baseline Diagnostic Assessment'
      },
      {
        id: 'oc-001-dig-01',
        userId: 'off-001',
        competencyId: 'comp-dig-001',
        competencyCode: 'DIG-PRV-01',
        competencyName: 'Data Privacy',
        domain: 'Digital Governance',
        currentProficiency: 2.7,
        proficiencyBand: 'Developing',
        lastAssessedAt: '2026-08-15T10:30:00Z',
        assessmentSessionId: 'sess-init-001',
        attemptNumber: 1,
        evidenceSummary: 'Initial Baseline Diagnostic Assessment'
      },
      {
        id: 'oc-001-dig-02',
        userId: 'off-001',
        competencyId: 'comp-dig-002',
        competencyCode: 'DIG-SEC-02',
        competencyName: 'Cybersecurity',
        domain: 'Digital Governance',
        currentProficiency: 3.2,
        proficiencyBand: 'Competent',
        lastAssessedAt: '2026-08-15T10:30:00Z',
        assessmentSessionId: 'sess-init-001',
        attemptNumber: 1,
        evidenceSummary: 'Initial Baseline Diagnostic Assessment'
      },
      {
        id: 'oc-001-dig-03',
        userId: 'off-001',
        competencyId: 'comp-dig-003',
        competencyCode: 'DIG-DPI-03',
        competencyName: 'Digital Public Infrastructure',
        domain: 'Digital Governance',
        currentProficiency: 3.4,
        proficiencyBand: 'Competent',
        lastAssessedAt: '2026-08-15T10:30:00Z',
        assessmentSessionId: 'sess-init-001',
        attemptNumber: 1,
        evidenceSummary: 'Initial Baseline Diagnostic Assessment'
      },
      {
        id: 'oc-001-beh-01',
        userId: 'off-001',
        competencyId: 'comp-beh-001',
        competencyCode: 'BEH-ETH-01',
        competencyName: 'Ethics',
        domain: 'Behavioural / Managerial',
        currentProficiency: 3.8,
        proficiencyBand: 'Proficient',
        lastAssessedAt: '2026-08-15T10:30:00Z',
        assessmentSessionId: 'sess-init-001',
        attemptNumber: 1,
        evidenceSummary: 'Initial Baseline Diagnostic Assessment'
      },
      {
        id: 'oc-001-beh-02',
        userId: 'off-001',
        competencyId: 'comp-beh-002',
        competencyCode: 'BEH-COM-02',
        competencyName: 'Communication',
        domain: 'Behavioural / Managerial',
        currentProficiency: 3.2,
        proficiencyBand: 'Competent',
        lastAssessedAt: '2026-08-15T10:30:00Z',
        assessmentSessionId: 'sess-init-001',
        attemptNumber: 1,
        evidenceSummary: 'Initial Baseline Diagnostic Assessment'
      }
    ];

    this.officialCompetencies.set('off-001', initialRecordsOff001);

    // Seed history record
    const historyItem: CompetencyHistoryRecord = {
      id: 'hist-001',
      userId: 'off-001',
      assessmentSessionId: 'sess-init-001',
      attemptNumber: 1,
      assessmentDate: '2026-08-15T10:30:00Z',
      assessmentType: 'ROLE_BASELINE',
      overallScore: 68,
      totalQuestions: 10,
      correctAnswers: 7,
      competencySnapshots: initialRecordsOff001.map(r => ({
        competencyId: r.competencyId,
        competencyName: r.competencyName,
        domain: r.domain,
        scorePercentage: Math.round((r.currentProficiency / 5.0) * 100),
        proficiencyLevel: r.currentProficiency,
        proficiencyBand: r.proficiencyBand
      }))
    };

    this.competencyHistory.set('off-001', [historyItem]);
  }

  // Retrieve full framework
  public getFramework() {
    return {
      version: FRAMEWORK_VERSION,
      updatedAt: '2026-09-26T00:00:00Z',
      domains: [
        {
          name: 'Statistical',
          description: 'Survey methodology, sampling theory, national accounts, price statistics, and data quality assurance.',
          competencyCount: this.framework.filter(c => c.domain === 'Statistical').length,
        },
        {
          name: 'Technical',
          description: 'Data analytics, programming (Python, R, SQL), visualization, and data warehousing.',
          competencyCount: this.framework.filter(c => c.domain === 'Technical').length,
        },
        {
          name: 'Digital Governance',
          description: 'Data privacy, DPDP compliance, cybersecurity, government cloud, and Digital Public Infrastructure.',
          competencyCount: this.framework.filter(c => c.domain === 'Digital Governance').length,
        },
        {
          name: 'Behavioural / Managerial',
          description: 'Civil service ethics, administrative communication, project execution, and decision-making.',
          competencyCount: this.framework.filter(c => c.domain === 'Behavioural / Managerial').length,
        }
      ],
      competencies: this.framework
    };
  }

  // Retrieve role requirements mapped to role
  public getRoleRequirements(jobRole?: string, department?: string): CompetencyRequirement[] {
    const roleStr = String(jobRole || '').toLowerCase();
    const matched = this.requirements.filter(r => 
      r.jobRole.toLowerCase() === roleStr ||
      (roleStr && roleStr.includes(r.jobRole.toLowerCase()))
    );

    if (matched.length > 0) return matched;

    // Fallback to Assistant Section Officer requirements
    return this.requirements.filter(r => r.jobRole.includes('Assistant Section Officer'));
  }

  // Get questions list
  public getQuestions(): AssessmentQuestionData[] {
    return this.questions;
  }

  // Get current competencies for official
  public getOfficialCompetencies(userId: string): OfficialCompetencyRecord[] {
    return this.officialCompetencies.get(userId) || [];
  }

  // Get assessment history for official
  public getOfficialHistory(userId: string): CompetencyHistoryRecord[] {
    return this.competencyHistory.get(userId) || [];
  }

  // Start or resume an assessment session
  public createAssessmentSession(params: {
    userId: string;
    officialName: string;
    jobRole: string;
    department: string;
    assessmentType?: 'ROLE_BASELINE' | 'PERIODIC_REVIEW' | 'MODULE_EVALUATION' | 'REASSESSMENT';
    domain?: CompetencyDomain;
  }): AssessmentSession {
    const { userId, officialName, jobRole, department, assessmentType = 'REASSESSMENT', domain } = params;

    // Determine past attempts
    const history = this.getOfficialHistory(userId);
    const attemptNumber = history.length + 1;

    let competenciesList: CompetencyDefinition[] = [];
    let selectedQuestions: AssessmentQuestionData[] = [];

    if (domain) {
      // Filter competencies and questions by domain
      competenciesList = this.framework.filter(c => c.domain === domain);
      selectedQuestions = this.questions.filter(q => q.domain === domain);
    } else {
      // Identify role-mapped competencies
      const requirements = this.getRoleRequirements(jobRole, department);
      const requiredCompIds = new Set(requirements.map(r => r.competencyId));

      const relevantCompetencies = this.framework.filter(c => requiredCompIds.has(c.id));
      competenciesList = relevantCompetencies.length > 0 ? relevantCompetencies : this.framework.slice(0, 6);

      for (const comp of competenciesList) {
        const compQuestions = this.questions.filter(q => q.competencyId === comp.id);
        if (compQuestions.length > 0) {
          selectedQuestions.push(...compQuestions);
        }
      }

      if (selectedQuestions.length < 6) {
        for (const q of this.questions) {
          if (!selectedQuestions.some(sq => sq.id === q.id)) {
            selectedQuestions.push(q);
            if (selectedQuestions.length >= 8) break;
          }
        }
      }
    }

    const sessionId = `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const session: AssessmentSession = {
      id: sessionId,
      userId,
      officialName,
      jobRole,
      department,
      frameworkVersion: FRAMEWORK_VERSION,
      assessmentType,
      status: 'IN_PROGRESS',
      attemptNumber,
      competenciesCovered: competenciesList.map(c => ({ id: c.id, name: c.name, domain: c.domain })),
      totalQuestions: selectedQuestions.length,
      answeredCount: 0,
      questions: selectedQuestions.map(q => ({
        id: q.id,
        question: q.question,
        questionType: q.questionType,
        competencyId: q.competencyId,
        competencyName: q.competencyName,
        domain: q.domain,
        scenarioContext: q.scenarioContext,
        options: [...q.options],
        selectedAnswerIndex: undefined,
        correctAnswerIndex: undefined,
        isCorrect: undefined,
        explanation: undefined
      })),
      startedAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // Get assessment session by ID
  public getAssessmentSession(sessionId: string, userId: string, maskAnswers = true): AssessmentSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (session.userId !== userId) return null; // Security check

    if (maskAnswers && session.status !== 'COMPLETED') {
      return {
        ...session,
        questions: session.questions.map(q => ({
          ...q,
          correctAnswerIndex: undefined,
          isCorrect: undefined,
          explanation: undefined
        }))
      };
    }

    return session;
  }

  // Record an answer
  public recordAnswer(sessionId: string, userId: string, questionId: string, selectedIndex: number): AssessmentSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found.');
    if (session.userId !== userId) throw new Error('Unauthorized session access.');
    if (session.status === 'COMPLETED') throw new Error('Assessment already submitted.');

    const q = session.questions.find(item => item.id === questionId);
    if (!q) throw new Error('Question not found in session.');

    if (selectedIndex < 0 || selectedIndex >= q.options.length) {
      throw new Error('Invalid option index.');
    }

    const wasUnanswered = q.selectedAnswerIndex === undefined;
    q.selectedAnswerIndex = selectedIndex;

    if (wasUnanswered) {
      session.answeredCount = session.questions.filter(item => item.selectedAnswerIndex !== undefined).length;
    }

    return session;
  }

  // Complete and evaluate assessment
  public completeAssessment(sessionId: string, userId: string): AssessmentSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found.');
    if (session.userId !== userId) throw new Error('Unauthorized session access.');
    if (session.status === 'COMPLETED') return session;

    let totalCorrect = 0;
    const competencyStats: Map<string, {
      id: string;
      name: string;
      domain: CompetencyDomain;
      total: number;
      correct: number;
    }> = new Map();

    // Map each question back to question bank for correct evaluation
    session.questions.forEach(sessionQ => {
      const bankQ = this.questions.find(bq => bq.id === sessionQ.id);
      const correctIdx = bankQ ? bankQ.correctIndex : 0;
      const isCorrect = sessionQ.selectedAnswerIndex === correctIdx;

      sessionQ.correctAnswerIndex = correctIdx;
      sessionQ.isCorrect = isCorrect;
      sessionQ.explanation = bankQ?.explanation || 'Standard civil service protocol.';

      if (isCorrect) totalCorrect++;

      const compId = sessionQ.competencyId;
      if (!competencyStats.has(compId)) {
        competencyStats.set(compId, {
          id: compId,
          name: sessionQ.competencyName,
          domain: sessionQ.domain,
          total: 0,
          correct: 0
        });
      }
      const stat = competencyStats.get(compId)!;
      stat.total++;
      if (isCorrect) stat.correct++;
    });

    const overallScore = Math.round((totalCorrect / Math.max(session.totalQuestions, 1)) * 100);

    // Build competency-wise results
    const results: CompetencyAssessmentResultItem[] = [];
    const updatedRecords: OfficialCompetencyRecord[] = [];

    // Get current records to update or create
    const existingRecords = this.getOfficialCompetencies(userId);
    const existingMap = new Map(existingRecords.map(r => [r.competencyId, r]));

    competencyStats.forEach((stat, compId) => {
      const scorePct = Math.round((stat.correct / Math.max(stat.total, 1)) * 100);

      // Deterministic competency mapping calculation:
      // Score 0-20% -> 1.5 - 2.0 (Foundation)
      // Score 21-50% -> 2.2 - 2.8 (Developing)
      // Score 51-75% -> 3.0 - 3.7 (Competent)
      // Score 76-90% -> 3.8 - 4.4 (Proficient)
      // Score 91-100% -> 4.5 - 5.0 (Expert)
      let calculatedLevel: number;
      if (scorePct >= 90) calculatedLevel = 4.8;
      else if (scorePct >= 75) calculatedLevel = 4.0;
      else if (scorePct >= 50) calculatedLevel = 3.3;
      else if (scorePct >= 30) calculatedLevel = 2.5;
      else calculatedLevel = 1.8;

      const band = getProficiencyBand(calculatedLevel);

      const resultItem: CompetencyAssessmentResultItem = {
        competencyId: compId,
        competencyName: stat.name,
        domain: stat.domain,
        questionsCount: stat.total,
        correctCount: stat.correct,
        scorePercentage: scorePct,
        evaluatedProficiency: calculatedLevel,
        proficiencyBand: band,
        evidenceReference: `Assessment Attempt #${session.attemptNumber} (Score: ${scorePct}%)`
      };
      results.push(resultItem);

      // Check if existing record exists
      const existing = existingMap.get(compId);
      const compDef = this.framework.find(c => c.id === compId);

      const record: OfficialCompetencyRecord = {
        id: existing?.id || `oc-${userId}-${compId}`,
        userId,
        competencyId: compId,
        competencyCode: compDef?.code || 'COMP-GEN',
        competencyName: stat.name,
        domain: stat.domain,
        currentProficiency: calculatedLevel,
        proficiencyBand: band,
        lastAssessedAt: new Date().toISOString(),
        assessmentSessionId: session.id,
        attemptNumber: session.attemptNumber,
        evidenceSummary: `Verified through Module 03 Assessment Session (Attempt #${session.attemptNumber})`
      };

      updatedRecords.push(record);
      existingMap.set(compId, record);
    });

    // Merge any competencies not tested in this session so official's full profile stays intact
    existingRecords.forEach(prev => {
      if (!existingMap.has(prev.competencyId)) {
        updatedRecords.push(prev);
      }
    });

    // Update state
    this.officialCompetencies.set(userId, Array.from(existingMap.values()));

    // Store in history (preserving past attempts)
    const history = this.getOfficialHistory(userId);
    const newHistoryItem: CompetencyHistoryRecord = {
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      assessmentSessionId: session.id,
      attemptNumber: session.attemptNumber,
      assessmentDate: new Date().toISOString(),
      assessmentType: session.assessmentType,
      overallScore,
      totalQuestions: session.totalQuestions,
      correctAnswers: totalCorrect,
      competencySnapshots: results.map(r => ({
        competencyId: r.competencyId,
        competencyName: r.competencyName,
        domain: r.domain,
        scorePercentage: r.scorePercentage,
        proficiencyLevel: r.evaluatedProficiency,
        proficiencyBand: r.proficiencyBand
      }))
    };

    history.unshift(newHistoryItem); // newest first
    this.competencyHistory.set(userId, history);

    // Finalize session
    session.status = 'COMPLETED';
    session.completedAt = new Date().toISOString();
    session.overallScore = overallScore;
    session.competencyResults = results;

    return session;
  }

  // Module 04 Handoff Contract Builder
  public getModule04Handoff(userId: string, jobRole: string, department: string) {
    const competencies = this.getOfficialCompetencies(userId);
    const requirements = this.getRoleRequirements(jobRole, department);
    const history = this.getOfficialHistory(userId);
    const latestAttempt = history[0];

    const handoffPayload = competencies.map(comp => {
      const req = requirements.find(r => r.competencyId === comp.competencyId);
      return {
        competencyId: comp.competencyId,
        competencyCode: comp.competencyCode,
        competencyName: comp.competencyName,
        domain: comp.domain,
        currentProficiency: comp.currentProficiency,
        proficiencyBand: comp.proficiencyBand,
        requiredProficiency: req ? req.requiredProficiency : 3.5,
        priority: req ? req.priority : 'Core',
        lastAssessedAt: comp.lastAssessedAt,
        evidenceSummary: comp.evidenceSummary,
        attemptCount: comp.attemptNumber
      };
    });

    return {
      officialId: userId,
      jobRole,
      department,
      latestAssessmentReference: latestAttempt ? latestAttempt.assessmentSessionId : null,
      assessmentTimestamp: latestAttempt ? latestAttempt.assessmentDate : new Date().toISOString(),
      overallPerformanceScore: latestAttempt ? latestAttempt.overallScore : null,
      competencyRecordsCount: handoffPayload.length,
      competencies: handoffPayload,
      historySummary: {
        totalAttempts: history.length,
        firstAssessed: history.length > 0 ? history[history.length - 1].assessmentDate : null,
        lastAssessed: latestAttempt ? latestAttempt.assessmentDate : null
      }
    };
  }
}

export const competencyStore = new CompetencyDataStore();
