import React, { useState } from 'react';
import { OfficialProfile, CompetencyItem } from '../types';
import { ArrowLeft, User, Mail, Award, Briefcase, Building, Target, Flame, CheckCircle2 } from 'lucide-react';

interface ProfileModalProps {
  profile: OfficialProfile;
  competencies: CompetencyItem[];
  theme: 'light' | 'dark';
  onClose: () => void;
  onLogout: () => void;
  onOpenFullProfile?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  competencies,
  theme,
  onClose,
  onLogout,
  onOpenFullProfile,
}) => {
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Top Header Card */}
        <div className="p-6 bg-gradient-to-r from-[#0c2340] to-blue-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-xs"
          >
            ✕
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white text-[#0c2340] font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-400">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-xs text-blue-200 mt-0.5">{profile.designation} • {profile.cadre}</p>
              <p className="text-xs text-blue-200/80">{profile.email}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{profile.karmaPoints} Karma Points</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-orange-400/20 text-orange-300 font-semibold border border-orange-400/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{profile.streakDays} Days Learning Streak</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 font-semibold border border-emerald-400/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{profile.completedCourses} Completed Modules</span>
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Official Cadre Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Official Service Details
            </h3>
            <div className={`grid sm:grid-cols-2 gap-3 text-xs p-3.5 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <div>
                <span className="text-slate-500 block">Ministry:</span>
                <span className="font-semibold">{profile.ministry}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Department:</span>
                <span className="font-semibold">{profile.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Service Experience:</span>
                <span className="font-semibold">{profile.experienceYears} Years</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pay Band:</span>
                <span className="font-semibold">{profile.currentBand}</span>
              </div>
            </div>
          </div>

          {/* Career & Capacity-Building Objective */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Target Milestone & Capacity Goal
            </h3>
            <div className={`text-xs p-3.5 rounded-xl border space-y-1.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Target Role:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{profile.targetRole}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Capacity-Building Objective:</span>
                <span className="text-slate-700 dark:text-slate-300">{profile.targetGoal}</span>
              </div>
            </div>
          </div>

          {/* Current Competencies Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Official Competency Snapshot
            </h3>
            <div className="space-y-2">
              {competencies.slice(0, 4).map(c => (
                <div 
                  key={c.id} 
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/60'
                  }`}
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="font-bold text-[#0c2340] dark:text-blue-400">
                    {c.currentLevel.toFixed(1)} / 5.0
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-300 dark:border-rose-900 transition-colors"
          >
            Logout
          </button>

          <div className="flex items-center gap-2">
            {onOpenFullProfile && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullProfile();
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors"
              >
                Manage Full Profile
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-lg bg-[#0c2340] hover:bg-[#133560] text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
