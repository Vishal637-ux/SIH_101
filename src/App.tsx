import React, { useState, useEffect } from 'react';
import { 
  OfficialProfile, 
  CompetencyItem, 
  GapAnalysisResult, 
  LearningPathwayItem, 
  BookToContentExtraction, 
  AssessmentEvaluation 
} from './types';
import { SAMPLE_PROFILES, INITIAL_COMPETENCIES, PRESET_BOOKS } from './mockData';
import { Header } from './components/Header';
import { WorkflowBar } from './components/WorkflowBar';
import { ProfileModal } from './components/ProfileModal';
import { Step1Login } from './components/steps/Step1Login';
import { Step2Profile } from './components/steps/Step2Profile';
import { Step3AssessmentGap } from './components/steps/Step3AssessmentGap';
import { Step4Recommendation } from './components/steps/Step4Recommendation';
import { Step5Pathway } from './components/steps/Step5Pathway';
import { Step6LearningExperience } from './components/steps/Step6LearningExperience';
import { Step7Assessment } from './components/steps/Step7Assessment';
import { Step8CompetencyUpdate } from './components/steps/Step8CompetencyUpdate';
import { Step9Analytics } from './components/steps/Step9Analytics';
import { Step10ContinuousLearning } from './components/steps/Step10ContinuousLearning';
import { IntegrationEcosystemView } from './components/IntegrationEcosystemView';
import { ContentManagementDashboard } from './components/ContentManagementDashboard';
import { ContentDetailView } from './components/ContentDetailView';
import { AssessmentManagementDashboard } from './components/assessments/AssessmentManagementDashboard';
import { DashboardView } from './components/DashboardView';
import { Sidebar } from './components/Sidebar';
import { CrossCuttingFeatures } from './components/CrossCuttingFeatures';
import { PublicLandingPage } from './components/PublicLandingPage';

