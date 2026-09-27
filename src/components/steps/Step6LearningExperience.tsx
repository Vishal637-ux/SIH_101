import React, { useState, useEffect } from 'react';
import { OfficialProfile, BookToContentExtraction } from '../../types';
import { LearningManagementDashboard } from '../LearningManagementDashboard';
import { LearningExperienceDetail } from '../LearningExperienceDetail';

interface Step6LearningExperienceProps {
  profile: OfficialProfile;
  extractedContent: BookToContentExtraction;
  onUpdateExtractedContent: (content: BookToContentExtraction) => void;
  onNext: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const Step6LearningExperience: React.FC<Step6LearningExperienceProps> = ({
  profile,
  extractedContent,
  onUpdateExtractedContent,
  onNext,
  onBack,
  theme,
}) => {
  // Currently opened resource for detailed learning experience
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);

  // Check if URL has a specific resource ID on mount, e.g. /learning/res-stat-002
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/learning/') && path.length > '/learning/'.length) {
      const id = path.replace('/learning/', '');
      setActiveResourceId(id);
    }
  }, []);

  const handleOpenResource = (resourceId: string) => {
    setActiveResourceId(resourceId);
    window.history.replaceState(null, '', `/learning/${resourceId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setActiveResourceId(null);
    window.history.replaceState(null, '', '/learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToAssessment = (resId: string, questions: any[]) => {
    if (questions && questions.length > 0) {
      onUpdateExtractedContent({
        ...extractedContent,
        assessmentQuestions: questions,
      });
    }
    // Advance to Step 7 (Assessment)
    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {activeResourceId ? (
        <LearningExperienceDetail
          resourceId={activeResourceId}
          profile={profile}
          onBack={handleBackToDashboard}
          onProceedToAssessment={handleProceedToAssessment}
          theme={theme}
        />
      ) : (
        <LearningManagementDashboard
          profile={profile}
          onOpenResource={handleOpenResource}
          onNavigateToRecommendations={onBack}
          theme={theme}
        />
      )}
    </div>
  );
};
