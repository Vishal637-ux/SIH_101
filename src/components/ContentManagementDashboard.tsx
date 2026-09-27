import React, { useState, useEffect } from 'react';
import { ContentItem, ContentType, ContentStatus } from '../types';
import { contentApi } from '../services/contentApi';
import { ContentUploadModal } from './ContentUploadModal';
import {
  FileText,
  Upload,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  Archive,
  Check,
  Sparkles,
  BookOpen,
  Layers,
  Clock,
  UserCheck,
  Shield,
  Download,
  Trash2,
  FolderOpen,
} from 'lucide-react';

interface ContentManagementDashboardProps {
  onSelectContent: (contentId: string) => void;
  onNavigateToUpload?: () => void;
  onNavigateToLearning?: () => void;
}

export const ContentManagementDashboard: React.FC<ContentManagementDashboardProps> = ({
  onSelectContent,
  onNavigateToLearning,
}) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // RBAC Mode: Trainer vs Admin vs Learner
  const [currentRole, setCurrentRole] = useState<'Trainer' | 'Admin' | 'Learner'>('Trainer');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load Content
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await contentApi.getContentList(
        {
          type: selectedType !== 'ALL' ? selectedType : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          language: selectedLanguage !== 'ALL' ? selectedLanguage : undefined,
          search: searchQuery || undefined,
        },
        currentRole
      );
      setItems(res.items);
    } catch (err: any) {
      console.error('Failed to load content list:', err);
      setError(err?.message || 'Failed to load content repository.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType, selectedStatus, selectedLanguage, searchQuery, currentRole]);

  // Handle Quick Publish
  const handleQuickPublish = async (id: string, title: string) => {
    try {
      await contentApi.publishContent(id, currentRole);
      setSuccessMessage(`'${title}' published successfully! Added to Module 07 Learning Experience.`);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Publishing failed.');
    }
  };

  // Status badge styling
  const getStatusBadge = (status: ContentStatus) => {
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

  // Type badge styling
  const getTypeBadge = (type: ContentType) => {
    switch (type) {
      case 'PDF':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'PPT':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'VIDEO':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'DOCUMENT':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Summary Metrics
  const totalCount = items.length;
  const readyCount = items.filter(i => i.status === 'READY').length;
  const publishedCount = items.filter(i => i.status === 'PUBLISHED').length;
  const inProcessingCount = items.filter(i => i.status === 'PROCESSING' || i.status === 'UPLOADED').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                <FileText className="w-3 h-3 text-teal-600" />
                <span>Module 08: Content Management</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">NLP Extraction & Assessment Preparation</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0c2340]">Training Content Repository</h1>
            <p className="text-xs text-slate-600 mt-1">
              Upload, extract text, normalize, and publish regulatory books & training materials for Learning Management and AI Assessment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* RBAC Role Selector for Demo */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-semibold">Active Role:</span>
              <select
                value={currentRole}
                onChange={e => setCurrentRole(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Trainer">Trainer / Faculty</option>
                <option value="Admin">System Admin</option>
                <option value="Learner">Learner (Read-Only)</option>
              </select>
            </div>

            {currentRole !== 'Learner' && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Content</span>
              </button>
            )}

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Refresh Content List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Feedback */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadData} className="underline text-xs font-bold">
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Documents</span>
            <FolderOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-[#0c2340]">{totalCount}</div>
          <p className="text-[11px] text-slate-400">In content repository</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-1">
          <div className="flex items-center justify-between text-indigo-700">
            <span className="text-xs font-semibold">Ready for Assessment</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">{readyCount}</div>
          <p className="text-[11px] text-slate-400">Extracted & normalized</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold">Published in Learning</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{publishedCount}</div>
          <p className="text-[11px] text-slate-400">Live in Module 07 catalog</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold">Processing / Drafts</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{inProcessingCount}</div>
          <p className="text-[11px] text-slate-400">Under text extraction</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Format / Type */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Format:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
            >
              <option value="ALL">All Formats</option>
              <option value="PDF">PDF Documents</option>
              <option value="PPT">Presentations (PPT/PPTX)</option>
              <option value="VIDEO">Video Modules</option>
              <option value="DOCUMENT">Plain Documents</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready (Extraction Done)</option>
              <option value="PUBLISHED">Published (In Catalog)</option>
              <option value="PROCESSING">Processing / Extracting</option>
              <option value="UPLOADED">Uploaded (Pending)</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Language:</span>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
            >
              <option value="ALL">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents, topics, text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340] focus:bg-white"
          />
        </div>
      </div>

      {/* Content Items List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Content Repository Items ({items.length})
            </h2>
            <span className="text-[10px] text-slate-400">• Persistent Local Storage</span>
          </div>
          <span className="text-xs text-slate-500">
            {currentRole === 'Learner' ? 'Learner View: Published Items Only' : 'Trainer View: Full Lifecycle Control'}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-teal-600 mx-auto mb-2" />
            <span className="text-xs">Loading repository...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-slate-700">No content items found</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentRole === 'Learner'
                  ? 'No published training materials match the current filter.'
                  : 'Click "Upload New Content" to add training manuals or presentations.'}
              </p>
            </div>
            {currentRole !== 'Learner' && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-[#0c2340] text-white text-xs font-semibold rounded-lg shadow"
              >
                Upload Content
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map(item => (
              <div
                key={item.content_id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getTypeBadge(item.content_type)}`}>
                      {item.content_type}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                      v{item.version}.0
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {item.domain} ({item.competency_name})
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectContent(item.content_id)}
                    className="text-sm font-bold text-[#0c2340] hover:text-teal-700 cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>File: <strong className="text-slate-600 font-mono">{item.file_name}</strong></span>
                    <span>Size: <strong className="text-slate-600">{(item.file_size / 1024).toFixed(1)} KB</strong></span>
                    <span>Words: <strong className="text-emerald-700">{item.word_count}</strong></span>
                    <span>Owner: <strong className="text-slate-600">{item.owner_name}</strong></span>
                    <span>Created: <strong>{new Date(item.created_at).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectContent(item.content_id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>View & Inspect</span>
                  </button>

                  {currentRole !== 'Learner' && item.status !== 'PUBLISHED' && item.processing_status === 'COMPLETED' && (
                    <button
                      onClick={() => handleQuickPublish(item.content_id, item.title)}
                      className="px-3.5 py-1.5 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Publish</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Upload Modal */}
      <ContentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={newItem => {
          setSuccessMessage(`'${newItem.title}' uploaded and text extracted successfully!`);
          loadData();
          onSelectContent(newItem.content_id);
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
        userRole={currentRole}
      />
    </div>
  );
};
