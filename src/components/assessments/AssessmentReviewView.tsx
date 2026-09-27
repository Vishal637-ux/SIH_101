import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  Trash2, 
  RotateCw, 
  Plus, 
  Send, 
  FileText, 
  BookOpen, 
  Save, 
  X, 
  Layers, 
  Loader2,
  HelpCircle,
  ShieldCheck,
  Archive
} from 'lucide-react';
import { Assessment, AssessmentQuestion, AssessmentDifficulty } from '../../types';
import { assessmentApi } from '../../services/assessmentApi';

interface AssessmentReviewViewProps {
  assessment: Assessment;
  onBack: () => void;
  onAssessmentUpdated: (assessment: Assessment) => void;
  onPreviewAsLearner: (assessmentId: string) => void;
  userRole?: string;
}

export const AssessmentReviewView: React.FC<AssessmentReviewViewProps> = ({
  assessment: initialAssessment,
  onBack,
  onAssessmentUpdated,
  onPreviewAsLearner,
  userRole = 'Trainer',
}) => {
  const [assessment, setAssessment] = useState<Assessment>(initialAssessment);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AssessmentQuestion>>({});
  
  // Single Question Regeneration Modal
  const [regeneratingQId, setRegeneratingQId] = useState<string | null>(null);
  const [regenInstructions, setRegenInstructions] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Add Question Modal
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [newQuestionData, setNewQuestionData] = useState<Partial<AssessmentQuestion>>({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: '',
    difficulty: 'MEDIUM',
    topic: initialAssessment.topic || 'Regulatory Procedures',
  });

  // Action states
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Start editing a question
  const handleStartEdit = (q: AssessmentQuestion) => {
    setEditingQuestionId(q.id);
    setEditFormData({ ...q });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditFormData({});
  };

  // Save edited question
  const handleSaveEdit = async () => {
    if (!editingQuestionId) return;
    try {
      setIsSaving(true);
      const res = await assessmentApi.updateQuestion(editingQuestionId, editFormData, userRole);
      setAssessment(res.assessment);
      onAssessmentUpdated(res.assessment);
      setEditingQuestionId(null);
      setEditFormData({});
      showNotification('success', 'Question updated and re-validated successfully.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update question.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question from the assessment?')) {
      return;
    }
    try {
      const updated = await assessmentApi.deleteQuestion(questionId, userRole);
      setAssessment(updated);
      onAssessmentUpdated(updated);
      showNotification('success', 'Question removed from assessment.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to delete question.');
    }
  };

  // Regenerate Question
  const handleRegenerateQuestion = async () => {
    if (!regeneratingQId) return;
    try {
      setIsRegenerating(true);
      await assessmentApi.regenerateQuestion(regeneratingQId, assessment.id, regenInstructions, userRole);
      // Reload full assessment
      const updatedAssessment = await assessmentApi.getAssessmentById(assessment.id, userRole);
      setAssessment(updatedAssessment);
      onAssessmentUpdated(updatedAssessment);
      setRegeneratingQId(null);
      setRegenInstructions('');
      showNotification('success', 'Question regenerated and validated by AI Assessment Engine.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to regenerate question.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Add Question
  const handleAddQuestion = async () => {
    if (!newQuestionData.question_text || !newQuestionData.option_a) {
      showNotification('error', 'Please provide question text and at least Option A.');
      return;
    }
    try {
      setIsSaving(true);
      const res = await assessmentApi.addQuestion(
        assessment.id,
        {
          ...newQuestionData,
          competency_reference: {
            id: assessment.competency_id,
            name: assessment.competency_name,
          },
          source_reference: {
            content_id: assessment.source_content_id,
            content_title: assessment.source_content_title,
            section_title: 'Manual Addition',
          },
        },
        userRole
      );
      setAssessment(res.assessment);
      onAssessmentUpdated(res.assessment);
      setIsAddingQuestion(false);
      setNewQuestionData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: '',
        difficulty: 'MEDIUM',
        topic: assessment.topic,
      });
      showNotification('success', 'New question added and validated.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to add question.');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Assessment
  const handlePublish = async () => {
    const invalidCount = assessment.questions.filter(q => q.validation_status === 'REJECTED').length;
    if (invalidCount > 0) {
      showNotification('error', `Cannot publish: ${invalidCount} question(s) have validation errors. Please edit or regenerate them.`);
      return;
    }

    try {
      setIsPublishing(true);
      const published = await assessmentApi.publishAssessment(assessment.id, userRole);
      setAssessment(published);
      onAssessmentUpdated(published);
      showNotification('success', 'Assessment published successfully! It is now accessible in the Learner Catalog.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to publish assessment.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Archive Assessment
  const handleArchive = async () => {
    if (!window.confirm('Archive this assessment? Learners will no longer be able to attempt it.')) {
      return;
    }
    try {
      const archived = await assessmentApi.archiveAssessment(assessment.id, userRole);
      setAssessment(archived);
      onAssessmentUpdated(archived);
      showNotification('success', 'Assessment archived.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to archive assessment.');
    }
  };

  const validCount = assessment.questions.filter(q => q.validation_status === 'VALID').length;
  const warningCount = assessment.questions.filter(q => q.validation_status === 'WARNING').length;
  const rejectedCount = assessment.questions.filter(q => q.validation_status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment List</span>
        </button>

        <div className="flex items-center gap-3">
          {assessment.status === 'PUBLISHED' && (
            <button
              onClick={() => onPreviewAsLearner(assessment.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-bold transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Preview / Test as Learner</span>
            </button>
          )}

          {assessment.status !== 'PUBLISHED' && (
            <button
              onClick={handlePublish}
              disabled={isPublishing || assessment.questions.length === 0 || rejectedCount > 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Assessment</span>
                </>
              )}
            </button>
          )}

          {assessment.status === 'PUBLISHED' && (
            <button
              onClick={handleArchive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Assessment Header Card */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded text-xs font-black tracking-wide uppercase border ${
                assessment.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : assessment.status === 'REVIEW'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {assessment.status}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {assessment.competency_name}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {assessment.questions.length} Questions
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900">{assessment.title}</h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">{assessment.description}</p>
          </div>

          {/* Validation Metrics */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-emerald-700 font-black text-base">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{validCount}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Valid</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-amber-700 font-black text-base">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{warningCount}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Warnings</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-rose-700 font-black text-base">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>{rejectedCount}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Rejected</span>
            </div>
          </div>
        </div>

        {/* Source Docket Traceability */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Source Content: <strong>{assessment.source_content_title}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Pass Threshold: <strong>{assessment.passing_percentage}%</strong></span>
            <span>•</span>
            <span>Time Limit: <strong>{assessment.time_limit_minutes} mins</strong></span>
            <span>•</span>
            <span>Mode: <strong className="text-indigo-700">{assessment.generation_metadata?.generation_mode || 'AI'}</strong></span>
          </div>
        </div>
      </div>

      {/* Action Toolbar: Add Question */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Question Bank & Validation Review ({assessment.questions.length})</span>
        </h2>
        <button
          onClick={() => setIsAddingQuestion(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Question</span>
        </button>
      </div>

      {/* Add Question Card / Form */}
      {isAddingQuestion && (
        <div className="p-6 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-300 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add New Objective MCQ</span>
            </h3>
            <button
              onClick={() => setIsAddingQuestion(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Text</label>
            <textarea
              rows={2}
              value={newQuestionData.question_text || ''}
              onChange={(e) => setNewQuestionData({ ...newQuestionData, question_text: e.target.value })}
              placeholder="e.g. Under GFR 2017, when is a single tender enquiry permissible?"
              className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(['A', 'B', 'C', 'D'] as const).map(letter => {
              const fieldName = `option_${letter.toLowerCase()}` as keyof AssessmentQuestion;
              return (
                <div key={letter} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {letter}
                  </span>
                  <input
                    type="text"
                    value={(newQuestionData[fieldName] as string) || ''}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, [fieldName]: e.target.value })}
                    placeholder={`Option ${letter} text`}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Answer</label>
              <select
                value={newQuestionData.correct_answer || 'A'}
                onChange={(e) => setNewQuestionData({ ...newQuestionData, correct_answer: e.target.value as any })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={newQuestionData.difficulty || 'MEDIUM'}
                onChange={(e) => setNewQuestionData({ ...newQuestionData, difficulty: e.target.value as any })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={newQuestionData.topic || ''}
                onChange={(e) => setNewQuestionData({ ...newQuestionData, topic: e.target.value })}
                placeholder="Topic name"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation & Statutory Citation</label>
            <textarea
              rows={2}
              value={newQuestionData.explanation || ''}
              onChange={(e) => setNewQuestionData({ ...newQuestionData, explanation: e.target.value })}
              placeholder="Cite rule number and operational rationale..."
              className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAddingQuestion(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddQuestion}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Validating...' : 'Validate & Add Question'}
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {assessment.questions.map((q, idx) => {
          const isEditing = editingQuestionId === q.id;

          return (
            <div
              key={q.id}
              className={`p-6 bg-white rounded-xl border transition-all ${
                q.validation_status === 'REJECTED'
                  ? 'border-rose-300 shadow-rose-50/50'
                  : q.validation_status === 'WARNING'
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              {isEditing ? (
                /* INLINE EDIT MODE */
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-blue-700 uppercase">Editing Question #{idx + 1}</span>
                    <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Question Text</label>
                    <textarea
                      rows={2}
                      value={editFormData.question_text || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, question_text: e.target.value })}
                      className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(['A', 'B', 'C', 'D'] as const).map(letter => {
                      const field = `option_${letter.toLowerCase()}` as keyof AssessmentQuestion;
                      const isCorrect = editFormData.correct_answer === letter;
                      return (
                        <div key={letter} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600">Option {letter}</span>
                            <label className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 cursor-pointer">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={isCorrect}
                                onChange={() => setEditFormData({ ...editFormData, correct_answer: letter })}
                                className="text-blue-600"
                              />
                              <span>Set Correct</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            value={(editFormData[field] as string) || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                            className={`w-full text-xs p-2 rounded-lg border ${
                              isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                      <input
                        type="text"
                        value={editFormData.topic || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, topic: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                      <select
                        value={editFormData.difficulty || 'MEDIUM'}
                        onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation</label>
                    <textarea
                      rows={2}
                      value={editFormData.explanation || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, explanation: e.target.value })}
                      className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Validating...' : 'Save & Validate'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* PREVIEW MODE */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {q.topic}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {q.difficulty}
                      </span>
                      {/* Validation Badge */}
                      {q.validation_status === 'VALID' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Validated</span>
                        </span>
                      ) : q.validation_status === 'WARNING' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Review Recommended</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Rejected (Issues Found)</span>
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(q)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setRegeneratingQId(q.id);
                          setRegenInstructions('');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-medium"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Regenerate with AI</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 hover:bg-rose-50 text-rose-600 text-xs font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Validation issues warning block */}
                  {q.validation_issues && q.validation_issues.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Validation Feedback:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                        {q.validation_issues.map((iss, iIdx) => (
                          <li key={iIdx}>{iss}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Question Text */}
                  <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                    {q.question_text}
                  </h4>

                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {(['A', 'B', 'C', 'D'] as const).map(letter => {
                      const optField = `option_${letter.toLowerCase()}` as keyof AssessmentQuestion;
                      const isCorrect = q.correct_answer === letter;
                      return (
                        <div
                          key={letter}
                          className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                            isCorrect
                              ? 'bg-emerald-50/70 border-emerald-300 font-semibold text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded text-[11px] font-black flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-snug">{q[optField] as string}</span>
                          {isCorrect && (
                            <span className="ml-auto text-[10px] uppercase font-bold text-emerald-700 shrink-0">
                              Correct Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Source Citation */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">Explanation & Regulatory Reference:</span>
                    <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Cited Section: {q.source_reference?.section_title || 'Module 08 Curriculum'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Regeneration Modal */}
      {regeneratingQId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <RotateCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Regenerate Question with AI</h3>
                <p className="text-xs text-slate-500">Reprompt Gemini 3.8 Flash using document context</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Trainer Prompt / Guidance
              </label>
              <textarea
                rows={3}
                value={regenInstructions}
                onChange={(e) => setRegenInstructions(e.target.value)}
                placeholder="e.g. Focus on penalty thresholds, make it a practical field inspection scenario, or increase difficulty."
                className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRegeneratingQId(null)}
                disabled={isRegenerating}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateQuestion}
                disabled={isRegenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs disabled:opacity-50"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Regenerate Question</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
