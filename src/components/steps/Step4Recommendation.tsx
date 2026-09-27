import React from 'react';
import { OfficialProfile, CompetencyItem, GapAnalysisResult, Module05HandoffPayload } from '../../types';
import { SkillGapDashboard } from '../SkillGapDashboard';
import { ArrowLeft } from 'lucide-react';

interface Step4RecommendationProps {
  profile: OfficialProfile;
  competencies: CompetencyItem[];
  gapResult: GapAnalysisResult | null;
  onNext: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const Step4Recommendation: React.FC<Step4RecommendationProps> = ({
  profile,
  onNext,
  onBack,
}) => {
  const handleProceedToModule05 = (handoff: Module05HandoffPayload) => {
    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Competencies & Assessment</span>
        </button>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          Skill-Gap Analysis Engine
        </span>
      </div>

      {/* Main Module 04 Skill-Gap Analysis Dashboard */}
      <SkillGapDashboard
        profile={profile}
        onProceedToModule05={handleProceedToModule05}
        onNavigateToCompetencies={onBack}
      />
    </div>
  );
};
