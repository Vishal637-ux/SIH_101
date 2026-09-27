/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 09: AI Assessment Engine Data Store & Lifecycle Management
 * 
 * Responsibilities:
 * - Assessment entity persistence: DRAFT -> REVIEW -> PUBLISHED -> ARCHIVED
 * - Question Bank entity persistence with multi-point validation status (VALID, WARNING, REJECTED)
 * - Validation Engine: completeness, option uniqueness, valid answer key (A/B/C/D), explanation presence, content grounding
 * - Learner Attempt lifecycle: IN_PROGRESS -> SUBMITTED with auto-evaluation against server-side answer keys
 * - Learner security: Answer keys & explanations strictly omitted during active attempt
 * - Performance Evidence generation: Handoff to Module 03 Competency state & Module 04 Skill Gap
 * - Source content traceability: Linking back to Module 08 content_id and sections
 */

import { contentStore } from './contentStore';
import { competencyStore } from './competencyStore';

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
  score: number; // number of correct answers
  total_questions: number;
  percentage: number;
  passed: boolean;
  status: 'IN_PROGRESS' | 'SUBMITTED';
  time_spent_seconds: number;
  responses: Record<string, 'A' | 'B' | 'C' | 'D'>; // question_id -> chosen answer
  question_breakdown?: QuestionBreakdownItem[];
  topic_breakdown?: Record<string, { total: number; correct: number; percentage: number }>;
  areas_for_improvement?: string[];
  competency_evidence_created?: boolean;
  evidence_summary?: string;
}

export interface QuestionValidationResult {
  status: QuestionValidationStatus;
  issues: string[];
}

export class AssessmentStore {
  private assessments: Map<string, Assessment> = new Map();
  private attempts: Map<string, AssessmentAttempt> = new Map();

  constructor() {
    this.seedInitialAssessments();
  }

  // ============================================================================
  // 1. QUESTION VALIDATION ENGINE
  // ============================================================================

  public validateQuestion(
    q: Partial<AssessmentQuestion>,
    sourceText: string = '',
    otherQuestions: AssessmentQuestion[] = []
  ): QuestionValidationResult {
    const issues: string[] = [];
    let hasFatalError = false;

    // 1. Question Text
    if (!q.question_text || q.question_text.trim().length < 15) {
      issues.push('Question text must be at least 15 characters long.');
      hasFatalError = true;
    }

    // 2. Options validation (exactly 4 non-empty distinct options)
    const options = [
      q.option_a?.trim() || '',
      q.option_b?.trim() || '',
      q.option_c?.trim() || '',
      q.option_d?.trim() || '',
    ];

    const filledOptions = options.filter(opt => opt.length > 0);
    if (filledOptions.length < 4) {
      issues.push('All 4 options (A, B, C, D) must be provided.');
      hasFatalError = true;
    }

    // Check for duplicate options
    const uniqueOptions = new Set(options.map(o => o.toLowerCase()));
    if (uniqueOptions.size < 4 && filledOptions.length === 4) {
      issues.push('Options must be distinct from one another; duplicate choices detected.');
      hasFatalError = true;
    }

    // 3. Correct Answer Key validation
    const validKeys = ['A', 'B', 'C', 'D'];
    if (!q.correct_answer || !validKeys.includes(q.correct_answer)) {
      issues.push("Correct answer key must be strictly one of 'A', 'B', 'C', or 'D'.");
      hasFatalError = true;
    } else {
      const idx = validKeys.indexOf(q.correct_answer);
      if (!options[idx] || options[idx].length === 0) {
        issues.push(`Selected correct option '${q.correct_answer}' has no text content.`);
        hasFatalError = true;
      }
    }

    // 4. Explanation presence and depth
    if (!q.explanation || q.explanation.trim().length < 20) {
      issues.push('Detailed explanation (at least 20 characters) citing the statutory or operational rule is required.');
      hasFatalError = true;
    }

    // 5. Content Grounding check (if source text available)
    if (sourceText && sourceText.length > 50 && q.question_text) {
      const qWords = q.question_text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 4);

      const sourceLower = sourceText.toLowerCase();
      const matchedWords = qWords.filter(w => sourceLower.includes(w));
      const matchRatio = qWords.length > 0 ? matchedWords.length / qWords.length : 0;

      if (matchRatio < 0.25) {
        issues.push('Question terminology has low grounding overlap with source document text.');
      }
    }

