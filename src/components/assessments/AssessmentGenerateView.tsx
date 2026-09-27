import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  BrainCircuit, 
  Cpu, 
  Loader2,
  Sliders,
  Languages,
  Layers,
  GraduationCap
} from 'lucide-react';
import { ContentItem, AssessmentDifficulty, Assessment } from '../../types';
import { contentApi } from '../../services/contentApi';
import { assessmentApi } from '../../services/assessmentApi';

interface AssessmentGenerateViewProps {
  initialContentId?: string | null;
  onBack: () => void;
  onAssessmentGenerated: (assessment: Assessment) => void;
  userRole?: string;
}

export const AssessmentGenerateView: React.FC<AssessmentGenerateViewProps> = ({
  initialContentId,
  onBack,
  onAssessmentGenerated,
  userRole = 'Trainer',
}) => {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [selectedContentId, setSelectedContentId] = useState<string>(initialContentId || '');
  
  // Generation parameters
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<AssessmentDifficulty>('MEDIUM');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');

  // Generation status state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setIsLoadingContent(true);
        const data = await contentApi.getContentList({}, userRole);
        // Filter to only items that are processed and have extracted text
        const processedItems = data.items.filter(
          item => (item.status === 'READY' || item.status === 'PUBLISHED') && item.word_count > 0
        );
        setContentList(processedItems);

        if (initialContentId) {
          const match = processedItems.find(i => i.content_id === initialContentId);
          if (match) {
            setSelectedContentId(match.content_id);
            if (match.topics && match.topics.length > 0) {
              setSelectedTopic(match.topics[0]);
            }
          }
        } else if (processedItems.length > 0 && !selectedContentId) {
          setSelectedContentId(processedItems[0].content_id);
          if (processedItems[0].topics && processedItems[0].topics.length > 0) {
            setSelectedTopic(processedItems[0].topics[0]);
          }
        }
      } catch (err: any) {
        console.error('Failed to load Module 08 content:', err);
      } finally {
        setIsLoadingContent(false);
      }
    }
    loadContent();
  }, [initialContentId, userRole]);

  // Selected document details
  const selectedItem = contentList.find(c => c.content_id === selectedContentId);

  // Update topic selector when content changes
  const handleContentChange = (contentId: string) => {
    setSelectedContentId(contentId);
    const item = contentList.find(c => c.content_id === contentId);
    if (item && item.topics && item.topics.length > 0) {
      setSelectedTopic(item.topics[0]);
    } else {
      setSelectedTopic('');
    }
  };

  const generationSteps = [
    'Retrieving Module 08 normalized text & structural units...',
    'Performing concept detection & extracting regulatory bounds...',
    'Formulating objective multiple-choice questions via Gemini AI / NLP...',
    'Executing Question Validation Engine (4 options, single key, grounding check)...',
    'Finalizing assessment draft and compiling review docket...',
  ];

  const handleGenerate = async () => {
    if (!selectedContentId) {
      setErrorMessage('Please select a processed Module 08 document.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMessage(null);
      setGenerationStep(0);

      // Simulate progressive step updates for UI realism while API processes
      const stepTimer1 = setTimeout(() => setGenerationStep(1), 700);
      const stepTimer2 = setTimeout(() => setGenerationStep(2), 1600);
      const stepTimer3 = setTimeout(() => setGenerationStep(3), 2600);

      const generated = await assessmentApi.generateAssessment(
        {
          contentId: selectedContentId,
          numQuestions,
          difficulty,
          topic: selectedTopic || selectedItem?.topics?.[0],
          language,
        },
        userRole
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setGenerationStep(4);

      setTimeout(() => {
        setIsGenerating(false);
        onAssessmentGenerated(generated);
      }, 500);
    } catch (err: any) {
      console.error('Generation error:', err);
      setIsGenerating(false);
      setErrorMessage(err?.message || 'Failed to generate assessment questions.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessments</span>
        </button>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-800 border border-purple-200">
          Module 09: AI Assessment Engine
        </span>
      </div>

      {/* Hero Header */}
      <div className="p-6 bg-gradient-to-r from-[#0c2340] to-[#1e3a8a] text-white rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl font-black tracking-tight">Generate AI Assessment from Processed Content</h1>
            </div>
            <p className="text-sm text-slate-200 max-w-2xl leading-relaxed">
              Convert training manuals, statutory handbooks, and operational guides from Module 08 into rigorous, syllabus-aligned objective MCQs with automated validation.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-medium">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Gemini 3.8 Flash + Validation Engine</span>
          </div>
        </div>
      </div>

      {/* Main Generation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Select & Configure */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Processed Document */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">1</span>
                <span>Select Module 08 Processed Content</span>
              </h2>
              <span className="text-xs text-slate-500">
                {contentList.length} processed manual(s) ready
              </span>
            </div>

            {isLoadingContent ? (
              <div className="p-8 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm">Loading processed documents from Module 08 repository...</p>
              </div>
            ) : contentList.length === 0 ? (
              <div className="p-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>No Processed Content Available</span>
                </div>
                <p className="text-xs text-amber-800">
                  Please upload and process a regulatory book or training PDF in Module 08 first before generating an AI assessment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Source Handbook / Manual
                </label>
                <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {contentList.map(item => {
                    const isSelected = item.content_id === selectedContentId;
                    return (
                      <div
                        key={item.content_id}
                        onClick={() => handleContentChange(item.content_id)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                                <span>{item.word_count.toLocaleString()} words</span>
                                <span>•</span>
                                <span>{item.extracted_structure?.length || 0} unit(s)</span>
                                <span>•</span>
                                <span className="font-medium text-blue-700">{item.competency_name}</span>
                              </div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-1" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Assessment Parameters */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">2</span>
              <span>Assessment & Question Configuration</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Question Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setNumQuestions(cnt)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                        numQuestions === cnt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cnt} MCQs
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Target Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EASY', 'MEDIUM', 'HARD'] as AssessmentDifficulty[]).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                        difficulty === d
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Focus Topic / Directive
                </label>
                {selectedItem?.topics && selectedItem.topics.length > 0 ? (
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedItem.topics.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="All Topics">All Detected Topics (Comprehensive)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    placeholder="e.g. Statutory Compliance & Audit Rules"
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onBack}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !selectedContentId}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Assessment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate {numQuestions} MCQs with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Info: Live Document & Engine Details */}
        <div className="space-y-6">
          {/* Selected Document Docket Preview */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Document Docket Summary</span>
            </h3>

            {selectedItem ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500">Document Title:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedItem.title}</p>
                </div>
                <div>
                  <span className="text-slate-500">Mapped Competency:</span>
                  <p className="font-semibold text-indigo-700 mt-0.5">{selectedItem.competency_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded">
                    <span className="text-slate-500 block">Extracted Text</span>
                    <span className="font-bold text-slate-900">{selectedItem.word_count.toLocaleString()} words</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded">
                    <span className="text-slate-500 block">Structured Units</span>
                    <span className="font-bold text-slate-900">{selectedItem.extracted_structure?.length || 0} sections</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Detected Regulatory Topics:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.topics?.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a document on the left to inspect its docket extract.</p>
            )}
          </div>

          {/* Validation Standards Card */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
              <span>Question Validation Standards</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>4 Distinct Options:</strong> Guaranteed non-duplicate choices.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Single Valid Answer Key:</strong> Strictly verified (A, B, C, or D).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Statutory Explanations:</strong> Comprehensive rationale citing GFR/rulebook.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Content Grounding:</strong> Verifies overlap with extracted document text.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generation Progress Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Assessment Engine Running</h3>
                <p className="text-xs text-slate-500">Processing "{selectedItem?.title}"</p>
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-2.5">
              {generationSteps.map((step, idx) => {
                const isDone = idx < generationStep;
                const isCurrent = idx === generationStep;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs p-2.5 rounded-lg transition-colors ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : isCurrent
                        ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
