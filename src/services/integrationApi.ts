import {
  NormalizedLearningResource,
  IntegrationSyncLog,
  ExternalEnrollmentRecord,
  EcosystemStatusResponse,
} from '../types';

function getAuthHeaders(userId?: string): HeadersInit {
  const currentUserId = userId || localStorage.getItem('sih_active_user_id') || 'off-001';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${currentUserId}`,
    'x-user-id': currentUserId,
  };
}

export const integrationApi = {
  // 1. GET /api/v1/integrations/status
  async getStatus(): Promise<EcosystemStatusResponse> {
    const res = await fetch('/api/v1/integrations/status', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch integration ecosystem status');
    }
    return res.json();
  },

  // 2. GET /api/v1/integrations/resources
  async getResources(filters?: {
    source?: string;
    domain?: string;
    search?: string;
    resourceType?: string;
  }): Promise<{
    totalCount: number;
    filtersApplied: any;
    resources: NormalizedLearningResource[];
  }> {
    const params = new URLSearchParams();
    if (filters?.source && filters.source !== 'ALL') params.set('source', filters.source);
    if (filters?.domain && filters.domain !== 'ALL') params.set('domain', filters.domain);
    if (filters?.resourceType && filters.resourceType !== 'ALL') params.set('resourceType', filters.resourceType);
    if (filters?.search) params.set('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/v1/integrations/resources${queryString}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch normalized external resources');
    }
    return res.json();
  },

  // 3. GET /api/v1/integrations/resources/:id
  async getResourceById(id: string): Promise<NormalizedLearningResource> {
    const res = await fetch(`/api/v1/integrations/resources/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch resource details');
    }
    return res.json();
  },

  // 4. POST /api/v1/integrations/sync
  async syncEcosystem(source: 'IGOT' | 'NSSTA' | 'TPAC' | 'ALL' = 'ALL'): Promise<{
    success: boolean;
    message: string;
    syncLog: IntegrationSyncLog;
  }> {
    const res = await fetch('/api/v1/integrations/sync', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ source }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to execute synchronization');
    }
    return res.json();
  },

  // 5. POST /api/v1/integrations/enroll
  async enrollOfficial(resourceId: string): Promise<{
    success: boolean;
    message: string;
    enrollment: ExternalEnrollmentRecord;
  }> {
    const res = await fetch('/api/v1/integrations/enroll', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resourceId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to enroll in external resource');
    }
    return res.json();
  },

  // 6. GET /api/v1/integrations/sync-logs
  async getSyncLogs(): Promise<{
    totalLogs: number;
    logs: IntegrationSyncLog[];
  }> {
    const res = await fetch('/api/v1/integrations/sync-logs', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch synchronization logs');
    }
    return res.json();
  },

  // 7. GET /api/v1/integrations/user-enrollments
  async getUserEnrollments(): Promise<{
    userId: string;
    totalEnrollments: number;
    enrollments: ExternalEnrollmentRecord[];
  }> {
    const res = await fetch('/api/v1/integrations/user-enrollments', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user enrollments');
    }
    return res.json();
  },

  // 8. GET /api/v1/integrations/sso/config
  async getSsoConfig(): Promise<any> {
    const res = await fetch('/api/v1/integrations/sso/config');
    if (!res.ok) {
      throw new Error('Failed to fetch SSO configuration');
    }
    return res.json();
  },
};
