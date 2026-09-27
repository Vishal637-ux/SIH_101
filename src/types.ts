export interface OfficialProfile {
  id: string;
  name: string;
  email: string;
  cadre: string; // e.g. Central Secretariat Service (CSS), IAS, IES, State Admin
  designation: string; // e.g. Assistant Section Officer, Under Secretary, Director
  ministry: string; // e.g. Ministry of Personnel, Public Grievances and Pensions
  department: string; // e.g. Department of Administrative Reforms & Public Grievances
  experienceYears: number;
  currentBand: string; // Level 8, Level 11, etc.
  targetRole: string; // Next promotional / leadership milestone
  targetGoal: string; // Specific administrative goal
  karmaPoints: number;
  streakDays: number;
  completedCourses: number;
}

// Module 02: Detailed Entity Types for Official Profile Management

export interface EducationRecord {
  id: string;
  degree: string;
  specialization: string;
  institution: string;
  university: string;
  startYear: number;
  completionYear: number;
  gradePercentage?: string;
  relevantSkills?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceRecord {
  id: string;
  organization: string;
  department: string;
  designation: string;
  employmentType: 'Permanent' | 'Deputation' | 'Contract' | 'Trainee' | 'Probationary';
  startDate: string; // YYYY-MM or YYYY-MM-DD
  endDate?: string;
  isCurrentPosition: boolean;
  responsibilities: string;
  keyAchievements?: string;
  skillsUsed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingRecord {
  id: string;
  courseName: string;
  trainingProvider: string;
  category: string;
  startDate: string;
  completionDate: string;
  duration: string; // e.g. "4 Weeks", "30 Hours"
  mode: 'Online' | 'Offline' | 'Hybrid';
  certificateNumber?: string;
  competenciesAcquired: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfficialSkillRecord {
  id: string;
  skillName: string;
  skillCategory: 'Statistical' | 'Technical' | 'Digital' | 'Behavioural' | 'Domain-specific';
  selfAssessedProficiency: 1 | 2 | 3 | 4 | 5; // 1: Beginner, 2: Elementary, 3: Intermediate, 4: Advanced, 5: Expert
  yearsOfExperience: number;
  certificationEvidence?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningPreferences {
  careerGoals: string;
  preferredFormats: ('Text' | 'Video' | 'Audio' | 'Interactive')[];
  preferredLanguage: string;
  areasToImprove: string;
  targetCompetencies: string;
  learningInterests: string;
  updatedAt?: string;
}

export interface ProfileCompletionSection {
  completed: boolean;
  label: string;
  weight: number;
  detail?: string;
}

export interface ProfileCompletionStatus {
  percentage: number;
  sections: {
    basicInfo: ProfileCompletionSection;
    professional: ProfileCompletionSection;
    education: ProfileCompletionSection;
    experience: ProfileCompletionSection;
    training: ProfileCompletionSection;
    skills: ProfileCompletionSection;
    preferences: ProfileCompletionSection;
  };
  incompleteSections: string[];
  recommendation: string;
}

export interface FullOfficialProfile {
  // Basic / Official Info
  id: string;
  userId: string;
  fullName: string;
  officialEmail: string; // System controlled
  employeeId: string; // System controlled
  profilePhoto?: string;
  mobileNumber: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  organization: string; // System controlled
  department: string;
  designation: string;
  jobRole: string;
  currentAssignment: string;
  serviceCadre: string;
  dateOfJoining: string;
  workLocation: string;

  // Professional Profile
  currentDesignation: string;
  responsibilities: string;
  yearsOfExperience: number;
  areasOfExpertise: string[];
  professionalInterests: string[];

  // Relational Collections
  education: EducationRecord[];
  experience: ExperienceRecord[];
  training: TrainingRecord[];
  skills: OfficialSkillRecord[];

  // Learning Preferences
  learningPreferences: LearningPreferences;

  // Profile Completion
  completionStatus?: ProfileCompletionStatus;

  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// MODULE 03: Competency Management & Assessment Entity Types
// ============================================================================

export type OfficialCompetencyDomain = 
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
  domain: OfficialCompetencyDomain;
  description: string;
  standardBenchmarks: Record<number, string>; // Levels 1 through 5
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

export interface AssessmentSessionQuestion {
  id: string;
  question: string;
  questionType: 'MCQ' | 'SCENARIO' | 'KNOWLEDGE' | 'SKILL_APPLICATION';
  competencyId: string;
  competencyName: string;
  domain: OfficialCompetencyDomain;
  scenarioContext?: string;
  options: string[];
  selectedAnswerIndex?: number;
  correctAnswerIndex?: number;
  isCorrect?: boolean;
  explanation?: string;
}

export interface CompetencyAssessmentResultItem {
  competencyId: string;
  competencyName: string;
  domain: OfficialCompetencyDomain;
  questionsCount: number;
  correctCount: number;
  scorePercentage: number;
  evaluatedProficiency: number;
  proficiencyBand: ProficiencyBand;
  evidenceReference: string;
}

export interface OfficialCompetencyRecord {
  id: string;
  userId: string;
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  domain: OfficialCompetencyDomain;
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
    domain: OfficialCompetencyDomain;
    scorePercentage: number;
    proficiencyLevel: number;
    proficiencyBand: ProficiencyBand;
  }>;
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
    domain: OfficialCompetencyDomain;
  }>;
  totalQuestions: number;
  answeredCount: number;
  questions: AssessmentSessionQuestion[];
  overallScore?: number;
  startedAt: string;
  completedAt?: string;
  competencyResults?: CompetencyAssessmentResultItem[];
}

export interface Module04HandoffContract {
  officialId: string;
  jobRole: string;
  department: string;
  latestAssessmentReference: string | null;
  assessmentTimestamp: string;
  overallPerformanceScore: number | null;
  competencyRecordsCount: number;
  competencies: Array<{
    competencyId: string;
    competencyCode: string;
    competencyName: string;
    domain: OfficialCompetencyDomain;
    currentProficiency: number;
    proficiencyBand: ProficiencyBand;
    requiredProficiency: number;
    priority: 'Critical' | 'Core' | 'Supportive';
    lastAssessedAt: string;
    evidenceSummary: string;
    attemptCount: number;
  }>;
  historySummary: {
    totalAttempts: number;
    firstAssessed: string | null;
    lastAssessed: string | null;
  };
}

// ============================================================================
// MODULE 04: Skill-Gap Analysis Entity Types
// ============================================================================

export type GapPriority = 'High' | 'Medium' | 'Low' | 'None';
export type GapSeverity = 'Critical' | 'High' | 'Moderate' | 'Minor' | 'None';
export type GapStatus = 'Needs Development' | 'Meets Requirement';

export interface SkillGapRecord {
  id: string;
  userId: string;
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  domain: OfficialCompetencyDomain;
  requiredProficiency: number;
  currentProficiency: number;
  gapValue: number; // Guaranteed >= 0
  priority: GapPriority;
  severity: GapSeverity;
  status: GapStatus;
  importance: 'Critical' | 'Core' | 'Supportive';
  standardBenchmarkRequired?: string;
  evidenceSummary: string;
  latestAssessmentReference: string;
  lastAssessedAt: string;
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillGapSummary {
  userId: string;
  officialName: string;
  jobRole: string;
  department: string;
  totalCompetenciesAssessed: number;
  competenciesMeetingRequirement: number;
  competenciesWithGaps: number;
  highPriorityGaps: number;
  overallReadinessPercentage: number;
  lastCalculatedAt: string;
  domainBreakdown: Record<OfficialCompetencyDomain, {
    total: number;
    meetingRequirement: number;
    withGaps: number;
    avgCurrent: number;
    avgRequired: number;
    avgGap: number;
  }>;
}

export interface Module05HandoffPayload {
  officialId: string;
  officialName: string;
  jobRole: string;
  department: string;
  calculatedAt: string;
  totalGapsCount: number;
  meetingRequirementCount: number;
  gaps: Array<{
    officialId: string;
    competencyId: string;
    competencyCode: string;
    competencyName: string;
    domain: OfficialCompetencyDomain;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    priority: GapPriority;
    severity: GapSeverity;
    status: GapStatus;
    importance: 'Critical' | 'Core' | 'Supportive';
    latestAssessmentReference: string;
    calculatedAt: string;
  }>;
  topPriorities: Array<{
    competencyId: string;
    competencyName: string;
    domain: OfficialCompetencyDomain;
    gap: number;
    priority: GapPriority;
  }>;
  handoffStatus: 'READY_FOR_RECOMMENDATION';
  handoffNotice: string;
}

// ============================================================================
// MODULE 05: AI Recommendation Engine Entity Types
// ============================================================================

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
  domain: OfficialCompetencyDomain;
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
  domain: OfficialCompetencyDomain;
  currentProficiency: number;
  requiredProficiency: number;
  gapValue: number;
  priority: GapPriority;
  matchScore: number;
  rank: number;
  whyRecommended: string[];
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

// ============================================================================
// MODULE 06: iGOT / NSSTA-TPAC Integration & Ecosystem Entity Types
// ============================================================================

export type IntegrationSource = 'IGOT' | 'NSSTA' | 'TPAC' | 'INTERNAL';
export type IntegrationStatus = 'CONNECTED' | 'DEMO_MODE' | 'NOT_CONFIGURED' | 'ERROR';

export interface NormalizedLearningResource {
  id: string;
  externalId: string;
  source: IntegrationSource;
  title: string;
  description: string;
  provider: ResourceProvider;
  resourceType: ResourceType;
  primaryCompetencyId: string;
  competencyCode: string;
  competencyName: string;
  domain: OfficialCompetencyDomain;
  targetProficiencyLevel: number;
  estimatedHours: number;
  difficulty: ResourceDifficulty;
  language: string;
  externalUrl: string;
  learningObjectives: string[];
  syllabus: Array<{ title: string; durationMinutes: number }>;
  karmaPoints: number;
  lastSyncedAt: string;
  isActive: boolean;
  syncVersion: number;
}

export interface IntegrationSourceStatus {
  source: 'IGOT' | 'NSSTA' | 'TPAC' | 'GOV_SSO';
  name: string;
  status: IntegrationStatus;
  lastSyncAt: string;
  lastError: string | null;
  totalResourcesCount: number;
  endpointUrl: string;
  isLiveConfigured: boolean;
  notice: string;
}

export interface IntegrationSyncLog {
  id: string;
  source: 'IGOT' | 'NSSTA' | 'TPAC' | 'ALL';
  triggeredBy: string;
  startedAt: string;
  completedAt: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  errorMessage: string | null;
  details: string;
}

export interface ExternalEnrollmentRecord {
  id: string;
  userId: string;
  officialName: string;
  resourceId: string;
  externalId: string;
  source: IntegrationSource;
  resourceTitle: string;
  provider: string;
  competencyId: string;
  competencyName: string;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED';
  enrolledAt: string;
  confirmationCode: string;
  module07HandoffTicket: string;
}

export interface EcosystemStatusResponse {
  overallMode: 'DEMO' | 'HYBRID' | 'LIVE';
  disclaimer: string;
  sources: IntegrationSourceStatus[];
  metrics: {
    totalExternalResources: number;
    totalEnrollments: number;
    lastSyncTimestamp: string;
  };
}

// ============================================================================
// MODULE 07: Learning Management & Delivery Entity Types
// ============================================================================

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
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle: string;
  source: IntegrationSource;
  provider: string;
  competencyId: string;
  competencyName: string;
  status: LearningStatus;
  progressPercentage: number;
  completedModules: number[];
  completedExercises: string[];
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

// Module 04 - 10 Pipeline Types
export interface CompetencyItem {
  id: string;
  name: string;
  domain: 'Behavioral' | 'Domain' | 'Functional' | OfficialCompetencyDomain;
  currentLevel: number; // 1.0 to 5.0
  requiredLevel: number; // 1.0 to 5.0
  gapScore: number;
  urgency: 'High' | 'Medium' | 'Low';
  impactExplanation?: string;
}

export interface GapAnalysisResult {
  overallReadiness: number;
  gapSummary: string;
  gaps: CompetencyItem[];
  topPriorities: string[];
}

export interface LearningPathwayItem {
  id: string;
  title: string;
  source: 'iGOT Karmayogi' | 'NSSTA' | 'TPAC' | 'Platform Content';
  competencyAddressed: string;
  estimatedHours: number;
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  description: string;
  karmaPoints: number;
  modulesCount: number;
  isEnrolled?: boolean;
}

export interface AdaptiveModule {
  title: string;
  keyTakeaways: string[];
  readTimeMinutes: number;
}

export interface DemoAssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  competencyTagged: string;
}

export interface BookToContentExtraction {
  documentTitle: string;
  documentSummary: string;
  adaptiveModules: AdaptiveModule[];
  assessmentQuestions: DemoAssessmentQuestion[];
}

export interface AssessmentEvaluation {
  score: number;
  correctCount: number;
  totalQuestions: number;
  karmaEarned: number;
  passed: boolean;
  evalSummary: string;
  competencyUplift: {
    competencyName: string;
    previousLevel: number;
    newLevel: number;
    improvementPercentage: number;
  };
  questionBreakdown: {
    questionId: string;
    questionText: string;
    selected: number;
    correct: number;
    isCorrect: boolean;
    explanation: string;
    competency: string;
  }[];
}

export interface WorkforceInsight {
  department: string;
  officialCount: number;
  averageReadiness: number;
  topSkillGaps: string[];
  completionRate: number;
}

// ============================================================================
// MODULE 08: CONTENT MANAGEMENT & NLP PREPARATION ENTITY TYPES
// ============================================================================

export type ContentType = 'PDF' | 'PPT' | 'VIDEO' | 'DOCUMENT';
export type ContentStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'PUBLISHED' | 'ARCHIVED' | 'FAILED';
export type ProcessingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface ContentStructureSection {
  sectionIndex: number;
  title: string;
  pageOrSlide?: number;
  content: string;
  wordCount: number;
}

export interface ContentItem {
  content_id: string;
  owner_user_id: string;
  owner_name: string;
  owner_role: 'Trainer' | 'Admin' | 'Learner';
  title: string;
  description: string;
  content_type: ContentType;
  language: string;
  object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: ContentStatus;
  processing_status: ProcessingStatus;
  version: number;
  extracted_text: string;
  extracted_structure: ContentStructureSection[];
  word_count: number;
  page_count?: number;
  topics: string[];
  competency_id: string;
  competency_name: string;
  domain: OfficialCompetencyDomain;
  processing_error: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  version: number;
  file_name: string;
  file_size: number;
  change_summary: string;
  created_at: string;
  created_by: string;
}

export interface ContentProcessingJob {
  job_id: string;
  content_id: string;
  status: ProcessingStatus;
  current_step: string;
  steps: Array<{
    name: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    timestamp: string;
  }>;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  logs: string[];
}

export interface ContentAuditLog {
  id: string;
  content_id: string;
  action:
    | 'UPLOAD'
    | 'PROCESS_START'
    | 'PROCESS_SUCCESS'
    | 'PROCESS_FAILED'
    | 'METADATA_UPDATE'
    | 'PUBLISH'
    | 'ARCHIVE'
    | 'DOWNLOAD'
    | 'DELETE';
  performed_by: string;
  performed_by_name: string;
  role: string;
  timestamp: string;
  details: string;
}

export interface AssessmentDocket {
  content_id: string;
  title: string;
  description: string;
  domain: string;
  competency_id: string;
  competency_name: string;
  extracted_text: string;
  extracted_structure: ContentStructureSection[];
  word_count: number;
  topics: string[];
  is_ready_for_assessment: boolean;
  status: ContentStatus;
}

// ============================================================================
// MODULE 09: AI Assessment Engine Types
// ============================================================================

export type AssessmentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type QuestionValidationStatus = 'VALID' | 'WARNING' | 'REJECTED';
export type AssessmentDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: AssessmentDifficulty;
  topic: string;
  competency_reference: {
    id: string;
    name: string;
  };
  source_reference: {
    content_id: string;
    content_title: string;
    section_title?: string;
    page_number?: number;
  };
  validation_status: QuestionValidationStatus;
  validation_issues: string[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  source_content_id: string;
  source_content_title: string;
  status: AssessmentStatus;
  created_by: {
    id: string;
    name: string;
    role: 'Trainer' | 'Admin' | 'Learner';
  };
  competency_id: string;
  competency_name: string;
  topic: string;
  difficulty: AssessmentDifficulty;
  language: string;
  time_limit_minutes: number;
  passing_percentage: number;
  questions: AssessmentQuestion[];
  generation_metadata?: {
    model: string;
    generation_mode: 'GEMINI_AI' | 'GROUNDED_CURRICULUM_FALLBACK';
    generated_at: string;
    total_generated: number;
    validated_count: number;
  };
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface QuestionBreakdownItem {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  selected_answer: 'A' | 'B' | 'C' | 'D' | null;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  explanation: string;
  topic: string;
  competency_name: string;
  source_reference: {
    content_id: string;
    content_title: string;
    section_title?: string;
  };
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  assessment_title: string;
  learner_id: string;
  learner_name: string;
  learner_role: string;
  started_at: string;
  submitted_at: string | null;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  status: 'IN_PROGRESS' | 'SUBMITTED';
  time_spent_seconds: number;
  responses: Record<string, 'A' | 'B' | 'C' | 'D'>;
  question_breakdown?: QuestionBreakdownItem[];
  topic_breakdown?: Record<string, { total: number; correct: number; percentage: number }>;
  areas_for_improvement?: string[];
  competency_evidence_created?: boolean;
  evidence_summary?: string;
}

export interface AssessmentGenerationRequest {
  contentId: string;
  numQuestions: number;
  difficulty: AssessmentDifficulty;
  topic?: string;
  language?: string;
}

// ============================================================================
// MODULE 10: Progress & Performance Management Types
// ============================================================================

export interface CompetencyEvidenceRecord {
  id: string;
  learnerId: string;
  learnerName: string;
  sourceType: 'ASSESSMENT' | 'COURSE_COMPLETION' | 'PRACTICAL_EXERCISE' | 'CUMULATIVE_MASTERY';
  sourceId: string;
  sourceTitle: string;
  competencyId: string;
  competencyName: string;
  domain: string;
  metricType: 'SCORE' | 'COMPLETION' | 'ACCURACY';
  metricValue: number;
  evaluatedProficiency: number;
  proficiencyBand: 'Foundation' | 'Developing' | 'Competent' | 'Proficient' | 'Expert';
  evidenceSummary: string;
  timestamp: string;
  isSyncedToModule03: boolean;
  syncedAt: string | null;
}

export interface TopicPerformanceRecord {
  topic: string;
  competencyId: string;
  competencyName: string;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  currentPercentage: number;
  previousPercentage: number | null;
  trendDelta: number | null;
  status: 'MASTERED' | 'IMPROVING' | 'NEEDS_PRACTICE';
  attemptsCount: number;
  lastAssessedAt: string;
}

export interface LearningHoursSummary {
  totalHours: number;
  weeklyHours: number;
  monthlyHours: number;
  totalMinutes: number;
  resourceBreakdown: Array<{
    resourceId: string;
    resourceTitle: string;
    provider: string;
    minutesSpent: number;
    hoursSpent: number;
    progressPercentage: number;
    status: string;
  }>;
}

export interface PerformanceTrendPoint {
  date: string;
  timestamp: string;
  type: 'ASSESSMENT' | 'LEARNING_COMPLETION';
  title: string;
  scoreOrProgress: number;
  competencyOrTopic: string;
  delta?: number;
}

export interface LearnerProgressSummary {
  learnerId: string;
  learnerName: string;
  designation: string;
  department: string;
  overallLearningCompletion: number;
  totalLearningHours: number;
  weeklyLearningHours: number;
  monthlyLearningHours: number;
  completedResourcesCount: number;
  inProgressResourcesCount: number;
  totalEnrolledResources: number;
  assessmentsCompletedCount: number;
  averageAssessmentScore: number;
  improvingTopicsCount: number;
  topicsNeedingPracticeCount: number;
  topImprovingTopics: string[];
  topicsNeedingPractice: string[];
  lastActivityAt: string;
}


