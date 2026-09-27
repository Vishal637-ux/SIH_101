import React, { useState, useEffect } from 'react';
import {
  LearningResourceDetail,
  LearningProgressRecord,
  OfficialProfile,
} from '../types';
import { learningApi } from '../services/learningApi';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  ExternalLink,
  Award,
  Lightbulb,
  FileCheck,
  Send,
  Play,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface LearningExperienceDetailProps {
  resourceId: string;
  profile: OfficialProfile;
  onBack: () => void;
  onProceedToAssessment?: (resourceId: string, questions: any[]) => void;
  theme?: 'light' | 'dark';
}

export const LearningExperienceDetail: React.FC<LearningExperienceDetailProps> = ({
  resourceId,
  profile,
  onBack,
  onProceedToAssessment,
  theme = 'light',
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resource, setResource] = useState<LearningResourceDetail | null>(null);
  const [progress, setProgress] = useState<LearningProgressRecord | null>(null);

  // Active module tab
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);

  // Audio speech synthesis
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Practical exercise state
  const [showExerciseHint, setShowExerciseHint] = useState<boolean>(false);
  const [exerciseCompleted, setExerciseCompleted] = useState<boolean>(false);

  // AI Assistant state
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Load resource details and persistent progress
  const loadResource = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await learningApi.getResourceById(resourceId);
      setResource(data.resource);
      setProgress(data.progress);
      if (data.progress.currentModuleIndex !== undefined) {
        setActiveModuleIdx(data.progress.currentModuleIndex);
      }
    } catch (err: any) {
      console.error('Failed to load learning resource:', err);
      setError(err.message || 'Failed to load resource details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  // Audio playback toggle
  const toggleAudio = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Toggle module completion with persistent DB update
  const handleToggleModuleDone = async (moduleIndex: number) => {
    if (!progress) return;
    try {
      const res = await learningApi.updateProgress(resourceId, {
        completedModuleIndex: moduleIndex,
        currentModuleIndex: moduleIndex,
        timeSpentDeltaMinutes: 15,
      });
      setProgress(res.progress);
    } catch (err: any) {
      console.error('Failed to update progress:', err);
    }
  };

  // Mark practical exercise completed
  const handleCompleteExercise = async (exerciseId: string) => {
    if (!progress) return;
    try {
      const res = await learningApi.updateProgress(resourceId, {
        completedExerciseId: exerciseId,
        timeSpentDeltaMinutes: 20,
      });
      setProgress(res.progress);
      setExerciseCompleted(true);
    } catch (err: any) {
      console.error('Failed to complete exercise:', err);
    }
  };

  // Mark whole course as completed
  const handleMarkCourseCompleted = async () => {
    if (!progress) return;
    try {
      const res = await learningApi.updateProgress(resourceId, {
        markCompleted: true,
        progressPercentage: 100,
      });
      setProgress(res.progress);
    } catch (err: any) {
      console.error('Failed to mark course completed:', err);
    }
  };

  // Ask AI Civil Service Tutor
  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;

    setAiLoading(true);
    setAiAnswer(null);
    try {
      const currTitle = resource?.curriculumDetails[activeModuleIdx]?.title;
      const res = await learningApi.askAssistant(resourceId, aiQuestion.trim(), currTitle);
      setAiAnswer(res.answer);
      setAiSource(res.source);
    } catch (err: any) {
      setAiAnswer('Unable to reach AI faculty tutor. Please refer to statutory guidelines.');
      setAiSource('System Fallback');
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading statutory curriculum and learning units...</p>
      </div>
    );
  }

  if (error || !resource || !progress) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Resource Unavailable</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error || 'Unable to retrieve course content.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
        >
          Back to Learning Path
        </button>
      </div>
    );
  }

  const currentUnit = resource.curriculumDetails[activeModuleIdx] || resource.curriculumDetails[0];
  const isModuleDone = progress.completedModules.includes(activeModuleIdx);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            {resource.provider} • {resource.difficulty}
          </span>

          {resource.externalUrl && resource.source !== 'INTERNAL' && (
            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Open on {resource.provider}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Course Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-50 text-blue-900 border-blue-200">
                {resource.source}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {resource.competencyName} ({resource.domain})
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Benchmark L{resource.targetProficiencyLevel.toFixed(1)}</span>
            </div>

            <h1 className="text-xl font-bold text-[#0c2340] leading-snug">
              {resource.title}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              {resource.description}
            </p>
          </div>

          {/* Progress Pill Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[240px] shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Course Progress</span>
              <span className="font-bold text-slate-900">{progress.progressPercentage}%</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress.progressPercentage >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>{progress.completedModules.length} of {resource.curriculumDetails.length} units completed</span>
              <span className={`font-semibold ${
                progress.status === 'COMPLETED' ? 'text-emerald-700' : 'text-blue-700'
              }`}>
                {progress.status}
              </span>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        {resource.learningObjectives && resource.learningObjectives.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Approved Learning Outcomes
            </span>
            <div className="grid md:grid-cols-2 gap-2 text-xs text-slate-600">
              {resource.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Learning Workspace */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Module Navigation & Curriculum Units */}
        <div className="lg:col-span-2 space-y-4">
          {/* Unit Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Curriculum Units ({resource.curriculumDetails.length})
              </span>
              <button
                onClick={() => toggleAudio(`${currentUnit.title}. ${currentUnit.contentBody}. Takeaways: ${currentUnit.keyTakeaways.join('. ')}`)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isPlayingAudio
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Unit'}</span>
              </button>
            </div>

            {/* Units Horizontal Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {resource.curriculumDetails.map((unit, idx) => {
                const done = progress.completedModules.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveModuleIdx(idx);
                      if (isPlayingAudio) {
                        window.speechSynthesis.cancel();
                        setIsPlayingAudio(false);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                      activeModuleIdx === idx
                        ? 'bg-[#0c2340] text-white border-[#0c2340] shadow-xs'
                        : done
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                    )}
                    <span>Unit {idx + 1}: {unit.title.slice(0, 24)}...</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit Reading Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Unit {activeModuleIdx + 1} • {currentUnit.durationMinutes} Minutes
                </span>
                <h2 className="text-lg font-bold text-[#0c2340] mt-0.5">
                  {currentUnit.title}
                </h2>
                {currentUnit.statutoryReference && (
                  <span className="text-[11px] text-slate-500 font-mono block mt-1">
                    Ref: {currentUnit.statutoryReference}
                  </span>
                )}
              </div>

              {/* Mark Completed Button */}
              <button
                onClick={() => handleToggleModuleDone(activeModuleIdx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  isModuleDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-[#0c2340] hover:bg-[#133560] text-white'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{isModuleDone ? 'Unit Completed' : 'Mark as Completed'}</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="text-xs text-slate-700 leading-relaxed space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
              <p>{currentUnit.contentBody}</p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Statutory Directives & Key Takeaways:
              </span>
              <div className="space-y-2">
                {currentUnit.keyTakeaways.map((point, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-2.5 shadow-2xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Exercise (if unit has one) */}
            {currentUnit.practicalExercise && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900">
                      Practical Exercise: {currentUnit.practicalExercise.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium">
                    {currentUnit.practicalExercise.estimatedMinutes} mins
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1.5">
                  <p><strong>Scenario:</strong> {currentUnit.practicalExercise.scenario}</p>
                  <p><strong>Instruction:</strong> {currentUnit.practicalExercise.instruction}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setShowExerciseHint(!showExerciseHint)}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>{showExerciseHint ? 'Hide Guidance' : 'View Solution Guidance'}</span>
                  </button>

                  <button
                    onClick={() => handleCompleteExercise(currentUnit.practicalExercise!.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exerciseCompleted || progress.completedExercises.includes(currentUnit.practicalExercise.id)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-800 text-white hover:bg-amber-900'
                    }`}
                  >
                    {exerciseCompleted || progress.completedExercises.includes(currentUnit.practicalExercise.id)
                      ? 'Exercise Submitted'
                      : 'Submit Exercise'}
                  </button>
                </div>

                {showExerciseHint && (
                  <div className="p-3 bg-white/90 border border-amber-200 rounded-lg text-xs text-slate-700 font-mono">
                    <strong>Solution Framework:</strong> {currentUnit.practicalExercise.solutionHint}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Tutor, Virtual Lab & Assessment Gateway */}
        <div className="space-y-4">
          {/* AI Civil Service Learning Assistant */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                AI Learning Assistant (Civil Service Tutor)
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Ask questions on statutory rules, sampling proofs, or secretariat compliance for this unit.
            </p>

            <form onSubmit={handleAskAssistant} className="space-y-2">
              <textarea
                rows={2}
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                placeholder="e.g. How does PPS sampling handle primary sampling units with zero population?"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0c2340] focus:bg-white resize-none"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiQuestion.trim()}
                className="w-full py-2 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Consulting Faculty Tutor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask Question</span>
                  </>
                )}
              </button>
            </form>

            {aiAnswer && (
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5 text-xs">
                <span className="font-bold text-purple-900 block text-[11px]">
                  Tutor Guidance ({aiSource}):
                </span>
                <p className="text-slate-800 leading-relaxed whitespace-pre-line">{aiAnswer}</p>
              </div>
            )}
          </div>

          {/* Virtual Lab Snippet (if available) */}
          {resource.virtualLabSnippet && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Virtual Lab Environment
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Interactive</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {resource.virtualLabSnippet.labTitle}
              </h4>
              <p className="text-xs text-slate-300">
                {resource.virtualLabSnippet.description}
              </p>
              <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg font-mono text-[11px] text-teal-300">
                {resource.virtualLabSnippet.sampleData}
              </div>
            </div>
          )}

          {/* Module 09 Assessment Gateway */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Assessment & Competency Handoff
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              When ready, submit your verified progress to unlock formal competency evaluation in Module 09.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleMarkCourseCompleted}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Entire Course Complete (100%)</span>
              </button>

              <button
                onClick={() => {
                  if (onProceedToAssessment) {
                    onProceedToAssessment(resource.id, resource.quizQuestions);
                  }
                }}
                className="w-full py-2.5 bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span>Proceed to Module 09 Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
