import React, { useState } from 'react';
import { OfficialProfile } from '../../types';
import { SAMPLE_PROFILES } from '../../mockData';
import { ArrowRight, Check } from 'lucide-react';

interface Step1LoginProps {
  currentProfile: OfficialProfile;
  onSelectProfile: (profile: OfficialProfile) => void;
  onNext: () => void;
  theme: 'light' | 'dark';
}

export const Step1Login: React.FC<Step1LoginProps> = ({
  currentProfile,
  onSelectProfile,
  onNext,
  theme,
}) => {
  const [tab, setTab] = useState<'demo' | 'google' | 'custom'>('demo');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customCadre, setCustomCadre] = useState('Central Secretariat Service (CSS)');
  const [customDesignation, setCustomDesignation] = useState('Section Officer');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSelectOfficial = (p: OfficialProfile) => {
    onSelectProfile(p);
    onNext();
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      const googleProfile: OfficialProfile = {
        id: `goog-${Date.now()}`,
        name: 'Pawar Pyarelal',
        email: 'pawarapyarelal1024@gmail.com',
        cadre: 'Indian Administrative Service (IAS)',
        designation: 'Under Secretary',
        ministry: 'Ministry of Personnel, Public Grievances and Pensions',
        department: 'Department of Personnel and Training (DoPT)',
        experienceYears: 6,
        currentBand: 'Pay Level 11',
        targetRole: 'Deputy Secretary / Director',
        targetGoal: 'e-Governance, Policy Analytics & Public Procurement Modernization',
        karmaPoints: 420,
        streakDays: 9,
        completedCourses: 5,
      };
      setGoogleLoading(false);
      onSelectProfile(googleProfile);
      onNext();
    }, 700);
  };

  const handleCustomRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newProfile: OfficialProfile = {
      id: `off-${Date.now().toString().slice(-4)}`,
      name: customName.trim(),
      email: customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '.')}@gov.in`,
      cadre: customCadre,
      designation: customDesignation,
      ministry: 'Ministry of Finance',
      department: 'Department of Expenditure',
      experienceYears: 7,
      currentBand: 'Pay Level 8',
      targetRole: 'Deputy Secretary / Joint Director',
      targetGoal: 'Capacity Building & Public Financial Management Master Plan',
      karmaPoints: 350,
      streakDays: 7,
      completedCourses: 4,
    };

    onSelectProfile(newProfile);
    onNext();
  };

  const isLight = theme === 'light';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className={`text-2xl font-bold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          Official Login / Registration
        </h2>
      </div>

      {/* Auth Mode Tabs */}
      <div className={`flex border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={() => setTab('demo')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            tab === 'demo'
              ? 'border-[#0c2340] text-[#0c2340] dark:border-blue-500 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Select Official
        </button>
        <button
          onClick={() => setTab('google')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            tab === 'google'
              ? 'border-[#0c2340] text-[#0c2340] dark:border-blue-500 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Sign in with Google
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            tab === 'custom'
              ? 'border-[#0c2340] text-[#0c2340] dark:border-blue-500 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          New Official Registration
        </button>
      </div>

      {/* Tab 1: Demo profiles */}
      {tab === 'demo' && (
        <div className="space-y-3">
          {SAMPLE_PROFILES.map((p) => {
            const isSelected = p.id === currentProfile.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectOfficial(p)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                  isSelected
                    ? isLight
                      ? 'border-[#0c2340] bg-blue-50/40 ring-1 ring-[#0c2340]'
                      : 'border-blue-500 bg-blue-950/20 ring-1 ring-blue-500'
                    : isLight
                    ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0c2340] text-amber-300 font-bold flex items-center justify-center text-sm">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {p.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {p.designation} • {p.ministry}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {p.cadre} • {p.experienceYears} Years Exp
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0c2340] text-white dark:bg-blue-600'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>Proceed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Google Sign In */}
      {tab === 'google' && (
        <div className={`p-8 rounded-xl border text-center space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="max-w-md mx-auto space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-3 border shadow-xs transition-all ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
              }`}
            >
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>{googleLoading ? 'Connecting...' : 'Continue with Google Account'}</span>
            </button>
            <p className="text-xs text-slate-500">
              Signs in with your registered official or personal Google ID.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Custom Registration */}
      {tab === 'custom' && (
        <form onSubmit={handleCustomRegister} className={`p-6 rounded-xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Official Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-xs border ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Government Email ID
              </label>
              <input
                type="email"
                placeholder="e.g. ramesh.k@gov.in"
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-xs border ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Service Cadre
              </label>
              <select
                value={customCadre}
                onChange={e => setCustomCadre(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-xs border ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="Central Secretariat Service (CSS)">Central Secretariat Service (CSS)</option>
                <option value="Indian Administrative Service (IAS)">Indian Administrative Service (IAS)</option>
                <option value="Indian Revenue Service (IRS)">Indian Revenue Service (IRS)</option>
                <option value="State Civil Services (SCS)">State Civil Services (SCS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Designation
              </label>
              <input
                type="text"
                required
                value={customDesignation}
                onChange={e => setCustomDesignation(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-xs border ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Register & Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
