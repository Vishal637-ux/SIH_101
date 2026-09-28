import {
  CompetencyDefinition,
  CompetencyRequirement,
  AssessmentSession,
  OfficialCompetencyRecord,
  CompetencyHistoryRecord,
  Module04HandoffContract,
} from '../types';

function getAuthHeaders(userId?: string): HeadersInit {
  const token = localStorage.getItem('pradnyasetu_auth_token') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
}

export const competencyApi = {
  // 1. GET /api/v1/competencies
  async getCompetenciesCatalog(): Promise<{
    frameworkVersion: string;
    totalCompetencies: number;
    competencies: CompetencyDefinition[];
  }> {
    const res = await fetch('/api/v1/competencies');
    if (!res.ok) {
      throw new Error('Failed to fetch competency catalog');
    }
    return res.json();
  },

  // 2. GET /api/v1/competencies/framework
  async getFrameworkDetails(): Promise<{
    version: string;
    name: string;
    domains: string[];
    totalCompetencies: number;
    competencies: CompetencyDefinition[];
  }> {
    const res = await fetch('/api/v1/competencies/framework');
    if (!res.ok) {
      throw new Error('Failed to fetch competency framework metadata');
    }
    return res.json();
  },

  // 3. GET /api/v1/competencies/requirements
  async getRoleRequirements(
    role?: string,
    department?: string,
    userId?: string
  ): Promise<{
    role: string;
    department: string;
    count: number;
    requirements: CompetencyRequirement[];
  }> {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (department) params.set('department', department);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`/api/v1/competencies/requirements${queryString}`, {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch role competency requirements');
    }
    return res.json();
  },

  // 4. GET /api/v1/competencies/me
  async getMyCompetencies(userId?: string): Promise<{
    userId: string;
    totalAssessed: number;
    latestAttemptNumber: number;
    lastAssessedAt: string | null;
    competencies: OfficialCompetencyRecord[];
  }> {
    const res = await fetch('/api/v1/competencies/me', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch current official competencies');
    }
    return res.json();
  },

  // 5. POST /api/v1/competency-assessments
  async createAssessmentSession(
    assessmentType: 'ROLE_BASELINE' | 'PERIODIC_REVIEW' | 'MODULE_EVALUATION' | 'REASSESSMENT' = 'ROLE_BASELINE',
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
    session: AssessmentSession;
  }> {
    const res = await fetch('/api/v1/competency-assessments', {
      method: 'POST',
      headers: getAuthHeaders(userId),
      body: JSON.stringify({ assessmentType }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to initialize assessment session');
    }
    return res.json();
  },

  // 5b. POST /api/v1/competency-assessments (Domain specific)
  async startDomainAssessment(
    domain: 'Statistical' | 'Technical' | 'Digital Governance' | 'Behavioural / Managerial',
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
    session: AssessmentSession;
  }> {
    const res = await fetch('/api/v1/competency-assessments', {
      method: 'POST',
      headers: getAuthHeaders(userId),
      body: JSON.stringify({ domain, assessmentType: 'MODULE_EVALUATION' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to start ${domain} assessment session`);
    }
    return res.json();
  },

  // 6. GET /api/v1/competency-assessments/:id
  async getAssessmentSession(id: string, userId?: string): Promise<AssessmentSession> {
    const res = await fetch(`/api/v1/competency-assessments/${id}`, {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to retrieve assessment session');
    }
    return res.json();
  },

  // 7. POST /api/v1/competency-assessments/:id/answers
  async recordAnswer(
    sessionId: string,
    questionId: string,
    selectedIndex: number,
    userId?: string
  ): Promise<{
    success: boolean;
    answeredCount: number;
    totalQuestions: number;
  }> {
    const res = await fetch(`/api/v1/competency-assessments/${sessionId}/answers`, {
      method: 'POST',
      headers: getAuthHeaders(userId),
      body: JSON.stringify({ questionId, selectedIndex }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save question response');
    }
    return res.json();
  },

  // 8. POST /api/v1/competency-assessments/:id/complete
  async completeAssessment(
    sessionId: string,
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
    overallScore: number;
    attemptNumber: number;
    completedAt: string;
    session: AssessmentSession;
  }> {
    const res = await fetch(`/api/v1/competency-assessments/${sessionId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to evaluate and finalize assessment');
    }
    return res.json();
  },

  // 9. GET /api/v1/competencies/history
  async getAssessmentHistory(userId?: string): Promise<{
    userId: string;
    totalAttempts: number;
    history: CompetencyHistoryRecord[];
  }> {
    const res = await fetch('/api/v1/competencies/history', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve assessment history');
    }
    return res.json();
  },

  // 10. GET /api/v1/competencies/handoff-to-module4
  async getModule04Handoff(userId?: string): Promise<Module04HandoffContract> {
    const res = await fetch('/api/v1/competencies/handoff-to-module4', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve Module 04 handoff contract');
    }
    return res.json();
  },
};
