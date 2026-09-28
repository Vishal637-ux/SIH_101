import React from 'react';
import { OfficialProfile } from '../../types';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

interface Step5Props {
  profile: OfficialProfile;
  onNext: () => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export const Step5Pathway: React.FC<Step5Props> = ({
  onNext,
  theme,
}) => {
  const isLight = theme === 'light';

  // Rule 7 exact recommendations
  const recommendations = [
    { title: 'Advanced Statistical Analysis', category: 'Statistics', hours: '6 Hours', provider: 'NSSTA / iGOT' },
    { title: 'Python for Data Analysis', category: 'Python', hours: '8 Hours', provider: 'iGOT Karmayogi' },
    { title: 'Data Visualization', category: 'Data Analysis', hours: '5 Hours', provider: 'TPAC' },
    { title: 'Communication Skills', category: 'Communication', hours: '4 Hours', provider: 'Platform Content' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          Recommended for You
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          AI-curated learning interventions directly targeted at bridging your identified competency gaps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((item, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-xs hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              {/* Badge: Based on your skill gap */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 border border-blue-300 dark:text-blue-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Based on your skill gap
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500">
                Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.category}</span> • {item.hours}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Provider: {item.provider}
              </span>
              <button
                onClick={onNext}
                className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={onNext}
          className="py-2.5 px-6 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Go to Personalized Learning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
