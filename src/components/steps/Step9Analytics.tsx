import React, { useState } from 'react';
import { OfficialProfile, CompetencyItem } from '../../types';
import { WORKFORCE_INSIGHTS } from '../../mockData';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface Step9AnalyticsProps {
  profile: OfficialProfile;
  competencies: CompetencyItem[];
  onNext: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const Step9Analytics: React.FC<Step9AnalyticsProps> = ({
  profile,
  competencies,
  onNext,
  onBack,
  theme,
}) => {
  const [tab, setTab] = useState<'individual' | 'workforce'>('individual');
  const isLight = theme === 'light';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`text-2xl font-bold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          Analytics & Dashboard
        </h2>

        <div className={`flex rounded-lg border p-0.5 text-xs font-semibold ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
        }`}>
          <button
            onClick={() => setTab('individual')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === 'individual'
                ? 'bg-[#0c2340] text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Individual
          </button>
          <button
            onClick={() => setTab('workforce')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === 'workforce'
                ? 'bg-[#0c2340] text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Workforce
          </button>
        </div>
      </div>

      {/* Individual View */}
      {tab === 'individual' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className={`p-4 rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="text-xs text-slate-500">Learning Hours</div>
              <div className={`text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                24.5 hrs
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="text-xs text-slate-500">Modules Completed</div>
              <div className={`text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {profile.completedCourses} Modules
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="text-xs text-slate-500">Karma Points</div>
              <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {profile.karmaPoints}
              </div>
            </div>
          </div>

          {/* Competency Level Bars */}
          <div className={`p-5 rounded-xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Competencies Distribution
            </span>

            <div className="space-y-3 mt-2">
              {competencies.map(c => {
                const percent = (c.currentLevel / 5.0) * 100;
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{c.name}</span>
                      <span className="text-slate-500">{c.currentLevel.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0c2340] dark:bg-blue-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Workforce View */}
      {tab === 'workforce' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {WORKFORCE_INSIGHTS.map((dept) => (
              <div
                key={dept.department}
                className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {dept.department}
                  </h4>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {dept.averageReadiness}% Ready
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {dept.officialCount} Officials enrolled
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-800/40">
                  Top Deficit: {dept.topSkillGaps[0] || 'Public Procurement'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
            isLight
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2 rounded-lg bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
        >
          <span>Continuous Learning Loop</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
