import React, { useState } from 'react';
import { OfficialProfile } from '../../types';
import { SAMPLE_PROFILES } from '../../mockData';
import { LogIn, UserPlus, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authApi } from '../../services/authApi';

interface Step1LoginProps {
  currentProfile: OfficialProfile;
  onSelectProfile: (profile: OfficialProfile, role: 'Learner' | 'Trainer' | 'Admin') => void;
  onNext: () => void;
  theme: 'light' | 'dark';
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const Step1Login: React.FC<Step1LoginProps> = ({
  onSelectProfile,
  onNext,
  theme,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'Learner' | 'Trainer'>('Learner');

  // UI Feedback State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isLight = theme === 'light';

  // Email format validation helper
  const isValidEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  // Quick helper to fill demo credentials
  const fillDemoCredentials = (roleType: 'Learner' | 'Trainer' | 'Admin') => {
    setMode('login');
    setErrorMsg(null);
    setSuccessMsg(null);
    if (roleType === 'Learner') {
      setEmail('rajesh.sharma@gov.in');
      setPassword('Official@12345');
    } else if (roleType === 'Trainer') {
      setEmail('trainer@sih26101.gov.in');
      setPassword('Trainer@12345');
    } else if (roleType === 'Admin') {
      setEmail('admin@sih26101.gov.in');
      setPassword('Admin@12345');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.login({ email: cleanEmail, password });
      
      if (res.token && res.user) {
        localStorage.setItem('pradnyasetu_auth_token', res.token);
        localStorage.setItem('pradnyasetu_user', JSON.stringify(res.user));
        localStorage.setItem('pradnyasetu_userRole', res.user.role);
        localStorage.setItem('pradnyasetu_isLoggedIn', 'true');

        let profileObj: OfficialProfile = {
          ...SAMPLE_PROFILES[0],
          id: res.user.id,
          name: res.user.fullName,
          email: res.user.email,
        };

        if (res.user.role === 'Trainer') {
          profileObj = {
            ...SAMPLE_PROFILES[0],
            id: res.user.id,
            name: res.user.fullName,
            email: res.user.email,
            designation: 'Senior Faculty & Master Trainer',
            department: 'Capacity Building Commission',
          };
        } else if (res.user.role === 'Admin') {
          profileObj = {
            ...SAMPLE_PROFILES[0],
            id: res.user.id,
            name: res.user.fullName,
            email: res.user.email,
            designation: 'Chief Administrator',
            department: 'DoPT Workforce Analytics',
          };
        }

        setSuccessMsg(`Authenticated as ${res.user.role}. Redirecting...`);
        
        setTimeout(() => {
          onSelectProfile(profileObj, res.user!.role);
          onNext();
        }, 300);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = fullName.trim();
    const cleanEmail = regEmail.trim();

    if (!cleanName) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!cleanEmail) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!regPassword) {
      setErrorMsg('Password is required.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setErrorMsg('Confirm Password does not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.register({
        fullName: cleanName,
        email: cleanEmail,
        password: regPassword,
        confirmPassword,
        role: regRole,
      });

      if (res.token && res.user) {
        localStorage.setItem('pradnyasetu_auth_token', res.token);
        localStorage.setItem('pradnyasetu_user', JSON.stringify(res.user));
        localStorage.setItem('pradnyasetu_userRole', res.user.role);
        localStorage.setItem('pradnyasetu_isLoggedIn', 'true');

        const newProfile: OfficialProfile = {
          id: res.user.id,
          name: res.user.fullName,
          email: res.user.email,
          cadre: 'Central Secretariat Service (CSS)',
          designation: regRole === 'Trainer' ? 'Faculty & Subject Specialist' : 'Assistant Section Officer (ASO)',
          department: 'Ministry of Statistics & Programme Implementation',
          ministry: 'MoSPI',
          experienceYears: 4,
          currentBand: 'Pay Level 8',
          targetRole: 'Section Officer & Analytics Lead',
          targetGoal: 'Capacity Building & Official Statistics Rigor',
          karmaPoints: 100,
          streakDays: 1,
          completedCourses: 0,
        };

        setSuccessMsg(`Registration successful! Account created as ${res.user.role}.`);
        
        setTimeout(() => {
          onSelectProfile(newProfile, res.user!.role);
          onNext();
        }, 300);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (targetRole: 'Learner' | 'Trainer' = regRole) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const googleEmail = (mode === 'login' ? email : regEmail).trim() || 'official.google@gov.in';
      const googleName = fullName.trim() || 'Government Official (Google Auth)';

      const res = await authApi.googleLogin({
        email: googleEmail,
        fullName: googleName,
        role: targetRole,
      });

      if (res.token && res.user) {
        localStorage.setItem('pradnyasetu_auth_token', res.token);
        localStorage.setItem('pradnyasetu_user', JSON.stringify(res.user));
        localStorage.setItem('pradnyasetu_userRole', res.user.role);
        localStorage.setItem('pradnyasetu_isLoggedIn', 'true');

        let profileObj: OfficialProfile = {
          ...SAMPLE_PROFILES[0],
          id: res.user.id,
          name: res.user.fullName,
          email: res.user.email,
        };

        if (res.user.role === 'Trainer') {
          profileObj = {
            ...SAMPLE_PROFILES[0],
            id: res.user.id,
            name: res.user.fullName,
            email: res.user.email,
            designation: 'Senior Faculty & Master Trainer',
            department: 'Capacity Building Commission',
          };
        }

        setSuccessMsg(`Signed in with Google as ${res.user.role}! Redirecting...`);

        setTimeout(() => {
          onSelectProfile(profileObj, res.user!.role);
          onNext();
        }, 300);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 pb-8">
      <div className={`p-8 rounded-2xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Header Title */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
            {mode === 'login' ? 'User Login' : 'User Registration'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            AI-Enabled Skill Intelligence Platform (SIH26101)
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-300 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-300 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official@gov.in"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors outline-none ${
                  isLight 
                    ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' 
                    : 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors outline-none ${
                  isLight 
                    ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' 
                    : 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                }`}
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Authenticating...' : 'Login'}</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-bold tracking-wider">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleAuth('Learner')}
                disabled={isLoading}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Helper Switch link */}
            <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-[#0c2340] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Register
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* 2. REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors outline-none ${
                  isLight 
                    ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' 
                    : 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="official@gov.in"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors outline-none ${
                  isLight 
                    ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' 
                    : 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password (min. 8 characters) <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors outline-none ${
                  isLight 
                    ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' 
                    : 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors outline-none ${
                  isLight 
                    ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' 
                    : 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                }`}
              />
            </div>

            {/* Role Options - ONLY Learner and Trainer (No Admin option!) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Learner', label: 'Official / Learner' },
                  { id: 'Trainer', label: 'Trainer' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRegRole(r.id as 'Learner' | 'Trainer')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      regRole === r.id
                        ? 'bg-[#0c2340] text-white border-[#0c2340] shadow-xs'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-bold tracking-wider">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleAuth(regRole)}
                disabled={isLoading}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Helper Switch link */}
            <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-[#0c2340] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Pre-seeded Credentials Card (Quick Demo Access) */}
      <div className={`p-4 rounded-xl border text-xs space-y-2 ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-800/60 border-slate-700 text-slate-300'
      }`}>
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span>Quick Demo Login Credentials</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <button
            type="button"
            onClick={() => fillDemoCredentials('Learner')}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-left hover:border-blue-500 cursor-pointer"
          >
            <div className="font-bold text-[#0c2340] dark:text-blue-400">Official / Learner</div>
            <div className="text-[10px] text-slate-500 truncate">rajesh.sharma@gov.in</div>
            <div className="text-[10px] text-slate-400">Official@12345</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemoCredentials('Trainer')}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-left hover:border-blue-500 cursor-pointer"
          >
            <div className="font-bold text-[#0c2340] dark:text-blue-400">Trainer</div>
            <div className="text-[10px] text-slate-500 truncate">trainer@sih26101.gov.in</div>
            <div className="text-[10px] text-slate-400">Trainer@12345</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemoCredentials('Admin')}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-left hover:border-blue-500 cursor-pointer"
          >
            <div className="font-bold text-[#0c2340] dark:text-blue-400">Administrator</div>
            <div className="text-[10px] text-slate-500 truncate">admin@sih26101.gov.in</div>
            <div className="text-[10px] text-slate-400">Admin@12345</div>
          </button>
        </div>
      </div>
    </div>
  );
};
