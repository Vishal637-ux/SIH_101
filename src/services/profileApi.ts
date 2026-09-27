import {
  FullOfficialProfile,
  EducationRecord,
  ExperienceRecord,
  TrainingRecord,
  OfficialSkillRecord,
  ProfileCompletionStatus,
} from '../types';

// Helper to get active user ID from session or local storage
function getAuthHeaders(userId?: string): HeadersInit {
  const currentUserId = userId || localStorage.getItem('sih_active_user_id') || 'off-001';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${currentUserId}`,
    'x-user-id': currentUserId,
  };
}

export const profileApi = {
  // GET /api/v1/profile/me
  async getProfile(userId?: string): Promise<FullOfficialProfile> {
    const res = await fetch('/api/v1/profile/me', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch official profile');
    }
    return res.json();
  },

  // PUT /api/v1/profile/me
  async updateProfile(updates: Partial<FullOfficialProfile>, userId?: string): Promise<{ profile: FullOfficialProfile; message: string; modifiedFields: string[] }> {
    const res = await fetch('/api/v1/profile/me', {
      method: 'PUT',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update official profile');
    }
    return res.json();
  },

  // GET /api/v1/profile/completion
  async getCompletionStatus(userId?: string): Promise<ProfileCompletionStatus> {
    const res = await fetch('/api/v1/profile/completion', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch completion status');
    }
    return res.json();
  },

  // EDUCATION CRUD
  async addEducation(data: Omit<EducationRecord, 'id'>, userId?: string): Promise<EducationRecord> {
    const res = await fetch('/api/v1/profile/education', {
      method: 'POST',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to add education record');
    }
    const json = await res.json();
    return json.record;
  },

  async updateEducation(id: string, data: Partial<EducationRecord>, userId?: string): Promise<EducationRecord> {
    const res = await fetch(`/api/v1/profile/education/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update education record');
    }
    const json = await res.json();
    return json.record;
  },

  async deleteEducation(id: string, userId?: string): Promise<boolean> {
    const res = await fetch(`/api/v1/profile/education/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete education record');
    }
    return true;
  },

  // EXPERIENCE CRUD
  async addExperience(data: Omit<ExperienceRecord, 'id'>, userId?: string): Promise<ExperienceRecord> {
    const res = await fetch('/api/v1/profile/experience', {
      method: 'POST',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to add experience record');
    }
    const json = await res.json();
    return json.record;
  },

  async updateExperience(id: string, data: Partial<ExperienceRecord>, userId?: string): Promise<ExperienceRecord> {
    const res = await fetch(`/api/v1/profile/experience/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update experience record');
    }
    const json = await res.json();
    return json.record;
  },

  async deleteExperience(id: string, userId?: string): Promise<boolean> {
    const res = await fetch(`/api/v1/profile/experience/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete experience record');
    }
    return true;
  },

  // TRAINING CRUD
  async addTraining(data: Omit<TrainingRecord, 'id'>, userId?: string): Promise<TrainingRecord> {
    const res = await fetch('/api/v1/profile/training', {
      method: 'POST',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to add training record');
    }
    const json = await res.json();
    return json.record;
  },

  async updateTraining(id: string, data: Partial<TrainingRecord>, userId?: string): Promise<TrainingRecord> {
    const res = await fetch(`/api/v1/profile/training/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update training record');
    }
    const json = await res.json();
    return json.record;
  },

  async deleteTraining(id: string, userId?: string): Promise<boolean> {
    const res = await fetch(`/api/v1/profile/training/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete training record');
    }
    return true;
  },

  // SKILLS CRUD
  async getSkills(userId?: string): Promise<OfficialSkillRecord[]> {
    const res = await fetch('/api/v1/profile/skills', {
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch skills');
    }
    const json = await res.json();
    return json.skills || [];
  },

  async addSkill(data: Omit<OfficialSkillRecord, 'id'>, userId?: string): Promise<OfficialSkillRecord> {
    const res = await fetch('/api/v1/profile/skills', {
      method: 'POST',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to add skill');
    }
    const json = await res.json();
    return json.record;
  },

  async updateSkill(id: string, data: Partial<OfficialSkillRecord>, userId?: string): Promise<OfficialSkillRecord> {
    const res = await fetch(`/api/v1/profile/skills/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update skill');
    }
    const json = await res.json();
    return json.record;
  },

  async deleteSkill(id: string, userId?: string): Promise<boolean> {
    const res = await fetch(`/api/v1/profile/skills/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(userId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete skill');
    }
    return true;
  },
};
