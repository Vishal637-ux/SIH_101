import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  CheckCircle, 
  BookOpen, 
  Target, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  CheckCircle2, 
  RotateCw, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Loader2,
  ExternalLink,
  Flame,
  BarChart3
} from 'lucide-react';
import { 
  LearnerProgressSummary, 
  LearningHoursSummary, 
  TopicPerformanceRecord, 
  PerformanceTrendPoint, 
  CompetencyEvidenceRecord, 
  LearningProgressRecord, 
  AssessmentAttempt 
} from '../../types';
import { progressApi } from '../../services/progressApi';

interface ProgressPerformanceDashboardProps {
  onNavigateToLearning?: () => void;
  onNavigateToAssessments?: () => void;
  onNavigateToSkillGaps?: () => void;
  onNavigateToRecommendations?: () => void;
  userRole?: 'Trainer' | 'Admin' | 'Learner';
}

export const ProgressPerformanceDashboard: React.FC<ProgressPerformanceDashboardProps> = ({
  onNavigateToLearning,
  onNavigateToAssessments,
  onNavigateToSkillGaps,
  onNavigateToRecommendations,
  userRole: propUserRole = 'Learner',
}) => {
  const [activeRole, setActiveRole] = useState<'Trainer' | 'Learner'>(propUserRole === 'Trainer' ? 'Trainer' : 'Learner');
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>('off-001');

  // Data states
  const [summary, setSummary] = useState<LearnerProgressSummary | null>(null);
  const [hours, setHours] = useState<LearningHoursSummary | null>(null);
  const [learningRecords, setLearningRecords] = useState<LearningProgressRecord[]>([]);
  const [topicRecords, setTopicRecords] = useState<TopicPerformanceRecord[]>([]);
  const [trends, setTrends] = useState<PerformanceTrendPoint[]>([]);
  const [evidenceList, setEvidenceList] = useState<CompetencyEvidenceRecord[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentAttempt[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadAllData = async (learnerId: string, role: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [
        summaryRes,
        hoursRes,
        learningRes,
        topicsRes,
        trendsRes,
        evidenceRes,
        assessmentsRes,
      ] = await Promise.all([
        progressApi.getProgressSummary(learnerId, role),
        progressApi.getLearningHours(learnerId, role),
        progressApi.getLearningProgress(learnerId, role),
        progressApi.getTopicPerformance(learnerId, role),
        progressApi.getPerformanceTrends(learnerId, role),
        progressApi.getCompetencyEvidence(learnerId, role),
        progressApi.getAssessmentHistory(learnerId, role),
      ]);

      setSummary(summaryRes);
      setHours(hoursRes);
      setLearningRecords(learningRes);
      setTopicRecords(topicsRes);
      setTrends(trendsRes);
      setEvidenceList(evidenceRes);
      setAssessmentHistory(assessmentsRes);
    } catch (err: any) {
      console.error('Failed to load progress & performance data:', err);
      setErrorMessage(err?.message || 'Failed to load progress records.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData(selectedLearnerId, activeRole);
  }, [selectedLearnerId, activeRole]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAllData(selectedLearnerId, activeRole);
  };

  if (isLoading && !summary) {
    return (
      <div className="p-16 text-center text-slate-500 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-sm font-semibold">Aggregating learning progress & performance records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Role/Learner Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-[#0c2340] text-amber-400 font-black flex items-center justify-center text-xs shadow border border-amber-400/30">
              M10
            </span>
            <h1 className="text-xl font-black text-slate-900">
              Progress & Performance Management Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time tracking of learning completion, learning hours, assessment performance over time, and verified competency evidence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Data</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveRole('Learner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRole === 'Learner'
                  ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Learner View</span>
            </button>
            <button
              onClick={() => setActiveRole('Trainer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRole === 'Trainer'
                  ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Trainer Inspector</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Identity Banner */}
      {summary && (
        <div className="p-5 bg-gradient-to-r from-[#0c2340] to-[#1e3a8a] text-white rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-[#0c2340] font-black text-lg flex items-center justify-center shrink-0 shadow">
              {summary.learnerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">{summary.learnerName}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-white border border-white/30">
                  {summary.designation}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{summary.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-center">
              <span className="text-slate-300 block text-[10px] uppercase font-bold">Total Learning</span>
              <span className="text-lg font-black text-amber-300">{summary.totalLearningHours} hrs</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-center">
              <span className="text-slate-300 block text-[10px] uppercase font-bold">Avg Assessment</span>
              <span className="text-lg font-black text-emerald-300">{summary.averageAssessmentScore}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP: Progress Summary Metric Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
          {/* Overall Learning Completion */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Completion
            </span>
            <span className="text-2xl font-black text-blue-700 block">
              {summary.overallLearningCompletion}%
            </span>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${summary.overallLearningCompletion}%` }}
              />
            </div>
          </div>

          {/* Learning Hours */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Learning Time
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {summary.totalLearningHours}h
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              {summary.weeklyLearningHours}h this week
            </span>
          </div>

          {/* Completed Resources */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-2xl font-black text-emerald-700 block">
              {summary.completedResourcesCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              of {summary.totalEnrolledResources} enrolled
            </span>
          </div>

          {/* Assessments Completed */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Assessments
            </span>
            <span className="text-2xl font-black text-purple-700 block">
              {summary.assessmentsCompletedCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Objective MCQs
            </span>
          </div>

          {/* Average Assessment Score */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Avg Score
            </span>
            <span className={`text-2xl font-black block ${
              summary.averageAssessmentScore >= 75
                ? 'text-emerald-700'
                : summary.averageAssessmentScore >= 60
                ? 'text-blue-700'
                : 'text-amber-700'
            }`}>
              {summary.averageAssessmentScore}%
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Benchmark: 60%
            </span>
          </div>

          {/* Skills/Topics Improving */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Improving
            </span>
            <span className="text-2xl font-black text-emerald-700 block">
              {summary.improvingTopicsCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              {summary.topImprovingTopics[0] || 'Strong trajectory'}
            </span>
          </div>

          {/* Topics Needing Practice */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Need Practice
            </span>
            <span className="text-2xl font-black text-rose-700 block">
              {summary.topicsNeedingPracticeCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              {summary.topicsNeedingPractice[0] || 'No critical gaps'}
            </span>
          </div>
        </div>
      )}

      {/* 2. MIDDLE: Learning Progress & Assessment Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Course / Resource Progress */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Learning Path & Resource Progress</h3>
            </div>
            {onNavigateToLearning && (
              <button
                onClick={onNavigateToLearning}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                <span>Module 07 Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {learningRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">No active learning enrollments recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {learningRecords.map(record => (
                <div
                  key={record.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          {record.provider}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {record.competencyName}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                        {record.resourceTitle}
                      </h4>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 border ${
                      record.status === 'COMPLETED' || record.progressPercentage >= 100
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {record.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Progress:</span>
                      <span className="font-bold text-slate-900">{record.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          record.progressPercentage >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${record.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Time spent: <strong>{record.totalTimeSpentMinutes} mins</strong></span>
                    <span>Modules completed: <strong>{record.completedModules?.length || 0}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Assessment Performance History */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Assessment Attempt History</h3>
            </div>
            {onNavigateToAssessments && (
              <button
                onClick={onNavigateToAssessments}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
              >
                <span>Module 09 Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {assessmentHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Award className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">No completed assessments recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {assessmentHistory.map(att => {
                const passed = att.percentage >= 60;
                return (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        passed
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {att.percentage}%
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                          {att.assessment_title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{att.score}/{att.total_questions} Correct</span>
                          <span>•</span>
                          <span>{new Date(att.submitted_at || att.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <span>•</span>
                          <span className={passed ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                            {passed ? 'Passed' : 'Needs Practice'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      Attempt #{att.id.slice(-4)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM: Topic Performance & Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Topic-Wise Performance */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Topic-Wise Performance & Trends</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Actual assessment evidence</span>
          </div>

          {topicRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Target className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">Take an assessment in Module 09 to view topic breakdowns.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {topicRecords.map(topic => (
                <div
                  key={topic.topic}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{topic.topic}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                        topic.status === 'MASTERED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : topic.status === 'IMPROVING'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {topic.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {topic.trendDelta !== null && (
                        <span className={`inline-flex items-center text-xs font-bold ${
                          topic.trendDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {topic.trendDelta >= 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          <span>{topic.trendDelta > 0 ? `+${topic.trendDelta}%` : `${topic.trendDelta}%`}</span>
                        </span>
                      )}
                      <span className="text-sm font-black text-slate-900">{topic.currentPercentage}%</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        topic.currentPercentage >= 75
                          ? 'bg-emerald-500'
                          : topic.currentPercentage >= 50
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${topic.currentPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Accuracy: <strong>{topic.totalQuestionsCorrect}/{topic.totalQuestionsAttempted} questions</strong></span>
                    <span>Assessments: <strong>{topic.attemptsCount}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Performance Trend Chart (Real SVG line plot) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Historical Performance Trajectory</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Chronological progression</span>
          </div>

          {trends.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <TrendingUp className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">Trajectory charts will appear as you complete activities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Visual Plot */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Score / Completion %</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span>Assessments</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span>Course Checkpoints</span>
                    </span>
                  </div>
                </div>

                {/* Bars chart */}
                <div className="h-44 flex items-end gap-2 pt-4 px-2 border-b border-slate-300">
                  {trends.slice(-8).map((pt, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-slate-900 text-white text-[10px] whitespace-nowrap z-10">
                        {pt.title}: {pt.scoreOrProgress}%
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">
                        {pt.scoreOrProgress}%
                      </span>
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          pt.type === 'ASSESSMENT' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                        style={{ height: `${Math.max(12, pt.scoreOrProgress * 1.2)}px` }}
                      />
                      <span className="text-[10px] text-slate-400 truncate w-full text-center">
                        {pt.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Hours Summary Card */}
              {hours && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Hours</span>
                    <span className="text-base font-black text-blue-900">{hours.totalHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Past 7 Days</span>
                    <span className="text-base font-black text-blue-900">{hours.weeklyHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Past 30 Days</span>
                    <span className="text-base font-black text-blue-900">{hours.monthlyHours} hrs</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. COMPETENCY EVIDENCE & DOWNSTREAM HANDOFF */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50/60 rounded-2xl border border-purple-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-purple-950">
                  Verified Performance Evidence for Downstream Modules
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Module 03 Synced
                </span>
              </div>
              <p className="text-xs text-purple-900/80 mt-1 leading-relaxed">
                Module 10 generates objective evidence from learner completions and test scores, synchronizing directly with Module 03 (Competency Management) to trigger real-time skill-gap recalculation in Module 04 and personalized recommendations in Module 05.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToSkillGaps && (
              <button
                onClick={onNavigateToSkillGaps}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Inspect Skill-Gaps</span>
              </button>
            )}
            {onNavigateToRecommendations && (
              <button
                onClick={onNavigateToRecommendations}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-300 text-purple-900 hover:bg-purple-50 text-xs font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Recommendations</span>
              </button>
            )}
          </div>
        </div>

        {/* Evidence items list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {evidenceList.map(ev => (
            <div
              key={ev.id}
              className="p-3.5 bg-white/90 rounded-xl border border-purple-200 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950">{ev.competencyName}</span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                  {ev.proficiencyBand} ({ev.evaluatedProficiency.toFixed(1)}/5.0)
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{ev.evidenceSummary}</p>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Source: {ev.sourceTitle}</span>
                <span>{new Date(ev.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
