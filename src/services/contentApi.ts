import {
  ContentItem,
  ContentVersion,
  ContentAuditLog,
  ContentProcessingJob,
  AssessmentDocket,
} from '../types';

function getAuthHeaders(userRole?: string): HeadersInit {
  const token = localStorage.getItem('pradnyasetu_auth_token') || localStorage.getItem('sih_active_user_id') || 'off-001';
  const role = userRole || localStorage.getItem('pradnyasetu_userRole') || 'Trainer';
  return {
    Authorization: `Bearer ${token}`,
    'x-user-role': role,
  };
}

export const contentApi = {
  // 1. GET /api/v1/content
  async getContentList(
    filters?: {
      type?: string;
      status?: string;
      language?: string;
      search?: string;
      owner?: string;
    },
    userRole: string = 'Trainer'
  ): Promise<{
    totalCount: number;
    userRole: string;
    filtersApplied: any;
    items: ContentItem[];
  }> {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== 'ALL') params.set('type', filters.type);
    if (filters?.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters?.language && filters.language !== 'ALL') params.set('language', filters.language);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.owner) params.set('owner', filters.owner);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/v1/content${qs}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch content items');
    }
    return res.json();
  },

  // 2. GET /api/v1/content/:id
  async getContentById(
    id: string,
    userRole: string = 'Trainer'
  ): Promise<{
    item: ContentItem;
    versions: ContentVersion[];
    auditLogs: ContentAuditLog[];
  }> {
    const res = await fetch(`/api/v1/content/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch content details');
    }
    return res.json();
  },

  // 3. GET /api/v1/content/search
  async searchContent(
    q: string,
    userRole: string = 'Trainer'
  ): Promise<{
    query: string;
    resultsCount: number;
    results: ContentItem[];
  }> {
    const res = await fetch(`/api/v1/content/search?q=${encodeURIComponent(q)}`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Search failed');
    }
    return res.json();
  },

  // 4. POST /api/v1/content/upload (Supports FormData or JSON)
  async uploadContent(
    payload:
      | FormData
      | {
          title: string;
          description?: string;
          language?: string;
          topics?: string[];
          competencyId?: string;
          competencyName?: string;
          domain?: string;
          fileName: string;
          fileBase64?: string;
          textContent?: string;
          mimeType?: string;
        },
    userRole: string = 'Trainer'
  ): Promise<{
    success: boolean;
    message: string;
    content: ContentItem;
  }> {
    const isFormData = payload instanceof FormData;
    const headers = getAuthHeaders(userRole) as Record<string, string>;

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch('/api/v1/content/upload', {
      method: 'POST',
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'File upload failed');
    }
    return res.json();
  },

  // 5. POST /api/v1/content/:id/process
  async processContent(
    id: string,
    userRole: string = 'Trainer'
  ): Promise<{
    success: boolean;
    message: string;
    job: ContentProcessingJob;
    content: ContentItem;
  }> {
    const res = await fetch(`/api/v1/content/${encodeURIComponent(id)}/process`, {
      method: 'POST',
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Processing failed');
    }
    return res.json();
  },

  // 6. POST /api/v1/content/:id/publish
  async publishContent(
    id: string,
    userRole: string = 'Trainer'
  ): Promise<{
    success: boolean;
    message: string;
    content: ContentItem;
  }> {
    const res = await fetch(`/api/v1/content/${encodeURIComponent(id)}/publish`, {
      method: 'POST',
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Publishing failed');
    }
    return res.json();
  },

  // 7. POST /api/v1/content/:id/archive
  async archiveContent(
    id: string,
    userRole: string = 'Trainer'
  ): Promise<{
    success: boolean;
    message: string;
    content: ContentItem;
  }> {
    const res = await fetch(`/api/v1/content/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Archiving failed');
    }
    return res.json();
  },

  // 8. GET /api/v1/content/:id/versions
  async getVersions(
    id: string,
    userRole: string = 'Trainer'
  ): Promise<{
    content_id: string;
    versions: ContentVersion[];
  }> {
    const res = await fetch(`/api/v1/content/${encodeURIComponent(id)}/versions`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch versions');
    }
    return res.json();
  },

  // 9. GET /api/v1/content/:id/assessment-docket
  async getAssessmentDocket(
    id: string,
    userRole: string = 'Trainer'
  ): Promise<{
    success: boolean;
    message: string;
    docket: AssessmentDocket;
  }> {
    const res = await fetch(`/api/v1/content/${encodeURIComponent(id)}/assessment-docket`, {
      headers: getAuthHeaders(userRole),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to retrieve assessment docket');
    }
    return res.json();
  },
};
