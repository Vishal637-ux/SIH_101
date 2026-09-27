import {
  NormalizedLearningResource,
  LearningResourceDetail,
  LearningProgressRecord,
  LearningHistoryRecord,
  UserLearningPathView,
} from '../types';

function getAuthHeaders(userId?: string): HeadersInit {
  const currentUserId = userId || localStorage.getItem('sih_active_user_id') || 'off-001';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${currentUserId}`,
    'x-user-id': currentUserId,
  };
}

export const learningApi = {
  // 1. GET /api/v1/learning/resources
  async getResources(filters?: {
    source?: string;
    domain?: string;
    status?: string;
    search?: string;
  }): Promise<{
    totalCount: number;
    filtersApplied: any;
    items: Array<{ resource: NormalizedLearningResource; progress: LearningProgressRecord }>;
  }> {
    const params = new URLSearchParams();
    if (filters?.source && filters.source !== 'ALL') params.set('source', filters.source);
    if (filters?.domain && filters.domain !== 'ALL') params.set('domain', filters.domain);
    if (filters?.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/v1/learning/resources${queryString}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch learning resources');
    }
    return res.json();
  },

  // 2. GET /api/v1/learning/resources/:id
  async getResourceById(id: string): Promise<{
    resource: LearningResourceDetail;
    progress: LearningProgressRecord;
  }> {
    const res = await fetch(`/api/v1/learning/resources/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch learning resource details');
    }
    return res.json();
  },

  // 3. GET /api/v1/learning/path
  async getLearningPath(): Promise<UserLearningPathView> {
    const res = await fetch('/api/v1/learning/path', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch personalized learning path');
    }
    return res.json();
  },

  // 4. POST /api/v1/learning/enroll
  async enroll(resourceId: string): Promise<{
    success: boolean;
    message: string;
    progress: LearningProgressRecord;
  }> {
    const res = await fetch('/api/v1/learning/enroll', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resourceId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to enroll in learning resource');
    }
    return res.json();
  },

  // 5. GET /api/v1/learning/progress
  async getProgressList(): Promise<{
    userId: string;
    totalRecords: number;
    records: LearningProgressRecord[];
  }> {
    const res = await fetch('/api/v1/learning/progress', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch learning progress records');
    }
    return res.json();
  },

  // 6. PUT /api/v1/learning/progress/:resource_id
  async updateProgress(
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
  ): Promise<{
    success: boolean;
    message: string;
    progress: LearningProgressRecord;
  }> {
    const res = await fetch(`/api/v1/learning/progress/${encodeURIComponent(resourceId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update learning progress');
    }
    return res.json();
  },

  // 7. GET /api/v1/learning/history
  async getHistory(): Promise<{
    userId: string;
    totalActivities: number;
    history: LearningHistoryRecord[];
  }> {
    const res = await fetch('/api/v1/learning/history', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch learning history');
    }
    return res.json();
  },

  // 8. POST /api/v1/learning/ask-assistant
  async askAssistant(
    resourceId: string,
    question: string,
    currentModuleTitle?: string
  ): Promise<{
    success: boolean;
    answer: string;
    source: string;
  }> {
    const res = await fetch('/api/v1/learning/ask-assistant', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resourceId, question, currentModuleTitle }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to query civil service AI learning assistant');
    }
    return res.json();
  },
};
