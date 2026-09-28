import React, { useState } from 'react';
import { OfficialProfile } from '../../types';
import { BookOpen, Video, FileText, Cpu, Radio, Globe, ArrowRight } from 'lucide-react';

interface Step6Props {
  profile: OfficialProfile;
  onNext: () => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export const Step6LearningExperience: React.FC<Step6Props> = ({
  onNext,
  theme,
}) => {
  const isLight = theme === 'light';
  const [activeCategory, setActiveCategory] = useState<string>('Courses');

  // Rule 8 exact learning options
  const learningOptions = [
    { id: 'Courses', title: 'Courses', icon: BookOpen, desc: 'Structured self-paced modules and government competency curriculums.' },
    { id: 'Videos', title: 'Videos', icon: Video, desc: 'High-definition video lectures by senior civil service domain experts.' },
    { id: 'PDF Materials', title: 'PDF Materials', icon: FileText, desc: 'Official manuals, gazette notifications, and policy reference documents.' },
    { id: 'Interactive Content', title: 'Interactive Content', icon: Cpu, desc: 'Virtual simulations, case-study exercises, and practical labs.' },
    { id: 'Live / Recorded Sessions', title: 'Live / Recorded Sessions', icon: Radio, desc: 'Webinars, classroom streams, and archived training broadcasts.' },
    { id: 'External Platforms', title: 'External Platforms', icon: Globe, desc: 'Integrated learning streams from iGOT Karmayogi, NSSTA, TPAC, etc.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          Personalized Learning
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Access multi-modal learning resources tailored to your preferred learning format and competency needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {learningOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = activeCategory === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setActiveCategory(opt.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#0c2340] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#0c2340]'
                  : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#0c2340] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {opt.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {opt.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className={`p-6 rounded-2xl border flex items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
      }`}>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Selected Category: <span className="text-blue-600 dark:text-blue-400">{activeCategory}</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Proceed to AI Content Adaptation engine for simplified reading & quiz generation.
          </p>
        </div>

        <button
          onClick={onNext}
          className="py-2.5 px-6 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Adapt Content with AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
