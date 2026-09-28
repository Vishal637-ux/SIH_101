import crypto from 'crypto';

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  salt: string;
  role: 'Learner' | 'Trainer' | 'Admin';
  createdAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  fullName: string;
  role: 'Learner' | 'Trainer' | 'Admin';
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'sih26101_secret_key_civil_services_platform_2026';

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, usedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: usedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
  } catch {
    return false;
  }
}

export function generateToken(user: { id: string; email: string; fullName: string; role: 'Learner' | 'Trainer' | 'Admin' }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    iat: now,
    exp: now + (24 * 60 * 60), // 24 hours validity
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');

  return `${base64Header}.${base64Payload}.${signature}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [base64Header, base64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: JWTPayload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

class AuthStore {
  private users: Map<string, UserAccount> = new Map();
  private emailIndex: Map<string, string> = new Map(); // lowercase email -> userId

  constructor() {
    this.seedUsers();
  }

  private seedUsers() {
    // 1. Seed Pre-existing Admin
    const adminPass = hashPassword('Admin@12345');
    const adminUser: UserAccount = {
      id: 'admin-001',
      email: 'admin@sih26101.gov.in',
      fullName: 'Anita Verma (Chief Admin)',
      passwordHash: adminPass.hash,
      salt: adminPass.salt,
      role: 'Admin',
      createdAt: '2026-01-01T00:00:00Z',
    };
    this.users.set(adminUser.id, adminUser);
    this.emailIndex.set(adminUser.email.toLowerCase(), adminUser.id);

    // 2. Seed Pre-existing Trainer
    const trainerPass = hashPassword('Trainer@12345');
    const trainerUser: UserAccount = {
      id: 'trainer-001',
      email: 'trainer@sih26101.gov.in',
      fullName: 'Dr. Ramesh Kumar (Master Trainer)',
      passwordHash: trainerPass.hash,
      salt: trainerPass.salt,
      role: 'Trainer',
      createdAt: '2026-01-01T00:00:00Z',
    };
    this.users.set(trainerUser.id, trainerUser);
    this.emailIndex.set(trainerUser.email.toLowerCase(), trainerUser.id);

    // 3. Seed Pre-existing Learner / Official
    const learnerPass = hashPassword('Official@12345');
    const learnerUser: UserAccount = {
      id: 'off-001',
      email: 'rajesh.sharma@gov.in',
      fullName: 'Rajesh Sharma',
      passwordHash: learnerPass.hash,
      salt: learnerPass.salt,
      role: 'Learner',
      createdAt: '2026-01-01T00:00:00Z',
    };
    this.users.set(learnerUser.id, learnerUser);
    this.emailIndex.set(learnerUser.email.toLowerCase(), learnerUser.id);
  }

  public findUserByEmail(email: string): UserAccount | null {
    const userId = this.emailIndex.get(email.trim().toLowerCase());
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  public findUserById(id: string): UserAccount | null {
    return this.users.get(id) || null;
  }

  public createUser(params: {
    fullName: string;
    email: string;
    password: string;
    role: 'Learner' | 'Trainer';
  }): UserAccount {
    const cleanEmail = params.email.trim().toLowerCase();
    if (this.emailIndex.has(cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    if (params.role === ('Admin' as any) || params.role === ('Administrator' as any)) {
      throw new Error('Registration as Administrator is not permitted.');
    }

    const { hash, salt } = hashPassword(params.password);
    const userId = params.role === 'Trainer'
      ? `tr-${Date.now()}`
      : `off-${Date.now()}`;

    const newUser: UserAccount = {
      id: userId,
      email: cleanEmail,
      fullName: params.fullName.trim(),
      passwordHash: hash,
      salt,
      role: params.role,
      createdAt: new Date().toISOString(),
    };

    this.users.set(newUser.id, newUser);
    this.emailIndex.set(cleanEmail, newUser.id);
    return newUser;
  }

  public findOrCreateGoogleUser(params: {
    email: string;
    fullName: string;
    role?: 'Learner' | 'Trainer';
  }): UserAccount {
    const cleanEmail = params.email.trim().toLowerCase();
    const existing = this.findUserByEmail(cleanEmail);
    if (existing) {
      return existing;
    }

    const role: 'Learner' | 'Trainer' = params.role || 'Learner';
    if (role === ('Admin' as any) || role === ('Administrator' as any)) {
      throw new Error('Registration as Administrator is not permitted via Google OAuth.');
    }

    // Generate random secret password for Google OAuth account
    const randomSecret = crypto.randomBytes(32).toString('hex');
    const { hash, salt } = hashPassword(randomSecret);
    const userId = role === 'Trainer' ? `tr-google-${Date.now()}` : `off-google-${Date.now()}`;

    const newUser: UserAccount = {
      id: userId,
      email: cleanEmail,
      fullName: params.fullName.trim() || cleanEmail.split('@')[0],
      passwordHash: hash,
      salt,
      role,
      createdAt: new Date().toISOString(),
    };

    this.users.set(newUser.id, newUser);
    this.emailIndex.set(cleanEmail, newUser.id);
    return newUser;
  }
}

export const authStore = new AuthStore();
