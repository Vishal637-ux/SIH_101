import React from 'react';
import { OfficialProfile } from '../../types';
import { RefreshCw, CheckCircle2, ArrowRight, Sparkles, Target } from 'lucide-react';

interface Step10Props {
  profile: OfficialProfile;
  onTriggerNewCycle: () => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export const Step10ContinuousLearning: React.FC<Step10Props> = ({
  onTriggerNewCycle,
  theme,
}) => {
  const isLight = theme === 'light';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b pb-4 border-slate-200 dark:border-slate-800 text-center">
        <h2 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          Competency Profile Update
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Continuous Learning Cycle Engine & Level Advancement
        </p>
      </div>

      {/* Cycle Diagram matching Rule 12 */}
      <div className={`p-8 rounded-2xl border shadow-sm space-y-6 text-center ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Profile Updated With New Competencies!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Your recent assessment completion has upgraded your official competency rating. The capacity engine has calculated your new benchmark gap.
          </p>
        </div>

        {/* Visual 3-Stage Cycle Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className={`p-4 rounded-xl border text-center ${isLight ? 'bg-blue-50/60 border-blue-200' : 'bg-blue-950/30 border-blue-800'}`}>
            <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">1. Profile Updated</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">New Competencies Registered</p>
          </div>

          <div className={`p-4 rounded-xl border text-center ${isLight ? 'bg-purple-50/60 border-purple-200' : 'bg-purple-950/30 border-purple-800'}`}>
            <Target className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">2. New Skill Gap Analysis</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Next-Level Gap Recalculated</p>
          </div>

          <div className={`p-4 rounded-xl border text-center ${isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/30 border-amber-800'}`}>
            <Sparkles className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">3. New Recommendations</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Fresh AI Learning Pathway</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button
            onClick={onTriggerNewCycle}
            className="py-3 px-8 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Repeat Continuous Learning Cycle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