    // 6. Duplicate check against existing questions in same assessment
    if (q.question_text && otherQuestions.length > 0) {
      const qTextNorm = q.question_text.toLowerCase().replace(/[^a-z0-9]/g, '');
      const duplicateFound = otherQuestions.some(
        oq => oq.id !== q.id && oq.question_text.toLowerCase().replace(/[^a-z0-9]/g, '') === qTextNorm
      );
      if (duplicateFound) {
        issues.push('Duplicate or near-identical question text already exists in this assessment.');
        hasFatalError = true;
      }
    }

    // 7. Metadata validation
    if (!q.topic || q.topic.trim().length === 0) {
      issues.push('Topic classification is missing.');
    }

    if (hasFatalError) {
      return { status: 'REJECTED', issues };
    }
    if (issues.length > 0) {
      return { status: 'WARNING', issues };
    }
    return { status: 'VALID', issues: [] };
  }

  // ============================================================================
  // 2. ASSESSMENT CRUD & LIFECYCLE
  // ============================================================================

  public getAllAssessments(options?: {
    status?: AssessmentStatus;
    role?: 'Trainer' | 'Admin' | 'Learner';
  }): Assessment[] {
    const list = Array.from(this.assessments.values());

    let filtered = list;
    if (options?.role === 'Learner') {
      // Learners can strictly only view PUBLISHED assessments
      filtered = filtered.filter(a => a.status === 'PUBLISHED');
    } else if (options?.status) {
      filtered = filtered.filter(a => a.status === options.status);
    }

    // Sort newest first
    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getAssessmentById(id: string, options?: { role?: 'Trainer' | 'Admin' | 'Learner' }): Assessment | null {
    const assessment = this.assessments.get(id);
    if (!assessment) return null;

    if (options?.role === 'Learner' && assessment.status !== 'PUBLISHED') {
      return null; // Learner cannot access draft/review assessments
    }

    return assessment;
  }

  public getAssessmentForLearnerAttempt(id: string): any | null {
    const assessment = this.assessments.get(id);
    if (!assessment || assessment.status !== 'PUBLISHED') return null;

    // Strip correct_answer and explanation so the learner cannot inspect network responses to cheat
    const sanitizedQuestions = assessment.questions.map(q => ({
      id: q.id,
      assessment_id: q.assessment_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      difficulty: q.difficulty,
      topic: q.topic,
      competency_reference: q.competency_reference,
      source_reference: {
        content_id: q.source_reference.content_id,
        content_title: q.source_reference.content_title,
        section_title: q.source_reference.section_title,
      },
    }));

    return {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      source_content_id: assessment.source_content_id,
      source_content_title: assessment.source_content_title,
      status: assessment.status,
      competency_id: assessment.competency_id,
      competency_name: assessment.competency_name,
      topic: assessment.topic,
      difficulty: assessment.difficulty,
      language: assessment.language,
      time_limit_minutes: assessment.time_limit_minutes,
      passing_percentage: assessment.passing_percentage,
      total_questions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    };
  }

  public saveAssessment(assessment: Assessment): Assessment {
    assessment.updated_at = new Date().toISOString();
    this.assessments.set(assessment.id, assessment);
    return assessment;
  }

  public publishAssessment(id: string, publishedBy: string): Assessment {
    const assessment = this.assessments.get(id);
    if (!assessment) throw new Error(`Assessment ${id} not found.`);

    if (assessment.questions.length === 0) {
      throw new Error('Cannot publish an assessment with zero questions.');
    }

    // Check if any question has fatal errors
    const invalidQuestions = assessment.questions.filter(q => q.validation_status === 'REJECTED');
    if (invalidQuestions.length > 0) {
      throw new Error(
        `Cannot publish assessment: ${invalidQuestions.length} question(s) have unresolved validation errors. Please review and resolve them.`
      );
    }

    const now = new Date().toISOString();
    assessment.status = 'PUBLISHED';
    assessment.published_at = now;
    assessment.updated_at = now;

    this.assessments.set(id, assessment);
    return assessment;
  }

  public archiveAssessment(id: string): Assessment {
    const assessment = this.assessments.get(id);
    if (!assessment) throw new Error(`Assessment ${id} not found.`);

    assessment.status = 'ARCHIVED';
    assessment.updated_at = new Date().toISOString();
    this.assessments.set(id, assessment);
    return assessment;
  }

  // ============================================================================
  // 3. QUESTION-LEVEL OPERATIONS (Review, Edit, Regenerate, Delete, Add)
  // ============================================================================

  public updateQuestion(
    questionId: string,
    updates: Partial<AssessmentQuestion>
  ): { assessment: Assessment; question: AssessmentQuestion } {
    let targetAssessment: Assessment | null = null;
    let targetIndex = -1;

    for (const a of this.assessments.values()) {
      const idx = a.questions.findIndex(q => q.id === questionId);
      if (idx !== -1) {
        targetAssessment = a;
        targetIndex = idx;
        break;
      }
    }

    if (!targetAssessment || targetIndex === -1) {
      throw new Error(`Question ${questionId} not found in any assessment.`);
    }

    const currentQ = targetAssessment.questions[targetIndex];
    const mergedQ: AssessmentQuestion = {
      ...currentQ,
      ...updates,
      id: currentQ.id,
      assessment_id: targetAssessment.id,
    };

    // Re-run validation
    const sourceDocket = contentStore.getContentById(targetAssessment.source_content_id);
    const sourceText = sourceDocket?.extracted_text || '';
    const otherQuestions = targetAssessment.questions.filter(q => q.id !== questionId);
    const validation = this.validateQuestion(mergedQ, sourceText, otherQuestions);

    mergedQ.validation_status = validation.status;
    mergedQ.validation_issues = validation.issues;

    targetAssessment.questions[targetIndex] = mergedQ;
    targetAssessment.updated_at = new Date().toISOString();
    this.assessments.set(targetAssessment.id, targetAssessment);

    return { assessment: targetAssessment, question: mergedQ };
  }

  public deleteQuestion(questionId: string): Assessment {
    let targetAssessment: Assessment | null = null;

    for (const a of this.assessments.values()) {
      const idx = a.questions.findIndex(q => q.id === questionId);
      if (idx !== -1) {
        targetAssessment = a;
        a.questions.splice(idx, 1);
        a.updated_at = new Date().toISOString();
        break;
      }
    }

    if (!targetAssessment) {
      throw new Error(`Question ${questionId} not found.`);
    }

    this.assessments.set(targetAssessment.id, targetAssessment);
    return targetAssessment;
  }

  public addQuestion(
    assessmentId: string,
    questionData: Omit<AssessmentQuestion, 'id' | 'assessment_id' | 'validation_status' | 'validation_issues'>
  ): { assessment: Assessment; question: AssessmentQuestion } {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) throw new Error(`Assessment ${assessmentId} not found.`);

    const newId = `q-ass-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newQuestion: AssessmentQuestion = {
      ...questionData,
      id: newId,
      assessment_id: assessmentId,
      validation_status: 'VALID',
      validation_issues: [],
    };

    const sourceDocket = contentStore.getContentById(assessment.source_content_id);
    const sourceText = sourceDocket?.extracted_text || '';
    const validation = this.validateQuestion(newQuestion, sourceText, assessment.questions);
    newQuestion.validation_status = validation.status;
    newQuestion.validation_issues = validation.issues;

    assessment.questions.push(newQuestion);
    assessment.updated_at = new Date().toISOString();
    this.assessments.set(assessmentId, assessment);

    return { assessment, question: newQuestion };
  }

  // ============================================================================
  // 4. LEARNER ATTEMPTS & AUTOMATIC EVALUATION
  // ============================================================================

  public startAttempt(
    assessmentId: string,
    learnerId: string,
    learnerName: string,
    learnerRole: string
  ): AssessmentAttempt {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) throw new Error(`Assessment ${assessmentId} not found.`);

    if (assessment.status !== 'PUBLISHED') {
      throw new Error('Only published assessments can be attempted by learners.');
    }

    // Check if there is an unfinished attempt
    const existingAttempt = Array.from(this.attempts.values()).find(
      att => att.assessment_id === assessmentId && att.learner_id === learnerId && att.status === 'IN_PROGRESS'
    );
    if (existingAttempt) {
      return existingAttempt;
    }

    const attemptId = `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newAttempt: AssessmentAttempt = {
      id: attemptId,
      assessment_id: assessmentId,
      assessment_title: assessment.title,
      learner_id: learnerId,
      learner_name: learnerName,
      learner_role: learnerRole,
      started_at: new Date().toISOString(),
      submitted_at: null,
      score: 0,
      total_questions: assessment.questions.length,
      percentage: 0,
      passed: false,
      status: 'IN_PROGRESS',
      time_spent_seconds: 0,
      responses: {},
    };

    this.attempts.set(attemptId, newAttempt);
    return newAttempt;
  }

  public submitAttempt(
    attemptId: string,
    learnerId: string,
    responses: Record<string, 'A' | 'B' | 'C' | 'D'>,
    timeSpentSeconds: number = 0
  ): AssessmentAttempt {
    const attempt = this.attempts.get(attemptId);
    if (!attempt) throw new Error(`Attempt ${attemptId} not found.`);

    if (attempt.learner_id !== learnerId) {
      throw new Error('Security Error: You are not authorized to submit this assessment attempt.');
    }

    if (attempt.status === 'SUBMITTED') {
      throw new Error('This assessment attempt has already been submitted and evaluated.');
    }

    const assessment = this.assessments.get(attempt.assessment_id);
    if (!assessment) throw new Error(`Associated assessment ${attempt.assessment_id} not found.`);

    // 1. Evaluate responses against stored answer keys
    let correctCount = 0;
    const breakdown: QuestionBreakdownItem[] = [];
    const topicStats: Record<string, { total: number; correct: number; percentage: number }> = {};
    const areasForImprovement: Set<string> = new Set();

    assessment.questions.forEach(q => {
      const selected = responses[q.id] || null;
      const isCorrect = selected === q.correct_answer;

      if (isCorrect) correctCount++;
      else {
        if (q.topic) areasForImprovement.add(q.topic);
      }

      // Topic aggregation
      const topicKey = q.topic || 'General Regulatory Standards';
      if (!topicStats[topicKey]) {
        topicStats[topicKey] = { total: 0, correct: 0, percentage: 0 };
      }
      topicStats[topicKey].total++;
      if (isCorrect) topicStats[topicKey].correct++;

      breakdown.push({
        question_id: q.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        selected_answer: selected,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation,
        topic: q.topic,
        competency_name: assessment.competency_name,
        source_reference: q.source_reference,
      });
    });

    // Compute percentages
    Object.keys(topicStats).forEach(top => {
      const s = topicStats[top];
      s.percentage = Math.round((s.correct / Math.max(s.total, 1)) * 100);
    });

    const totalQuestions = assessment.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= assessment.passing_percentage;

    const submittedAt = new Date().toISOString();

    // 2. Downstream Performance Evidence Handoff -> Module 03 Competency state
    let evidenceCreated = false;
    let evidenceSummary = '';

    try {
      const evidence = this.recordDownstreamCompetencyEvidence(
        learnerId,
        attempt.learner_name,
        assessment,
        percentage,
        correctCount,
        totalQuestions
      );
      evidenceCreated = true;
      evidenceSummary = evidence;
    } catch (err: any) {
      console.warn('Downstream competency evidence generation warning:', err?.message || err);
      evidenceSummary = `Evaluation recorded; score: ${percentage}%.`;
    }

    // Finalize attempt
    attempt.status = 'SUBMITTED';
    attempt.submitted_at = submittedAt;
    attempt.score = correctCount;
    attempt.total_questions = totalQuestions;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.time_spent_seconds = timeSpentSeconds;
    attempt.responses = responses;
    attempt.question_breakdown = breakdown;
    attempt.topic_breakdown = topicStats;
    attempt.areas_for_improvement = Array.from(areasForImprovement);
    attempt.competency_evidence_created = evidenceCreated;
    attempt.evidence_summary = evidenceSummary;

    this.attempts.set(attemptId, attempt);
    return attempt;
  }

  public getAttemptResult(attemptId: string, requesterId: string, requesterRole: string): AssessmentAttempt | null {
    const attempt = this.attempts.get(attemptId);
    if (!attempt) return null;

    // RBAC: Learners can only view their own attempts; Trainers and Admins can view any
    if (requesterRole === 'Learner' && attempt.learner_id !== requesterId) {
      throw new Error('Access denied: You cannot view results for other learners.');
    }

    return attempt;
  }

  public getLearnerAttempts(learnerId: string): AssessmentAttempt[] {
    return Array.from(this.attempts.values())
      .filter(att => att.learner_id === learnerId && att.status === 'SUBMITTED')
      .sort((a, b) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime());
  }

  // ============================================================================
  // 5. DOWNSTREAM EVIDENCE RECORDING (Module 03 Competency Handoff)
  // ============================================================================

  private recordDownstreamCompetencyEvidence(
    userId: string,
    userName: string,
    assessment: Assessment,
    percentage: number,
    correctCount: number,
    totalQuestions: number
  ): string {
    // Score to proficiency mapping:
    // >= 90% -> 4.8 (Expert)
    // >= 75% -> 4.2 (Proficient)
    // >= 50% -> 3.4 (Competent)
    // >= 30% -> 2.6 (Developing)
    // < 30%  -> 1.8 (Foundation)
    let evaluatedLevel = 2.0;
    let bandName: 'Foundation' | 'Developing' | 'Competent' | 'Proficient' | 'Expert' = 'Developing';

    if (percentage >= 90) {
      evaluatedLevel = 4.8;
      bandName = 'Expert';
    } else if (percentage >= 75) {
      evaluatedLevel = 4.2;
      bandName = 'Proficient';
    } else if (percentage >= 50) {
      evaluatedLevel = 3.4;
      bandName = 'Competent';
    } else if (percentage >= 30) {
      evaluatedLevel = 2.6;
      bandName = 'Developing';
    } else {
      evaluatedLevel = 1.8;
      bandName = 'Foundation';
    }

    const currentRecords = competencyStore.getOfficialCompetencies(userId);
    const existingRecord = currentRecords.find(r => r.competencyId === assessment.competency_id);

    const now = new Date().toISOString();
    const updatedRecord = {
      id: existingRecord?.id || `oc-${userId}-${assessment.competency_id}`,
      userId,
      competencyId: assessment.competency_id,
      competencyCode: existingRecord?.competencyCode || 'COMP-M09',
      competencyName: assessment.competency_name,
      domain: (existingRecord?.domain || 'Digital Governance') as any,
      // Positive uplift: if evaluated level exceeds previous, update; otherwise preserve or slight adjustment
      currentProficiency: existingRecord
        ? Math.max(existingRecord.currentProficiency, evaluatedLevel)
        : evaluatedLevel,
      proficiencyBand: bandName,
      lastAssessedAt: now,
      assessmentSessionId: `m09-ass-${assessment.id}`,
      attemptNumber: 1,
      evidenceSummary: `Verified via Module 09 AI Assessment: "${assessment.title}" (Score: ${correctCount}/${totalQuestions}, ${percentage}%)`,
    };

    // Update competencyStore record
    const updatedList = currentRecords.filter(r => r.competencyId !== assessment.competency_id);
    updatedList.push(updatedRecord);
    (competencyStore as any).officialCompetencies.set(userId, updatedList);

    // Append to competency history
    const history = competencyStore.getOfficialHistory(userId);
    history.unshift({
      id: `hist-m09-${Date.now()}`,
      userId,
      assessmentSessionId: `m09-${assessment.id}`,
      attemptNumber: history.length + 1,
      assessmentDate: now,
      assessmentType: 'MODULE_EVALUATION',
      overallScore: percentage,
      totalQuestions,
      correctAnswers: correctCount,
      competencySnapshots: [
        {
          competencyId: assessment.competency_id,
          competencyName: assessment.competency_name,
          domain: updatedRecord.domain,
          scorePercentage: percentage,
          proficiencyLevel: updatedRecord.currentProficiency,
          proficiencyBand: bandName,
        },
      ],
    });

    return `Competency "${assessment.competency_name}" verified at ${updatedRecord.currentProficiency.toFixed(1)}/5.0 (${bandName}). Ready for downstream Module 04 skill-gap recalculation.`;
  }

  // ============================================================================
  // 6. INITIAL SEED DATA
  // ============================================================================

  private seedInitialAssessments() {
    const seedAssessmentId = 'ass-gfr-001';
    const seedQuestions: AssessmentQuestion[] = [
      {
        id: 'q-seed-1',
        assessment_id: seedAssessmentId,
        question_text: 'Under General Financial Rules (GFR) 2017, when is post-tender negotiation legally permissible?',
        option_a: 'Freely with all shortlisted bidders to maximize fiscal discount',
        option_b: 'Only in exceptional circumstances and strictly with the lowest compliant bidder (L1)',
        option_c: 'Simultaneously with the top three bidders through sealed compromise bids',
        option_d: 'At the discretion of the procurement committee after opening financial bids',
        correct_answer: 'B',
        explanation: 'GFR 2017 Rule 173(xiv) strictly prohibits post-tender negotiations except under recorded exigencies and exclusively with the lowest responsive bidder (L1) to avoid cartelization.',
        difficulty: 'MEDIUM',
        topic: 'GFR 2017',
        competency_reference: {
          id: 'comp-proc-001',
          name: 'Public Procurement & GeM Rules',
        },
        source_reference: {
          content_id: 'cnt-seed-01',
          content_title: 'General Financial Rules 2017 & GeM 4.0 Manual',
          section_title: 'Unit 1: Fundamental Principles of Public Procurement',
          page_number: 1,
        },
        validation_status: 'VALID',
        validation_issues: [],
      },
      {
        id: 'q-seed-2',
        assessment_id: seedAssessmentId,
        question_text: 'What is the statutory role of the Consignee Receipt and Acceptance Certificate (CRAC) on the Government e-Marketplace (GeM)?',
        option_a: 'It extends delivery timelines automatically without liquidated damages',
        option_b: 'It certifies physical inspection and acceptance, triggering the 10-day payment mandate',
        option_c: 'It exempts the vendor from performance security deposit requirements',
        option_d: 'It acts as an administrative sanction for unutilized departmental budget grants',
        correct_answer: 'B',
        explanation: 'On GeM, issuance of CRAC verifies that goods or services comply with technical specifications and contract terms, binding the buyer department to disburse payment within 10 calendar days.',
        difficulty: 'MEDIUM',
        topic: 'GeM Mandates',
        competency_reference: {
          id: 'comp-proc-001',
          name: 'Public Procurement & GeM Rules',
        },
        source_reference: {
          content_id: 'cnt-seed-01',
          content_title: 'General Financial Rules 2017 & GeM 4.0 Manual',
          section_title: 'Unit 2: Government e-Marketplace (GeM) Mandate & Direct Purchases',
          page_number: 2,
        },
        validation_status: 'VALID',
        validation_issues: [],
      },
      {
        id: 'q-seed-3',
        assessment_id: seedAssessmentId,
        question_text: 'Which core principle must govern the formulation of tender technical specifications under GFR 2017?',
        option_a: 'Specifications should mandate specific proprietary brand names to ensure high durability',
        option_b: 'Specifications must be generic, functional, and performance-based to promote broad competition',
        option_c: 'Specifications must replicate the prior year procurement document without alteration',
        option_d: 'Specifications can be determined collaboratively with prospective vendors during bid opening',
        correct_answer: 'B',
        explanation: 'GFR 2017 Rule 144 mandates that technical specifications must be generic and objective, promoting wide competition without tailoring parameters to favor proprietary brands.',
        difficulty: 'EASY',
        topic: 'Public Procurement',
        competency_reference: {
          id: 'comp-proc-001',
          name: 'Public Procurement & GeM Rules',
        },
        source_reference: {
          content_id: 'cnt-seed-01',
          content_title: 'General Financial Rules 2017 & GeM 4.0 Manual',
          section_title: 'Unit 1: Fundamental Principles of Public Procurement',
          page_number: 1,
        },
        validation_status: 'VALID',
        validation_issues: [],
      },
      {
        id: 'q-seed-4',
        assessment_id: seedAssessmentId,
        question_text: 'When is a Proprietary Article Certificate (PAC) required under public procurement procedures?',
        option_a: 'For any direct purchase under ₹25,000 on the open retail market',
        option_b: 'When procuring from a single supplier without open competitive bidding due to sole manufacturing rights',
        option_c: 'Only when procuring imported machinery exceeding ₹50 Crores',
        option_d: 'Whenever a two-stage bidding process fails to attract at least five participants',
        correct_answer: 'B',
        explanation: 'Rule 166 of GFR 2017 specifies that procurement from a single source without open competition requires an explicit Proprietary Article Certificate (PAC) approved by the competent authority.',
        difficulty: 'HARD',
        topic: 'GFR 2017',
        competency_reference: {
          id: 'comp-proc-001',
          name: 'Public Procurement & GeM Rules',
        },
        source_reference: {
          content_id: 'cnt-seed-01',
          content_title: 'General Financial Rules 2017 & GeM 4.0 Manual',
          section_title: 'Unit 3: Integrity Pacts, Bid Securities & Audit Compliance',
          page_number: 3,
        },
        validation_status: 'VALID',
        validation_issues: [],
      },
      {
        id: 'q-seed-5',
        assessment_id: seedAssessmentId,
        question_text: 'What is the ceiling percentage prescribed for Performance Security in central government procurement contracts?',
        option_a: 'Between 3% to 10% of the total contract value',
        option_b: 'Exactly 25% of the total contract value',
        option_c: 'No ceiling is prescribed; determined solely by the consignee',
        option_d: 'Up to 50% for micro and small enterprise suppliers',
        correct_answer: 'A',
        explanation: 'Under GFR 2017 Rule 171, Performance Security is typically fixed between 3% and 10% (historically adjusted to 3-5% under recent Ministry of Finance directives) to ensure contract execution.',
        difficulty: 'MEDIUM',
        topic: 'Audit Compliance',
        competency_reference: {
          id: 'comp-proc-001',
          name: 'Public Procurement & GeM Rules',
        },
        source_reference: {
          content_id: 'cnt-seed-01',
          content_title: 'General Financial Rules 2017 & GeM 4.0 Manual',
          section_title: 'Unit 3: Integrity Pacts, Bid Securities & Audit Compliance',
          page_number: 3,
        },
        validation_status: 'VALID',
        validation_issues: [],
      },
    ];

    const seedAssessment: Assessment = {
      id: seedAssessmentId,
      title: 'General Financial Rules 2017 & GeM 4.0 Statutory Assessment',
      description: 'Comprehensive objective evaluation covering statutory procurement standards, GeM direct purchase thresholds, CRAC certification, and audit compliance under GFR 2017.',
      source_content_id: 'cnt-seed-01',
      source_content_title: 'General Financial Rules 2017 & GeM 4.0 Manual',
      status: 'PUBLISHED',
      created_by: {
        id: 'trainer-001',
        name: 'Dr. R. K. Sharma',
        role: 'Trainer',
      },
      competency_id: 'comp-proc-001',
      competency_name: 'Public Procurement & GeM Rules',
      topic: 'GFR 2017 & GeM Framework',
      difficulty: 'MEDIUM',
      language: 'English',
      time_limit_minutes: 15,
      passing_percentage: 60,
      questions: seedQuestions,
      generation_metadata: {
        model: 'gemini-3.8-flash',
        generation_mode: 'GEMINI_AI',
        generated_at: new Date(Date.now() - 86400000).toISOString(),
        total_generated: 5,
        validated_count: 5,
      },
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      published_at: new Date(Date.now() - 86400000).toISOString(),
    };

    this.assessments.set(seedAssessmentId, seedAssessment);
  }
}

export const assessmentStore = new AssessmentStore();
