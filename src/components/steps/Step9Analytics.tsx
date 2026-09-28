import React from 'react';
import { OfficialProfile } from '../../types';
import { TrendingUp, BookOpen, Award, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Step9Props {
  profile: OfficialProfile;
  onNext: () => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export const Step9Analytics: React.FC<Step9Props> = ({
  onNext,
  theme,
}) => {
  const isLight = theme === 'light';

  // Rule 11 exact 5 metrics
  const metrics = [
    { title: 'Learning Progress', value: '78%', sub: 'Overall Capacity Completion', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { title: 'Completed Courses', value: '5 Courses', sub: 'Verified Modules', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'Assessment Average', value: '88%', sub: 'First-time Pass Rate', icon: Award, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { title: 'Learning Hours', value: '24.5 Hours', sub: 'Logged Time', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'Skills Improved', value: '+4 Core Skills', sub: 'Public Procurement, Data Analytics', icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          Progress & Performance
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Individual capacity building achievements and score analytics summary
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  {item.title}
                </span>
                <div className={`p-2 rounded-xl border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {item.value}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={onNext}
          className="py-2.5 px-6 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Update Competency Profile</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
