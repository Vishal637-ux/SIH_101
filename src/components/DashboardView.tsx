import React from 'react';
import { OfficialProfile, CompetencyItem, GapAnalysisResult, LearningPathwayItem } from '../types';
import { 
  GraduationCap, 
  Award, 
  Target, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  UploadCloud,
  FileText,
  HelpCircle,
  Users,
  Building2,
  BarChart3,
  BrainCircuit,
  FileCheck
} from 'lucide-react';

interface DashboardViewProps {
  profile: OfficialProfile;
  competencies: CompetencyItem[];
  gapResult: GapAnalysisResult | null;
  pathways: LearningPathwayItem[];
  theme: 'light' | 'dark';
  userRole?: 'Learner' | 'Trainer' | 'Admin';
  onNavigateToProfile: () => void;
  onNavigateToSkills: () => void;
  onNavigateToSkillGaps: () => void;
  onNavigateToRecommendations: () => void;
  onNavigateToLearning: () => void;
  onNavigateToAssessments: () => void;
  onNavigateToProgress: () => void;
  onSelectStep?: (step: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  competencies,
  theme,
  userRole = 'Learner',
  onNavigateToProfile,
  onNavigateToSkillGaps,
  onNavigateToRecommendations,
  onNavigateToLearning,
  onNavigateToAssessments,
  onNavigateToProgress,
  onSelectStep,
}) => {
  const isLight = theme === 'light';

  // =========================================================================
  // 1. TRAINER DASHBOARD (Rule 14)
  // =========================================================================
  if (userRole === 'Trainer') {
    return (
      <div className="space-y-8 pb-8">
        {/* Title */}
        <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
          <h1 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
            Trainer Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            AI Content Processing, Course Authoring & Learner Performance Tracking
          </p>
        </div>

        {/* Trainer Workflow matching Rule 14 */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-blue-50/50 border-blue-200' : 'bg-blue-950/20 border-blue-800/40'}`}>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 text-center">
            Trainer Workflow
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
            <span className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white shadow-xs flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4" /> Upload PDF / Book
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#0c2340] text-amber-300 shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Processing
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white shadow-xs flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Generate Content
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white shadow-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Review & Publish
            </span>
          </div>
        </div>

        {/* 3 Main Sections matching Rule 14 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section 1: Recent Uploads */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              Recent Uploads
            </h3>
            <div className="space-y-2.5">
              {[
                { name: 'GFR_2017_Procurement_Manual.pdf', date: 'Yesterday', status: 'Published' },
                { name: 'DPDP_Act_2023_Compliance_Guide.pdf', date: '3 days ago', status: 'Processed' },
                { name: 'National_Data_Governance_Draft.docx', date: '5 days ago', status: 'Draft' },
              ].map((item, i) => (
                <div key={i} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.date}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Generated MCQs */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              Generated MCQs
            </h3>
            <div className="space-y-2.5">
              {[
                { title: 'Public Procurement & GeM Rules', count: '48 Questions' },
                { title: 'Data Privacy & Security Protocols', count: '32 Questions' },
                { title: 'Statistical Sampling Rigor', count: '24 Questions' },
              ].map((item, i) => (
                <div key={i} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Learner Performance */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Learner Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span>Average Quiz Score:</span>
                <span className="font-bold text-emerald-600">86.4%</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span>Active Participants:</span>
                <span className="font-bold text-blue-600">1,240 Officials</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span>Course Completion Rate:</span>
                <span className="font-bold text-purple-600">92.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. ADMIN DASHBOARD (Rule 15)
  // =========================================================================
  if (userRole === 'Admin') {
    return (
      <div className="space-y-8 pb-8">
        {/* Title */}
        <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
          <h1 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
            Admin Dashboard (Workforce Analytics)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Civil Services Capacity Building Workforce Intelligence & Department Metrics
          </p>
        </div>

        {/* Top Cards matching Rule 15 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Officials</span>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">14,250</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">Across Central Cadres</p>
          </div>

          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departments</span>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">42</p>
            <p className="text-[11px] font-semibold text-blue-600 mt-1">Ministries & Line Agencies</p>
          </div>

          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ongoing Trainings</span>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">184</p>
            <p className="text-[11px] font-semibold text-purple-600 mt-1">Active Batches</p>
          </div>

          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Rate</span>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">89.2%</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">+4.5% vs Last Quarter</p>
          </div>
        </div>

        {/* 4 Charts/Sections matching Rule 15 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department-wise Skill Gap */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Department-wise Skill Gap
            </h3>
            <div className="space-y-3 text-xs">
              {[
                { dept: 'Ministry of Finance (Expenditure)', gap: '1.8 Avg Gap', pct: 72 },
                { dept: 'DoPT (Personnel & Training)', gap: '1.2 Avg Gap', pct: 48 },
                { dept: 'Ministry of Statistics & PI', gap: '2.1 Avg Gap', pct: 84 },
                { dept: 'MeitY (Digital Governance)', gap: '1.4 Avg Gap', pct: 56 },
              ].map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{d.dept}</span>
                    <span className="text-rose-600 font-bold">{d.gap}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Skill Gaps */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Top Skill Gaps
            </h3>
            <div className="space-y-3 text-xs">
              {[
                { skill: 'Data Analytics & Python', impact: 'Critical (3,400 Officials Required)' },
                { skill: 'Public Procurement & GeM Rules', impact: 'High (2,100 Officials Required)' },
                { skill: 'DPDP Data Privacy Compliance', impact: 'High (1,950 Officials Required)' },
                { skill: 'Evidence-Based Policy Formulation', impact: 'Medium (1,200 Officials Required)' },
              ].map((s, i) => (
                <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{s.skill}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400">
                    {s.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Training Completion Trend */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Training Completion Trend
            </h3>
            <div className="space-y-2 text-xs">
              {['Q1 2026: 2,400 Completed', 'Q2 2026: 3,100 Completed', 'Q3 2026: 4,200 Completed', 'Q4 2026 (Target): 5,000 Completed'].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Competency Distribution */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Competency Distribution
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-semibold"><span>Level 5 (Expert / Master):</span> <span className="font-bold text-emerald-600">18%</span></div>
              <div className="flex justify-between font-semibold"><span>Level 4 (Advanced):</span> <span className="font-bold text-blue-600">32%</span></div>
              <div className="flex justify-between font-semibold"><span>Level 3 (Intermediate):</span> <span className="font-bold text-amber-600">38%</span></div>
              <div className="flex justify-between font-semibold"><span>Level 1-2 (Foundation):</span> <span className="font-bold text-rose-600">12%</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. GOVERNMENT OFFICIAL (LEARNER) DASHBOARD (Rule 13)
  // =========================================================================
  return (
    <div className="space-y-8 pb-8">
      {/* Title */}
      <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
        <h1 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
          Government Official Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Welcome back, {profile.name} ({profile.designation})
        </p>
      </div>

      {/* Top Summary Cards matching Rule 13 (4 exact elements) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Learning Progress */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learning Progress</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100">78%</p>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">Target Competency Rate</p>
        </div>

        {/* 2. Ongoing Courses */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ongoing Courses</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100">2 Courses</p>
          <p className="text-[11px] font-semibold text-amber-600 mt-1">In Progress</p>
        </div>

        {/* 3. Completed Courses */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Courses</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100">5 Courses</p>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1">Verified Badges</p>
        </div>

        {/* 4. Achievements */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Achievements</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100">420 Points</p>
          <p className="text-[11px] font-semibold text-purple-600 mt-1">Level 3 Master</p>
        </div>
      </div>

      {/* Main Sections matching Rule 13 (4 exact sections) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Recommended for You */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Recommended for You
            </h3>
            <button 
              onClick={onNavigateToRecommendations}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Advanced Statistical Analysis', gap: 'Statistics Gap (-2.0)', tag: 'Based on your skill gap' },
              { title: 'Python for Data Analysis', gap: 'Python Gap (-2.0)', tag: 'Based on your skill gap' },
            ].map((item, i) => (
              <div key={i} className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  {item.tag}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.gap}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Skill Gap Overview */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-600" />
              Skill Gap Overview
            </h3>
            <button 
              onClick={onNavigateToSkillGaps}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Report</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Data Analysis', gap: '-2.0', current: '2.5 / 4.5' },
              { name: 'Statistics', gap: '-2.0', current: '2.0 / 4.0' },
              { name: 'Python', gap: '-2.0', current: '1.5 / 3.5' },
              { name: 'Communication', gap: '-1.0', current: '3.5 / 4.5' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between font-semibold">
                <span>{s.name} ({s.current})</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 font-extrabold text-[11px]">
                  Gap: {s.gap}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Continue Learning */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              Continue Learning
            </h3>
            <button 
              onClick={onNavigateToLearning}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Open Player</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              General Financial Rules 2017 & GeM Procurement
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">Module 2 of 5 • 65% Completed</p>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-2">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
        </div>

        {/* Section 4: Upcoming Assessment */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-600" />
              Upcoming Assessment
            </h3>
            <button 
              onClick={onNavigateToAssessments}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Start</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Role Based Evaluation: Public Procurement & Compliance
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">15 Questions • Estimated time: 20 mins</p>
          </div>
        </div>
      </div>
    </div>
  );
};
