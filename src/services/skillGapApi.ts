import {
  SkillGapRecord,
  SkillGapSummary,
  Module05HandoffPayload,
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

export const skillGapApi = {
  // 1. GET /api/v1/skill-gaps
  async getSkillGaps(
    filters?: { domain?: string; priority?: string; status?: string },
    userId?: string
  ): Promise<{
    userId: string;
    officialName: string;
    jobRole: string;
    department: string;
    totalCount: number;
    lastCalculatedAt: string;
    gaps: SkillGapRecord[];
  }> {
    const params = new URLSearchParams();
    if (filters?.domain && filters.domain !== 'All' && filters.domain !== 'All Domains') {
      params.set('domain', filters.domain);
    }
    if (filters?.priority && filters.priority !== 'All') {
      params.set('priority', filters.priority);
    }
    if (filters?.status && filters.status !== 'All') {
      params.set('status', filters.status);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/v1/skill-gaps${queryString}`, {
      headers: getAuthHeaders(userId),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch skill-gap analysis');
    }
    return res.json();
  },

  // 2. GET /api/v1/skill-gaps/summary
  async getSummary(userId?: string): Promise<SkillGapSummary> {
    const res = await fetch('/api/v1/skill-gaps/summary', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch skill-gap summary');
    }
    return res.json();
  },

  // 3. GET /api/v1/skill-gaps/:competencyId
  async getGapDetail(competencyId: string, userId?: string): Promise<SkillGapRecord> {
    const res = await fetch(`/api/v1/skill-gaps/${encodeURIComponent(competencyId)}`, {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to retrieve competency gap detail');
    }
    return res.json();
  },

  // 4. POST /api/v1/skill-gaps/recalculate
  async recalculateGaps(userId?: string): Promise<{
    success: boolean;
    message: string;
    totalAssessed: number;
    competenciesWithGaps: number;
    highPriorityGaps: number;
    gaps: SkillGapRecord[];
  }> {
    const res = await fetch('/api/v1/skill-gaps/recalculate', {
      method: 'POST',
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to recalculate skill gaps');
    }
    return res.json();
  },

  // 5. GET /api/v1/skill-gaps/handoff-to-module5
  async getModule05Handoff(userId?: string): Promise<Module05HandoffPayload> {
    const res = await fetch('/api/v1/skill-gaps/handoff-to-module5', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to retrieve Module 05 handoff payload');
    }
    return res.json();
  },

  // 6. GET /api/v1/skill-gaps/audit-logs
  async getAuditLogs(userId?: string): Promise<{
    userId: string;
    count: number;
    logs: Array<{
      id: string;
      userId: string;
      action: string;
      timestamp: string;
      gapsIdentified: number;
      highPriorityCount: number;
      details: string;
    }>;
  }> {
    const res = await fetch('/api/v1/skill-gaps/audit-logs', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve skill-gap audit logs');
    }
    return res.json();
  },
};
