import React, { useState, useEffect } from 'react';
import {
  NormalizedLearningResource,
  LearningProgressRecord,
  LearningHistoryRecord,
  UserLearningPathView,
  OfficialProfile,
} from '../types';
import { learningApi } from '../services/learningApi';
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  ArrowRight,
  Search,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  RotateCcw,
  History,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface LearningManagementDashboardProps {
  profile: OfficialProfile;
  onOpenResource: (resourceId: string) => void;
  onNavigateToRecommendations?: () => void;
  theme?: 'light' | 'dark';
}

export const LearningManagementDashboard: React.FC<LearningManagementDashboardProps> = ({
  profile,
  onOpenResource,
  onNavigateToRecommendations,
  theme = 'light',
}) => {
  const [activeTab, setActiveTab] = useState<'path' | 'catalog' | 'history'>('path');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [learningPath, setLearningPath] = useState<UserLearningPathView | null>(null);
  const [resources, setResources] = useState<
    Array<{ resource: NormalizedLearningResource; progress: LearningProgressRecord }>
  >([]);
  const [history, setHistory] = useState<LearningHistoryRecord[]>([]);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pathRes, resList, histRes] = await Promise.all([
        learningApi.getLearningPath(),
        learningApi.getResources({
          source: sourceFilter !== 'ALL' ? sourceFilter : undefined,
          domain: domainFilter !== 'ALL' ? domainFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: searchQuery || undefined,
        }),
        learningApi.getHistory(),
      ]);

      setLearningPath(pathRes);
      setResources(resList.items);
      setHistory(histRes.history);
    } catch (err: any) {
      console.error('Failed to load learning management data:', err);
      setError(err.message || 'Failed to load learning management data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [sourceFilter, domainFilter, statusFilter, searchQuery]);

  // Provider badge helper
  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'iGOT Karmayogi':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'NSSTA':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'TPAC':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Module 07: Learning Management</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">Civil Service Learning Delivery</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0c2340]">Official Learning Experience</h1>
            <p className="text-xs text-slate-600 mt-1">
              Personalized learning path, interactive modules, and persistent competency progress for{' '}
              <strong className="text-slate-900">{profile.name}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToRecommendations && (
              <button
                onClick={onNavigateToRecommendations}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <span>View AI Recommendations (Module 05)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        {learningPath && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-semibold">Overall Progress</div>
              <div className="text-xl font-bold text-[#0c2340] mt-0.5">
                {learningPath.overallProgressPercentage}%
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${learningPath.overallProgressPercentage}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-semibold">Active In-Progress</div>
              <div className="text-xl font-bold text-blue-700 mt-0.5">
                {learningPath.inProgressCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Ongoing Courses</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-semibold">Completed Modules</div>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">
                {learningPath.totalCompleted}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Verified Completions</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-semibold">Hours Logged</div>
              <div className="text-xl font-bold text-purple-700 mt-0.5">
                {learningPath.learningHoursLogged} hrs
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Dedicated Study Time</div>
            </div>
          </div>
        )}

        {/* Global Feedback */}
        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadAllData} className="underline text-xs font-bold ml-2">
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('path')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'path'
              ? 'border-[#0c2340] text-[#0c2340]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Personalized Learning Path</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'catalog'
              ? 'border-[#0c2340] text-[#0c2340]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum Catalog ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'border-[#0c2340] text-[#0c2340]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Learning Activity Audit ({history.length})</span>
        </button>
      </div>

      {/* TAB 1: Personalized Learning Path View */}
      {activeTab === 'path' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <RotateCcw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <span className="text-xs">Loading personalized 4-phase learning progression...</span>
            </div>
          ) : !learningPath || learningPath.phases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No learning path found</h4>
              <p className="text-xs text-slate-400">Please generate recommendations in Module 05 first.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {learningPath.phases.map(phase => (
                <div
                  key={phase.phaseNumber}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0c2340] text-white flex items-center justify-center text-[10px] font-bold">
                          {phase.phaseNumber}
                        </span>
                        <h3 className="text-sm font-bold text-[#0c2340]">
                          {phase.phaseTitle}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 ml-7">
                        {phase.phaseDescription}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      {phase.items.length} Modules
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {phase.items.map(({ resource, progress, matchScore, priority }) => (
                      <div
                        key={resource.id}
                        className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getProviderBadge(resource.provider)}`}>
                              {resource.provider}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(progress.status)}`}>
                              {progress.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[#0c2340] leading-snug line-clamp-1">
                            {resource.title}
                          </h4>

                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            {resource.description}
                          </p>

                          {/* Progress bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Progress</span>
                              <strong>{progress.progressPercentage}%</strong>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  progress.progressPercentage >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                                }`}
                                style={{ width: `${progress.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {resource.estimatedHours} hrs • {resource.difficulty}
                          </span>

                          <button
                            onClick={() => onOpenResource(resource.id)}
                            className="px-3 py-1.5 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <span>{progress.progressPercentage > 0 ? 'Continue' : 'Start'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Curriculum Catalog View */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Source Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
                >
                  <option value="ALL">All Sources</option>
                  <option value="IGOT">iGOT Karmayogi</option>
                  <option value="NSSTA">NSSTA Greater Noida</option>
                  <option value="TPAC">TPAC Competence</option>
                </select>
              </div>

              {/* Domain Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500">Domain:</span>
                <select
                  value={domainFilter}
                  onChange={e => setDomainFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
                >
                  <option value="ALL">All Domains</option>
                  <option value="Statistical">Statistical</option>
                  <option value="Technical">Technical</option>
                  <option value="Digital Governance">Digital Governance</option>
                  <option value="Behavioural / Managerial">Behavioural / Managerial</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="NOT_STARTED">Not Started</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses or topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340] focus:bg-white"
              />
            </div>
          </div>

          {/* Resources List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {resources.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No resources found matching filter criteria</h4>
                <p className="text-xs text-slate-400">Try changing the status or domain filter.</p>
              </div>
            ) : (
              resources.map(({ resource, progress }) => (
                <div
                  key={resource.id}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getProviderBadge(resource.provider)}`}>
                        {resource.provider}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(progress.status)}`}>
                        {progress.status}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {resource.competencyName} ({resource.domain})
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0c2340]">
                      {resource.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Duration: <strong>{resource.estimatedHours} hrs</strong></span>
                      <span>Target Level: <strong>L{resource.targetProficiencyLevel.toFixed(1)}</strong></span>
                      <span>Difficulty: <strong>{resource.difficulty}</strong></span>
                      <span>Progress: <strong className="text-slate-800">{progress.progressPercentage}%</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => onOpenResource(resource.id)}
                      className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Play className="w-3 h-3" />
                      <span>{progress.progressPercentage > 0 ? 'Continue' : 'Start'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Learning Activity History Ledger */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Learning Activity History Ledger
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Persistent Audit Trail ({history.length} events)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Event ID</th>
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Activity Type</th>
                  <th className="py-2.5 px-3 text-center">Progress</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No learning history recorded yet. Start a course to begin logging activity.
                    </td>
                  </tr>
                ) : (
                  history.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{item.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.resourceTitle}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.provider}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-50 text-blue-800 border-blue-200">
                          {item.activityType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                        {item.newProgressPercentage}%
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                        {new Date(item.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
