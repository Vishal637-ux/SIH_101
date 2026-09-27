import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Award, 
  Clock, 
  Layers, 
  BookOpen, 
  Target, 
  Sparkles, 
  TrendingUp, 
  RotateCw,
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { AssessmentAttempt } from '../../types';

interface AssessmentResultViewProps {
  attempt: AssessmentAttempt;
  onBackToAssessments: () => void;
  onRetakeAssessment?: () => void;
  onNavigateToSkillGaps?: () => void;
  onNavigateToRecommendations?: () => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  attempt,
  onBackToAssessments,
  onRetakeAssessment,
  onNavigateToSkillGaps,
  onNavigateToRecommendations,
}) => {
  const isPassed = attempt.percentage >= 60;
  const incorrectCount = attempt.total_questions - attempt.score;

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToAssessments}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessments</span>
        </button>

        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-800 border border-purple-200">
          Module 09: Automatic Evaluation & Performance Evidence
        </span>
      </div>

      {/* Main Score Banner */}
      <div className={`p-8 rounded-2xl border text-white shadow-lg relative overflow-hidden ${
        isPassed
          ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-[#0c2340] border-emerald-700/50'
          : 'bg-gradient-to-r from-amber-950 via-slate-900 to-[#0c2340] border-amber-800/50'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/10 backdrop-blur-xs border border-white/20">
              {isPassed ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Assessment Passed (Benchmark Met)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Revision Recommended</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight">{attempt.assessment_title}</h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Official score record verified for <strong>{attempt.learner_name}</strong> on {new Date(attempt.submitted_at || Date.now()).toLocaleDateString(undefined, { dateStyle: 'medium' })}.
            </p>
          </div>

          {/* Big Score Dial */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shrink-0">
            <div className="text-center">
              <span className="text-4xl font-black tracking-tighter text-white">
                {attempt.percentage}%
              </span>
              <span className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">
                Overall Score
              </span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <span className="text-2xl font-black text-amber-300">
                {attempt.score}/{attempt.total_questions}
              </span>
              <span className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">
                Correct
              </span>
            </div>
          </div>
        </div>

        {/* Metric summary strip */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Correct Answers:</span>
            <span className="font-bold text-emerald-300 text-sm">{attempt.score} Questions</span>
          </div>
          <div>
            <span className="text-slate-400 block">Incorrect / Skipped:</span>
            <span className="font-bold text-rose-300 text-sm">{incorrectCount} Questions</span>
          </div>
          <div>
            <span className="text-slate-400 block">Time Invested:</span>
            <span className="font-bold text-white text-sm flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{formatTime(attempt.time_spent_seconds)}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Passing Standard:</span>
            <span className="font-bold text-amber-300 text-sm">60% Benchmark</span>
          </div>
        </div>
      </div>

      {/* Performance Evidence Card: Downstream Handoff */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-xl border border-blue-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-blue-950">Performance Evidence Generated for Competency Framework</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Ready for Downstream Modules
                </span>
              </div>
              <p className="text-xs text-blue-900/80 mt-1 leading-relaxed">
                {attempt.evidence_summary || 'Evaluation evidence generated and recorded into the official competency store.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToSkillGaps && (
              <button
                onClick={onNavigateToSkillGaps}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                <span>View Skill-Gaps</span>
              </button>
            )}
            {onNavigateToRecommendations && (
              <button
                onClick={onNavigateToRecommendations}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-800 hover:bg-blue-50 text-xs font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pathways</span>
              </button>
            )}
          </div>
        </div>

        {/* Downstream architecture pipeline visualization */}
        <div className="p-3 bg-white/80 rounded-lg border border-blue-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Module 09 (Assessment)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-indigo-700">Module 03 (Competency State)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800">Module 04 (Skill-Gap Recalculation)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800">Module 05 (Personalized Pathways)</span>
          </div>
        </div>
      </div>

      {/* Topic-Wise Breakdown & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Topic-Wise Mastery Breakdown</span>
          </h3>

          {attempt.topic_breakdown && Object.keys(attempt.topic_breakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(attempt.topic_breakdown).map(([topic, stat]) => (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{topic}</span>
                    <span className="font-semibold text-slate-600">
                      {stat.correct}/{stat.total} ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stat.percentage >= 75
                          ? 'bg-emerald-500'
                          : stat.percentage >= 50
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Topic-wise data recorded across assessment directives.</p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-600" />
            <span>Areas Needing Reinforcement</span>
          </h3>

          {attempt.areas_for_improvement && attempt.areas_for_improvement.length > 0 ? (
            <div className="space-y-2.5">
              {attempt.areas_for_improvement.map((area, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">{area}</span>
                    <span className="text-amber-800 text-[11px]">
                      Recommended: Review procedural directives and guidelines in Module 08 manual.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Outstanding performance! You answered all topics accurately without critical gaps.</span>
            </div>
          )}
        </div>
      </div>

      {/* Question-Wise Detailed Analysis & Explanations */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Question-Wise Explanations & Regulatory Citations ({attempt.question_breakdown?.length || 0})</span>
        </h3>

        {attempt.question_breakdown?.map((q, idx) => {
          const isCorrect = q.is_correct;

          return (
            <div
              key={q.question_id}
              className={`p-6 bg-white rounded-xl border transition-all space-y-4 ${
                isCorrect ? 'border-slate-200' : 'border-rose-200 bg-rose-50/10'
              }`}
            >
              {/* Question header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {q.topic}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Correct Answer</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Question text */}
              <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                {q.question_text}
              </h4>

              {/* Options Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(['A', 'B', 'C', 'D'] as const).map(letter => {
                  const optField = `option_${letter.toLowerCase()}` as keyof typeof q;
                  const optText = q[optField] as string;
                  const isUserSelection = q.selected_answer === letter;
                  const isOfficialCorrect = q.correct_answer === letter;

                  let borderClass = 'border-slate-200 bg-slate-50 text-slate-700';
                  if (isOfficialCorrect) {
                    borderClass = 'border-emerald-300 bg-emerald-50/80 text-emerald-950 font-bold';
                  } else if (isUserSelection && !isOfficialCorrect) {
                    borderClass = 'border-rose-300 bg-rose-50/80 text-rose-950 font-bold';
                  }

                  return (
                    <div
                      key={letter}
                      className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${borderClass}`}
                    >
                      <span className={`w-5 h-5 rounded text-[11px] font-black flex items-center justify-center shrink-0 ${
                        isOfficialCorrect
                          ? 'bg-emerald-600 text-white'
                          : isUserSelection
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {letter}
                      </span>
                      <span className="leading-snug">{optText}</span>

                      {/* Tag badges */}
                      <div className="ml-auto shrink-0 flex items-center gap-1 text-[10px] uppercase font-bold">
                        {isUserSelection && (
                          <span className={`px-1.5 py-0.5 rounded ${isOfficialCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                            Your Choice
                          </span>
                        )}
                        {isOfficialCorrect && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                            Answer Key
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Official Statutory Explanation */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Official Regulatory Explanation:</span>
                <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Source: {q.source_reference?.content_title} • {q.source_reference?.section_title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToAssessments}
          className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900"
        >
          Return to Assessment Catalog
        </button>

        <div className="flex items-center gap-3">
          {onRetakeAssessment && (
            <button
              onClick={onRetakeAssessment}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retake Assessment</span>
            </button>
          )}

          {onNavigateToSkillGaps && (
            <button
              onClick={onNavigateToSkillGaps}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>Inspect Updated Skill-Gap Analysis</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
