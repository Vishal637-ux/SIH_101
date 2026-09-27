import React, { useState, useEffect } from 'react';
import {
  NormalizedLearningResource,
  IntegrationSyncLog,
  ExternalEnrollmentRecord,
  EcosystemStatusResponse,
  IntegrationSource,
  OfficialCompetencyDomain,
} from '../types';
import { integrationApi } from '../services/integrationApi';
import {
  Globe,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Layers,
  Clock,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Info,
  Server,
  KeyRound,
  FileText,
  UserCheck,
  X,
} from 'lucide-react';

interface IntegrationEcosystemViewProps {
  onLaunchModule07?: (ticket: string, resourceId: string) => void;
  onNavigateToRecommendations?: () => void;
}

export const IntegrationEcosystemView: React.FC<IntegrationEcosystemViewProps> = ({
  onLaunchModule07,
  onNavigateToRecommendations,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncingSource, setSyncingSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [ecosystem, setEcosystem] = useState<EcosystemStatusResponse | null>(null);
  const [resources, setResources] = useState<NormalizedLearningResource[]>([]);
  const [syncLogs, setSyncLogs] = useState<IntegrationSyncLog[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<ExternalEnrollmentRecord[]>([]);

  // Filters
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected resource for details modal
  const [selectedResource, setSelectedResource] = useState<NormalizedLearningResource | null>(null);
  const [activeEnrollment, setActiveEnrollment] = useState<ExternalEnrollmentRecord | null>(null);

  // Load Ecosystem Data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statusRes, resourcesRes, logsRes, enrollmentsRes] = await Promise.all([
        integrationApi.getStatus(),
        integrationApi.getResources({
          source: selectedSource !== 'ALL' ? selectedSource : undefined,
          domain: selectedDomain !== 'ALL' ? selectedDomain : undefined,
          search: searchQuery || undefined,
        }),
        integrationApi.getSyncLogs(),
        integrationApi.getUserEnrollments(),
      ]);

      setEcosystem(statusRes);
      setResources(resourcesRes.resources);
      setSyncLogs(logsRes.logs);
      setUserEnrollments(enrollmentsRes.enrollments);
    } catch (err: any) {
      console.error('Failed to load integration ecosystem:', err);
      setError(err.message || 'Failed to connect to integration service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSource, selectedDomain, searchQuery]);

  // Execute Sync
  const handleSync = async (source: 'IGOT' | 'NSSTA' | 'TPAC' | 'ALL' = 'ALL') => {
    setSyncingSource(source);
    setError(null);
    try {
      const res = await integrationApi.syncEcosystem(source);
      setSuccessMessage(res.message);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || `Failed to synchronize ${source}`);
    } finally {
      setSyncingSource(null);
    }
  };

  // Enroll in External Course
  const handleEnroll = async (resource: NormalizedLearningResource) => {
    try {
      const res = await integrationApi.enrollOfficial(resource.id);
      setActiveEnrollment(res.enrollment);
      setSuccessMessage(`Successfully enrolled in ${resource.title} (${resource.provider})!`);
      const updatedEnrollments = await integrationApi.getUserEnrollments();
      setUserEnrollments(updatedEnrollments.enrollments);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Enrollment request failed.');
    }
  };

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

  // Source status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'DEMO_MODE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'NOT_CONFIGURED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                <Globe className="w-3 h-3 text-teal-600" />
                <span>Module 06: Ecosystem Integration</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">iGOT Karmayogi & NSSTA-TPAC</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0c2340]">Integration Ecosystem</h1>
            <p className="text-xs text-slate-600 mt-1">
              Normalized external course catalogue, synchronization status, and enrollment coordination.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleSync('ALL')}
              disabled={syncingSource !== null || isLoading}
              className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingSource === 'ALL' ? 'animate-spin' : ''}`} />
              <span>{syncingSource === 'ALL' ? 'Synchronizing All...' : 'Sync All Providers'}</span>
            </button>

            {onNavigateToRecommendations && (
              <button
                onClick={onNavigateToRecommendations}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <span>Back to Recommendations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Honest Demo Mode Banner */}
        <div className="mt-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              INTEGRATION MODE: DEMO (Curated Civil Service Curriculum Simulation)
            </span>
            <span>
              {ecosystem?.disclaimer ||
                'Demo data — live government integration credentials are not configured in environment. The platform uses verified civil service curriculum simulation for iGOT Karmayogi, NSSTA, and TPAC.'}
            </span>
          </div>
        </div>

        {/* Global Feedback */}
        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadData} className="underline text-xs font-bold ml-2">
              Retry
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Provider Status Cards (iGOT, NSSTA, TPAC, Parichay SSO) */}
      {ecosystem && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ecosystem.sources.map(source => (
            <div
              key={source.source}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(source.status)}`}>
                    {source.status === 'DEMO_MODE' ? 'Demo Mode' : source.status}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {source.source}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#0c2340] leading-snug">
                  {source.name}
                </h3>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {source.notice}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Catalog Items:</span>
                    <strong className="text-slate-900">{source.totalResourcesCount}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Last Sync:</span>
                    <span>{new Date(source.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {source.source !== 'GOV_SSO' && (
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => handleSync(source.source as any)}
                    disabled={syncingSource !== null}
                    className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingSource === source.source ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Sync {source.source}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Source:</span>
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
            >
              <option value="ALL">All Sources (iGOT, NSSTA, TPAC)</option>
              <option value="IGOT">iGOT Karmayogi</option>
              <option value="NSSTA">NSSTA Greater Noida</option>
              <option value="TPAC">TPAC Competence</option>
            </select>
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Domain:</span>
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
            >
              <option value="ALL">All Domains</option>
              <option value="Statistical">Statistical</option>
              <option value="Technical">Technical</option>
              <option value="Digital Governance">Digital Governance</option>
              <option value="Behavioural / Managerial">Behavioural / Managerial</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search external catalog..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340] focus:bg-white"
          />
        </div>
      </div>

      {/* Normalized Learning Resources Catalog Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Normalized External Course Catalogue ({resources.length})
            </h2>
            <span className="text-[10px] text-slate-400">• Standardized Platform Schema</span>
          </div>
          <span className="text-xs text-slate-500">
            Deduplication: Compound Key [source:externalId]
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-xs">Connecting to external learning sources...</span>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No resources found matching filter criteria.</h4>
            <p className="text-xs text-slate-400">Try changing the source or domain filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resources.map(res => {
              const isEnrolled = userEnrollments.some(e => e.resourceId === res.id || e.externalId === res.externalId);

              return (
                <div
                  key={res.id}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getProviderBadge(res.provider)}`}>
                        {res.provider}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Ext ID: {res.externalId}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {res.resourceType}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {res.competencyName} ({res.domain})
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0c2340]">
                      {res.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {res.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Duration: <strong>{res.estimatedHours} hrs</strong></span>
                      <span>Target Level: <strong>L{res.targetProficiencyLevel.toFixed(1)}</strong></span>
                      <span>Difficulty: <strong>{res.difficulty}</strong></span>
                      <span>Language: <strong>{res.language}</strong></span>
                      <span>Sync Version: <strong>v{res.syncVersion}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => setSelectedResource(res)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleEnroll(res)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        isEnrolled
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-[#0c2340] hover:bg-[#133560] text-white shadow-xs'
                      }`}
                    >
                      {isEnrolled ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Enrolled</span>
                        </>
                      ) : (
                        <>
                          <span>Enroll</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Synchronization Audit Log Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Synchronization Audit Trail (Last {syncLogs.length} Runs)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Automated & Manual Sync Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Log ID</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Triggered By</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Processed</th>
                <th className="py-2.5 px-3 text-center">Created</th>
                <th className="py-2.5 px-3 text-center">Updated</th>
                <th className="py-2.5 px-4">Completed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {syncLogs.slice(0, 8).map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{log.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{log.source}</td>
                  <td className="py-2.5 px-3 text-slate-600">{log.triggeredBy}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : log.status === 'PARTIAL_SUCCESS'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">{log.recordsProcessed}</td>
                  <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">+{log.recordsCreated}</td>
                  <td className="py-2.5 px-3 text-center text-blue-700 font-bold">{log.recordsUpdated}</td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                    {new Date(log.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Details Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getProviderBadge(selectedResource.provider)}`}>
                    {selectedResource.provider}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {selectedResource.externalId}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0c2340]">
                  {selectedResource.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedResource.description}
            </p>

            {/* Objectives */}
            {selectedResource.learningObjectives.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Learning Objectives:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedResource.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Syllabus */}
            {selectedResource.syllabus.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Curriculum & Syllabus:
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedResource.syllabus.map((s, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{s.title}</span>
                      <span className="text-slate-400 text-[11px]">{s.durationMinutes} mins</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External URL notice */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
              <div>
                <span className="font-bold block">External Deep Link:</span>
                <span className="font-mono text-[11px] text-blue-700 truncate max-w-sm block">
                  {selectedResource.externalUrl}
                </span>
              </div>
              <a
                href={selectedResource.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-900 flex items-center gap-1 text-[11px] font-semibold"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>

              <button
                onClick={() => {
                  handleEnroll(selectedResource);
                }}
                className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
              >
                <span>Enroll in Course</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Confirmation Modal */}
      {activeEnrollment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#0c2340]">Official Enrollment Confirmed</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Successfully dispatched to {activeEnrollment.provider}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Official Name:</span>
                <strong className="text-slate-800">{activeEnrollment.officialName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Resource:</span>
                <strong className="text-slate-800 truncate max-w-[200px]">{activeEnrollment.resourceTitle}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Confirmation Code:</span>
                <strong className="font-mono text-emerald-700">{activeEnrollment.confirmationCode}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Module 07 Ticket:</span>
                <strong className="font-mono text-blue-700">{activeEnrollment.module07HandoffTicket}</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveEnrollment(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Done
              </button>

              {onLaunchModule07 && (
                <button
                  onClick={() => {
                    const ticket = activeEnrollment.module07HandoffTicket;
                    const resId = activeEnrollment.resourceId;
                    setActiveEnrollment(null);
                    onLaunchModule07(ticket, resId);
                  }}
                  className="w-full py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Launch in Module 07</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
