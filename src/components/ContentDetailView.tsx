import React, { useState, useEffect } from 'react';
import { ContentItem, ContentVersion, ContentAuditLog, AssessmentDocket } from '../types';
import { contentApi } from '../services/contentApi';
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Globe,
  Upload,
  Archive,
  Download,
  Sparkles,
  Layers,
  Clock,
  User,
  Tag,
  BookOpen,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ContentDetailViewProps {
  contentId: string;
  onBack: () => void;
  userRole?: string;
  onNavigateToAssessment?: (docket: AssessmentDocket) => void;
  onNavigateToLearning?: () => void;
}

export const ContentDetailView: React.FC<ContentDetailViewProps> = ({
  contentId,
  onBack,
  userRole = 'Trainer',
  onNavigateToAssessment,
  onNavigateToLearning,
}) => {
  const [item, setItem] = useState<ContentItem | null>(null);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [auditLogs, setAuditLogs] = useState<ContentAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'extracted' | 'raw' | 'docket' | 'audit'>('extracted');
  const [docket, setDocket] = useState<AssessmentDocket | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await contentApi.getContentById(contentId, userRole);
      setItem(res.item);
      setVersions(res.versions);
      setAuditLogs(res.auditLogs);

      if (res.item.status === 'READY' || res.item.status === 'PUBLISHED') {
        const docketRes = await contentApi.getAssessmentDocket(contentId, userRole);
        setDocket(docketRes.docket);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load content details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contentId, userRole]);

  // Handle reprocess
  const handleReprocess = async () => {
    if (!item) return;
    setIsActionLoading(true);
    setError(null);
    try {
      const res = await contentApi.processContent(item.content_id, userRole);
      setItem(res.content);
      setSuccessMessage('Content reprocessed successfully.');
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Reprocessing failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle publish
  const handlePublish = async () => {
    if (!item) return;
    setIsActionLoading(true);
    setError(null);
    try {
      const res = await contentApi.publishContent(item.content_id, userRole);
      setItem(res.content);
      setSuccessMessage(`'${res.content.title}' published successfully! Synced to Module 07 Learning Experience.`);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Publishing failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle archive
  const handleArchive = async () => {
    if (!item) return;
    setIsActionLoading(true);
    setError(null);
    try {
      const res = await contentApi.archiveContent(item.content_id, userRole);
      setItem(res.content);
      setSuccessMessage(`'${res.content.title}' archived successfully.`);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Archiving failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'READY':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse';
      case 'UPLOADED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
        <span className="text-xs text-slate-500 font-medium">Loading content details...</span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Content Repository</span>
        </button>
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error || 'Content item not found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Content Repository</span>
          </button>

          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            Module 08: Content Management & NLP Preparation
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                {item.status}
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
                {item.content_type}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                v{item.version}.0
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-700">
                {item.domain} ({item.competency_name})
              </span>
            </div>

            <h1 className="text-xl font-bold text-[#0c2340]">
              {item.title}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed">
              {item.description || 'No description provided.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/v1/content/${item.content_id}/file`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Original File</span>
            </a>

            {userRole !== 'Learner' && (
              <>
                <button
                  onClick={handleReprocess}
                  disabled={isActionLoading}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isActionLoading ? 'animate-spin' : ''}`} />
                  <span>Reprocess</span>
                </button>

                {item.status !== 'PUBLISHED' && (
                  <button
                    onClick={handlePublish}
                    disabled={isActionLoading || item.processing_status !== 'COMPLETED'}
                    className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Publish Content</span>
                  </button>
                )}

                {item.status === 'PUBLISHED' && (
                  <button
                    onClick={handleArchive}
                    disabled={isActionLoading}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5 text-slate-600" />
                    <span>Archive</span>
                  </button>
                )}
              </>
            )}

            {/* Handoff to Module 09 AI Assessment */}
            {docket && docket.is_ready_for_assessment && onNavigateToAssessment && (
              <button
                onClick={() => onNavigateToAssessment(docket)}
                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Handoff to AI Assessment (M09)</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {item.processing_error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Processing Error: {item.processing_error}</span>
            </div>
            <button onClick={handleReprocess} className="underline font-bold text-xs">
              Retry Processing
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('extracted')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'extracted'
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Structured Units ({item.extracted_structure.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'raw'
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Normalized Text ({item.word_count} words)</span>
          </button>

          <button
            onClick={() => setActiveTab('docket')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'docket'
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Module 09 Assessment Docket</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Content inspection according to active tab */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'extracted' && (
            <div className="space-y-4">
              {item.extracted_structure.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">No Structured Units Extracted</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Reprocess" above to extract and normalize text from this document.
                  </p>
                </div>
              ) : (
                item.extracted_structure.map((sec, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-[#0c2340]">{sec.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        {sec.pageOrSlide && <span>Page/Slide {sec.pageOrSlide}</span>}
                        <span>{sec.wordCount} words</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-serif whitespace-pre-line bg-slate-50/50 p-3.5 rounded-lg border border-slate-100">
                      {sec.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Normalized Extracted Text Stream
                </h3>
                <span className="text-[11px] text-slate-400">
                  Total Words: {item.word_count} • Characters: {item.extracted_text.length}
                </span>
              </div>
              <textarea
                readOnly
                rows={16}
                value={item.extracted_text || 'No text extracted yet.'}
                className="w-full p-4 font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'docket' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0c2340]">
                    Module 09 AI Assessment Docket
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Prepared payload handed off to the AI Assessment Engine for automated MCQ and evaluation generation.
                  </p>
                </div>
              </div>

              {docket ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600">Target Assessment Domain:</span>
                      <strong className="text-slate-900">{docket.domain}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600">Target Competency:</span>
                      <strong className="text-slate-900">{docket.competency_name} ({docket.competency_id})</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600">Total Extracted Words:</span>
                      <strong className="font-mono text-emerald-700">{docket.word_count} words</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600">Status:</span>
                      <span className="font-bold text-emerald-700">READY FOR ASSESSMENT GENERATION</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-700 block">Assessment Target Topics:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {docket.topics.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                    <strong>Architectural Boundary:</strong> Module 08 strictly manages content extraction and structural tagging. Final MCQ generation is performed by Module 09 AI Assessment Engine using this docket.
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Docket will be generated once content processing completes.
                </p>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Content Lifecycle Audit Ledger
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Immutable Action Log</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{log.id}</span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {log.action}
                        </span>
                        <span className="text-slate-600 font-medium">by {log.performed_by_name} ({log.role})</span>
                      </div>
                      <p className="text-slate-600">{log.details}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata & File Specifications */}
        <div className="space-y-4">
          {/* Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              File & Storage Specifications
            </h3>

            <div className="space-y-2 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">File Name:</span>
                <span className="font-mono text-slate-800 truncate max-w-[170px]" title={item.file_name}>
                  {item.file_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="font-mono text-slate-800">{(item.file_size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">MIME Type:</span>
                <span className="font-mono text-[11px] text-slate-600">{item.mime_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Storage Driver:</span>
                <span className="font-semibold text-emerald-700">Local Verified Disk</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Language:</span>
                <span className="font-medium text-slate-800">{item.language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Owner:</span>
                <span className="font-semibold text-slate-800">{item.owner_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-700">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              {item.published_at && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Published:</span>
                  <span className="text-emerald-700 font-semibold">{new Date(item.published_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Topics Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              Extracted Topics & Tags
            </h3>
            {item.topics.length === 0 ? (
              <p className="text-xs text-slate-400">No topics tagged yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {item.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Publishing Handshake to Module 07 */}
          {item.status === 'PUBLISHED' && onNavigateToLearning && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Live in Learning Experience (M07)</span>
              </div>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                This content has been converted into a Platform Learning Resource and is currently accessible to enrolled civil servants.
              </p>
              <button
                onClick={onNavigateToLearning}
                className="w-full py-1.5 px-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>View in Learning Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
