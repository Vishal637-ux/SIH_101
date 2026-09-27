import {
  RecommendationRecord,
  RecommendationSummary,
  PersonalizedLearningPath,
  Module07HandoffPayload,
} from '../types';

function getAuthHeaders(userId?: string): HeadersInit {
  const currentUserId = userId || localStorage.getItem('sih_active_user_id') || 'off-001';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${currentUserId}`,
    'x-user-id': currentUserId,
  };
}

export const recommendationApi = {
  // 1. GET /api/v1/recommendations
  async getRecommendations(
    filters?: {
      domain?: string;
      priority?: string;
      provider?: string;
      resourceType?: string;
      difficulty?: string;
      search?: string;
    },
    userId?: string
  ): Promise<{
    userId: string;
    officialName: string;
    jobRole: string;
    department: string;
    totalCount: number;
    lastGeneratedAt: string;
    recommendations: RecommendationRecord[];
  }> {
    const params = new URLSearchParams();
    if (filters?.domain && filters.domain !== 'All') params.set('domain', filters.domain);
    if (filters?.priority && filters.priority !== 'All') params.set('priority', filters.priority);
    if (filters?.provider && filters.provider !== 'All') params.set('provider', filters.provider);
    if (filters?.resourceType && filters.resourceType !== 'All') params.set('resourceType', filters.resourceType);
    if (filters?.difficulty && filters.difficulty !== 'All') params.set('difficulty', filters.difficulty);
    if (filters?.search && filters.search.trim()) params.set('search', filters.search.trim());

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/v1/recommendations${qs}`, {
      headers: getAuthHeaders(userId),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch recommendations');
    }
    return res.json();
  },

  // 2. GET /api/v1/recommendations/summary
  async getSummary(userId?: string): Promise<RecommendationSummary> {
    const res = await fetch('/api/v1/recommendations/summary', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch recommendation summary');
    }
    return res.json();
  },

  // 3. GET /api/v1/recommendations/path
  async getLearningPath(userId?: string): Promise<PersonalizedLearningPath> {
    const res = await fetch('/api/v1/recommendations/path', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch personalized learning path');
    }
    return res.json();
  },

  // 4. GET /api/v1/recommendations/:id
  async getRecommendationById(id: string, userId?: string): Promise<RecommendationRecord> {
    const res = await fetch(`/api/v1/recommendations/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to retrieve recommendation detail');
    }
    return res.json();
  },

  // 5. POST /api/v1/recommendations/generate
  async generateRecommendations(userId?: string): Promise<{
    success: boolean;
    message: string;
    totalRecommendations: number;
    highPriorityCount: number;
    aiSynthesis?: string;
    recommendations: RecommendationRecord[];
  }> {
    const res = await fetch('/api/v1/recommendations/generate', {
      method: 'POST',
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to regenerate recommendations');
    }
    return res.json();
  },

  // 6. POST /api/v1/recommendations/:id/start
  async startLearning(id: string, userId?: string): Promise<{
    success: boolean;
    message: string;
    handoff: Module07HandoffPayload;
  }> {
    const res = await fetch(`/api/v1/recommendations/${encodeURIComponent(id)}/start`, {
      method: 'POST',
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to enroll and initialize learning experience');
    }
    return res.json();
  },
};
