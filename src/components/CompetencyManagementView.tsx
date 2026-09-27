import React, { useState, useEffect } from 'react';
import {
  OfficialProfile,
  CompetencyDefinition,
  CompetencyRequirement,
  OfficialCompetencyRecord,
  CompetencyHistoryRecord,
  AssessmentSession,
  OfficialCompetencyDomain,
  ProficiencyBand,
  Module04HandoffContract,
  CompetencyItem,
} from '../types';
import { competencyApi } from '../services/competencyApi';
import {
  Award,
  CheckCircle2,
  Clock,
  Play,
  History,
  BookOpen,
  Send,
  Layers,
  Search,
  Check,
  AlertCircle,
  HelpCircle,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CompetencyManagementViewProps {
  profile: OfficialProfile;
  onProceedToGapAnalysis: (assessedCompetencies: CompetencyItem[]) => void;
  onCompetenciesUpdated?: (competencies: CompetencyItem[]) => void;
  onBack?: () => void;
}

export const CompetencyManagementView: React.FC<CompetencyManagementViewProps> = ({
  profile,
  onProceedToGapAnalysis,
  onCompetenciesUpdated,
  onBack,
}) => {
  // Navigation tabs within Module 03
  const [activeTab, setActiveTab] = useState<'current' | 'assessment' | 'framework' | 'history' | 'handoff'>('current');

  // Data states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Competency data
  const [officialCompetencies, setOfficialCompetencies] = useState<OfficialCompetencyRecord[]>([]);
  const [requirements, setRequirements] = useState<CompetencyRequirement[]>([]);
  const [frameworkCatalog, setFrameworkCatalog] = useState<CompetencyDefinition[]>([]);
  const [historyRecords, setHistoryRecords] = useState<CompetencyHistoryRecord[]>([]);
  const [handoffContract, setHandoffContract] = useState<Module04HandoffContract | null>(null);

  // Filter & Search states
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBenchmarkComp, setSelectedBenchmarkComp] = useState<CompetencyDefinition | null>(null);

  // Assessment session states
  const [activeSession, setActiveSession] = useState<AssessmentSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Load all initial Module 03 data
  const loadModule03Data = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [compRes, reqRes, catRes, histRes, handoffRes] = await Promise.all([
        competencyApi.getMyCompetencies(profile.id),
        competencyApi.getRoleRequirements(profile.designation, profile.department, profile.id),
        competencyApi.getCompetenciesCatalog(),
        competencyApi.getAssessmentHistory(profile.id),
        competencyApi.getModule04Handoff(profile.id),
      ]);

      setOfficialCompetencies(compRes.competencies);
      setRequirements(reqRes.requirements);
      setFrameworkCatalog(catRes.competencies);
      setHistoryRecords(histRes.history);
      setHandoffContract(handoffRes);

      // Sync back to pipeline state if callback exists
      if (onCompetenciesUpdated && compRes.competencies.length > 0) {
        const pipelineItems: CompetencyItem[] = compRes.competencies.map(c => {
          const req = reqRes.requirements.find(r => r.competencyId === c.competencyId);
          const reqLevel = req ? req.requiredProficiency : 3.5;
          const gap = Number((reqLevel - c.currentProficiency).toFixed(1));
          return {
            id: c.competencyId,
            name: c.competencyName,
            domain: c.domain,
            currentLevel: c.currentProficiency,
            requiredLevel: reqLevel,
            gapScore: gap,
            urgency: gap >= 2.0 ? 'High' : gap >= 1.0 ? 'Medium' : 'Low',
            impactExplanation: c.evidenceSummary,
          };
        });
        onCompetenciesUpdated(pipelineItems);
      }
    } catch (err: any) {
      console.error('Failed to load Module 03 data:', err);
      setError(err.message || 'Failed to initialize competency data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModule03Data();
  }, [profile.id]);

  // Start new assessment session
  const handleStartAssessment = async (type: 'ROLE_BASELINE' | 'REASSESSMENT' = 'REASSESSMENT') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await competencyApi.createAssessmentSession(type, profile.id);
      setActiveSession(res.session);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setEvaluationResult(null);
      setActiveTab('assessment');
      setSuccessMessage(`Assessment session initialized (${res.session.totalQuestions} official questions ready).`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to start assessment session');
    } finally {
      setIsLoading(false);
    }
  };

  // Record answer locally & on server
  const handleSelectAnswer = async (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    if (activeSession) {
      try {
        await competencyApi.recordAnswer(activeSession.id, questionId, answerIndex, profile.id);
      } catch (err) {
        console.error('Error saving answer:', err);
      }
    }
  };

  // Submit assessment for deterministic evaluation
  const handleSubmitAssessment = async () => {
    if (!activeSession) return;
    setIsSubmittingAssessment(true);
    setError(null);
    try {
      const res = await competencyApi.completeAssessment(activeSession.id, profile.id);
      setEvaluationResult(res);
      setSuccessMessage(`Assessment evaluated successfully! Overall Score: ${res.overallScore}%.`);
      
      // Reload profile & history to reflect updated proficiencies
      await loadModule03Data();
    } catch (err: any) {
      setError(err.message || 'Failed to complete assessment');
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  // Handoff to Module 04
  const handleProceed = () => {
    const pipelineItems: CompetencyItem[] = officialCompetencies.map(c => {
      const req = requirements.find(r => r.competencyId === c.competencyId);
      const reqLevel = req ? req.requiredProficiency : 3.5;
      const gap = Number((reqLevel - c.currentProficiency).toFixed(1));
      return {
        id: c.competencyId,
        name: c.competencyName,
        domain: c.domain,
        currentLevel: c.currentProficiency,
        requiredLevel: reqLevel,
        gapScore: gap,
        urgency: gap >= 2.0 ? 'High' : gap >= 1.0 ? 'Medium' : 'Low',
        impactExplanation: c.evidenceSummary,
      };
    });

    onProceedToGapAnalysis(pipelineItems);
  };

  // Helper for proficiency band badge styling
  const getProficiencyBandBadge = (band: ProficiencyBand) => {
    switch (band) {
      case 'Foundation':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Developing':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Competent':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Proficient':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Expert':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Domain badge styling
  const getDomainBadge = (domain: string) => {
    switch (domain) {
      case 'Statistical':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Technical':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Digital Governance':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Behavioural / Managerial':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filter competencies based on selected domain and search
  const filteredCompetencies = officialCompetencies.filter(c => {
    const matchesDomain = selectedDomain === 'All' || c.domain === selectedDomain;
    const matchesSearch = c.competencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.competencyCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const averageProficiency = officialCompetencies.length > 0
    ? (officialCompetencies.reduce((acc, c) => acc + c.currentProficiency, 0) / officialCompetencies.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Module 03: Competency Management & Assessment
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">Framework v1.2.0</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0c2340]">Official Competency Architecture</h1>
            <p className="text-xs text-slate-600 mt-1">
              Role: <strong className="text-slate-900">{profile.designation}</strong> &nbsp;|&nbsp; 
              Cadre: <strong className="text-slate-900">{profile.cadre}</strong> &nbsp;|&nbsp; 
              Department: <strong className="text-slate-900">{profile.department}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleStartAssessment('REASSESSMENT')}
              disabled={isLoading}
              className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Launch Assessment Session</span>
            </button>
            <button
              onClick={handleProceed}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <span>Bridge to Module 04: Skill-Gap</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Alert / Feedback */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'current'
                ? 'bg-[#0c2340] text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Current Competency Status ({officialCompetencies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'assessment'
                ? 'bg-[#0c2340] text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>
              {activeSession && activeSession.status === 'IN_PROGRESS'
                ? 'Active Assessment Session (In Progress)'
                : 'Assessment Center'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('framework')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'framework'
                ? 'bg-[#0c2340] text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Competency Framework Catalog (v1.2.0)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'history'
                ? 'bg-[#0c2340] text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Assessment Audit Log ({historyRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('handoff')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'handoff'
                ? 'bg-[#0c2340] text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Module 04 Handoff Contract</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: CURRENT COMPETENCY STATUS */}
      {/* ==================================================================== */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-600 block">Total Role Competencies</span>
              <span className="text-2xl font-bold text-[#0c2340] mt-1 block">
                {requirements.length} <span className="text-xs font-normal text-slate-600">mapped to cadre</span>
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-600 block">Assessed & Verified</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                {officialCompetencies.length} <span className="text-xs font-normal text-slate-600">active records</span>
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-600 block">Avg. Verified Proficiency</span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block">
                {averageProficiency} <span className="text-xs font-normal text-slate-600">/ 5.0 scale</span>
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-600 block">Assessment History</span>
              <span className="text-2xl font-bold text-indigo-700 mt-1 block">
                {historyRecords.length} <span className="text-xs font-normal text-slate-600">past attempts</span>
              </span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Domain Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 mr-1">Domain:</span>
              {['All', 'Statistical', 'Technical', 'Digital Governance', 'Behavioural / Managerial'].map(dom => (
                <button
                  key={dom}
                  onClick={() => setSelectedDomain(dom)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    selectedDomain === dom
                      ? 'bg-[#0c2340] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {dom}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search competency or code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340] focus:bg-white"
              />
            </div>
          </div>

          {/* Competency Records Table/Grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Assessed Competencies ({filteredCompetencies.length})
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Deterministically validated via Module 03 assessments
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredCompetencies.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No verified competency records match the selected filter.
                </div>
              ) : (
                filteredCompetencies.map(comp => {
                  const req = requirements.find(r => r.competencyId === comp.competencyId);
                  const reqLevel = req ? req.requiredProficiency : 3.5;
                  const priority = req ? req.priority : 'Core';
                  const benchmarkPercentage = Math.round((comp.currentProficiency / 5.0) * 100);

                  return (
                    <div key={comp.id} className="p-5 hover:bg-slate-50/80 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {comp.competencyCode}
                          </span>
                          <h3 className="text-sm font-bold text-[#0c2340]">{comp.competencyName}</h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDomainBadge(comp.domain)}`}>
                            {comp.domain}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            priority === 'Critical'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {priority} Priority
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getProficiencyBandBadge(comp.proficiencyBand)}`}>
                            {comp.proficiencyBand}
                          </span>
                          <div className="text-right">
                            <span className="text-base font-bold text-slate-900">{comp.currentProficiency.toFixed(1)}</span>
                            <span className="text-xs text-slate-400"> / 5.0</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar & Benchmark Context */}
                      <div className="space-y-1.5 mt-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Cadre Standard Requirement: <strong className="text-slate-700">{reqLevel.toFixed(1)}</strong>
                          </span>
                          <span>Verified Proficiency: <strong>{benchmarkPercentage}%</strong></span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className="bg-[#0c2340] h-full rounded-full transition-all duration-500"
                            style={{ width: `${benchmarkPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Evidence & Audit Reference */}
                      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span className="truncate max-w-md">
                          Evidence: <span className="text-slate-700">{comp.evidenceSummary}</span>
                        </span>
                        <div className="flex items-center gap-4 text-slate-400">
                          <span>Attempt: #{comp.attemptNumber}</span>
                          <span>Assessed: {new Date(comp.lastAssessedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ACTIVE ASSESSMENT SESSION (INTERACTIVE TEST) */}
      {/* ==================================================================== */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          {!activeSession ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm max-w-2xl mx-auto">
              <div className="w-14 h-14 bg-blue-50 text-[#0c2340] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Play className="w-6 h-6 fill-[#0c2340]" />
              </div>
              <h2 className="text-lg font-bold text-[#0c2340]">Official Competency Assessment Center</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Assess official competencies aligned with official statistics mandates, sampling methods, National Accounts,
                data governance, and administrative leadership. Responses are deterministically evaluated to establish
                the verified proficiency baseline for Module 04.
              </p>

              <div className="grid grid-cols-2 gap-3 my-6 max-w-md mx-auto text-left">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block">4 Key Domains</span>
                  <span className="text-slate-500 text-[11px]">Statistical, Tech, Governance, Managerial</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block">5-Level Benchmarks</span>
                  <span className="text-slate-500 text-[11px]">Foundation to Expert evaluation</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleStartAssessment('ROLE_BASELINE')}
                  className="px-5 py-2.5 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Role Baseline Assessment</span>
                </button>
                <button
                  onClick={() => handleStartAssessment('REASSESSMENT')}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Launch Reassessment Attempt</span>
                </button>
              </div>
            </div>
          ) : evaluationResult ? (
            /* EVALUATION RESULTS VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0c2340]">Assessment Evaluation Completed</h2>
                    <span className="text-xs text-slate-500">Attempt #{evaluationResult.attemptNumber} • Evaluated on {new Date(evaluationResult.completedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-medium text-slate-500 block">Overall Score</span>
                  <span className="text-3xl font-extrabold text-[#0c2340]">{evaluationResult.overallScore}%</span>
                </div>
              </div>

              {/* Detailed Breakdown by Competency */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Evaluated Competency Proficiencies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evaluationResult.session?.competencyResults?.map((res: any) => (
                    <div key={res.competencyId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{res.competencyName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getProficiencyBandBadge(res.proficiencyBand)}`}>
                          {res.proficiencyBand}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Domain: {res.domain}</span>
                        <span>Correct: <strong>{res.correctCount} / {res.questionsCount}</strong> ({res.scorePercentage}%)</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                        <span className="text-slate-500">Evaluated Proficiency Level:</span>
                        <span className="font-bold text-[#0c2340] text-sm">{res.evaluatedProficiency.toFixed(1)} / 5.0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveSession(null);
                    setEvaluationResult(null);
                    setActiveTab('current');
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Return to Competency Dashboard
                </button>

                <button
                  onClick={handleProceed}
                  className="px-5 py-2.5 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow"
                >
                  <span>Proceed to Module 04: Skill-Gap Analysis</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE QUESTION TEST INTERFACE */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Question Header & Counter */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Question {currentQuestionIndex + 1} of {activeSession.questions.length}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getDomainBadge(activeSession.questions[currentQuestionIndex].domain)}`}>
                      {activeSession.questions[currentQuestionIndex].domain}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">
                      Competency: {activeSession.questions[currentQuestionIndex].competencyName}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {activeSession.questions[currentQuestionIndex].questionType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Answered:</span>
                  <span className="text-xs font-bold text-[#0c2340] bg-slate-100 px-2 py-0.5 rounded">
                    {Object.keys(selectedAnswers).length} / {activeSession.questions.length}
                  </span>
                </div>
              </div>

              {/* Question Context / Scenario */}
              {activeSession.questions[currentQuestionIndex].scenarioContext && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold block mb-1">Scenario / Administrative Context:</span>
                  {activeSession.questions[currentQuestionIndex].scenarioContext}
                </div>
              )}

              {/* Question Text */}
              <h2 className="text-base font-bold text-slate-900 leading-relaxed">
                {activeSession.questions[currentQuestionIndex].question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {activeSession.questions[currentQuestionIndex].options.map((option, optIdx) => {
                  const currentQId = activeSession.questions[currentQuestionIndex].id;
                  const isSelected = selectedAnswers[currentQId] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(currentQId, optIdx)}
                      className={`w-full p-4 rounded-xl text-left text-xs font-medium border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-blue-50/90 border-[#0c2340] text-[#0c2340] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#0c2340] text-white'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation & Question Jump Palette */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(activeSession.questions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === activeSession.questions.length - 1}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>

                {/* Question Palette Dots */}
                <div className="flex flex-wrap gap-1.5 max-w-xs">
                  {activeSession.questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'ring-2 ring-[#0c2340] bg-[#0c2340] text-white'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Final Submit */}
                <button
                  onClick={handleSubmitAssessment}
                  disabled={isSubmittingAssessment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmittingAssessment ? 'Evaluating Answers...' : 'Submit Assessment'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: APPROVED FRAMEWORK CATALOG (v1.2.0) */}
      {/* ==================================================================== */}
      {activeTab === 'framework' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-[#0c2340]">Approved Competency Framework Dictionary</h2>
                <p className="text-xs text-slate-500 mt-1">
                  National Statistical System & Civil Service Framework Catalog (v1.2.0) across 4 mandated domains.
                </p>
              </div>

              {/* Domain pills */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Statistical', 'Technical', 'Digital Governance', 'Behavioural / Managerial'].map(dom => (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomain(dom)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      selectedDomain === dom
                        ? 'bg-[#0c2340] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            </div>

            {/* Framework List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frameworkCatalog
                .filter(c => selectedDomain === 'All' || c.domain === selectedDomain)
                .map(comp => (
                  <div key={comp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {comp.code}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDomainBadge(comp.domain)}`}>
                        {comp.domain}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{comp.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{comp.description}</p>

                    <button
                      onClick={() => setSelectedBenchmarkComp(comp)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-1"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>View 5-Level Standard Benchmarks</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Benchmark Modal */}
      {selectedBenchmarkComp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500">{selectedBenchmarkComp.code}</span>
                <h3 className="text-base font-bold text-[#0c2340]">{selectedBenchmarkComp.name}</h3>
                <span className="text-xs text-slate-500">{selectedBenchmarkComp.domain} Domain Benchmarks</span>
              </div>
              <button
                onClick={() => setSelectedBenchmarkComp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { lvl: 1, name: 'Foundation', color: 'border-amber-200 bg-amber-50/50' },
                { lvl: 2, name: 'Developing', color: 'border-blue-200 bg-blue-50/50' },
                { lvl: 3, name: 'Competent', color: 'border-emerald-200 bg-emerald-50/50' },
                { lvl: 4, name: 'Proficient', color: 'border-indigo-200 bg-indigo-50/50' },
                { lvl: 5, name: 'Expert', color: 'border-purple-200 bg-purple-50/50' },
              ].map(b => (
                <div key={b.lvl} className={`p-3.5 rounded-xl border ${b.color}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      Level {b.lvl}: {b.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{b.lvl}.0 Score Range</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedBenchmarkComp.standardBenchmarks[b.lvl] || 'Standard descriptor defined by statistical council.'}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedBenchmarkComp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: ASSESSMENT AUDIT LOG / HISTORY */}
      {/* ==================================================================== */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2340]">Assessment Audit & Evaluation History</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable chronological log of all official assessment attempts for {profile.name}.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {historyRecords.length} Attempts Logged
            </span>
          </div>

          <div className="space-y-4">
            {historyRecords.map(item => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Attempt #{item.attemptNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">Type: {item.assessmentType}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.assessmentDate).toLocaleDateString()} {new Date(item.assessmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Correct: <strong>{item.correctAnswers} / {item.totalQuestions}</strong>
                    </span>
                    <span className="text-xs font-bold text-white bg-[#0c2340] px-2.5 py-0.5 rounded-full">
                      Score: {item.overallScore}%
                    </span>
                  </div>
                </div>

                {/* Snapshots */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60">
                  {item.competencySnapshots?.map((snap, sIdx) => (
                    <div key={sIdx} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                      <span className="font-semibold text-slate-800 truncate block">{snap.competencyName}</span>
                      <div className="flex items-center justify-between text-slate-500 mt-1">
                        <span>Level: <strong>{snap.proficiencyLevel.toFixed(1)}</strong></span>
                        <span className="text-[10px] text-indigo-600 font-medium">{snap.proficiencyBand}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: MODULE 04 HANDOFF CONTRACT PREVIEW */}
      {/* ==================================================================== */}
      {activeTab === 'handoff' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2340]">Module 04 Data Contract Specifications</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Structured contract payload passed from Module 03 to Module 04 (Skill-Gap Analysis).
              </p>
            </div>
            <button
              onClick={handleProceed}
              className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-xl flex items-center gap-2"
            >
              <span>Execute Handoff to Module 04</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96">
            <pre>{JSON.stringify(handoffContract, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
