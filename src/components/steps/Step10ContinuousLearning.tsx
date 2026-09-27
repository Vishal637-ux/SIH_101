import React, { useState } from 'react';
import { OfficialProfile, CompetencyItem } from '../../types';
import { RotateCw, ArrowLeft } from 'lucide-react';

interface Step10ContinuousLearningProps {
  profile: OfficialProfile;
  competencies: CompetencyItem[];
  onTriggerNewCycle: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const Step10ContinuousLearning: React.FC<Step10ContinuousLearningProps> = ({
  profile,
  competencies,
  onTriggerNewCycle,
  onBack,
  theme,
}) => {
  const [isLooping, setIsLooping] = useState(false);

  const handleStartNextCycle = () => {
    setIsLooping(true);
    setTimeout(() => {
      onTriggerNewCycle();
      setIsLooping(false);
    }, 600);
  };

  const isLight = theme === 'light';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className={`text-2xl font-bold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          Continuous Learning: Re-assess → Identify New Gaps → Recommend → Learn 🔄
        </h2>
      </div>

      {/* Cycle Description Card */}
      <div className={`p-6 rounded-xl border text-center space-y-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
          As competencies are mastered, benchmarks elevate automatically. Triggering the next cycle adjusts standards for higher-order governance responsibilities and identifies new learning needs.
        </p>

        <div className="pt-2">
          <button
            onClick={handleStartNextCycle}
            disabled={isLooping}
            className="px-6 py-2.5 rounded-lg bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow"
          >
            <RotateCw className={`w-4 h-4 ${isLooping ? 'animate-spin' : ''}`} />
            <span>{isLooping ? 'Elevating Competency Standards...' : 'Start Next Learning Cycle (Repeat 🔄)'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-start pt-2">
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
      </div>
    </div>
  );
};
