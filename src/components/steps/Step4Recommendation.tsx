import React, { useState, useEffect } from 'react';
import { OfficialProfile, SkillGapRecord, SkillGapSummary } from '../../types';
import { skillGapApi } from '../../services/skillGapApi';
import { Target, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Play } from 'lucide-react';

export type CompetencyDomainName =
  | 'Statistical'
  | 'Technical'
  | 'Digital Governance'
  | 'Behavioural / Managerial';

interface Step4Props {
  profile: OfficialProfile;
  onNext?: () => void;
  onBack?: () => void;
  onNavigateToAssessments?: () => void;
  theme: 'light' | 'dark';
}

export const Step4Recommendation: React.FC<Step4Props> = ({
  onNavigateToAssessments,
  theme,
}) => {
  const isLight = theme === 'light';

  // High contrast helper classes
  const headingClass = isLight ? 'text-[#0c2340]' : 'text-slate-100';
  const bodyTextClass = isLight ? 'text-slate-900' : 'text-slate-100';
  const subtextClass = isLight ? 'text-slate-800' : 'text-slate-300';
  const cardBgClass = isLight ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-900 border-slate-700 shadow-md';

  const DOMAINS: CompetencyDomainName[] = [
    'Statistical',
    'Technical',
    'Digital Governance',
    'Behavioural / Managerial',
  ];

  const [gaps, setGaps] = useState<SkillGapRecord[]>([]);
  const [summary, setSummary] = useState<SkillGapSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load and recalculate user's skill gaps
  const loadSkillGaps = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      // Recalculate based on latest assessment results
      const recalcResp = await skillGapApi.recalculateGaps();
      setGaps(recalcResp.gaps || []);

      const summaryResp = await skillGapApi.getSummary();
      setSummary(summaryResp);
    } catch (err: any) {
      console.error('Failed to load skill gaps:', err);
      setErrorMessage(err.message || 'Failed to load skill gap evaluation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkillGaps();
  }, []);

  // Convert 1.0 - 5.0 level to percentage (0 - 100%)
  const toPercentage = (level: number): number => {
    return Math.min(100, Math.max(0, Math.round((level / 5.0) * 100)));
  };

  // Group gaps by domain
  const gapsByDomain = DOMAINS.reduce((acc, domain) => {
    acc[domain] = gaps.filter(g => g.domain === domain);
    return acc;
  }, {} as Record<CompetencyDomainName, SkillGapRecord[]>);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-2 py-8 text-center">
        <div className="p-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#0c2340] dark:text-blue-400 animate-spin" />
          <h3 className={`text-lg font-black ${headingClass}`}>
            Evaluating Skill Gaps...
          </h3>
          <p className={`text-xs font-semibold ${subtextClass}`}>
            Comparing your latest competency assessment scores against role benchmark requirements.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // EMPTY STATE: User has not completed any competency assessment
  // ==========================================================================
  if (gaps.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-7 px-2 py-4">
        {/* Page Title & Subtitle */}
        <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${headingClass}`}>
            Skill Gap
          </h2>
          <p className={`text-sm font-extrabold mt-1 ${subtextClass}`}>
            Competencies that need improvement
          </p>
        </div>

        {/* Empty State Card */}
        <div className={`p-8 md:p-12 rounded-2xl border text-center space-y-5 ${cardBgClass}`}>
          <div className="w-16 h-16 rounded-full bg-blue-100 text-[#0c2340] border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-bold flex items-center justify-center mx-auto shadow-sm">
            <Target className="w-9 h-9" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className={`text-xl font-black ${headingClass}`}>
              No Competency Assessment Found
            </h3>
            <p className={`text-sm font-bold leading-relaxed ${subtextClass}`}>
              Complete your competency assessment to view your skill gaps.
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

  // Calculate summary counters
  const totalAssessed = gaps.length;
  const needingImprovement = gaps.filter(g => {
    const reqPct = toPercentage(g.requiredProficiency);
    const currPct = toPercentage(g.currentProficiency);
    return Math.max(0, reqPct - currPct) > 0;
  }).length;
  const meetingRequirement = totalAssessed - needingImprovement;

  // ==========================================================================
  // MAIN SKILL GAP DISPLAY VIEW
  // ==========================================================================
  return (
    <div className="max-w-4xl mx-auto space-y-7 px-2 py-4">
      {/* Page Title & Subtitle */}
      <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
        <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${headingClass}`}>
          Skill Gap
        </h2>
        <p className={`text-sm font-extrabold mt-1 ${subtextClass}`}>
          Competencies that need improvement
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-950 text-sm font-black border border-rose-300 shadow-xs">
          {errorMessage}
        </div>
      )}

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Competencies */}
        <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            Total Competencies
          </div>
          <div className={`text-2xl font-black mt-1 ${headingClass}`}>
            {totalAssessed}
          </div>
        </div>

        {/* Competencies Needing Improvement */}
        <div className={`p-4 rounded-2xl border ${
          needingImprovement > 0 
            ? isLight
              ? 'bg-amber-50/90 border-amber-300 shadow-xs'
              : 'bg-amber-950/40 border-amber-800 shadow-md'
            : cardBgClass
        }`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${
            needingImprovement > 0 ? (isLight ? 'text-amber-900' : 'text-amber-300') : (isLight ? 'text-slate-700' : 'text-slate-400')
          }`}>
            Needing Improvement
          </div>
          <div className={`text-2xl font-black mt-1 ${
            needingImprovement > 0 ? (isLight ? 'text-amber-950' : 'text-amber-200') : headingClass
          }`}>
            {needingImprovement}
          </div>
        </div>

        {/* Competencies Meeting Requirement */}
        <div className={`p-4 rounded-2xl border ${
          meetingRequirement > 0 
            ? isLight
              ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
              : 'bg-emerald-950/40 border-emerald-800 shadow-md'
            : cardBgClass
        }`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${
            meetingRequirement > 0 ? (isLight ? 'text-emerald-900' : 'text-emerald-300') : (isLight ? 'text-slate-700' : 'text-slate-400')
          }`}>
            Meeting Requirement
          </div>
          <div className={`text-2xl font-black mt-1 ${
            meetingRequirement > 0 ? (isLight ? 'text-emerald-950' : 'text-emerald-200') : headingClass
          }`}>
            {meetingRequirement}
          </div>
        </div>
      </div>

      {/* Competencies Grouped Under 4 Domains */}
      <div className="space-y-6">
        {DOMAINS.map(domain => {
          const domainGaps = gapsByDomain[domain] || [];
          if (domainGaps.length === 0) return null;

          return (
            <div key={domain} className="space-y-3">
              <h3 className={`text-base font-black uppercase tracking-wider border-b pb-1 border-slate-200 dark:border-slate-800 ${
                isLight ? 'text-[#0c2340]' : 'text-blue-400'
              }`}>
                {domain} Domain
              </h3>

              <div className="space-y-4">
                {domainGaps.map(item => {
                  const currPct = toPercentage(item.currentProficiency);
                  const reqPct = toPercentage(item.requiredProficiency);
                  const gapPct = Math.max(0, reqPct - currPct);
                  const meetsReq = gapPct === 0;

                  return (
                    <div
                      key={item.id || item.competencyId}
                      className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        !meetsReq
                          ? isLight
                            ? 'bg-white border-amber-300 shadow-xs hover:border-amber-400'
                            : 'bg-slate-900 border-amber-900 shadow-md'
                          : isLight
                          ? 'bg-white border-slate-300 shadow-xs hover:border-slate-400'
                          : 'bg-slate-900 border-slate-700 shadow-md'
                      }`}
                    >
                      {/* Left: Competency Name & Domain */}
                      <div className="space-y-1">
                        <h4 className={`text-base font-black ${bodyTextClass}`}>
                          {item.competencyName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                            !meetsReq
                              ? isLight
                                ? 'bg-amber-100 text-amber-950 border-amber-300'
                                : 'bg-amber-950 text-amber-200 border-amber-800'
                              : isLight
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              : 'bg-emerald-950 text-emerald-200 border-emerald-800'
                          }`}>
                            {!meetsReq ? 'Needs Improvement' : 'Meets Requirement'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Scores & Skill Gap Breakdown */}
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div>
                          <div className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                            Current Score
                          </div>
                          <div className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                            {currPct}%
                          </div>
                        </div>

                        <div>
                          <div className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                            Required Score
                          </div>
                          <div className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                            {reqPct}%
                          </div>
                        </div>

                        {!meetsReq && (
                          <div className="pl-2 border-l border-slate-200 dark:border-slate-800">
                            <div className={`text-xs font-extrabold ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                              Skill Gap
                            </div>
                            <div className={`text-base font-black ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>
                              {gapPct}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
