import React, { useState, useEffect } from 'react';
import { OfficialProfile, AssessmentSession, OfficialCompetencyRecord, CompetencyAssessmentResultItem } from '../../types';
import { competencyApi } from '../../services/competencyApi';
import { CheckCircle, ChevronLeft, ChevronRight, Play, RefreshCw, ArrowRight } from 'lucide-react';

export type CompetencyDomainName =
  | 'Statistical'
  | 'Technical'
  | 'Digital Governance'
  | 'Behavioural / Managerial';

interface Step3Props {
  profile: OfficialProfile;
  competencies?: any[];
  onNext?: () => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export const Step3AssessmentGap: React.FC<Step3Props> = ({
  theme,
}) => {
  const isLight = theme === 'light';

  // Theme-aware high contrast text and background helper classes
  const headingClass = isLight ? 'text-[#0c2340]' : 'text-slate-100';
  const bodyTextClass = isLight ? 'text-slate-900' : 'text-slate-100';
  const subtextClass = isLight ? 'text-slate-800' : 'text-slate-300';
  const cardBgClass = isLight ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-900 border-slate-700 shadow-md';
  const cardSubtleBgClass = isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/90 border-slate-700';

  // Four official domains
  const DOMAINS: Array<{ id: CompetencyDomainName; label: string; desc: string }> = [
    { 
      id: 'Statistical', 
      label: 'Statistical', 
      desc: 'Survey methodology, sampling design, national accounts, price statistics, and data quality frameworks.' 
    },
    { 
      id: 'Technical', 
      label: 'Technical', 
      desc: 'SQL database querying, Python analytics, data visualization, and open data management.' 
    },
    { 
      id: 'Digital Governance', 
      label: 'Digital Governance', 
      desc: 'DPDP Act 2023 compliance, cybersecurity protocols, and Digital Public Infrastructure.' 
    },
    { 
      id: 'Behavioural / Managerial', 
      label: 'Behavioural / Managerial', 
      desc: 'Civil service ethics, executive communication, project scheduling, and decision making.' 
    },
  ];

  // Component state
  const [viewState, setViewState] = useState<'domain_select' | 'in_assessment' | 'result_screen'>('domain_select');
  const [selectedDomain, setSelectedDomain] = useState<CompetencyDomainName | null>(null);
  
  // Active assessment session state
  const [activeSession, setActiveSession] = useState<AssessmentSession | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  // Evaluation & Stored user competency scores
  const [evaluationResults, setEvaluationResults] = useState<CompetencyAssessmentResultItem[]>([]);
  const [userCompetencyRecords, setUserCompetencyRecords] = useState<OfficialCompetencyRecord[]>([]);
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load existing competency scores for currently authenticated user
  const loadUserCompetencies = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await competencyApi.getMyCompetencies();
      setUserCompetencyRecords(data.competencies || []);
    } catch (err: any) {
      console.error('Failed to load user competency records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserCompetencies();
  }, []);

  // Handle starting a domain assessment
  const handleStartAssessment = async () => {
    if (!selectedDomain) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      const resp = await competencyApi.startDomainAssessment(selectedDomain);
      if (resp.success && resp.session) {
        setActiveSession(resp.session);
        setCurrentQIndex(0);
        setAnswers({});
        setViewState('in_assessment');
      } else {
        setErrorMessage(resp.message || 'Could not start assessment session.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start domain assessment.');
    } finally {
      setLoading(false);
    }
  };

  // Select an option for current question
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit assessment answers and evaluate
  const handleSubmitAssessment = async () => {
    if (!activeSession) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);

      // Record any unrecorded answers to backend
      for (const q of activeSession.questions) {
        const selectedIdx = answers[q.id];
        if (selectedIdx !== undefined) {
          await competencyApi.recordAnswer(activeSession.id, q.id, selectedIdx);
        }
      }

      // Complete & Evaluate assessment session
      const completeResp = await competencyApi.completeAssessment(activeSession.id);

