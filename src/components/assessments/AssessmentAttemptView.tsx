import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  HelpCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Loader2, 
  BookOpen, 
  ShieldCheck 
} from 'lucide-react';
import { AssessmentAttempt } from '../../types';
import { assessmentApi } from '../../services/assessmentApi';

interface AssessmentAttemptViewProps {
  assessmentId: string;
  onBack: () => void;
  onAttemptSubmitted: (attemptResult: AssessmentAttempt) => void;
  userRole?: string;
}

export const AssessmentAttemptView: React.FC<AssessmentAttemptViewProps> = ({
  assessmentId,
  onBack,
  onAttemptSubmitted,
  userRole = 'Learner',
}) => {
  const [assessmentData, setAssessmentData] = useState<any | null>(null);
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active question index
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);

  // User answers map: question_id -> chosen option ('A' | 'B' | 'C' | 'D')
  const [responses, setResponses] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  useEffect(() => {
    async function initAssessment() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // 1. Fetch learner-sanitized assessment questions (no answer keys or explanations)
        const assessment = await assessmentApi.getAssessmentById(assessmentId, userRole, true);
        setAssessmentData(assessment);

        // 2. Start learner attempt session
        const startedAttempt = await assessmentApi.startAttempt(assessmentId, userRole);
        setAttempt(startedAttempt);

        // If previously saved in-progress responses exist
        if (startedAttempt.responses) {
          setResponses(startedAttempt.responses);
        }
      } catch (err: any) {
        console.error('Failed to initialize assessment attempt:', err);
        setErrorMessage(err?.message || 'Failed to start assessment attempt.');
      } finally {
        setIsLoading(false);
      }
    }
    initAssessment();
  }, [assessmentId, userRole]);

  // Elapsed timer tick
  useEffect(() => {
    if (isLoading || isSubmitting || !attempt) return;
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, isSubmitting, attempt]);

  const questions = assessmentData?.questions || [];
  const currentQuestion = questions[currentQIndex];

  // Select option handler
  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: optionKey,
    }));
  };

  // Clear current question answer
  const handleClearAnswer = () => {
    if (!currentQuestion) return;
    setResponses(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const answeredCount = Object.keys(responses).length;
  const totalCount = questions.length;
  const unansweredCount = totalCount - answeredCount;

  // Submit assessment handler
  const handleSubmit = async () => {
    if (!attempt) return;
    try {
      setIsSubmitting(true);
      setShowSubmitModal(false);

      const result = await assessmentApi.submitAttempt(
        attempt.id,
        responses,
        secondsElapsed,
        userRole
      );

      onAttemptSubmitted(result);
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert(err?.message || 'Failed to submit assessment answers.');
      setIsSubmitting(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-500 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-sm font-semibold">Preparing your secure official assessment session...</p>
      </div>
    );
  }

  if (errorMessage || !assessmentData || questions.length === 0) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-white rounded-xl border border-rose-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Assessment Unavailable</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {errorMessage || 'This assessment has no published questions available for attempts.'}
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Return to Assessments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Timer */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => {
              if (answeredCount > 0 && !window.confirm('Leave assessment? Your current responses will be saved in progress.')) {
                return;
              }
              onBack();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Assessment</span>
          </button>
          <h1 className="text-base font-black text-slate-900 leading-tight">
            {assessmentData.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Competency: <strong className="text-blue-700">{assessmentData.competency_name}</strong></span>
            <span>•</span>
            <span>Source: {assessmentData.source_content_title}</span>
          </div>
        </div>

        {/* Live Timer & Progress */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Assessment</span>
          </button>
        </div>
      </div>

      {/* Main Test Layout: Palette & Active Question */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left / Sidebar Question Palette */}
        <div className="lg:col-span-1 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Question Palette
            </h3>
            <span className="text-xs font-bold text-emerald-700">
              {answeredCount}/{totalCount} Answered
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q: any, idx: number) => {
              const isAnswered = Boolean(responses[q.id]);
              const isCurrent = idx === currentQIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'ring-2 ring-blue-600 ring-offset-1 bg-blue-600 text-white shadow-xs'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 shrink-0" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 shrink-0" />
              <span>Unattempted ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-600 shrink-0" />
              <span>Current Question</span>
            </div>
          </div>
        </div>

        {/* Center: Question Area */}
        <div className="lg:col-span-3 p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
                Question {currentQIndex + 1} of {totalCount}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {currentQuestion.topic}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {currentQuestion.difficulty}
              </span>
            </div>

            {responses[currentQuestion.id] && (
              <button
                onClick={handleClearAnswer}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 leading-relaxed">
              {currentQuestion.question_text}
            </h2>
            <div className="text-[11px] text-slate-400">
              Source Directive: {currentQuestion.source_reference?.section_title || 'Module 08 Regulatory Syllabus'}
            </div>
          </div>

          {/* 4 Multiple-Choice Options */}
          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as const).map(letter => {
              const optionText = currentQuestion[`option_${letter.toLowerCase()}`];
              const isSelected = responses[currentQuestion.id] === letter;

              return (
                <div
                  key={letter}
                  onClick={() => handleSelectOption(letter)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {letter}
                  </span>
                  <p className={`text-sm leading-relaxed ${isSelected ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                    {optionText}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentQIndex < totalCount - 1 ? (
              <button
                onClick={() => setCurrentQIndex(prev => Math.min(totalCount - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Review & Submit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Submit Assessment</h3>
                <p className="text-xs text-slate-500">Instant automatic evaluation & competency uplift</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Questions:</span>
                <span className="font-bold text-slate-900">{totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Answered Questions:</span>
                <span className="font-bold text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unanswered Questions:</span>
                <span className={`font-bold ${unansweredCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                  {unansweredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Taken:</span>
                <span className="font-bold text-slate-900">{formatTime(secondsElapsed)}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>You still have {unansweredCount} unanswered question(s). Unanswered questions are evaluated as incorrect.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Answers...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Finalize Submission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
