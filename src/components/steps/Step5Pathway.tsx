import React from 'react';
import { OfficialProfile, LearningPathwayItem, Module07HandoffPayload } from '../../types';
import { RecommendationDashboard } from '../RecommendationDashboard';
import { ArrowLeft } from 'lucide-react';

interface Step5PathwayProps {
  profile: OfficialProfile;
  pathways: LearningPathwayItem[];
  selectedPathwayId: string;
  onSelectPathway: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  onNavigateToIntegrations?: () => void;
  theme: 'light' | 'dark';
}

export const Step5Pathway: React.FC<Step5PathwayProps> = ({
  profile,
  onNext,
  onBack,
  onNavigateToIntegrations,
}) => {
  const handleStartLearning = (handoff: Module07HandoffPayload) => {
    // Transition to Module 07 Learning Experience (Step 6/7)
    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Skill-Gap Analysis</span>
        </button>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          Recommended for You
        </span>
      </div>

      {/* Main Module 05 Recommendation Dashboard */}
      <RecommendationDashboard
        profile={profile}
        onStartLearning={handleStartLearning}
        onBackToSkillGaps={onBack}
        onNavigateToIntegrations={onNavigateToIntegrations}
      />
    </div>
  );
};