      if (completeResp.success && completeResp.session) {
        const results = completeResp.session.competencyResults || [];
        setEvaluationResults(results);

        // Refresh official's persisted scores
        await loadUserCompetencies();

        setViewState('result_screen');
      } else {
        setErrorMessage('Failed to evaluate assessment. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit and evaluate assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to calculate percentage score for stored competency record
  const getPercentageForRecord = (record: OfficialCompetencyRecord): number => {
    const matchingEval = evaluationResults.find(e => e.competencyId === record.competencyId);
    if (matchingEval) return matchingEval.scorePercentage;
    return Math.round((record.currentProficiency / 5.0) * 100);
  };

  // Group stored scores by domain
  const scoresByDomain = DOMAINS.reduce((acc, domain) => {
    acc[domain.id] = userCompetencyRecords.filter(r => r.domain === domain.id);
    return acc;
  }, {} as Record<CompetencyDomainName, OfficialCompetencyRecord[]>);

  // ==========================================================================
  // VIEW 1: DOMAIN SELECTION VIEW ("Assess Your Skills")
  // ==========================================================================
  if (viewState === 'domain_select') {
    return (
      <div className="max-w-4xl mx-auto space-y-7 px-2 py-4">
        {/* Page Title & Subtitle */}
        <div className="border-b pb-4 border-slate-300 dark:border-slate-800">
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${headingClass}`}>
            Assess Your Skills
          </h2>
          <p className={`text-sm font-bold mt-1 ${subtextClass}`}>
            Choose a Domain to evaluate your competency scores through direct assessment.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-950 text-sm font-extrabold border border-rose-300 shadow-xs">
            {errorMessage}
          </div>
        )}

        {/* Section Heading: "Choose a Domain" */}
        <div className="space-y-4">
          <h3 className={`text-lg font-black ${headingClass}`}>
            Choose a Domain
          </h3>

          {/* 4 Domain Cards 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DOMAINS.map((domain) => {
              const isSelected = selectedDomain === domain.id;
              const domainRecords = scoresByDomain[domain.id] || [];

              return (
                <div
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain.id)}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-full cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'border-[#0c2340] bg-blue-50/90 ring-2 ring-[#0c2340] shadow-md'
                        : 'border-blue-500 bg-blue-950/80 ring-2 ring-blue-500 shadow-md'
                      : isLight
                      ? 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50/70 shadow-xs'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-base font-black ${isLight ? 'text-[#0c2340]' : 'text-white'}`}>
                        {domain.label}
                      </h4>
                      {domainRecords.length > 0 && (
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full border shadow-2xs ${
                          isLight 
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-400' 
                            : 'bg-emerald-950 text-emerald-200 border-emerald-700'
                        }`}>
                          Assessed ({domainRecords.length})
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-semibold leading-relaxed mt-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      {domain.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                      {isSelected ? 'Selected' : 'Click to select'}
                    </span>
                    <span className={`font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-blue-400'}`}>
                      {isSelected ? '✓ Selected' : 'Select →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Card: "Selected Domain" */}
        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${cardBgClass}`}>
          <div>
            <div className={`text-sm font-extrabold ${bodyTextClass}`}>
              Selected Domain:{' '}
              <span className={`font-black ${isLight ? 'text-[#0c2340]' : 'text-blue-400'}`}>
                {selectedDomain || 'None (Please select a domain above)'}
              </span>
            </div>
            <p className={`text-xs font-bold mt-1 ${subtextClass}`}>
              Multiple-choice questions with automated objective evaluation.
            </p>
          </div>

          <button
            onClick={handleStartAssessment}
            disabled={!selectedDomain || loading}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedDomain && !loading
                ? 'bg-[#0c2340] hover:bg-[#15345a] text-white'
                : isLight
                ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed'
                : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Assessment</span>
              </>
            )}
          </button>
        </div>

        {/* Stored User Competency Scores */}
        {userCompetencyRecords.length > 0 && (
          <div className="space-y-4 pt-5 border-t border-slate-300 dark:border-slate-800">
            <h3 className={`text-lg font-black ${headingClass}`}>
              Your Competency Scores
            </h3>

            <div className={`p-5 rounded-2xl border ${cardBgClass}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userCompetencyRecords.map((record) => {
                  const scorePct = getPercentageForRecord(record);
                  return (
                    <div
                      key={record.id || record.competencyId}
                      className={`p-4 rounded-xl border flex items-center justify-between shadow-2xs ${cardSubtleBgClass}`}
                    >
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                          {record.domain}
                        </div>
                        <div className={`text-sm font-black mt-0.5 ${bodyTextClass}`}>
                          {record.competencyName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-black ${isLight ? 'text-[#0c2340]' : 'text-blue-400'}`}>
                          {scorePct}%
                        </div>
                        <div className={`text-xs font-extrabold mt-0.5 ${subtextClass}`}>
                          {record.proficiencyBand}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // VIEW 2: IN ASSESSMENT (QUESTION RUNNER)
  // ==========================================================================
  if (viewState === 'in_assessment' && activeSession) {
    const questions = activeSession.questions;
    const currentQuestion = questions[currentQIndex];
    const totalQuestions = questions.length;
    const selectedAnswerIndex = answers[currentQuestion.id];

    return (
      <div className="max-w-3xl mx-auto space-y-6 px-2 py-4">
        {/* Top Assessment Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-300 dark:border-slate-800">
          <div>
            <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-[#0c2340]' : 'text-blue-400'}`}>
              {activeSession.competenciesCovered[0]?.domain || selectedDomain} Assessment
            </span>
            <h3 className={`text-xl font-black ${bodyTextClass}`}>
              Question {currentQIndex + 1} of {totalQuestions}
            </h3>
          </div>

          <div className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${
            isLight 
              ? 'bg-slate-200 text-slate-900 border-slate-300' 
              : 'bg-slate-800 text-slate-100 border-slate-700'
          }`}>
            {Object.keys(answers).length} of {totalQuestions} Answered
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-950 text-sm font-black border border-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Question Card */}
        <div className={`p-6 md:p-8 rounded-2xl border ${cardBgClass}`}>
          {/* Question Text */}
          <div className={`text-lg md:text-xl font-black leading-relaxed mb-6 ${
            isLight ? 'text-[#0c2340]' : 'text-slate-100'
          }`}>
            {currentQuestion.question}
          </div>

          {/* MCQ Options */}
          <div className="space-y-3.5">
            {currentQuestion.options.map((option, idx) => {
              const isOptionSelected = selectedAnswerIndex === idx;
              const optionLabels = ['A', 'B', 'C', 'D', 'E'];

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(currentQuestion.id, idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                    isOptionSelected
                      ? isLight
                        ? 'border-[#0c2340] bg-blue-100/90 ring-2 ring-[#0c2340] shadow-sm'
                        : 'border-blue-500 bg-blue-950/90 ring-2 ring-blue-500 shadow-sm'
                      : isLight
                      ? 'bg-white border-slate-300 hover:border-[#0c2340] hover:bg-slate-50'
                      : 'bg-slate-800/90 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    isOptionSelected
                      ? 'bg-[#0c2340] text-white shadow-xs'
                      : isLight
                      ? 'bg-slate-200 text-slate-900'
                      : 'bg-slate-700 text-slate-100'
                  }`}>
                    {optionLabels[idx] || idx + 1}
                  </span>
                  <span className={`text-sm md:text-base font-bold pt-1 leading-snug ${
                    isOptionSelected
                      ? isLight ? 'text-[#0c2340] font-black' : 'text-white font-black'
                      : isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentQIndex(prev => Math.max(prev - 1, 0))}
            disabled={currentQIndex === 0}
            className={`px-6 py-3 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all border ${
              currentQIndex > 0
                ? isLight
                  ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-900 cursor-pointer shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100 cursor-pointer'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentQIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQIndex(prev => Math.min(prev + 1, totalQuestions - 1))}
              className="px-7 py-3 rounded-xl font-extrabold text-xs bg-[#0c2340] hover:bg-[#15345a] text-white flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitAssessment}
              disabled={submitting}
              className="px-8 py-3 rounded-xl font-black text-xs bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Answers...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Assessment</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 3: RESULT SCREEN
  // ==========================================================================
  if (viewState === 'result_screen') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 px-2 py-4">
        {/* Header */}
        <div className="text-center py-4 border-b border-slate-300 dark:border-slate-800">
          <div className={`w-14 h-14 rounded-full border font-bold flex items-center justify-center mx-auto mb-3 shadow-sm ${
            isLight
              ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
              : 'bg-emerald-950 text-emerald-200 border-emerald-700'
          }`}>
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className={`text-2xl md:text-3xl font-black ${headingClass}`}>
            Assessment Completed
          </h2>
          <p className={`text-xs font-extrabold uppercase tracking-widest mt-1 ${subtextClass}`}>
            Domain: {selectedDomain}
          </p>
        </div>

        {/* Competency Scores Card */}
        <div className={`p-6 rounded-2xl border ${cardBgClass}`}>
          <h3 className={`text-lg font-black mb-4 pb-2 border-b border-slate-300 dark:border-slate-800 ${headingClass}`}>
            Your Competency Scores
          </h3>

          <div className="space-y-3">
            {evaluationResults.length > 0 ? (
              evaluationResults.map((item) => (
                <div
                  key={item.competencyId}
                  className={`p-4 rounded-xl border flex items-center justify-between shadow-2xs ${cardSubtleBgClass}`}
                >
                  <div>
                    <div className={`text-base font-black ${bodyTextClass}`}>
                      {item.competencyName}
                    </div>
                    <div className={`text-xs font-extrabold mt-0.5 ${subtextClass}`}>
                      Proficiency Level: {item.proficiencyBand}
                    </div>
                  </div>

                  <div className={`text-2xl font-black ${isLight ? 'text-[#0c2340]' : 'text-blue-400'}`}>
                    {item.scorePercentage}%
                  </div>
                </div>
              ))
            ) : (
              (scoresByDomain[selectedDomain || 'Statistical'] || []).map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-xl border flex items-center justify-between shadow-2xs ${cardSubtleBgClass}`}
                >
                  <div>
                    <div className={`text-base font-black ${bodyTextClass}`}>
                      {record.competencyName}
                    </div>
                    <div className={`text-xs font-extrabold mt-0.5 ${subtextClass}`}>
                      {record.proficiencyBand}
                    </div>
                  </div>

                  <div className={`text-2xl font-black ${isLight ? 'text-[#0c2340]' : 'text-blue-400'}`}>
                    {getPercentageForRecord(record)}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              setViewState('domain_select');
              setSelectedDomain(null);
              setActiveSession(null);
            }}
            className="px-9 py-3.5 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Assess Another Domain</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
