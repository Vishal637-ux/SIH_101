export interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'Learner' | 'Trainer';
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: 'Learner' | 'Trainer' | 'Admin';
  };
}

export const authApi = {
  async register(params: RegisterParams): Promise<AuthResponse> {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Registration failed.');
    }
    return data;
  },

  async login(params: LoginParams): Promise<AuthResponse> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Login failed.');
    }
    return data;
  },

  async googleLogin(params: { email: string; fullName?: string; role?: 'Learner' | 'Trainer' }): Promise<AuthResponse> {
    const res = await fetch('/api/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Google authentication failed.');
    }
    return data;
  },

  async getCurrentUser(token: string): Promise<AuthResponse> {
    const res = await fetch('/api/v1/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Session expired or invalid.');
    }
    return data;
  },
};
