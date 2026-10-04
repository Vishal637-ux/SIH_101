import React, { useState, useEffect } from 'react';
import { OfficialProfile, RecommendationRecord } from '../../types';
import { recommendationApi } from '../../services/recommendationApi';
import { skillGapApi } from '../../services/skillGapApi';
import { Sparkles, ArrowRight, RefreshCw, Target, CheckCircle2, Play, BookOpen } from 'lucide-react';

interface Step5Props {
  profile: OfficialProfile;
  onNext: () => void;
  onBack?: () => void;
  onNavigateToAssessments?: () => void;
  theme: 'light' | 'dark';
}

export const Step5Pathway: React.FC<Step5Props> = ({
  profile,
  onNext,
  onNavigateToAssessments,
  theme,
}) => {
  const isLight = theme === 'light';

  // High contrast text helper classes
  const headingClass = isLight ? 'text-[#0c2340]' : 'text-slate-100';
  const bodyTextClass = isLight ? 'text-slate-900' : 'text-slate-100';
  const subtextClass = isLight ? 'text-slate-800' : 'text-slate-300';
  const cardBgClass = isLight ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-900 border-slate-700 shadow-md';

  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState<boolean>(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // 1. Check if user has completed assessment
      const gapsResp = await skillGapApi.getSkillGaps();
      const userGaps = gapsResp.gaps || [];
      const isAssessed = userGaps.length > 0;
      setHasCompletedAssessment(isAssessed);

      if (!isAssessed) {
        setRecommendations([]);
        return;
      }

      // 2. Fetch personalized recommendations
      const recsResp = await recommendationApi.getRecommendations();
      setRecommendations(recsResp.recommendations || []);
    } catch (err: any) {
      console.error('Failed to load personalized recommendations:', err);
      setErrorMessage(err.message || 'Failed to retrieve personalized learning recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [profile.id]);

  const handleStartLearning = async (recId: string) => {
    try {
      setEnrollingId(recId);
      await recommendationApi.startLearning(recId);
      onNext();
    } catch (err: any) {
      console.error('Failed to start learning:', err);
      onNext(); // fallback to proceed to Step 6
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-2 py-8 text-center">
        <div className="p-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#0c2340] dark:text-blue-400 animate-spin" />
          <h3 className={`text-lg font-black ${headingClass}`}>
            Generating Personalized Recommendations...
          </h3>
          <p className={`text-xs font-semibold ${subtextClass}`}>
            Matching your verified skill gaps against curated civil service learning resources.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // STATE 1: User has NOT completed competency assessment
  // ==========================================================================
  if (!hasCompletedAssessment) {
    return (
      <div className="max-w-4xl mx-auto space-y-7 px-2 py-4">
        {/* Title */}
        <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${headingClass}`}>
            Recommended for You
          </h2>
          <p className={`text-sm font-extrabold mt-1 ${subtextClass}`}>
            AI-curated learning interventions directly targeted at bridging your identified competency gaps
          </p>
        </div>

        {/* Empty State Card */}
        <div className={`p-8 md:p-12 rounded-2xl border text-center space-y-5 ${cardBgClass}`}>
          <div className="w-16 h-16 rounded-full bg-blue-100 text-[#0c2340] border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-bold flex items-center justify-center mx-auto shadow-sm">
            <Target className="w-9 h-9" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className={`text-xl font-black ${headingClass}`}>
              No Assessment Found
            </h3>
            <p className={`text-sm font-bold leading-relaxed ${subtextClass}`}>
              Complete your competency assessment to get personalized recommendations.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateToAssessments}
              className="px-8 py-3.5 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Assess Your Skills</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // STATE 2: User HAS completed assessment, but ALL skill gaps are 0% (Requirements met)
  // ==========================================================================
  if (recommendations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-7 px-2 py-4">
        {/* Title */}
        <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${headingClass}`}>
            Recommended for You
          </h2>
          <p className={`text-sm font-extrabold mt-1 ${subtextClass}`}>
            AI-curated learning interventions directly targeted at bridging your identified competency gaps
          </p>
        </div>

        {/* Success / No Gap Card */}
        <div className={`p-8 md:p-12 rounded-2xl border text-center space-y-5 ${
          isLight ? 'bg-emerald-50/90 border-emerald-300 shadow-xs' : 'bg-emerald-950/40 border-emerald-800 shadow-md'
        }`}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700 font-bold flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className={`text-xl font-black ${isLight ? 'text-emerald-950' : 'text-emerald-100'}`}>
              You're meeting your current competency requirements.
            </h3>
            <p className={`text-sm font-extrabold ${isLight ? 'text-emerald-900' : 'text-emerald-200'}`}>
              No immediate learning recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Helper to calculate percentage from 1-5 level
  const toPct = (level: number) => Math.min(100, Math.max(0, Math.round((level / 5.0) * 100)));

  // ==========================================================================
  // STATE 3: Display Personalized Recommendations List
  // ==========================================================================
  return (
    <div className="max-w-4xl mx-auto space-y-7 px-2 py-4">
      {/* Title */}
      <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
        <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${headingClass}`}>
          Recommended for You
        </h2>
        <p className={`text-sm font-extrabold mt-1 ${subtextClass}`}>
          AI-curated learning interventions directly targeted at bridging your identified competency gaps
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-950 text-sm font-black border border-rose-300 shadow-xs">
          {errorMessage}
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((item) => {
          const currPct = toPct(item.currentProficiency);
          const reqPct = toPct(item.requiredProficiency);
          const gapPct = Math.max(0, reqPct - currPct);
          const reasonText = item.whyRecommended && item.whyRecommended.length > 0
            ? item.whyRecommended[0]
            : `Recommended because your ${item.competencyName} competency is below the required level.`;

          const isEnrolling = enrollingId === item.id || enrollingId === item.resourceId;

          return (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                isLight 
                  ? 'bg-white border-slate-300 shadow-xs hover:border-slate-400' 
                  : 'bg-slate-900 border-slate-700 shadow-md hover:border-slate-600'
              }`}
            >
              <div className="space-y-4">
                {/* Header Row: Badge & Skill Gap */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    isLight
                      ? 'bg-blue-50 text-[#0c2340] border-blue-200'
                      : 'bg-blue-950/60 text-blue-300 border-blue-800'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Based on your skill gap</span>
                  </span>

                  {gapPct > 0 && (
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
                      Skill Gap: {gapPct}%
                    </span>
                  )}
                </div>

                {/* Course Title */}
                <div>
                  <h3 className={`text-lg font-black leading-snug ${bodyTextClass}`}>
                    {item.resource.title}
                  </h3>
                  <p className={`text-xs font-bold mt-1 ${subtextClass}`}>
                    Related Skill: <span className="font-black text-slate-900 dark:text-slate-100">{item.competencyName}</span>
                  </p>
                </div>

                {/* Explainability / Reason */}
                <div className={`p-3 rounded-xl border text-xs font-bold ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}>
                  <span className="text-[#0c2340] dark:text-blue-400 font-black">Why recommended: </span>
                  {reasonText}
                </div>

                {/* Metadata Row: Provider & Duration */}
                <div className="flex items-center justify-between text-xs font-bold pt-1 text-slate-600 dark:text-slate-400">
                  <div>
                    Provider: <span className="font-black text-slate-900 dark:text-slate-100">{item.resource.provider}</span>
                  </div>
                  <div>
                    Duration: <span className="font-black text-slate-900 dark:text-slate-100">{item.resource.estimatedHours} Hours</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Start Learning Button */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => handleStartLearning(item.id)}
                  disabled={isEnrolling}
                  className="px-5 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isEnrolling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Learning</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation Button */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onNext}
          className="py-3 px-7 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Go to Personalized Learning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