export default function App() {
  // Theme state: light theme as requested, matching Karmayogi
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Active Role state: Learner (Government Official), Trainer, or Admin (Persisted)
  const [userRole, setUserRole] = useState<'Learner' | 'Trainer' | 'Admin'>(() => {
    const saved = localStorage.getItem('pradnyasetu_userRole');
    return (saved === 'Trainer' || saved === 'Admin') ? saved : 'Learner';
  });

  // Sidebar open state (Left sidebar)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // View state: 'dashboard' or 'workflow'
  const [activeView, setActiveView] = useState<'dashboard' | 'workflow'>('dashboard');

  // Step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [showIntegrationsView, setShowIntegrationsView] = useState<boolean>(false);
  const [showContentView, setShowContentView] = useState<boolean>(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [showAssessmentsView, setShowAssessmentsView] = useState<boolean>(false);
  const [assessmentTargetContentId, setAssessmentTargetContentId] = useState<string | null>(null);

  // Auth & Profile State (Persisted in localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('pradnyasetu_isLoggedIn') === 'true';
  });
  const [publicAuthMode, setPublicAuthMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profile, setProfile] = useState<OfficialProfile>(() => {
    const saved = localStorage.getItem('pradnyasetu_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SAMPLE_PROFILES[0];
  });
  const [competencies, setCompetencies] = useState<CompetencyItem[]>(INITIAL_COMPETENCIES);

  // Gap Analysis & Recommendations State
  const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(null);
  const [isGapLoading, setIsGapLoading] = useState<boolean>(false);

  // Pathways State
  const [pathways, setPathways] = useState<LearningPathwayItem[]>([
    {
      id: 'path-igot-101',
      title: 'General Financial Rules 2017 & GeM 4.0 Procurement Framework',
      source: 'iGOT Karmayogi',
      competencyAddressed: 'Public Procurement & GeM Rules',
      estimatedHours: 6,
      level: 'Intermediate',
      description: 'Master contract drafting, reverse bidding, and dispute resolution guidelines under modern public procurement directives.',
      karmaPoints: 150,
      modulesCount: 5,
    },
    {
      id: 'path-nssta-202',
      title: 'Statistical Verification & Evidence-Based Public Policy',
      source: 'NSSTA',
      competencyAddressed: 'Data-Driven Decision Making & Analytics',
      estimatedHours: 4,
      level: 'Intermediate',
      description: 'Field sampling rigor, index analysis, and validating scheme survey data for policy formulation.',
      karmaPoints: 120,
      modulesCount: 4,
    },
    {
      id: 'path-tpac-303',
      title: 'Digital Personal Data Protection (DPDP) Act & e-Governance Compliance',
      source: 'TPAC',
      competencyAddressed: 'Digital Governance & Data Privacy Compliance',
      estimatedHours: 5,
      level: 'Advanced',
      description: 'Implementing security safeguards, data fiduciary duties, and citizen consent workflows in departmental systems.',
      karmaPoints: 140,
      modulesCount: 4,
    },
    {
      id: 'path-plat-404',
      title: 'Executive Note Drafting, Cabinet Briefings & Ethics in Administration',
      source: 'Platform Content',
      competencyAddressed: 'Ethical Leadership & Citizen Centricity',
      estimatedHours: 3.5,
      level: 'Foundation',
      description: 'Concise inter-ministerial correspondence, code of conduct compliance, and transparent citizen grievance handling.',
      karmaPoints: 90,
      modulesCount: 3,
    },
  ]);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('path-igot-101');

  // Book-to-Content Extraction State (Step 6 Prototype)
  const [extractedContent, setExtractedContent] = useState<BookToContentExtraction>({
    documentTitle: PRESET_BOOKS[0].title,
    documentSummary: 'This manual synthesizes statutory procurement principles, open competitive bidding protocols, and electronic contract management standards under General Financial Rules (GFR).',
    adaptiveModules: [
      {
        title: 'Module 1: Fundamental Principles of Public Procurement',
        keyTakeaways: [
          'Mandatory adherence to fairness, transparency, and value for public expenditure.',
          'Specifications must not be tailored to restrict competition to proprietary vendors.',
          'Explicit justification required for limited or single tender inquiries.',
        ],
        readTimeMinutes: 4,
      },
      {
        title: 'Module 2: Government e-Marketplace (GeM) Mandate & Direct Purchases',
        keyTakeaways: [
          'Direct purchase allowed up to prescribed financial thresholds through lowest certified vendor.',
          'Mandatory reverse auction triggers for procurement exceeding threshold limits.',
          'Timely generation of Provisional Receipt and Consignee Receipt and Acceptance Certificate (CRAC).',
        ],
        readTimeMinutes: 5,
      },
      {
        title: 'Module 3: Integrity Pacts, Bid Securities & Audit Compliance',
        keyTakeaways: [
          'Exemptions and ceilings on Performance Security and Earnest Money Deposits (EMD).',
          'Strict prohibition of post-tender negotiations except with lowest compliant bidder (L1).',
          'Complete audit trail maintenance for Comptroller & Auditor General (CAG) inspection.',
        ],
        readTimeMinutes: 4,
      },
    ],
    assessmentQuestions: [
      {
        id: 'q-doc-1',
        question: 'Under public procurement rules, when is post-tender negotiation permissible?',
        options: [
          'Freely with all participants to drive costs down',
          'Only in exceptional cases and strictly with the lowest compliant bidder (L1)',
          'With the top three bidders simultaneously via sealed envelope',
          'Negotiations are strictly prohibited under every circumstance',
        ],
        correctIndex: 1,
        explanation: 'Post-tender negotiations are severely restricted to prevent cartelization and bias; they are permitted only under recorded exigency strictly with the L1 bidder.',
        competencyTagged: 'Public Procurement & GeM Rules',
      },
      {
        id: 'q-doc-2',
        question: 'What is the purpose of the Consignee Receipt and Acceptance Certificate (CRAC) on GeM?',
        options: [
          'To extend the delivery period automatically without penalty',
          'To certify formal inspection and receipt of goods for time-bound vendor payment',
          'To waive performance security deposits for micro enterprises',
          'To issue an administrative sanction for unspent budget grants',
        ],
        correctIndex: 1,
        explanation: 'CRAC verifies goods meet technical specifications and binds the buyer department to disburse vendor payment within the statutory 10-day window.',
        competencyTagged: 'Public Procurement & GeM Rules',
      },
      {
        id: 'q-doc-3',
        question: 'Which principle governs the drafting of tender technical specifications?',
        options: [
          'They should specify exact proprietary brand names to ensure high quality',
          'They must be generic, functional, and performance-based to promote broad competition',
          'They must be identical to the previous financial year regardless of market changes',
          'They are determined unilaterally by the supplier after bid submission',
        ],
        correctIndex: 1,
        explanation: 'GFR 2017 mandates generic and performance-oriented specifications to encourage widest possible competition without brand favoritism.',
        competencyTagged: 'Public Procurement & GeM Rules',
      },
      {
        id: 'q-doc-4',
        question: 'What constitutes an essential requirement for Single Tender / Proprietary Article procurement?',
        options: [
          'An informal email consent from the vendor',
          'A formal Proprietary Article Certificate (PAC) approved by the competent financial authority',
          'Verbal approval by the immediate section supervisor',
          'A price quote matching market retail list prices',
        ],
        correctIndex: 1,
        explanation: 'A formal PAC from the competent financial authority is mandatory to justify dispensing with open competitive bidding.',
        competencyTagged: 'Public Procurement & GeM Rules',
      },
    ],
  });

  // Assessment Evaluation State (Step 7 -> 8)
  const [evaluation, setEvaluation] = useState<AssessmentEvaluation | null>(null);

  // Initial gap analysis
  const runGapAnalysis = async () => {
    setIsGapLoading(true);
    try {
      const res = await fetch('/api/analyze-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          currentCompetencies: competencies,
          targetRole: profile.targetRole,
        }),
      });
      if (res.ok) {
        const data: GapAnalysisResult = await res.json();
        setGapResult(data);
      }
    } catch (err) {
      console.error('Failed to run gap analysis:', err);
    } finally {
      setIsGapLoading(false);
    }
  };

  useEffect(() => {
    runGapAnalysis();
  }, [profile.id]);

  // Route support for /skill-gaps, /recommendations, /integrations, /learning, and /content directly
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path.startsWith('/assessments') || hash.startsWith('#assessments')) {
        setShowAssessmentsView(true);
        setShowContentView(false);
        setShowIntegrationsView(false);
      } else if (path.startsWith('/content') || hash.startsWith('#content')) {
        setShowContentView(true);
        setShowAssessmentsView(false);
        setShowIntegrationsView(false);
        const parts = path.split('/');
        if (parts.length >= 3 && parts[2]) {
          setSelectedContentId(parts[2]);
        } else {
          setSelectedContentId(null);
        }
      } else {
        setShowAssessmentsView(false);
        setShowContentView(false);
        setSelectedContentId(null);
        if (path === '/integrations' || hash === '#integrations') {
          setShowIntegrationsView(true);
        } else {
          setShowIntegrationsView(false);
          if (path === '/skill-gaps' || hash === '#skill-gaps') {
            setCurrentStep(4);
          } else if (
            path === '/recommendations' || 
            hash === '#recommendations' || 
            path === '/recommendations/path' || 
            hash === '#recommendations/path'
          ) {
            setCurrentStep(5);
          } else if (
            path === '/learning' || 
            hash === '#learning' || 
            path.startsWith('/learning/')
          ) {
            setCurrentStep(6);
          }
        }
      }
    };
    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Navigation handlers
  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    const nextStep = Math.min(10, currentStep + 1);
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    const prevStep = Math.max(1, currentStep - 1);
    setCurrentStep(prevStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDashboard = () => {
    setShowIntegrationsView(false);
    setShowContentView(false);
    setShowAssessmentsView(false);
    setSelectedContentId(null);
    setAssessmentTargetContentId(null);
    setActiveView('dashboard');
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStep = (stepNumber: number) => {
    setShowIntegrationsView(false);
    setShowContentView(false);
    setShowAssessmentsView(false);
    setSelectedContentId(null);
    setAssessmentTargetContentId(null);
    setActiveView('workflow');
    setCurrentStep(stepNumber);
    if (stepNumber === 4) {
      window.history.replaceState(null, '', '/skill-gaps');
    } else if (stepNumber === 5) {
      window.history.replaceState(null, '', '/recommendations');
    } else if (stepNumber === 6) {
      window.history.replaceState(null, '', '/learning');
    } else if (
      window.location.pathname === '/skill-gaps' || 
      window.location.pathname === '/recommendations' ||
      window.location.pathname === '/integrations' ||
      window.location.pathname === '/learning' ||
      window.location.pathname.startsWith('/content') ||
      window.location.pathname.startsWith('/assessments')
    ) {
      window.history.replaceState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToIntegrations = () => {
    setShowContentView(false);
    setShowAssessmentsView(false);
    setSelectedContentId(null);
    setShowIntegrationsView(true);
    window.history.replaceState(null, '', '/integrations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToContent = (contentId?: string) => {
    setShowIntegrationsView(false);
    setShowAssessmentsView(false);
    setShowContentView(true);
    setSelectedContentId(contentId || null);
    if (contentId) {
      window.history.replaceState(null, '', `/content/${contentId}`);
    } else {
      window.history.replaceState(null, '', '/content');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAssessments = (contentId?: string) => {
    setShowIntegrationsView(false);
    setShowContentView(false);
    setSelectedContentId(null);
    setShowAssessmentsView(true);
    setAssessmentTargetContentId(contentId || null);
    if (contentId) {
      window.history.replaceState(null, '', '/assessments/generate');
    } else {
      window.history.replaceState(null, '', '/assessments');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToLearning = () => {
    setShowIntegrationsView(false);
    setShowAssessmentsView(false);
    handleSelectStep(6);
  };

  // Competency updates
  const handleUpdateCompetency = (id: string, newLevel: number) => {
    setCompetencies(prev =>
      prev.map(c => {
        if (c.id === id) {
          const gapScore = Number((c.requiredLevel - newLevel).toFixed(1));
          return {
            ...c,
            currentLevel: newLevel,
            gapScore,
            urgency: gapScore >= 2.0 ? 'High' : gapScore >= 1.0 ? 'Medium' : 'Low',
          };
        }
        return c;
      })
    );
  };

  const handleUpdateProfile = (updated: Partial<OfficialProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  // Evaluation submission in Step 7
  const handleAssessmentSubmit = (evalResult: AssessmentEvaluation) => {
    setEvaluation(evalResult);

    // Apply competency uplift
    setCompetencies(prev =>
      prev.map(c => {
        if (c.name.toLowerCase().includes('procurement') || c.name === evalResult.competencyUplift.competencyName) {
          const newLevel = evalResult.competencyUplift.newLevel;
          const gap = Number((c.requiredLevel - newLevel).toFixed(1));
          return {
            ...c,
            currentLevel: newLevel,
            gapScore: gap,
            urgency: gap >= 2.0 ? 'High' : gap >= 1.0 ? 'Medium' : 'Low',
          };
        }
        return c;
      })
    );

    // Credit Karma points
    setProfile(prev => ({
      ...prev,
      karmaPoints: prev.karmaPoints + (evalResult.karmaEarned || 120),
      completedCourses: prev.completedCourses + 1,
    }));
  };

  // Continuous Learning: Re-assess loop
  const handleTriggerNewCycle = () => {
    setCompetencies(prev =>
      prev.map(c => {
        const nextRequired = Math.min(5.0, Number((c.requiredLevel + 0.5).toFixed(1)));
        const newGap = Number((nextRequired - c.currentLevel).toFixed(1));
        return {
          ...c,
          requiredLevel: nextRequired,
          gapScore: newGap,
          urgency: newGap >= 2.0 ? 'High' : newGap >= 1.0 ? 'Medium' : 'Low',
        };
      })
    );

    setEvaluation(null);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    runGapAnalysis();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('Learner');
    localStorage.removeItem('pradnyasetu_auth_token');
    localStorage.removeItem('pradnyasetu_user');
    localStorage.removeItem('pradnyasetu_isLoggedIn');
    localStorage.removeItem('pradnyasetu_userRole');
    localStorage.removeItem('pradnyasetu_profile');
    setShowAssessmentsView(false);
    setShowContentView(false);
    setShowIntegrationsView(false);
    setSelectedContentId(null);
    setActiveView('workflow');
    setCurrentStep(1);
    setPublicAuthMode('landing');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const getActiveNavId = () => {
    if (showAssessmentsView) return 'assessments';
    if (showContentView) return 'content';
    if (showIntegrationsView) return 'integrations';
    if (activeView === 'dashboard') return 'dashboard';
    if (currentStep === 2) return 'profile';
    if (currentStep === 3 || currentStep === 4) return 'skills';
    if (currentStep === 5) return 'recommendations';
    if (currentStep === 6) return 'learning';
    if (currentStep === 7) return 'assessments';
    if (currentStep >= 8) return 'progress';
    return 'dashboard';
  };

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'light' 
        ? 'bg-[#f8fafc] text-slate-900' 
        : 'bg-[#0b1120] text-slate-100'
    }`}>
      {!isLoggedIn && publicAuthMode === 'landing' ? (
        <PublicLandingPage
          onOpenLogin={() => setPublicAuthMode('login')}
          onOpenRegister={() => setPublicAuthMode('register')}
          theme={theme}
        />
      ) : (
        <>
          {/* Karmayogi Header */}
          <Header
            profile={profile}
            isLoggedIn={isLoggedIn}
            theme={theme}
            setTheme={setTheme}
            activeNav={getActiveNavId()}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onNavigateToDashboard={handleNavigateToDashboard}
            onOpenProfile={() => handleSelectStep(2)}
            onLoginClick={() => {
              setPublicAuthMode('login');
            }}
            onLogoutClick={handleLogout}
            onNavigateToSkillGaps={() => handleSelectStep(4)}
            onNavigateToIntegrations={handleNavigateToIntegrations}
            onNavigateToContent={() => handleNavigateToContent()}
          />

          {/* Left Navigation Sidebar (Only for logged-in users) */}
          {isLoggedIn && (
            <Sidebar
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              activeNav={getActiveNavId()}
              theme={theme}
              profile={profile}
              isLoggedIn={isLoggedIn}
              userRole={userRole}
              onNavigate={(navId) => {
                if (navId === 'dashboard') handleNavigateToDashboard();
                else if (navId === 'profile') handleSelectStep(2);
                else if (navId === 'skills' || navId === 'competency-analytics') handleSelectStep(3);
                else if (navId === 'skill-gaps' || navId === 'dept-analytics') handleSelectStep(4);
                else if (navId === 'recommendations') handleSelectStep(5);
                else if (navId === 'learning' || navId === 'manage-courses' || navId === 'training-programs') handleSelectStep(6);
                else if (navId === 'assessments' || navId === 'question-bank' || navId === 'assessment-reports') handleSelectStep(7);
                else if (navId === 'progress' || navId === 'performance' || navId === 'reports') handleSelectStep(9);
                else if (navId === 'upload-content' || navId === 'ai-content-gen' || navId === 'platform-content') handleNavigateToContent();
                else if (navId === 'external-integration') handleNavigateToIntegrations();
                else handleNavigateToDashboard();
              }}
              onLogoutClick={handleLogout}
            />
          )}

          {/* Main Content & Workflow Container with Left Sidebar Offset */}
          <div className={`transition-all duration-300 ${
            isLoggedIn ? (isSidebarOpen ? 'pl-0 md:pl-64' : 'pl-0 md:pl-16') : 'pl-0'
          }`}>
            {/* Workflow Navigation (Contextual Breadcrumb Bar) */}
            {isLoggedIn && !showAssessmentsView && !showContentView && !showIntegrationsView && activeView === 'workflow' && (
              <WorkflowBar
                currentStep={currentStep}
                onSelectStep={handleSelectStep}
                completedSteps={completedSteps}
                theme={theme}
              />
            )}

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 py-8">
              {!isLoggedIn ? (
                <Step1Login
                  currentProfile={profile}
                  initialMode={publicAuthMode === 'register' ? 'register' : 'login'}
                  onBackToLanding={() => setPublicAuthMode('landing')}
                  onSelectProfile={(p, selectedRole) => {
                    setProfile(p);
                    setUserRole(selectedRole);
                    setIsLoggedIn(true);
                    localStorage.setItem('pradnyasetu_isLoggedIn', 'true');
                    localStorage.setItem('pradnyasetu_userRole', selectedRole);
                    localStorage.setItem('pradnyasetu_profile', JSON.stringify(p));
                    handleNavigateToDashboard();
                  }}
                  onNext={handleNext}
                  theme={theme}
                />
              ) : showAssessmentsView ? (
          <AssessmentManagementDashboard
            initialContentId={assessmentTargetContentId}
            onNavigateToLearning={() => {
              setShowAssessmentsView(false);
              handleSelectStep(6);
            }}
            onNavigateToSkillGaps={() => {
              setShowAssessmentsView(false);
              handleSelectStep(4);
            }}
            onNavigateToRecommendations={() => {
              setShowAssessmentsView(false);
              handleSelectStep(5);
            }}
            userRole={userRole === 'Learner' ? 'Learner' : 'Trainer'}
          />
        ) : showContentView ? (
          selectedContentId ? (
            <ContentDetailView
              contentId={selectedContentId}
              onBack={() => {
                setSelectedContentId(null);
                window.history.replaceState(null, '', '/content');
              }}
              onNavigateToLearning={() => {
                setShowContentView(false);
                setSelectedContentId(null);
                handleSelectStep(6);
              }}
              onNavigateToAssessment={(docket) => {
                setShowContentView(false);
                setSelectedContentId(null);
                handleNavigateToAssessments(docket.content_id);
              }}
            />
          ) : (
            <ContentManagementDashboard
              onSelectContent={(id) => handleNavigateToContent(id)}
              onNavigateToLearning={() => {
                setShowContentView(false);
                handleSelectStep(6);
              }}
            />
          )
        ) : showIntegrationsView ? (
          <IntegrationEcosystemView
            onLaunchModule07={(ticket, resId) => {
              setShowIntegrationsView(false);
              handleSelectStep(6);
            }}
            onNavigateToRecommendations={() => {
              setShowIntegrationsView(false);
              handleSelectStep(5);
            }}
          />
        ) : activeView === 'dashboard' ? (
          <DashboardView
            profile={profile}
            competencies={competencies}
            gapResult={gapResult}
            pathways={pathways}
            theme={theme}
            userRole={userRole}
            onNavigateToProfile={() => handleSelectStep(2)}
            onNavigateToSkills={() => handleSelectStep(3)}
            onNavigateToSkillGaps={() => handleSelectStep(4)}
            onNavigateToRecommendations={() => handleSelectStep(5)}
            onNavigateToLearning={() => handleSelectStep(6)}
            onNavigateToAssessments={() => handleNavigateToAssessments()}
            onNavigateToProgress={() => handleSelectStep(9)}
            onSelectStep={handleSelectStep}
          />
        ) : (
          <>
            {currentStep === 1 && (
              <Step1Login
                currentProfile={profile}
                onSelectProfile={(p, selectedRole) => {
                  setProfile(p);
                  setUserRole(selectedRole);
                  setIsLoggedIn(true);
                  localStorage.setItem('pradnyasetu_isLoggedIn', 'true');
                  localStorage.setItem('pradnyasetu_userRole', selectedRole);
                  localStorage.setItem('pradnyasetu_profile', JSON.stringify(p));
                  handleNavigateToDashboard();
                }}
                onNext={handleNext}
                theme={theme}
              />
            )}

            {currentStep === 2 && (
              <Step2Profile
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onNext={handleNext}
                onBack={handleBack}
                theme={theme}
              />
            )}

            {currentStep === 3 && (
              <Step3AssessmentGap
                profile={profile}
                competencies={competencies}
                onNext={handleNext}
                onBack={handleBack}
                theme={theme}
              />
            )}

            {currentStep === 4 && (
              <Step4Recommendation
                profile={profile}
                onNext={handleNext}
                onBack={handleBack}
                onNavigateToAssessments={() => handleSelectStep(3)}
                theme={theme}
              />
            )}

            {currentStep === 5 && (
              <Step5Pathway
                profile={profile}
                onNext={handleNext}
                onBack={handleBack}
                theme={theme}
              />
            )}

            {currentStep === 6 && (
              <Step6LearningExperience
                profile={profile}
                onNext={handleNext}
                onBack={handleBack}
                theme={theme}
              />
            )}

            {currentStep === 7 && (
              <Step7Assessment
                profile={profile}
                onNext={handleNext}
                onBack={handleBack}
                theme={theme}
              />
            )}

            {currentStep === 8 && (
              <Step8CompetencyUpdate
                profile={profile}
                onNext={handleNext}
                onBack={handleBack}
                theme={theme}
              />
            )}

            {currentStep === 9 && (
              <Step9Analytics
                profile={profile}
                onNext={handleNext}
                onBack={handleBack}
                theme={theme}
              />
            )}

            {currentStep === 10 && (
              <Step10ContinuousLearning
                profile={profile}
                onTriggerNewCycle={handleTriggerNewCycle}
                onBack={handleBack}
                theme={theme}
              />
            )}
          </>
        )}

        <CrossCuttingFeatures theme={theme} />
      </main>
      </div>
      </>
      )}

      {/* Profile Modal triggered by top-right circle */}
      {isProfileModalOpen && (
        <ProfileModal
          profile={profile}
          competencies={competencies}
          theme={theme}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
          onOpenFullProfile={() => {
            handleSelectStep(2);
          }}
        />
      )}
    </div>
  );
}
