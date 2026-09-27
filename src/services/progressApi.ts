import {
  LearnerProgressSummary,
  LearningHoursSummary,
  TopicPerformanceRecord,
  PerformanceTrendPoint,
  CompetencyEvidenceRecord,
  LearningProgressRecord,
  AssessmentAttempt,
} from '../types';

function getAuthHeaders(userRole: string = 'Learner'): HeadersInit {
  const currentUserId = localStorage.getItem('sih_active_user_id') || 'off-001';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${currentUserId}`,
    'x-user-id': currentUserId,
    'x-user-role': userRole,
  };
}

export const progressApi = {
  // 1. GET /api/v1/progress or /api/v1/progress/:learner_id
  async getProgressSummary(
    learnerId?: string,
    userRole: string = 'Learner'
  ): Promise<LearnerProgressSummary> {
    const url = learnerId ? `/api/v1/progress/${learnerId}` : '/api/v1/progress';
    const res = await fetch(url, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch learner progress summary');
    }
    return res.json();
  },

  // 2. GET /api/v1/progress/learning
  async getLearningProgress(
    learnerId?: string,
    userRole: string = 'Learner'
  ): Promise<LearningProgressRecord[]> {
    const qs = learnerId ? `?learnerId=${learnerId}` : '';
    const res = await fetch(`/api/v1/progress/learning${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch learning progress records');
    }
    return res.json();
  },

  // 3. GET /api/v1/progress/hours
  async getLearningHours(
    learnerId?: string,
    userRole: string = 'Learner'
  ): Promise<LearningHoursSummary> {
    const qs = learnerId ? `?learnerId=${learnerId}` : '';
    const res = await fetch(`/api/v1/progress/hours${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch learning hours summary');
    }
    return res.json();
  },

  // 4. GET /api/v1/progress/completion
  async getCompletionStats(
    learnerId?: string,
    userRole: string = 'Learner'
  ): Promise<{
    overallCompletion: number;
    totalResources: number;
    completedResources: number;
    inProgressResources: number;
    notStartedResources: number;
  }> {
    const qs = learnerId ? `?learnerId=${learnerId}` : '';
    const res = await fetch(`/api/v1/progress/completion${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch completion statistics');
    }
    return res.json();
  },

  // 5. GET /api/v1/performance/topics
  async getTopicPerformance(
    learnerId?: string,
    userRole: string = 'Learner'
  ): Promise<TopicPerformanceRecord[]> {
    const qs = learnerId ? `?learnerId=${learnerId}` : '';
    const res = await fetch(`/api/v1/performance/topics${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch topic performance');
    }
    return res.json();
  },

  // 6. GET /api/v1/performance/trends
  async getPerformanceTrends(
    learnerId?: string,
    userRole: string = 'Learner'
  ): Promise<PerformanceTrendPoint[]> {
    const qs = learnerId ? `?learnerId=${learnerId}` : '';
    const res = await fetch(`/api/v1/performance/trends${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch performance trends');
    }
    return res.json();
  },

  // 7. GET /api/v1/performance/evidence
  async getCompetencyEvidence(
    learnerId?: string,
    userRole: string = 'Learner'
  ): Promise<CompetencyEvidenceRecord[]> {
    const qs = learnerId ? `?learnerId=${learnerId}` : '';
    const res = await fetch(`/api/v1/performance/evidence${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch competency evidence');
    }
    return res.json();
  },

  // 8. GET /api/v1/performance/assessments
  async getAssessmentHistory(
    learnerId?: string,
    userRole: string = 'Learner'
  ): Promise<AssessmentAttempt[]> {
    const qs = learnerId ? `?learnerId=${learnerId}` : '';
    const res = await fetch(`/api/v1/performance/assessments${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch assessment history');
    }
    return res.json();
  },

  // 9. POST /api/v1/performance/assessment-result (Ingestion)
  async ingestAssessmentResult(
    attempt: AssessmentAttempt,
    userRole: string = 'Learner'
  ): Promise<{ ingested: boolean; evidence: CompetencyEvidenceRecord | null; message: string }> {
    const res = await fetch('/api/v1/performance/assessment-result', {
      method: 'POST',
      headers: getAuthHeaders(userRole),
      body: JSON.stringify(attempt),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to ingest assessment result');
    }
    return res.json();
  },
};
