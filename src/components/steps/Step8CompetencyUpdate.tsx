import React from 'react';
import { OfficialProfile, AssessmentEvaluation, CompetencyItem } from '../../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface Step8CompetencyUpdateProps {
  profile: OfficialProfile;
  evaluation: AssessmentEvaluation | null;
  competencies: CompetencyItem[];
  onNext: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const Step8CompetencyUpdate: React.FC<Step8CompetencyUpdateProps> = ({
  profile,
  evaluation,
  competencies,
  onNext,
  onBack,
  theme,
}) => {
  const targetCompName = evaluation?.competencyUplift.competencyName || 'Public Procurement & GeM Rules';
  const prevLevel = evaluation?.competencyUplift.previousLevel ?? 2.2;
  const newLevel = evaluation?.competencyUplift.newLevel ?? 3.4;
  const isLight = theme === 'light';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className={`text-2xl font-bold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          Progress & Competency Update
        </h2>
      </div>

      {/* 3 Pipeline Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Stage 1: Score */}
        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-[10px] font-bold uppercase text-slate-500">
            Stage 1: Verified Score
          </span>
          <div className={`text-2xl font-extrabold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {evaluation ? `${evaluation.score}%` : '100%'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {evaluation?.correctCount || 4} of {evaluation?.totalQuestions || 4} correct
          </p>
        </div>

        {/* Stage 2: Skills Uplift */}
        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-[10px] font-bold uppercase text-slate-500">
            Stage 2: Skill Uplift
          </span>
          <div className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
            {prevLevel.toFixed(1)} → {newLevel.toFixed(1)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {targetCompName}
          </p>
        </div>

        {/* Stage 3: Profile Ledger */}
        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-[10px] font-bold uppercase text-slate-500">
            Stage 3: Profile Credit
          </span>
          <div className="text-2xl font-extrabold mt-1 text-amber-600 dark:text-amber-400">
            +{evaluation?.karmaEarned || 120} Karma
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Credited to {profile.name}
          </p>
        </div>
      </div>

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
          <span>View Analytics Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
