import React, { useState, useRef } from 'react';
import { contentApi } from '../services/contentApi';
import { ContentItem } from '../types';
import { PRESET_BOOKS } from '../mockData';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Sparkles,
  BookOpen,
  Layers,
  Tag,
  ShieldAlert,
} from 'lucide-react';

interface ContentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (item: ContentItem) => void;
  userRole?: string;
}

export const ContentUploadModal: React.FC<ContentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  userRole = 'Trainer',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [domain, setDomain] = useState<'Statistical' | 'Technical' | 'Digital Governance' | 'Behavioural / Managerial'>('Statistical');
  const [competencyName, setCompetencyName] = useState('Survey Design & Sampling');
  const [topicsInput, setTopicsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // File validation
  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 50MB.`);
      return;
    }

    const validExtensions = ['.pdf', '.ppt', '.pptx', '.mp4', '.webm', '.txt', '.md', '.docx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setErrorMessage(`Unsupported file format '${ext}'. Supported: PDF, PPT, PPTX, MP4, WEBM, TXT, MD, DOCX.`);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      // Auto-populate clean title from filename
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      setTitle(cleanName);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Preset Book Quick-Selection for Rapid Demonstration
  const handleSelectPreset = (preset: (typeof PRESET_BOOKS)[0]) => {
    setTitle(preset.title);
    setDescription(`Official reference document: ${preset.title} published by ${preset.sourceOrg}. (${preset.pages} pages)`);
    setTopicsInput('Public Administration, Governance, Statutory Compliance');
    if (preset.title.includes('Procurement')) {
      setDomain('Behavioural / Managerial');
      setCompetencyName('Ethics & Financial Propriety');
    } else if (preset.title.includes('Data Protection') || preset.title.includes('DPDP')) {
      setDomain('Digital Governance');
      setCompetencyName('Data Privacy');
    } else {
      setDomain('Behavioural / Managerial');
      setCompetencyName('Communication & Vigilance');
    }

    // Create a virtual File object from the sampleExtract text
    const blob = new Blob([preset.sampleExtract], { type: 'text/plain' });
    const cleanFileName = preset.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.txt';
    const file = new File([blob], cleanFileName, { type: 'text/plain' });
    setSelectedFile(file);
    setErrorMessage(null);
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select or drop a valid file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please provide a title for the content item.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('language', language);
      formData.append('domain', domain);
      formData.append('competencyName', competencyName);
      formData.append('competencyId', domain === 'Statistical' ? 'comp-stat-001' : domain === 'Technical' ? 'comp-tech-001' : domain === 'Digital Governance' ? 'comp-dig-001' : 'comp-beh-001');

      const topics = topicsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      topics.forEach(t => formData.append('topics', t));

      const res = await contentApi.uploadContent(formData, userRole);
      onUploadSuccess(res.content);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload and process file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center">
              <Upload className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0c2340]">Upload Training Content</h2>
              <p className="text-[11px] text-slate-500">
                Upload PDFs, presentations, documents or video modules for text extraction and AI assessment prep.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast-Track Presets */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>SIH Prototype Demo: Quick-Select Regulatory Training Books</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_BOOKS.map((b, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(b)}
                className="p-2.5 bg-white hover:bg-teal-50/50 hover:border-teal-300 border border-slate-200 rounded-lg text-left transition-colors flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">
                  {b.title}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {b.sourceOrg}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop File Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-teal-500 bg-teal-50/40'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/20'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={e => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
              accept=".pdf,.ppt,.pptx,.mp4,.webm,.txt,.md,.docx"
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-emerald-600" />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block truncate max-w-sm">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                <span className="text-xs font-semibold text-slate-700 block">
                  Click to browse or drag & drop training file
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Supported: PDF, PPT, PPTX, Video (MP4/WebM), Docs (TXT, MD, DOCX) up to 50MB
                </span>
              </div>
            )}
          </div>

          {/* Title & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Document / Content Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Compendium of Public Procurement & GeM 4.0"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="English & Hindi">Bilingual (English & Hindi)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Content Abstract & Regulatory Purpose</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of statutory guidelines or syllabus topics covered..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
            />
          </div>

          {/* Domain & Competency Mapping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Competency Domain</label>
              <select
                value={domain}
                onChange={e => {
                  const d = e.target.value as any;
                  setDomain(d);
                  if (d === 'Statistical') setCompetencyName('Survey Design & Sampling');
                  else if (d === 'Technical') setCompetencyName('Python & Statistical Computing');
                  else if (d === 'Digital Governance') setCompetencyName('Data Privacy & DPDP');
                  else setCompetencyName('Ethics & Financial Propriety');
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
              >
                <option value="Statistical">Statistical</option>
                <option value="Technical">Technical</option>
                <option value="Digital Governance">Digital Governance</option>
                <option value="Behavioural / Managerial">Behavioural / Managerial</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Target Competency</label>
              <input
                type="text"
                value={competencyName}
                onChange={e => setCompetencyName(e.target.value)}
                placeholder="e.g. Survey Design & Sampling"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
              />
            </div>
          </div>

          {/* Topics / Tags */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Topics & Keywords (Comma-separated)</label>
            <input
              type="text"
              value={topicsInput}
              onChange={e => setTopicsInput(e.target.value)}
              placeholder="e.g. GFR 2017, GeM 4.0, Procurement, Reverse Auction"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c2340]"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-5 py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading & Extracting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Process Content</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
