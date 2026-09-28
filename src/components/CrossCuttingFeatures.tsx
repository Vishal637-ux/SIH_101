import React from 'react';
import { Award, Users, Accessibility, Languages, Globe } from 'lucide-react';

interface CrossCuttingFeaturesProps {
  theme: 'light' | 'dark';
}

export const CrossCuttingFeatures: React.FC<CrossCuttingFeaturesProps> = ({ theme }) => {
  const isLight = theme === 'light';

  const featureGroups = [
    {
      title: '1. GAMIFICATION',
      icon: Award,
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-300',
      options: ['Points', 'Badges', 'Challenges', 'Streaks', 'Leaderboards'],
    },
    {
      title: '2. SOCIAL LEARNING',
      icon: Users,
      badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-300',
      options: ['Discussions', 'Peer Learning', 'Knowledge Sharing', 'Trainer Interaction', 'Community Forums'],
    },
    {
      title: '3. INCLUSIVE & ACCESSIBLE LEARNING',
      icon: Accessibility,
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:text-emerald-300',
      options: ['Screen Reader', 'High Contrast', 'Text-to-Speech', 'Adjust Text Size', 'Keyboard Navigation'],
    },
    {
      title: '4. MULTILINGUAL SUPPORT',
      icon: Languages,
      badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-300 dark:text-purple-300',
      options: ['Regional Languages', 'AI Translation', 'Simplified Content', 'Multiple Language Interface'],
    },
    {
      title: '5. EXTERNAL INTEGRATIONS',
      icon: Globe,
      badgeColor: 'bg-indigo-500/10 text-indigo-700 border-indigo-300 dark:text-indigo-300',
      options: ['iGOT Karmayogi', 'NSSTA', 'TPAC', 'Other Government Portals'],
    },
  ];

  return (
    <div className={`mt-12 p-6 rounded-2xl border transition-colors ${
      isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-md'
    }`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className={`text-sm font-extrabold uppercase tracking-wider ${
          isLight ? 'text-[#0c2340]' : 'text-blue-400'
        }`}>
          Platform Capability Architecture (Cross-Cutting Features)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {featureGroups.map((group, idx) => {
          const Icon = group.icon;
          return (
            <div 
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {group.title}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {group.options.map((opt, i) => (
                    <span 
                      key={i}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${group.badgeColor}`}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
