import React, { useState } from 'react';
import { OfficialProfile } from '../../types';
import { FileUp, Sparkles, FileText, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';

interface Step7Props {
  profile: OfficialProfile;
  onNext: () => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export const Step7Assessment: React.FC<Step7Props> = ({
  onNext,
  theme,
}) => {
  const isLight = theme === 'light';
  const [selectedSource, setSelectedSource] = useState<'PDF' | 'Book' | 'Document'>('PDF');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepFinished, setStepFinished] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          AI Content Adaptation
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Automated simplification, key point extraction, and adaptive MCQ generation for official manuals
        </p>
      </div>

      {/* Visual Flow diagram matching Rule 9 */}
      <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#0c2340]/5 border-[#0c2340]/20' : 'bg-blue-950/20 border-blue-800/40'}`}>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 text-center">
          Adaptation Pipeline Flow
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-2 text-center text-[11px] font-bold">
          <span className="px-3 py-1 rounded-lg bg-blue-600 text-white shadow-xs">Upload / Select Content</span>
          <span className="text-slate-400">↓</span>
          <span className="px-3 py-1 rounded-lg bg-[#0c2340] text-amber-300 shadow-xs">AI Understands Content</span>
          <span className="text-slate-400">↓</span>
          <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">Summary & Key Points</span>
          <span className="text-slate-400">↓</span>
          <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white shadow-xs">Simplified Explanation</span>
          <span className="text-slate-400">↓</span>
          <span className="px-3 py-1 rounded-lg bg-purple-600 text-white shadow-xs">AI Generated MCQs / Quiz</span>
          <span className="text-slate-400">↓</span>
          <span className="px-3 py-1 rounded-lg bg-amber-600 text-white shadow-xs">Personalized Content (Based on user level)</span>
        </div>
      </div>

      {/* Source Selector */}
      <div className="grid grid-cols-3 gap-3">
        {(['PDF', 'Book', 'Document'] as const).map((src) => (
          <button
            key={src}
            onClick={() => setSelectedSource(src)}
            className={`p-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedSource === src
                ? 'bg-[#0c2340] text-white border-[#0c2340] shadow-md'
                : isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Source: {src}</span>
          </button>
        ))}
      </div>

      {/* Adapted Content Result View */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Adapted Output: General Financial Rules 2017 ({selectedSource})
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-300 dark:text-emerald-300">
            Adapted to Pay Level 11 Intermediate Level
          </span>
        </div>

        {/* Summary & Key Points */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400">
            Summary & Key Points
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-4 list-disc">
            <li>Mandatory adherence to open competitive bidding principles under GFR Rule 144.</li>
            <li>GeM procurement mandatory thresholds: Direct purchase up to ₹25,000, L1 purchasing up to ₹5,00,000.</li>
            <li>Audit trail compliance and performance guarantee limits capped at 3-5% of contract value.</li>
          </ul>
        </div>

        {/* Simplified Explanation */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400">
            Simplified Explanation
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Public procurement requires every official to act as a custodian of public funds. Whenever purchasing goods or contracting services, transparency must be maintained by ensuring specifications are objective, vendor neutral, and properly recorded on GeM.
          </p>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={onNext}
          className="py-2.5 px-6 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Take AI-Based Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
