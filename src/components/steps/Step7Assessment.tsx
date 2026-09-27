import React, { useState } from 'react';
import { OfficialProfile, DemoAssessmentQuestion, AssessmentEvaluation } from '../../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface Step7AssessmentProps {
  profile: OfficialProfile;
  questions: DemoAssessmentQuestion[];
  evaluation: AssessmentEvaluation | null;
  onSubmitEvaluation: (evalResult: AssessmentEvaluation) => void;
  onNext: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const Step7Assessment: React.FC<Step7AssessmentProps> = ({
  profile,
  questions,
  evaluation,
  onSubmitEvaluation,
  onNext,
  onBack,
  theme,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(evaluation !== null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === questions.length;

  const handleSubmit = async () => {
    if (!isAllAnswered) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/evaluate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: selectedAnswers,
          questions,
          officialProfile: profile,
        }),
      });

      if (res.ok) {
        const data: AssessmentEvaluation = await res.json();
        onSubmitEvaluation(data);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className={`text-2xl font-bold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          AI Assessment: MCQs, Quizzes & Tests
        </h2>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-5 rounded-xl border transition-all ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="w-full">
                  <h4 className={`text-sm font-bold leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {q.question}
                  </h4>

                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selected === optIdx;
                      let optionStyle = isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800';

                      if (submitted) {
                        if (optIdx === q.correctIndex) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200';
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle = 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = isLight
                          ? 'border-[#0c2340] bg-blue-50/70 text-[#0c2340] font-semibold'
                          : 'border-blue-500 bg-blue-950/40 text-blue-200 font-semibold';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                            isOptionSelected ? 'border-[#0c2340] bg-[#0c2340] text-white' : 'border-slate-300'
                          }`}>
                            {isOptionSelected ? '✓' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {submitted && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                      <strong>Statutory Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
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

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!isAllAnswered || isSubmitting}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-colors shadow ${
              isAllAnswered
                ? 'bg-[#0c2340] hover:bg-[#133560] text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800'
            }`}
          >
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Answers'}</span>
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-5 py-2 rounded-lg bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
          >
            <span>Proceed to Competency Update</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
