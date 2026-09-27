import {
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentGenerationRequest,
} from '../types';

function getAuthHeaders(userRole: string = 'Trainer'): HeadersInit {
  const currentUserId = localStorage.getItem('sih_active_user_id') || 'off-001';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${currentUserId}`,
    'x-user-id': currentUserId,
    'x-user-role': userRole,
  };
}

export const assessmentApi = {
  // 1. GET /api/v1/assessments
  async getAssessments(
    filters?: { status?: string },
    userRole: string = 'Trainer'
  ): Promise<Assessment[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') {
      params.set('status', filters.status);
    }
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/v1/assessments${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch assessments');
    }
    return res.json();
  },

  // 2. GET /api/v1/assessments/:id
  async getAssessmentById(
    id: string,
    userRole: string = 'Trainer',
    asAttempt: boolean = false
  ): Promise<Assessment> {
    const qs = asAttempt ? '?attempt=true' : '';
    const res = await fetch(`/api/v1/assessments/${id}${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to load assessment');
    }
    return res.json();
  },

  // 3. POST /api/v1/assessments/generate
  async generateAssessment(
    request: AssessmentGenerationRequest,
    userRole: string = 'Trainer'
  ): Promise<Assessment> {
    const res = await fetch('/api/v1/assessments/generate', {
      method: 'POST',
      headers: getAuthHeaders(userRole),
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to generate assessment');
    }
    return res.json();
  },

  // 4. POST /api/v1/assessments/:id/publish
  async publishAssessment(id: string, userRole: string = 'Trainer'): Promise<Assessment> {
    const res = await fetch(`/api/v1/assessments/${id}/publish`, {
      method: 'POST',
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to publish assessment');
    }
    return res.json();
  },

  // 5. POST /api/v1/assessments/:id/archive
  async archiveAssessment(id: string, userRole: string = 'Trainer'): Promise<Assessment> {
    const res = await fetch(`/api/v1/assessments/${id}/archive`, {
      method: 'POST',
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to archive assessment');
    }
    return res.json();
  },

  // 6. POST /api/v1/assessments/:id/questions - Add manual question
  async addQuestion(
    assessmentId: string,
    questionData: Partial<AssessmentQuestion>,
    userRole: string = 'Trainer'
  ): Promise<{ assessment: Assessment; question: AssessmentQuestion }> {
    const res = await fetch(`/api/v1/assessments/${assessmentId}/questions`, {
      method: 'POST',
      headers: getAuthHeaders(userRole),
      body: JSON.stringify(questionData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to add question');
    }
    return res.json();
  },

  // 7. PUT /api/v1/assessment-questions/:id - Update question
  async updateQuestion(
    questionId: string,
    updates: Partial<AssessmentQuestion>,
    userRole: string = 'Trainer'
  ): Promise<{ assessment: Assessment; question: AssessmentQuestion }> {
    const res = await fetch(`/api/v1/assessment-questions/${questionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(userRole),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update question');
    }
    return res.json();
  },

  // 8. DELETE /api/v1/assessment-questions/:id
  async deleteQuestion(
    questionId: string,
    userRole: string = 'Trainer'
  ): Promise<Assessment> {
    const res = await fetch(`/api/v1/assessment-questions/${questionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete question');
    }
    return res.json();
  },

  // 9. POST /api/v1/assessment-questions/:id/regenerate
  async regenerateQuestion(
    questionId: string,
    assessmentId: string,
    instructions?: string,
    userRole: string = 'Trainer'
  ): Promise<AssessmentQuestion> {
    const res = await fetch(`/api/v1/assessment-questions/${questionId}/regenerate`, {
      method: 'POST',
      headers: getAuthHeaders(userRole),
      body: JSON.stringify({ assessmentId, instructions }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to regenerate question');
    }
    return res.json();
  },

  // 10. POST /api/v1/assessments/:id/attempt - Start attempt (Learner)
  async startAttempt(
    assessmentId: string,
    userRole: string = 'Learner'
  ): Promise<AssessmentAttempt> {
    const res = await fetch(`/api/v1/assessments/${assessmentId}/attempt`, {
      method: 'POST',
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to start assessment attempt');
    }
    return res.json();
  },

  // 11. POST /api/v1/attempts/:id/submit - Submit answers
  async submitAttempt(
    attemptId: string,
    responses: Record<string, 'A' | 'B' | 'C' | 'D'>,
    timeSpentSeconds: number = 0,
    userRole: string = 'Learner'
  ): Promise<AssessmentAttempt> {
    const res = await fetch(`/api/v1/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(userRole),
      body: JSON.stringify({ responses, timeSpentSeconds }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit assessment answers');
    }
    return res.json();
  },

  // 12. GET /api/v1/attempts/:id/result - Fetch attempt evaluation
  async getAttemptResult(
    attemptId: string,
    userRole: string = 'Learner'
  ): Promise<AssessmentAttempt> {
    const res = await fetch(`/api/v1/attempts/${attemptId}/result`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch assessment result');
    }
    return res.json();
  },

  // 13. GET /api/v1/attempts/learner/:learnerId
  async getLearnerAttempts(
    learnerId: string,
    userRole: string = 'Learner'
  ): Promise<AssessmentAttempt[]> {
    const res = await fetch(`/api/v1/attempts/learner/${learnerId}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch learner assessment history');
    }
    return res.json();
  },
};
