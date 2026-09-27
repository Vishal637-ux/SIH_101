import React, { useState } from 'react';
import { OfficialProfile, CompetencyItem, GapAnalysisResult } from '../../types';
import { CompetencyManagementView } from '../CompetencyManagementView';
import { ArrowLeft, Sliders, Award } from 'lucide-react';

interface Step3AssessmentGapProps {
  profile: OfficialProfile;
  competencies: CompetencyItem[];
  gapResult: GapAnalysisResult | null;
  onUpdateCompetency: (id: string, newLevel: number) => void;
  onRunGapAnalysis: () => Promise<void>;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const Step3AssessmentGap: React.FC<Step3AssessmentGapProps> = ({
  profile,
  competencies,
  onUpdateCompetency,
  onRunGapAnalysis,
  onNext,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<'module03' | 'quickMatrix'>('module03');

  const handleProceedToGap = async (assessed: CompetencyItem[]) => {
    // Update any changed proficiencies in parent state
    assessed.forEach(item => {
      onUpdateCompetency(item.id, item.currentLevel);
    });
    // Trigger gap analysis calculation for Module 04
    await onRunGapAnalysis();
    // Advance to next step (Module 04)
    onNext();
  };

  const handleCompetenciesUpdated = (updatedItems: CompetencyItem[]) => {
    updatedItems.forEach(item => {
      onUpdateCompetency(item.id, item.currentLevel);
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Official Profile</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'module03' ? 'quickMatrix' : 'module03')}
            className="text-xs font-semibold text-slate-600 hover:text-[#0c2340] px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            {viewMode === 'module03' ? (
              <>
                <Sliders className="w-3.5 h-3.5" />
                <span>Switch to Quick Matrix View</span>
              </>
            ) : (
              <>
                <Award className="w-3.5 h-3.5" />
                <span>Switch to Module 03 Assessment Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main View Mode */}
      {viewMode === 'module03' ? (
        <CompetencyManagementView
          profile={profile}
          onProceedToGapAnalysis={handleProceedToGap}
          onCompetenciesUpdated={handleCompetenciesUpdated}
          onBack={onBack}
        />
      ) : (
        /* Quick Competency Matrix Adjustment View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0c2340]">Competency Level Matrix</h2>
              <p className="text-xs text-slate-500">Fine-tune verified proficiency levels on a 1.0 - 5.0 scale.</p>
            </div>
            <button
              onClick={() => handleProceedToGap(competencies)}
              className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Continue to AI Recommendation
            </button>
          </div>

          <div className="space-y-3">
            {competencies.map(comp => (
              <div
                key={comp.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{comp.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                      {comp.domain}
                    </span>
                  </div>
                  <div className="text-xs">
                    Current: <strong>{comp.currentLevel.toFixed(1)}</strong> / 5.0
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={comp.currentLevel}
                    onChange={e => onUpdateCompetency(comp.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0c2340]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
