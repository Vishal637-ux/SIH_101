import React from 'react';
import { OfficialProfile } from '../types';
import { 
  LayoutDashboard, 
  User, 
  Target, 
  Sparkles, 
  GraduationCap, 
  BrainCircuit, 
  TrendingUp, 
  Globe, 
  FileText, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Compass,
  Award
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeNav: string;
  theme: 'light' | 'dark';
  profile: OfficialProfile;
  isLoggedIn: boolean;
  onNavigateToDashboard?: () => void;
  onOpenProfile?: () => void;
  onNavigateToSkillGaps?: () => void;
  onNavigateToRecommendations?: () => void;
  onNavigateToIntegrations?: () => void;
  onNavigateToLearning?: () => void;
  onNavigateToContent?: () => void;
  onNavigateToAssessments?: () => void;
  onNavigateToProgress?: () => void;
  onLogoutClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeNav,
  theme,
  profile,
  isLoggedIn,
  onNavigateToDashboard,
  onOpenProfile,
  onNavigateToSkillGaps,
  onNavigateToRecommendations,
  onNavigateToIntegrations,
  onNavigateToLearning,
  onNavigateToContent,
  onNavigateToAssessments,
  onNavigateToProgress,
  onLogoutClick,
}) => {
  const isLight = theme === 'light';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: onNavigateToDashboard },
    { id: 'profile', label: 'My Profile', icon: User, action: onOpenProfile },
    { id: 'skills', label: 'My Skills', icon: Target, action: onNavigateToSkillGaps },
    { id: 'recommendations', label: 'Recommended', icon: Sparkles, action: onNavigateToRecommendations },
    { id: 'learning', label: 'My Learning', icon: GraduationCap, action: onNavigateToLearning },
    { id: 'assessments', label: 'Assessments', icon: BrainCircuit, action: onNavigateToAssessments },
    { id: 'progress', label: 'My Progress', icon: TrendingUp, action: onNavigateToProgress },
  ];

  const secondaryItems = [
    { id: 'integrations', label: 'Ecosystem', icon: Globe, action: onNavigateToIntegrations },
    { id: 'content', label: 'Content Library', icon: FileText, action: onNavigateToContent },
  ];

  if (!isLoggedIn) return null;

  return (
    <aside 
      className={`fixed top-[53px] left-0 bottom-0 z-30 flex flex-col border-r transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      } ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-800 shadow-xs' 
          : 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-md'
      }`}
    >
      {/* Sidebar Header Toggle */}
      <div className={`flex items-center justify-between p-3 border-b ${
        isLight ? 'border-slate-100' : 'border-slate-800'
      }`}>
        {isOpen && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">
            Navigation
          </span>
        )}
        <button
          onClick={onToggle}
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isOpen ? 'ml-auto' : 'mx-auto'
          } ${
            isLight 
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600' 
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          if (!item.action) return null;

          return (
            <button
              key={item.id}
              onClick={item.action}
              title={!isOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-[#0c2340] text-white shadow-xs font-bold'
                    : 'bg-blue-600 text-white shadow-xs font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              } ${!isOpen ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
              {isOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}

        {/* Divider */}
        <div className={`my-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`} />

        {isOpen && (
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Tools
          </div>
        )}

        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          if (!item.action) return null;

          return (
            <button
              key={item.id}
              onClick={item.action}
              title={!isOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-[#0c2340] text-white shadow-xs font-bold'
                    : 'bg-blue-600 text-white shadow-xs font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              } ${!isOpen ? 'justify-center px-0' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {isOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Footer User Card */}
      <div className={`p-3 border-t ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-900/50'}`}>
        <div className={`flex items-center gap-2.5 ${!isOpen ? 'justify-center' : ''}`}>
          <div 
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-[#0c2340] text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 cursor-pointer shadow-inner"
          >
            {profile.name.charAt(0)}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {profile.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {profile.designation}
              </p>
            </div>
          )}
          {isOpen && onLogoutClick && (
            <button
              onClick={onLogoutClick}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
