import React from 'react';
import { OfficialProfile, FullOfficialProfile } from '../../types';
import OfficialProfileView from '../OfficialProfileView';
import { ArrowLeft } from 'lucide-react';

interface Step2ProfileProps {
  profile: OfficialProfile;
  onUpdateProfile: (updated: Partial<OfficialProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const Step2Profile: React.FC<Step2ProfileProps> = ({
  profile,
  onUpdateProfile,
  onNext,
  onBack,
}) => {
  // Sync changes from full official profile back to global profile state
  const handleProfileUpdated = (full: FullOfficialProfile) => {
    onUpdateProfile({
      name: full.fullName,
      email: full.officialEmail,
      designation: full.designation,
      department: full.department,
      cadre: full.serviceCadre,
      experienceYears: full.yearsOfExperience,
      targetRole: full.learningPreferences?.careerGoals || profile.targetRole,
      targetGoal: full.learningPreferences?.areasToImprove || profile.targetGoal,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Official Login</span>
        </button>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          Official Profile Management
        </span>
      </div>

      {/* Main Official Profile Management View */}
      <OfficialProfileView
        userId={profile.id}
        onProceedToAssessment={onNext}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};
