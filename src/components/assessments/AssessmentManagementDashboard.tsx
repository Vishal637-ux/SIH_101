import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  ArrowRight, 
  Eye, 
  Send, 
  Archive, 
  Edit3, 
  Award, 
  TrendingUp, 
  UserCheck, 
  ShieldCheck, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Assessment, AssessmentAttempt, AssessmentStatus } from '../../types';
import { assessmentApi } from '../../services/assessmentApi';
import { AssessmentGenerateView } from './AssessmentGenerateView';
import { AssessmentReviewView } from './AssessmentReviewView';
import { AssessmentAttemptView } from './AssessmentAttemptView';
import { AssessmentResultView } from './AssessmentResultView';

interface AssessmentManagementDashboardProps {
  initialContentId?: string | null;
  onNavigateToLearning?: () => void;
  onNavigateToSkillGaps?: () => void;
  onNavigateToRecommendations?: () => void;
  userRole?: 'Trainer' | 'Admin' | 'Learner';
}

type SubView = 'LIST' | 'GENERATE' | 'REVIEW' | 'ATTEMPT' | 'RESULT';

export const AssessmentManagementDashboard: React.FC<AssessmentManagementDashboardProps> = ({
  initialContentId,
  onNavigateToLearning,
  onNavigateToSkillGaps,
  onNavigateToRecommendations,
  userRole: propUserRole = 'Trainer',
}) => {
  // Active role toggle (Trainer vs Learner) to support the full SIH demo seamlessly
  const [activeRole, setActiveRole] = useState<'Trainer' | 'Learner'>(
    propUserRole === 'Learner' ? 'Learner' : 'Trainer'
  );

  // Subview routing
  const [subView, setSubView] = useState<SubView>(initialContentId ? 'GENERATE' : 'LIST');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedAttemptResult, setSelectedAttemptResult] = useState<AssessmentAttempt | null>(null);

  // Data states
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [learnerAttempts, setLearnerAttempts] = useState<AssessmentAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const list = await assessmentApi.getAssessments(
        statusFilter !== 'ALL' ? { status: statusFilter } : undefined,
        activeRole
      );
      setAssessments(list);

      // Also fetch learner attempt history for badge display
      try {
        const currentUserId = localStorage.getItem('sih_active_user_id') || 'off-001';
        const attempts = await assessmentApi.getLearnerAttempts(currentUserId, activeRole);
        setLearnerAttempts(attempts);
      } catch (attErr) {
        // Non-blocking
      }
    } catch (err: any) {
      console.error('Failed to load assessments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole, statusFilter]);

  // Handle URL route sync
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/assessments/generate') {
      setActiveRole('Trainer');
      setSubView('GENERATE');
    } else if (path === '/assessments/available') {
      setActiveRole('Learner');
      setSubView('LIST');
    } else if (path.includes('/review')) {
      const parts = path.split('/');
      const id = parts[2];
      if (id && id !== 'generate' && id !== 'available') {
        setSelectedAssessmentId(id);
        setActiveRole('Trainer');
        setSubView('REVIEW');
      }
    } else if (path.includes('/attempt')) {
      const parts = path.split('/');
      const id = parts[2];
      if (id) {
        setSelectedAssessmentId(id);
        setActiveRole('Learner');
        setSubView('ATTEMPT');
      }
    }
  }, []);

  // Filtered assessments list
  const filteredAssessments = assessments.filter(a => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchComp = a.competency_name.toLowerCase().includes(q);
      const matchTopic = a.topic.toLowerCase().includes(q);
      const matchSource = a.source_content_title.toLowerCase().includes(q);
      if (!matchTitle && !matchComp && !matchTopic && !matchSource) return false;
    }
    return true;
  });

  // Active assessment object for review
  const activeAssessment = assessments.find(a => a.id === selectedAssessmentId) || null;

  // Render SubViews:
  // 1. GENERATE VIEW
  if (subView === 'GENERATE') {
    return (
      <AssessmentGenerateView
        initialContentId={initialContentId}
        onBack={() => {
          setSubView('LIST');
          window.history.replaceState(null, '', '/assessments');
        }}
        onAssessmentGenerated={(generated) => {
          setAssessments(prev => [generated, ...prev]);
          setSelectedAssessmentId(generated.id);
          setSubView('REVIEW');
          window.history.replaceState(null, '', `/assessments/${generated.id}/review`);
        }}
        userRole={activeRole}
      />
    );
  }

  // 2. REVIEW VIEW
  if (subView === 'REVIEW' && activeAssessment) {
    return (
      <AssessmentReviewView
        assessment={activeAssessment}
        onBack={() => {
          setSubView('LIST');
          setSelectedAssessmentId(null);
          loadData();
          window.history.replaceState(null, '', '/assessments');
        }}
        onAssessmentUpdated={(updated) => {
          setAssessments(prev => prev.map(a => a.id === updated.id ? updated : a));
        }}
        onPreviewAsLearner={(assId) => {
          setSelectedAssessmentId(assId);
          setActiveRole('Learner');
          setSubView('ATTEMPT');
          window.history.replaceState(null, '', `/assessments/${assId}/attempt`);
        }}
        userRole={activeRole}
      />
    );
  }

  // 3. ATTEMPT VIEW
  if (subView === 'ATTEMPT' && selectedAssessmentId) {
    return (
      <AssessmentAttemptView
        assessmentId={selectedAssessmentId}
        onBack={() => {
          setSubView('LIST');
          setSelectedAssessmentId(null);
          window.history.replaceState(null, '', '/assessments');
        }}
        onAttemptSubmitted={(result) => {
          setSelectedAttemptResult(result);
          setSubView('RESULT');
          window.history.replaceState(null, '', `/assessments/${selectedAssessmentId}/result`);
        }}
        userRole={activeRole}
      />
    );
  }

  // 4. RESULT VIEW
  if (subView === 'RESULT' && selectedAttemptResult) {
    return (
      <AssessmentResultView
        attempt={selectedAttemptResult}
        onBackToAssessments={() => {
          setSubView('LIST');
          setSelectedAttemptResult(null);
          setSelectedAssessmentId(null);
          loadData();
          window.history.replaceState(null, '', '/assessments');
        }}
        onRetakeAssessment={() => {
          setSelectedAttemptResult(null);
          setSubView('ATTEMPT');
        }}
        onNavigateToSkillGaps={onNavigateToSkillGaps}
        onNavigateToRecommendations={onNavigateToRecommendations}
      />
    );
  }

  // Statistics
  const totalAssessments = assessments.length;
  const reviewCount = assessments.filter(a => a.status === 'REVIEW' || a.status === 'DRAFT').length;
  const publishedCount = assessments.filter(a => a.status === 'PUBLISHED').length;
  const totalQuestionsSum = assessments.reduce((acc, a) => acc + (a.questions?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-[#0c2340] text-amber-400 font-black flex items-center justify-center text-xs shadow border border-amber-400/30">
              M09
            </span>
            <h1 className="text-xl font-black text-slate-900">
              AI Assessment Engine & Evaluation Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Convert Module 08 content into validated MCQs, manage trainer review, conduct official learner assessments, and auto-generate competency evidence.
          </p>
        </div>

        {/* Role Toggle Switcher for SIH End-to-End Demo */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => {
              setActiveRole('Trainer');
              window.history.replaceState(null, '', '/assessments');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === 'Trainer'
                ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Trainer / Reviewer</span>
          </button>
          <button
            onClick={() => {
              setActiveRole('Learner');
              window.history.replaceState(null, '', '/assessments/available');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === 'Learner'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Learner Mode</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (for Trainer) */}
      {activeRole === 'Trainer' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Assessments
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalAssessments}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Repository catalog</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              In Trainer Review
            </span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">
              {reviewCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Pending verification</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Published & Active
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {publishedCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Live for learners</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Validated Questions
            </span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">
              {totalQuestionsSum}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Objective MCQs</span>
          </div>
        </div>
      )}

      {/* Action Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, topic, or competency..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters and CTA */}
        <div className="flex items-center gap-3">
          {activeRole === 'Trainer' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="REVIEW">In Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          )}

          {activeRole === 'Trainer' && (
            <button
              onClick={() => {
                setSubView('GENERATE');
                window.history.replaceState(null, '', '/assessments/generate');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate AI Assessment</span>
            </button>
          )}
        </div>
      </div>

      {/* Assessment Cards Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-500 space-y-3">
          <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600" />
          <p className="text-sm font-semibold">Loading assessments catalog...</p>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {activeRole === 'Learner' ? 'No Published Assessments Available' : 'No Assessments Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {activeRole === 'Learner'
              ? 'Published assessments aligned with your target competencies will appear here as soon as approved by trainers.'
              : 'Generate your first objective assessment from a processed Module 08 PDF or manual.'}
          </p>
          {activeRole === 'Trainer' && (
            <button
              onClick={() => setSubView('GENERATE')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Assessment</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map(assessment => {
            // Check if learner already attempted this assessment
            const existingAttempt = learnerAttempts.find(
              att => att.assessment_id === assessment.id && att.status === 'SUBMITTED'
            );

            return (
              <div
                key={assessment.id}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  {/* Status Badge & Topic */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 truncate">
                      {assessment.topic}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        assessment.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : assessment.status === 'REVIEW'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {assessment.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {assessment.description}
                    </p>
                  </div>

                  {/* Metadata strip */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Questions:</span>
                      <span className="font-bold text-slate-800">{assessment.questions.length} MCQs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Difficulty:</span>
                      <span className="font-bold text-slate-800">{assessment.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pass Mark:</span>
                      <span className="font-bold text-slate-800">{assessment.passing_percentage}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Time Limit:</span>
                      <span className="font-bold text-slate-800">{assessment.time_limit_minutes}m</span>
                    </div>
                  </div>

                  {/* Source Reference */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Source: {assessment.source_content_title}</span>
                  </div>

                  {/* Past Learner Attempt Badge */}
                  {existingAttempt && (
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                      <span>Previous Attempt:</span>
                      <span className="font-black text-emerald-700">{existingAttempt.percentage}% Score</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {activeRole === 'Trainer' ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedAssessmentId(assessment.id);
                          setSubView('REVIEW');
                          window.history.replaceState(null, '', `/assessments/${assessment.id}/review`);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Review / Edit</span>
                      </button>

                      {assessment.status === 'PUBLISHED' && (
                        <button
                          onClick={() => {
                            setSelectedAssessmentId(assessment.id);
                            setActiveRole('Learner');
                            setSubView('ATTEMPT');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {existingAttempt ? (
                        <button
                          onClick={() => {
                            setSelectedAttemptResult(existingAttempt);
                            setSubView('RESULT');
                          }}
                          className="text-xs font-bold text-slate-700 hover:text-slate-900"
                        >
                          View Results & Evidence
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not attempted yet</span>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAssessmentId(assessment.id);
                          setSubView('ATTEMPT');
                          window.history.replaceState(null, '', `/assessments/${assessment.id}/attempt`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <span>{existingAttempt ? 'Retake' : 'Start Assessment'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
