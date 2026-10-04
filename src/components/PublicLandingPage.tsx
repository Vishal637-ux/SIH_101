import React, { useState } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  BrainCircuit, 
  CheckCircle2, 
  ChevronRight, 
  Database, 
  FileText, 
  Globe, 
  GraduationCap, 
  Layers, 
  LineChart, 
  Lock, 
  Menu, 
  Sparkles, 
  Target, 
  TrendingUp, 
  UserCheck, 
  Users, 
  X, 
  ShieldCheck,
  Award,
  ArrowRight,
  Mail,
  AlertTriangle,
  Lightbulb,
  Check,
  CheckCircle
} from 'lucide-react';

interface PublicLandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  theme?: 'light' | 'dark';
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  theme = 'light',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Government Tricolor Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] sticky top-0 z-50" />

      {/* HEADER / NAVBAR */}
      <header className="sticky top-1 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & SIH Badge */}
            <div 
              onClick={() => scrollToSection('top')}
              className="flex items-center gap-3 cursor-pointer group"
              title="PradnyaSetu — AI Skill Intelligence Platform (SIH26101)"
            >
              <img 
                src="/logo.png" 
                alt="PradnyaSetu Logo" 
                className="h-12 sm:h-16 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                SIH26101 • MoSPI
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-slate-700">
              <button 
                onClick={() => scrollToSection('top')}
                className="hover:text-blue-700 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('problem')}
                className="hover:text-blue-700 transition-colors cursor-pointer"
              >
                Problem Statement
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-blue-700 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('domains')}
                className="hover:text-blue-700 transition-colors cursor-pointer"
              >
                Competency Domains
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="hover:text-blue-700 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('impact')}
                className="hover:text-blue-700 transition-colors cursor-pointer"
              >
                Impact
              </button>
            </nav>

            {/* Desktop Right Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-900 border border-slate-300 hover:border-slate-400 rounded-xl transition-all cursor-pointer shadow-xs bg-white"
              >
                Login
              </button>
              <button
                onClick={onOpenRegister}
                className="px-5 py-2 text-sm font-bold text-white bg-[#0c2340] hover:bg-[#16365f] rounded-xl transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-3 font-semibold text-slate-700 text-sm">
              <button 
                onClick={() => scrollToSection('top')}
                className="text-left py-2 border-b border-slate-100 hover:text-blue-700"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('problem')}
                className="text-left py-2 border-b border-slate-100 hover:text-blue-700"
              >
                Problem Statement
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 border-b border-slate-100 hover:text-blue-700"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('domains')}
                className="text-left py-2 border-b border-slate-100 hover:text-blue-700"
              >
                Competency Domains
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-left py-2 border-b border-slate-100 hover:text-blue-700"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('impact')}
                className="text-left py-2 border-b border-slate-100 hover:text-blue-700"
              >
                Impact
              </button>
            </nav>
            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-800 border border-slate-300 rounded-xl bg-slate-50"
              >
                Login
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-[#0c2340] rounded-xl shadow-xs"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="top" className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-900 text-xs font-bold tracking-wide">
                <BrainCircuit className="w-4 h-4 text-blue-700 shrink-0" />
                <span>SIH PROBLEM STATEMENT 26101 • MoSPI</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c2340] leading-tight tracking-tight">
                Build Skills. Bridge Gaps. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-[#0c2340] bg-clip-text text-transparent">
                  Strengthen Official Statistics.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                An AI-enabled Skill Intelligence & Learning Platform designed to assess competencies, identify skill gaps, and recommend personalized learning pathways for India's Official Statistical System.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={onOpenRegister}
                  className="w-full sm:w-auto px-7 py-3.5 text-base font-bold text-white bg-[#0c2340] hover:bg-[#143560] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => scrollToSection('problem')}
                  className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-slate-700 hover:text-blue-900 bg-white border border-slate-300 hover:border-slate-400 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Explore Solution</span>
                </button>
              </div>

              {/* Key Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-xl mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Domain</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-0.5">Official Statistics</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Framework</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-0.5">4 Core Domains</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine</div>
                  <div className="text-sm font-extrabold text-[#16a34a] mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 inline" /> AI Gap Analytics
                  </div>
                </div>
              </div>

            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-5">
                
                {/* Visual Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Competency Gap Matrix</div>
                      <div className="text-[11px] text-slate-500">Official Statistical System Cadre</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    Interactive Demo
                  </span>
                </div>

                {/* Domain Skill Gauges */}
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>1. Statistical Domain</span>
                      <span className="text-blue-700">3.2 / 5.0 (Gap: 1.3)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '64%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>2. Technical & Analytics</span>
                      <span className="text-blue-700">3.8 / 5.0 (Gap: 0.7)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>3. Digital Governance</span>
                      <span className="text-blue-700">4.1 / 5.0 (Gap: 0.4)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>4. Behavioural / Managerial</span>
                      <span className="text-blue-700">3.5 / 5.0 (Gap: 1.0)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>

                {/* AI Pathway Recommendation Pill */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0c2340]">Recommended iGOT Karmayogi Pathway</div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      "National Account Statistics & Index Compilation" (4 Hrs • Target Gap: Statistical)
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENT SECTION (SIH26101 Context) */}
      <section id="problem" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>THE CHALLENGE WE ARE ADDRESSING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight">
              Problem We Are Solving
            </h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full" />
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
              India's Official Statistical System requires continuous skill upgrading across central, state, and departmental cadres to maintain high data quality and policy relevance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 hover:border-rose-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Evolving Statistical Standards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Modern microdata handling, big data analytics, and survey sampling demand continuous competency updates beyond traditional static training methods.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-100 hover:border-amber-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Lack of Role-Specific Gap Diagnostics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Without structured gap analysis comparing actual vs. required competency levels for specific designations, capacity building remains generic and un-targeted.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50/40 border border-blue-100 hover:border-blue-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Fragmented Learning Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Official learning content (such as iGOT Karmayogi and NSSTA courses) needs to be intelligently matched to each official's identified skill gaps.
              </p>
            </div>

          </div>

          {/* Solution Highlight Box */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#0c2340] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Lightbulb className="w-4 h-4" />
                <span>PRADNYASETU SOLUTION</span>
              </div>
              <h3 className="text-xl font-bold">End-to-End Competency Assessment & Learning Engine</h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                PradnyaSetu bridges the gap by automating competency assessment across 4 official domains, calculating exact skill deltas, and curating personalized learning pathways.
              </p>
            </div>
            <button
              onClick={onOpenRegister}
              className="px-6 py-3 rounded-xl bg-white text-[#0c2340] hover:bg-slate-100 text-sm font-bold shrink-0 transition-all shadow-xs cursor-pointer"
            >
              Get Started
            </button>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Five simple steps to assess, build, and maintain competency excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0c2340] text-white font-extrabold flex items-center justify-center text-base mb-4 shadow-xs">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Create Profile</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provide professional role, cadre, and designation details.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-700 gap-1">
                <UserCheck className="w-4 h-4" />
                <span>Step 01</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0c2340] text-white font-extrabold flex items-center justify-center text-base mb-4 shadow-xs">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Assess Skills</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete competency assessments across four core domains.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-700 gap-1">
                <BarChart3 className="w-4 h-4" />
                <span>Step 02</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0c2340] text-white font-extrabold flex items-center justify-center text-base mb-4 shadow-xs">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Identify Skill Gaps</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compare current competency scores with required benchmarks.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-700 gap-1">
                <LineChart className="w-4 h-4" />
                <span>Step 03</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0c2340] text-white font-extrabold flex items-center justify-center text-base mb-4 shadow-xs">
                  4
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Get Recommendations</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Receive personalized courses from iGOT Karmayogi & NSSTA.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-700 gap-1">
                <BookOpen className="w-4 h-4" />
                <span>Step 04</span>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0c2340] text-white font-extrabold flex items-center justify-center text-base mb-4 shadow-xs">
                  5
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Improve & Track</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Take AI-generated quizzes and track continuous competency growth.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#16a34a] gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Step 05</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOUR COMPETENCY DOMAINS */}
      <section id="domains" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight">
              Four Competency Domains
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Standardized competency mapping tailored for official statistical personnel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Domain 1 */}
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 hover:border-blue-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0c2340]">Statistical</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Official statistics compilation, survey methodology, sampling frameworks, microdata validation, national accounts, and index estimation.
              </p>
            </div>

            {/* Domain 2 */}
            <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 hover:border-indigo-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0c2340]">Technical & Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Data analytics, Python/R automation, statistical modeling, database querying, automated ETL pipelines, and reporting.
              </p>
            </div>

            {/* Domain 3 */}
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0c2340]">Digital Governance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                DPDP Act 2023 compliance, e-Governance standards, data security, and open data sharing frameworks across government departments.
              </p>
            </div>

            {/* Domain 4 */}
            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 hover:border-amber-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0c2340]">Behavioural / Managerial</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evidence-based decision making, ethical leadership, project execution, public administration ethics, and stakeholder communication.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* KEY FEATURES */}
      <section id="features" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight">
              Key Features
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Core platform capabilities aligned with SIH Problem Statement 26101.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700 shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Competency Assessment</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluate current skill levels against standard designation expectations across 4 domains.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 shrink-0">
                <LineChart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Skill Gap Analysis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated delta calculation comparing actual proficiency vs. role benchmarks.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">iGOT Karmayogi Recommendations</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Intelligent matching of official courses tailored to specific identified skill gaps.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">AI-Generated Quiz & Assessment</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dynamic extraction of key concepts and MCQ generation from uploaded training manuals.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Progress & Competency Tracking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Longitudinal monitoring of competency uplift, completed modules, and Karma Points.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Learner & Admin Dashboards</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Role-specific views for Officials (Learners), Trainers, and System Administrators.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* EXPECTED OUTCOMES & IMPACT */}
      <section id="impact" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight">
              Expected Outcomes & Value Delivery
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Impact on India's Official Statistical System.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0c2340] text-white flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-[#0c2340]">Targeted Capacity Building</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Replaces generic training with personalized skill recommendations mapped directly to individual gap scores.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0c2340] text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-[#0c2340]">Enhanced Statistical Rigor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strengthens survey design, sampling accuracy, microdata validation, and evidence-based public policy formulation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0c2340] text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-[#0c2340]">AI Efficiency for Faculty</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automates assessment creation and content summarization for training institutions and master trainers.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CALL TO ACTION (CTA) */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-[#0c2340] via-[#143560] to-[#0c2340] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Capacity Building for Official Statistics</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Start Your Skill Development Journey
          </h2>

          <p className="text-base sm:text-lg text-blue-100/90 max-w-2xl mx-auto font-normal">
            Assess your competencies, discover improvement areas, and take the next step in your professional learning journey.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenRegister}
              className="px-8 py-3.5 text-base font-bold text-[#0c2340] bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 text-[#0c2340] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-[#0c2340]">Platform Support & Assistance</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            For assistance regarding official registration, competency assessments, or learning pathway inquiries, reach out through the official support desk.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold">
            <Mail className="w-4 h-4 text-blue-700" />
            <span>support@pradnyasetu.gov.in</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a182b] text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="PradnyaSetu Logo" 
                  className="h-12 sm:h-14 w-auto bg-white/95 p-1 rounded-md"
                />
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                PradnyaSetu — AI-Enabled Skill Intelligence & Learning Platform for India's Official Statistical System (SIH Problem Statement 26101 • MoSPI).
              </p>
            </div>

            <div className="md:col-span-6 flex flex-wrap gap-8 justify-start md:justify-end text-xs font-medium">
              <div className="space-y-2">
                <div className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">Navigation</div>
                <div className="flex flex-col space-y-1.5">
                  <button onClick={() => scrollToSection('top')} className="text-left hover:text-white transition-colors">Home</button>
                  <button onClick={() => scrollToSection('problem')} className="text-left hover:text-white transition-colors">Problem Statement</button>
                  <button onClick={() => scrollToSection('how-it-works')} className="text-left hover:text-white transition-colors">How It Works</button>
                  <button onClick={() => scrollToSection('domains')} className="text-left hover:text-white transition-colors">Competency Domains</button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">Account Access</div>
                <div className="flex flex-col space-y-1.5">
                  <button onClick={onOpenLogin} className="text-left hover:text-white transition-colors">Login</button>
                  <button onClick={onOpenRegister} className="text-left hover:text-white transition-colors">Get Started</button>
                  <button onClick={() => scrollToSection('contact')} className="text-left hover:text-white transition-colors">Contact</button>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 PradnyaSetu. SIH 26101 Official Statistical System Capacity Building Platform.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Standard Compliant</span>
              <span>•</span>
              <span>Secure Authentication</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
