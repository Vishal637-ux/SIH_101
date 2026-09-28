import React from 'react';
import { 
  LogIn, 
  User, 
  Award, 
  Target, 
  Sparkles, 
  BrainCircuit, 
  CheckSquare, 
  TrendingUp, 
  BarChart3, 
  Repeat,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface WorkflowBarProps {
  currentStep: number;
  onSelectStep: (stepNumber: number) => void;
  completedSteps: number[];
  theme: 'light' | 'dark';
  compact?: boolean;
}

export const WORKFLOW_STEPS = [
  { id: 1, title: 'LOGIN / REGISTER', icon: LogIn },
  { id: 2, title: 'OFFICIAL PROFILE', icon: User },
  { id: 3, title: 'COMPETENCY ASSESSMENT', icon: Award },
  { id: 4, title: 'SKILL-GAP ANALYSIS', icon: Target },
  { id: 5, title: 'AI RECOMMENDATION', icon: Sparkles },
  { id: 6, title: 'PERSONALIZED LEARNING', icon: BrainCircuit },
  { id: 7, title: 'AI CONTENT ADAPTATION', icon: CheckSquare },
  { id: 8, title: 'AI-BASED ASSESSMENT', icon: TrendingUp },
  { id: 9, title: 'PROGRESS & PERFORMANCE', icon: BarChart3 },
  { id: 10, title: 'COMPETENCY PROFILE UPDATE', icon: Repeat },
];

export const WorkflowBar: React.FC<WorkflowBarProps> = ({
  currentStep,
  onSelectStep,
  completedSteps,
  theme,
}) => {
  const currentStepObj = WORKFLOW_STEPS.find(s => s.id === currentStep) || WORKFLOW_STEPS[0];
  const isLight = theme === 'light';

  return (
    <div className={`w-full border-b transition-colors py-2 px-4 select-none ${
      isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-900/80 border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto text-xs">
        {/* Step Breadcrumb Context */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Capacity Building Workflow
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#0c2340] text-white text-[11px]">
            Step {currentStep}: {currentStepObj.title}
          </span>
        </div>

        {/* Compact Step Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {WORKFLOW_STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                title={`Jump to Step ${step.id}: ${step.title}`}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#0c2340] text-white ring-2 ring-blue-500/40 scale-105'
                    : isCompleted
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : isLight
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {isCompleted && !isActive ? '✓' : step.id}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
