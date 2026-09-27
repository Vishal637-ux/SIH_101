import React, { useState, useEffect } from 'react';
import {
  OfficialProfile,
  SkillGapRecord,
  SkillGapSummary,
  OfficialCompetencyDomain,
  GapPriority,
  GapStatus,
  Module05HandoffPayload,
} from '../types';
import { skillGapApi } from '../services/skillGapApi';
import {
  Target,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  ArrowUpDown,
  Search,
  Sparkles,
  Info,
  ChevronRight,
  Shield,
  Layers,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';

interface SkillGapDashboardProps {
  profile: OfficialProfile;
  onProceedToModule05?: (handoff: Module05HandoffPayload) => void;
  onNavigateToCompetencies?: () => void;
}

export const SkillGapDashboard: React.FC<SkillGapDashboardProps> = ({
  profile,
  onProceedToModule05,
  onNavigateToCompetencies,
}) => {
  // State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [summary, setSummary] = useState<SkillGapSummary | null>(null);
  const [gaps, setGaps] = useState<SkillGapRecord[]>([]);
  const [selectedCompetencyDetail, setSelectedCompetencyDetail] = useState<SkillGapRecord | null>(null);
  const [showHandoffModal, setShowHandoffModal] = useState<boolean>(false);
  const [handoffPayload, setHandoffPayload] = useState<Module05HandoffPayload | null>(null);

  // Filters & Sorting
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'competencyName' | 'currentProficiency' | 'requiredProficiency' | 'gapValue' | 'priority'>('gapValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load data
  const loadSkillGapData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, gapsRes, handoffRes] = await Promise.all([
        skillGapApi.getSummary(profile.id),
        skillGapApi.getSkillGaps(undefined, profile.id),
        skillGapApi.getModule05Handoff(profile.id),
      ]);
      setSummary(summaryRes);
      setGaps(gapsRes.gaps);
      setHandoffPayload(handoffRes);
    } catch (err: any) {
      console.error('Failed to load skill-gap data:', err);
      setError(err.message || 'Failed to retrieve skill-gap records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkillGapData();
  }, [profile.id]);

  // Recalculate gaps
  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setError(null);
    try {
      const res = await skillGapApi.recalculateGaps(profile.id);
      setSuccessMessage(res.message || 'Skill gaps recalculated against latest competency ratings.');
      await loadSkillGapData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to recalculate skill gaps.');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Sorting
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'gapValue' ? 'desc' : 'asc');
    }
  };

  // Filtered & sorted records
  const filteredGaps = gaps
    .filter(record => {
      const matchesDomain = selectedDomain === 'All' || record.domain === selectedDomain;
      const matchesPriority = selectedPriority === 'All' || record.priority === selectedPriority;
      const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;
      const matchesSearch =
        record.competencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.competencyCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDomain && matchesPriority && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const factor = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'competencyName') {
        return a.competencyName.localeCompare(b.competencyName) * factor;
      }
      if (sortField === 'priority') {
        const order: Record<GapPriority, number> = { High: 3, Medium: 2, Low: 1, None: 0 };
        return (order[a.priority] - order[b.priority]) * factor;
      }
      return ((a[sortField] as number) - (b[sortField] as number)) * factor;
    });

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

  // Status badge helper
  const getStatusBadge = (status: GapStatus) => {
    switch (status) {
      case 'Meets Requirement':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Needs Development':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Domain badge helper
  const getDomainBadge = (domain: OfficialCompetencyDomain) => {
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
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Top Priority Gaps (up to 3)
  const topPriorityGaps = gaps
    .filter(g => g.gapValue > 0)
    .sort((a, b) => {
      const order: Record<GapPriority, number> = { High: 3, Medium: 2, Low: 1, None: 0 };
      if (order[b.priority] !== order[a.priority]) return order[b.priority] - order[a.priority];
      return b.gapValue - a.gapValue;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                <Target className="w-3 h-3 text-rose-600" />
                <span>Module 04: Skill-Gap Analysis</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">Deterministic Evaluation</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0c2340]">Skill-Gap Analysis</h1>
            <p className="text-xs text-slate-600 mt-1">
              Understand the competencies you need to strengthen for your current role as{' '}
              <strong className="text-slate-900">{profile.designation}</strong> in{' '}
              <strong className="text-slate-900">{profile.department}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating || isLoading}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Gap'}</span>
            </button>

            <button
              onClick={() => setShowHandoffModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>View Module 05 Contract</span>
            </button>

            {onProceedToModule05 && handoffPayload && (
              <button
                onClick={() => onProceedToModule05(handoffPayload)}
                className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow"
              >
                <span>Handoff to Module 05</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback Messages */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadSkillGapData} className="underline text-xs font-bold ml-2">
              Retry
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Summary Statistics Cards (Real values from backend, no fake numbers) */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">TOTAL COMPETENCIES</span>
              <span className="text-2xl font-black text-[#0c2340] mt-0.5 block">
                {summary.totalCompetenciesAssessed}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Mapped to role mandate</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0c2340] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">MEETING REQUIREMENT</span>
              <span className="text-2xl font-black text-emerald-700 mt-0.5 block">
                {summary.competenciesMeetingRequirement}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Gap = 0 (Satisfactory)</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">SKILL GAPS</span>
              <span className="text-2xl font-black text-amber-700 mt-0.5 block">
                {summary.competenciesWithGaps}
              </span>
              <span className="text-[11px] text-amber-700 font-medium mt-1 block">Needs development</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">HIGH PRIORITY</span>
              <span className="text-2xl font-black text-rose-700 mt-0.5 block">
                {summary.highPriorityGaps}
              </span>
              <span className="text-[11px] text-rose-600 font-medium mt-1 block">Immediate focus required</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Top Priority Gaps Callout Banner */}
      {topPriorityGaps.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50/90 to-amber-50/70 border border-rose-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-rose-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-900">
              Top Priority Competencies Requiring Development
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topPriorityGaps.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedCompetencyDetail(item)}
                className="bg-white p-3.5 rounded-xl border border-rose-100 hover:border-rose-300 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-[#0c2340] truncate">{item.competencyName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(item.priority)}`}>
                    {item.priority} Priority
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                  <span>
                    Current: <strong>{item.currentProficiency.toFixed(1)}</strong> → Required: <strong>{item.requiredProficiency.toFixed(1)}</strong>
                  </span>
                  <span className="font-extrabold text-rose-700">Gap: -{item.gapValue.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Gap Analysis: Current vs Required & Domain Summary */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart A: Horizontal Comparison Bars */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#0c2340]">Current vs Required Competency Levels</h2>
                <p className="text-[11px] text-slate-500">Benchmark comparison on a 1.0 to 5.0 civil service scale.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-xs bg-[#0c2340]" />
                  <span className="text-slate-600">Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-xs bg-amber-400" />
                  <span className="text-slate-600">Required</span>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-1 max-h-80 overflow-y-auto pr-1">
              {filteredGaps.slice(0, 7).map(item => {
                const currentPct = Math.min(100, Math.round((item.currentProficiency / 5.0) * 100));
                const requiredPct = Math.min(100, Math.round((item.requiredProficiency / 5.0) * 100));

                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {item.competencyName}
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-600">
                          {item.currentProficiency.toFixed(1)} / {item.requiredProficiency.toFixed(1)}
                        </span>
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          item.gapValue === 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.gapValue === 0 ? 'Optimal' : `Gap -${item.gapValue.toFixed(1)}`}
                        </span>
                      </div>
                    </div>

                    {/* Dual bar */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-amber-400/50 absolute top-0 left-0 rounded-full"
                        style={{ width: `${requiredPct}%` }}
                      />
                      <div
                        className="h-full bg-[#0c2340] absolute top-0 left-0 rounded-full transition-all duration-500"
                        style={{ width: `${currentPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart B: Domain-wise Gap Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#0c2340]">Domain-Wise Gap Distribution</h2>
                <p className="text-[11px] text-slate-500">Aggregate readiness across the 4 civil service domains.</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Framework v1.2.0
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {(['Statistical', 'Technical', 'Digital Governance', 'Behavioural / Managerial'] as OfficialCompetencyDomain[]).map(domain => {
                const data = summary.domainBreakdown[domain] || {
                  total: 0,
                  meetingRequirement: 0,
                  withGaps: 0,
                  avgCurrent: 0,
                  avgRequired: 0,
                  avgGap: 0,
                };

                const readiness = data.avgRequired > 0
                  ? Math.min(100, Math.round((data.avgCurrent / data.avgRequired) * 100))
                  : 100;

                return (
                  <div key={domain} className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{domain}</span>
                        <span className="text-[10px] text-slate-500">({data.total} mapped)</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-slate-500">Avg Gap: <strong>{data.avgGap.toFixed(1)}</strong></span>
                        <span className="font-bold text-[#0c2340]">{readiness}% Ready</span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          readiness >= 85
                            ? 'bg-emerald-600'
                            : readiness >= 65
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${readiness}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Domain Filter */}
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

          {/* Priority Filter */}
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
              <option value="None">None (Met)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
            >
              <option value="All">All Statuses</option>
              <option value="Needs Development">Needs Development</option>
              <option value="Meets Requirement">Meets Requirement</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
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

      {/* Skill-Gap Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Role Competencies & Gap Matrix ({filteredGaps.length})
            </h2>
            <span className="text-[10px] text-slate-400">• Non-negative gap guarantee</span>
          </div>
          <span className="text-xs text-slate-500">
            Last recalculated: {summary?.lastCalculatedAt ? new Date(summary.lastCalculatedAt).toLocaleDateString() : 'Today'}
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('competencyName')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Competency</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Domain</th>
                <th
                  onClick={() => handleSort('currentProficiency')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Current</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('requiredProficiency')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Required</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gapValue')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Gap</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-slate-400">Last Assessed</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                      <span>Loading authenticated skill-gap records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredGaps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    {gaps.length === 0 ? (
                      <div className="max-w-md mx-auto space-y-3">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-800">
                          Complete your competency assessment to generate your skill-gap analysis.
                        </h4>
                        <p className="text-xs text-slate-500">
                          No verified assessment data found for your official profile.
                        </p>
                        {onNavigateToCompetencies && (
                          <button
                            onClick={onNavigateToCompetencies}
                            className="px-4 py-2 bg-[#0c2340] text-white rounded-lg text-xs font-semibold"
                          >
                            Go to Competency Assessment
                          </button>
                        )}
                      </div>
                    ) : (
                      <span>No skill gaps match the selected filters.</span>
                    )}
                  </td>
                </tr>
              ) : (
                filteredGaps.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedCompetencyDetail(item)}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.competencyCode}
                        </span>
                        <span>{item.competencyName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDomainBadge(item.domain)}`}>
                        {item.domain}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-800">
                      {item.currentProficiency.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-800">
                      {item.requiredProficiency.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        item.gapValue === 0
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : item.gapValue >= 2.0
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {item.gapValue === 0 ? '0.0' : `-${item.gapValue.toFixed(1)}`}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      {new Date(item.lastAssessedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedCompetencyDetail(item);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competency Gap Detail Modal */}
      {selectedCompetencyDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs text-slate-400 font-bold">
                  {selectedCompetencyDetail.competencyCode}
                </span>
                <h3 className="text-base font-bold text-[#0c2340]">
                  {selectedCompetencyDetail.competencyName}
                </h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block ${getDomainBadge(selectedCompetencyDetail.domain)}`}>
                  {selectedCompetencyDetail.domain} Domain
                </span>
              </div>
              <button
                onClick={() => setSelectedCompetencyDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gap Metrics Visuals */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Current Verified Level:</span>
                  <span className="font-bold text-slate-900">{selectedCompetencyDetail.currentProficiency.toFixed(1)} / 5.0</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0c2340] rounded-full"
                    style={{ width: `${(selectedCompetencyDetail.currentProficiency / 5.0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Required Role Mandate Level:</span>
                  <span className="font-bold text-slate-900">{selectedCompetencyDetail.requiredProficiency.toFixed(1)} / 5.0</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(selectedCompetencyDetail.requiredProficiency / 5.0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-rose-800">Skill Gap Magnitude:</span>
                  <span className="font-extrabold text-rose-700">
                    {selectedCompetencyDetail.gapValue === 0
                      ? '0.0 (Requirement Met)'
                      : `-${selectedCompetencyDetail.gapValue.toFixed(1)}`}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 rounded-full"
                    style={{ width: `${(selectedCompetencyDetail.gapValue / 5.0) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Context & Rationale */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                <span className="font-bold text-[#0c2340] block mb-0.5">Required Because:</span>
                <span>
                  This competency is required for the official's current administrative role as{' '}
                  <strong>{profile.designation}</strong> in <strong>{profile.department}</strong> with{' '}
                  <strong>{selectedCompetencyDetail.importance} Priority</strong> status.
                </span>
              </div>

              {selectedCompetencyDetail.standardBenchmarkRequired && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-700 block mb-0.5">Standard Role Benchmark (Level {Math.round(selectedCompetencyDetail.requiredProficiency)}):</span>
                  <span>{selectedCompetencyDetail.standardBenchmarkRequired}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Evidence: {selectedCompetencyDetail.evidenceSummary}</span>
                <span>Assessed: {new Date(selectedCompetencyDetail.lastAssessedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Strict Module Boundary Note (Clean Handoff to Module 05) */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Next Stage: AI Learning Recommendation (Module 05)</span>
                <span>
                  Learning recommendations will be generated based on this skill gap in Module 05.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedCompetencyDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>

              {onProceedToModule05 && handoffPayload && (
                <button
                  onClick={() => {
                    setSelectedCompetencyDetail(null);
                    onProceedToModule05(handoffPayload);
                  }}
                  className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <span>Recommend Courses for this Gap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Module 05 Handoff Contract Modal */}
      {showHandoffModal && handoffPayload && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0c2340]">Module 05 Handoff Contract</h3>
                <span className="text-xs text-slate-500">
                  Clean structured gap payload passed directly to Module 05 AI Recommendation Engine
                </span>
              </div>
              <button
                onClick={() => setShowHandoffModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96">
              <pre>{JSON.stringify(handoffPayload, null, 2)}</pre>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Payload contains {handoffPayload.totalGapsCount} identified skill gaps.
              </span>
              <button
                onClick={() => setShowHandoffModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
