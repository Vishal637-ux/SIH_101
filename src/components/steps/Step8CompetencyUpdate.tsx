import React, { useState } from 'react';
import { OfficialProfile } from '../../types';
import { CheckCircle2, ArrowRight, Send } from 'lucide-react';

interface Step8Props {
  profile: OfficialProfile;
  onNext: () => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export const Step8CompetencyUpdate: React.FC<Step8Props> = ({
  onNext,
  theme,
}) => {
  const isLight = theme === 'light';
  const [selectedOption, setSelectedOption] = useState<number | null>(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          AI-Based Assessment
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Validate mastery of adapted competency material
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <span className="font-extrabold text-[#0c2340] dark:text-blue-400 text-sm">Q1.</span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
              Under General Financial Rules (GFR 2017), what is the mandatory threshold ceiling for direct purchasing on Government e-Marketplace (GeM) without requiring reverse auction bidding?
            </p>
          </div>

          {/* Options A, B, C, D */}
          <div className="space-y-2.5 pt-2">
            {[
              { index: 0, letter: 'A', text: 'Up to ₹10,000 across all categories' },
              { index: 1, letter: 'B', text: 'Up to ₹25,000 through any certified GeM seller meeting quality specifications' },
              { index: 2, letter: 'C', text: 'Up to ₹2,50,000 via direct verbal officer approval' },
              { index: 3, letter: 'D', text: 'Direct purchase is completely prohibited regardless of value' },
            ].map((opt) => (
              <div
                key={opt.index}
                onClick={() => setSelectedOption(opt.index)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  selectedOption === opt.index
                    ? 'border-[#0c2340] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#0c2340]'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                  selectedOption === opt.index ? 'bg-[#0c2340] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {opt.letter}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {opt.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {submitted && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Assessment submitted successfully! Score: 100% • Competency Uplift Verified.</span>
          </div>
        )}

        <div className="pt-2 flex justify-between items-center">
          <button
            type="submit"
            className="py-2.5 px-8 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Submit</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>View Progress & Performance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
