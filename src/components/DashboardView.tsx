import React from 'react';
import { OfficialProfile, CompetencyItem, GapAnalysisResult, LearningPathwayItem } from '../types';
import { 
  GraduationCap, 
  Award, 
  Target, 
  Sparkles, 
  CheckSquare, 
  TrendingUp, 
  Flame, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Zap,
  BarChart2
} from 'lucide-react';

interface DashboardViewProps {
  profile: OfficialProfile;
  competencies: CompetencyItem[];
  gapResult: GapAnalysisResult | null;
  pathways: LearningPathwayItem[];
  theme: 'light' | 'dark';
  onNavigateToProfile: () => void;
  onNavigateToSkills: () => void;
  onNavigateToSkillGaps: () => void;
  onNavigateToRecommendations: () => void;
  onNavigateToLearning: () => void;
  onNavigateToAssessments: () => void;
  onNavigateToProgress: () => void;
  onSelectStep?: (step: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  competencies,
  gapResult,
  pathways,
  theme,
  onNavigateToProfile,
  onNavigateToSkills,
  onNavigateToSkillGaps,
  onNavigateToRecommendations,
  onNavigateToLearning,
  onNavigateToAssessments,
  onNavigateToProgress,
  onSelectStep,
}) => {
  const isLight = theme === 'light';

  // Calculate metrics
  const totalCompetencies = competencies.length;
  const avgCurrentLevel = totalCompetencies > 0 
    ? (competencies.reduce((acc, c) => acc + c.currentLevel, 0) / totalCompetencies).toFixed(1)
    : '3.2';
  const avgRequiredLevel = totalCompetencies > 0
    ? (competencies.reduce((acc, c) => acc + c.requiredLevel, 0) / totalCompetencies).toFixed(1)
    : '4.5';
  
  const highPriorityGaps = competencies.filter(c => c.urgency === 'High');
  const overallProgressPct = Math.round((Number(avgCurrentLevel) / Number(avgRequiredLevel)) * 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
        isLight 
          ? 'bg-gradient-to-r from-[#0c2340] via-[#15345a] to-[#1e4676] text-white shadow-md border-slate-200' 
          : 'bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155] text-white border-slate-800 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Official Learner Dashboard
              </span>
              <span className="text-xs text-slate-300">• {profile.cadre}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {profile.designation} — <span className="text-slate-200">{profile.department || profile.ministry}</span>. Continue building your capacity and targeted competencies for high-impact governance.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onNavigateToRecommendations}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>View Recommended Courses</span>
            </button>
            <button
              onClick={onNavigateToProfile}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>My Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={onNavigateToProgress}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
            isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overall Progress
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {overallProgressPct}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +4% this week
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${overallProgressPct}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={onNavigateToSkillGaps}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
            isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Competency Level
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {avgCurrentLevel}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              / {avgRequiredLevel} Target
            </span>
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-2">
            {highPriorityGaps.length} high priority gap{highPriorityGaps.length === 1 ? '' : 's'} identified
          </p>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={onNavigateToLearning}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
            isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Learning Streak
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {profile.streakDays || 9} Days
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Active Streak 🔥
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {profile.completedCourses || 5} courses completed
          </p>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={onNavigateToProgress}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
            isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Karma Points
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {profile.karmaPoints || 420}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Points
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            iGOT Karmayogi Recognition
          </p>
        </div>
      </div>

      {/* Learning Journey Progress Roadmap Card */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Your Capacity Building Journey
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Targeted progression based on role expectations and competency mapping
            </p>
          </div>
          <button
            onClick={onNavigateToSkillGaps}
            className="text-xs font-semibold text-[#0c2340] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Analyze Gaps</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { step: 1, title: 'Official Profile', status: 'Completed', icon: ShieldCheck, nav: () => onSelectStep?.(2) },
            { step: 2, title: 'Competencies', status: 'Completed', icon: Award, nav: () => onSelectStep?.(3) },
            { step: 3, title: 'Skill-Gap Analysis', status: 'In Progress', icon: Target, nav: () => onSelectStep?.(4) },
            { step: 4, title: 'AI Recommendations', status: 'Available', icon: Sparkles, nav: () => onSelectStep?.(5) },
            { step: 5, title: 'Interactive Learning', status: 'Available', icon: GraduationCap, nav: () => onSelectStep?.(6) },
            { step: 6, title: 'Assessment & Uplift', status: 'Next', icon: CheckSquare, nav: () => onSelectStep?.(7) },
          ].map((item, idx) => {
            const Icon = item.icon;
            const isDone = item.status === 'Completed';
            const isInProgress = item.status === 'In Progress';
            return (
              <div 
                key={idx}
                onClick={item.nav}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  isInProgress
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500/50'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 text-xs font-bold ${
                  isInProgress
                    ? 'bg-blue-600 text-white'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {item.title}
                </div>
                <div className={`text-[10px] font-semibold mt-1 ${
                  isInProgress
                    ? 'text-blue-700 dark:text-blue-400'
                    : isDone
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {item.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid: Continue Learning + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Continue Learning & Current Competency Gaps */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning Section */}
          <div className={`p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Continue Learning
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pick up where you left off in your assigned capacity building modules
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToLearning}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl border transition-all ${
                isLight ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      General Financial Rules 2017 & GeM
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Public Procurement & GeM 4.0 Framework
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Module 2: Direct Purchases, Reverse Bidding & PAC Certifications
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">65% Done</span>
                      <p className="text-[10px] text-slate-400">Est. 25 mins left</p>
                    </div>
                    <button
                      onClick={onNavigateToLearning}
                      className="px-3.5 py-2 rounded-lg bg-[#0c2340] hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div className={`p-4 rounded-xl border transition-all ${
                isLight ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Policy Analytics
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Statistical Verification & Evidence-Based Public Policy
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Module 1: Field Sampling Rigor & Scheme Survey Validation
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">30% Done</span>
                      <p className="text-[10px] text-slate-400">Est. 40 mins left</p>
                    </div>
                    <button
                      onClick={onNavigateToLearning}
                      className="px-3.5 py-2 rounded-lg bg-[#0c2340] hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Top Priority Skill Gaps */}
          <div className={`p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Targeted Skill Gaps
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Competencies requiring targeted capacity building for target role
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToSkillGaps}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Full Gap Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {competencies.slice(0, 4).map((c) => {
                const isHigh = c.urgency === 'High';
                const isMedium = c.urgency === 'Medium';
                return (
                  <div 
                    key={c.id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-800/40 border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHigh 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                            : isMedium
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {c.urgency} Urgency
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Gap: {c.gapScore} pts
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {c.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {c.domain} • Required: {c.requiredLevel} / Current: {c.currentLevel}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Level {c.currentLevel} → {c.requiredLevel}
                      </span>
                      <button
                        onClick={onNavigateToRecommendations}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Find Course</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): AI Recommendations & Assessments */}
        <div className="space-y-8">
          {/* Recommended for You */}
          <div className={`p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Recommended for You
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    AI matched for target role
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToRecommendations}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {pathways.slice(0, 3).map((path) => (
                <div 
                  key={path.id}
                  onClick={onNavigateToRecommendations}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isLight 
                      ? 'bg-amber-50/30 border-amber-200/60 hover:border-amber-300 hover:bg-amber-50' 
                      : 'bg-amber-950/20 border-amber-900/40 hover:border-amber-700/60 hover:bg-amber-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      {path.source}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {path.estimatedHours} hrs • {path.karmaPoints} pts
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {path.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    Addresses: {path.competencyAddressed}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming / Recent Assessments */}
          <div className={`p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Assessments
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Verify skill uplift & credentials
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToAssessments}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Assessments
              </button>
            </div>

            <div className="space-y-3">
              <div className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Public Procurement GFR 2017
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Pending Take
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  4 AI adaptive questions • 120 Karma Points
                </p>
                <button
                  onClick={onNavigateToAssessments}
                  className="w-full py-1.5 rounded-lg bg-[#0c2340] text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    e-Governance Compliance
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Passed (90%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Completed 3 days ago • Competency level upgraded to 4.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
