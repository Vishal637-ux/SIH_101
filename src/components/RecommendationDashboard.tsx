import React, { useState, useEffect } from 'react';
import {
  OfficialProfile,
  RecommendationRecord,
  RecommendationSummary,
  PersonalizedLearningPath,
  Module07HandoffPayload,
  OfficialCompetencyDomain,
  ResourceProvider,
  ResourceType,
  GapPriority,
} from '../types';
import { recommendationApi } from '../services/recommendationApi';
import {
  Sparkles,
  BookOpen,
  Compass,
  RefreshCw,
  Play,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Target,
  AlertCircle,
  X,
  ChevronRight,
  Flame,
  Check,
  Globe,
} from 'lucide-react';

interface RecommendationDashboardProps {
  profile: OfficialProfile;
  initialPathView?: boolean;
  onStartLearning?: (handoff: Module07HandoffPayload) => void;
  onBackToSkillGaps?: () => void;
  onNavigateToIntegrations?: () => void;
}

export const RecommendationDashboard: React.FC<RecommendationDashboardProps> = ({
  profile,
  initialPathView = false,
  onStartLearning,
  onBackToSkillGaps,
  onNavigateToIntegrations,
}) => {
  // Navigation tabs within Module 05
  const [activeTab, setActiveTab] = useState<'catalog' | 'path'>(initialPathView ? 'path' : 'catalog');

  // Data states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [aiSynthesis, setAiSynthesis] = useState<string | null>(null);

  const [summary, setSummary] = useState<RecommendationSummary | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [learningPath, setLearningPath] = useState<PersonalizedLearningPath | null>(null);

  // Selected item for Detail Modal
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationRecord | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [handoffResult, setHandoffResult] = useState<Module07HandoffPayload | null>(null);

  // Filter & Search states
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load all initial recommendations data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, recsRes, pathRes] = await Promise.all([
        recommendationApi.getSummary(profile.id),
        recommendationApi.getRecommendations(undefined, profile.id),
        recommendationApi.getLearningPath(profile.id),
      ]);

      setSummary(sumRes);
      setRecommendations(recsRes.recommendations);
      setLearningPath(pathRes);
    } catch (err: any) {
      console.error('Failed to load Module 05 recommendations:', err);
      setError(err.message || 'Failed to retrieve learning recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile.id]);

  // Refresh / Regenerate recommendations
  const handleRefreshRecommendations = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await recommendationApi.generateRecommendations(profile.id);
      setSuccessMessage(res.message || 'Recommendations regenerated against latest skill gaps.');
      if (res.aiSynthesis) {
        setAiSynthesis(res.aiSynthesis);
      }
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate recommendations.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Start Learning (Module 07 Handoff)
  const handleStartLearning = async (recId: string) => {
    setEnrollingId(recId);
    setError(null);
    try {
      const res = await recommendationApi.startLearning(recId, profile.id);
      setHandoffResult(res.handoff);
      setSuccessMessage(`Enrolled! Launching Module 07 Learning Experience for "${res.handoff.resourceTitle}".`);

      // Update state locally
      setRecommendations(prev =>
        prev.map(r => (r.id === recId || r.resourceId === recId ? { ...r, status: 'IN_PROGRESS' } : r))
      );

      // Trigger handoff callback if provided
      if (onStartLearning) {
        setTimeout(() => {
          onStartLearning(res.handoff);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enroll in learning resource.');
    } finally {
      setEnrollingId(null);
    }
  };

  // Filtered recommendations
  const filteredRecs = recommendations.filter(rec => {
    const matchesDomain = selectedDomain === 'All' || rec.domain === selectedDomain;
    const matchesPriority = selectedPriority === 'All' || rec.priority === selectedPriority;
    const matchesProvider = selectedProvider === 'All' || rec.resource.provider === selectedProvider;
    const matchesType = selectedType === 'All' || rec.resource.resourceType === selectedType;
    const matchesSearch =
      rec.resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.competencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.resource.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesPriority && matchesProvider && matchesType && matchesSearch;
  });

  // Top Recommendation
  const topRec = recommendations.length > 0 ? recommendations[0] : null;

  // Provider badge helper
  const getProviderBadge = (provider: ResourceProvider) => {
    switch (provider) {
      case 'iGOT Karmayogi':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'NSSTA':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'TPAC':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Platform Content':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Priority badge helper
  const getPriorityBadge = (priority: GapPriority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Low':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'None':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Module 05: AI Recommendation Engine</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">Explainable Learning Matching</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0c2340]">Personalized Learning Recommendations</h1>
            <p className="text-xs text-slate-600 mt-1">
              AI-ranked civil service modules targeted to close your verified skill gaps for{' '}
              <strong className="text-slate-900">{profile.designation}</strong> in{' '}
              <strong className="text-slate-900">{profile.department}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRefreshRecommendations}
              disabled={isRefreshing || isLoading}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isRefreshing ? 'Regenerating...' : 'Refresh Recommendations'}</span>
            </button>

            {onBackToSkillGaps && (
              <button
                onClick={onBackToSkillGaps}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Target className="w-3.5 h-3.5 text-slate-600" />
                <span>View Skill Gaps (Module 04)</span>
              </button>
            )}

            {onNavigateToIntegrations && (
              <button
                onClick={onNavigateToIntegrations}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>External Ecosystem (Module 06)</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadData} className="underline text-xs font-bold ml-2">
              Retry
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Navigation Tabs: Catalog vs Path */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'catalog'
                ? 'bg-[#0c2340] text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Recommended Resources Catalog ({recommendations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('path')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'path'
                ? 'bg-[#0c2340] text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>My Personalized Learning Path ({learningPath?.phases.length || 4} Phases)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">SKILL GAPS ADDRESSED</span>
              <span className="text-2xl font-black text-[#0c2340] mt-0.5 block">
                {summary.totalSkillGapsAddressed}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Linked to Module 04 gaps</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0c2340] flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">RECOMMENDED RESOURCES</span>
              <span className="text-2xl font-black text-indigo-700 mt-0.5 block">
                {summary.totalRecommendedResources}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">iGOT, NSSTA, TPAC</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">HIGH-PRIORITY AREAS</span>
              <span className="text-2xl font-black text-rose-700 mt-0.5 block">
                {summary.highPriorityLearningAreas}
              </span>
              <span className="text-[11px] text-rose-600 font-medium mt-1 block">Urgent focus</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">LEARNING PATH PROGRESS</span>
              <span className="text-2xl font-black text-emerald-700 mt-0.5 block">
                {summary.learningPathProgressPercentage}%
              </span>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Active curriculum track</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* AI Synthesis Callout (if generated) */}
      {aiSynthesis && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200 rounded-xl text-xs text-slate-800 shadow-xs flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#0c2340] block">AI Executive Learning Rationale:</span>
            <p className="leading-relaxed text-slate-700">{aiSynthesis}</p>
          </div>
        </div>
      )}

      {/* TAB 1: RECOMMENDATIONS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Top Priority Recommendation Highlight Card */}
          {topRec && (
            <div className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] text-white rounded-2xl p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
                    Top Priority #1
                  </span>
                  <span className="text-xs text-white/70">•</span>
                  <span className="text-xs font-semibold text-amber-300">
                    {topRec.matchScore}% Match Score
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/80 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                    {topRec.resource.provider}
                  </span>
                  <span className="text-xs text-white/80 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                    {topRec.resource.difficulty} • {topRec.resource.estimatedHours} hrs
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 space-y-2">
                  <h3 className="text-xl font-black text-white">{topRec.resource.title}</h3>
                  <p className="text-xs text-slate-200 leading-relaxed">{topRec.resource.description}</p>

                  {/* Why recommended reasons */}
                  <div className="pt-2 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                      Why Recommended:
                    </span>
                    {topRec.whyRecommended.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 space-y-3">
                  <div className="flex items-center justify-between text-xs text-white/90">
                    <span>Target Competency:</span>
                    <span className="font-bold text-amber-300">{topRec.competencyName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/90">
                    <span>Verified Skill Gap:</span>
                    <span className="font-bold text-rose-300">-{topRec.gapValue.toFixed(1)} points</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/90">
                    <span>Reward:</span>
                    <span className="font-bold text-amber-300">+{topRec.resource.karmaPoints} Karma Points</span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRecommendation(topRec)}
                      className="w-1/2 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleStartLearning(topRec.id)}
                      disabled={enrollingId === topRec.id}
                      className="w-1/2 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{enrollingId === topRec.id ? 'Starting...' : 'Start Learning'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Domain */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500">Domain:</span>
                <select
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
                >
                  <option value="All">All Domains</option>
                  <option value="Statistical">Statistical</option>
                  <option value="Technical">Technical</option>
                  <option value="Digital Governance">Digital Governance</option>
                  <option value="Behavioural / Managerial">Behavioural / Managerial</option>
                </select>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500">Priority:</span>
                <select
                  value={selectedPriority}
                  onChange={e => setSelectedPriority(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              {/* Provider */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500">Provider:</span>
                <select
                  value={selectedProvider}
                  onChange={e => setSelectedProvider(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
                >
                  <option value="All">All Providers</option>
                  <option value="iGOT Karmayogi">iGOT Karmayogi</option>
                  <option value="NSSTA">NSSTA</option>
                  <option value="TPAC">TPAC</option>
                  <option value="Platform Content">Platform Content</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search module, skill, provider..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340] focus:bg-white"
              />
            </div>
          </div>

          {/* Recommendations Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRecs.map(rec => (
              <div
                key={rec.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getProviderBadge(rec.resource.provider)}`}>
                        {rec.resource.provider}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {rec.resource.resourceType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(rec.priority)}`}>
                        {rec.priority} Priority
                      </span>
                      <span className="text-xs font-black text-[#0c2340] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {rec.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-[#0c2340] leading-snug">{rec.resource.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {rec.resource.description}
                    </p>
                  </div>

                  {/* Competency Gap Linkage Banner */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Target Competency:</span>
                      <strong className="text-slate-900">{rec.competencyName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Level Gap:</span>
                      <span>
                        Current <strong>{rec.currentProficiency.toFixed(1)}</strong> → Target <strong>{rec.requiredProficiency.toFixed(1)}</strong>{' '}
                        <strong className="text-rose-700">(-{rec.gapValue.toFixed(1)})</strong>
                      </span>
                    </div>
                  </div>

                  {/* Explainable Why Recommended */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Why Recommended:
                    </span>
                    {rec.whyRecommended.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {rec.resource.estimatedHours} hrs
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-semibold">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      +{rec.resource.karmaPoints} Karma
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRecommendation(rec)}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleStartLearning(rec.id)}
                      disabled={enrollingId === rec.id}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs ${
                        rec.status === 'IN_PROGRESS'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#0c2340] hover:bg-[#133560] text-white'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{enrollingId === rec.id ? 'Starting...' : rec.status === 'IN_PROGRESS' ? 'Resume' : 'Start Learning'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PERSONALIZED LEARNING PATH (/recommendations/path) */}
      {activeTab === 'path' && learningPath && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#0c2340]">Ordered Progression Pathway</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sequential 4-phase learning journey tailored to bridge critical administrative deficits for {profile.name}.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                  Total Duration: {learningPath.totalEstimatedHours} Hours
                </span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-lg">
                  Total Reward: +{learningPath.totalKarmaPoints} Karma
                </span>
              </div>
            </div>

            {/* 4 Phases Accordion / Stepper */}
            <div className="space-y-5 pt-2">
              {learningPath.phases.map((phase, pIdx) => (
                <div key={phase.phaseNumber} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <div className="px-5 py-3.5 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#0c2340] text-white font-bold text-xs flex items-center justify-center">
                        {phase.phaseNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0c2340]">{phase.phaseTitle}</h4>
                        <p className="text-[11px] text-slate-500">{phase.phaseDescription}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{phase.estimatedTotalHours} hrs</span>
                      <span>+{phase.totalKarmaPoints} Karma</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        phase.phaseStatus === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {phase.phaseStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.recommendations.map(rec => (
                      <div
                        key={rec.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getProviderBadge(rec.resource.provider)}`}>
                              {rec.resource.provider}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-700">{rec.matchScore}% Match</span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">{rec.resource.title}</h5>
                          <span className="text-[11px] text-slate-500 block">
                            Target: {rec.competencyName} (Gap -{rec.gapValue.toFixed(1)})
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">{rec.resource.estimatedHours} hrs</span>
                          <button
                            onClick={() => handleStartLearning(rec.id)}
                            className="px-3 py-1 bg-[#0c2340] hover:bg-[#133560] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Details Modal (/recommendations/{id}) */}
      {selectedRecommendation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getProviderBadge(selectedRecommendation.resource.provider)}`}>
                    {selectedRecommendation.resource.provider}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600">{selectedRecommendation.resource.resourceType}</span>
                </div>
                <h3 className="text-lg font-bold text-[#0c2340] mt-1">{selectedRecommendation.resource.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRecommendation(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-700 leading-relaxed">
              {selectedRecommendation.resource.description}
            </p>

            {/* Competency Alignment Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-[#0c2340] block">Competency Alignment:</span>
              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div>
                  Competency: <strong className="text-slate-900">{selectedRecommendation.competencyName}</strong>
                </div>
                <div>
                  Domain: <strong className="text-slate-900">{selectedRecommendation.domain}</strong>
                </div>
                <div>
                  Current Level: <strong className="text-slate-900">{selectedRecommendation.currentProficiency.toFixed(1)} / 5.0</strong>
                </div>
                <div>
                  Target Benchmark: <strong className="text-slate-900">{selectedRecommendation.requiredProficiency.toFixed(1)} / 5.0</strong>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span>Verified Deficit: <strong className="text-rose-700">-{selectedRecommendation.gapValue.toFixed(1)} points</strong></span>
                <span>Priority: <strong className="text-slate-900">{selectedRecommendation.priority}</strong></span>
              </div>
            </div>

            {/* Why Recommended Reasons */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Why Recommended For Your Profile:
              </span>
              {selectedRecommendation.whyRecommended.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            {/* Learning Objectives */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Key Learning Objectives:
              </span>
              <ul className="space-y-1 list-disc list-inside text-xs text-slate-600">
                {selectedRecommendation.resource.learningObjectives.map((obj, oIdx) => (
                  <li key={oIdx}>{obj}</li>
                ))}
              </ul>
            </div>

            {/* Syllabus Modules */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Curriculum Syllabus ({selectedRecommendation.resource.modulesCount} Modules):
              </span>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {selectedRecommendation.resource.syllabus.map((mod, mIdx) => (
                  <div key={mIdx} className="p-2.5 bg-slate-50 rounded-lg text-xs flex items-center justify-between border border-slate-100">
                    <span className="text-slate-800 font-medium">{mod.title}</span>
                    <span className="text-slate-400 text-[11px]">{mod.durationMinutes} mins</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedRecommendation(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const id = selectedRecommendation.id;
                  setSelectedRecommendation(null);
                  handleStartLearning(id);
                }}
                className="px-5 py-2.5 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>START LEARNING</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
