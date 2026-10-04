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
  Award,
  Users,
  Bell,
  Settings,
  UploadCloud,
  BookOpen,
  FileCheck,
  BarChart3,
  Globe,
  FileText,
  ChevronLeft, 
  ChevronRight,
  LogOut,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeNav: string;
  theme: 'light' | 'dark';
  profile: OfficialProfile;
  isLoggedIn: boolean;
  userRole?: 'Learner' | 'Trainer' | 'Admin';
  onNavigate?: (navId: string) => void;
  onLogoutClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeNav,
  theme,
  profile,
  isLoggedIn,
  userRole = 'Learner',
  onNavigate,
  onLogoutClick,
}) => {
  const isLight = theme === 'light';

  if (!isLoggedIn) return null;

  // Government Official (Learner) Sidebar items
  const learnerItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'skills', label: 'My Skills', icon: Target },
    { id: 'assessments', label: 'Assessments', icon: BrainCircuit },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'learning', label: 'Learning', icon: GraduationCap },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Trainer Sidebar items
  const trainerItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'upload-content', label: 'Upload Content', icon: UploadCloud },
    { id: 'manage-courses', label: 'Manage Courses', icon: BookOpen },
    { id: 'ai-content-gen', label: 'AI Content Generation', icon: Sparkles },
    { id: 'question-bank', label: 'Question Bank', icon: HelpCircle },
    { id: 'assessments', label: 'Assessments', icon: BrainCircuit },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Admin Sidebar items
  const adminItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'user-mgmt', label: 'User Management', icon: Users },
    { id: 'dept-analytics', label: 'Department Analytics', icon: BarChart3 },
    { id: 'competency-analytics', label: 'Competency Analytics', icon: Target },
    { id: 'training-programs', label: 'Training Programs', icon: GraduationCap },
    { id: 'assessment-reports', label: 'Assessment Reports', icon: FileCheck },
    { id: 'platform-content', label: 'Platform Content', icon: FileText },
    { id: 'external-integration', label: 'External Integration', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const currentNavItems = 
    userRole === 'Trainer' ? trainerItems :
    userRole === 'Admin' ? adminItems : learnerItems;

  const sidebarTitle = 
    userRole === 'Admin' ? 'Admin Dashboard' :
    userRole === 'Trainer' ? 'Trainer Dashboard' : 'Government Official';

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 top-[53px] bg-slate-950/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed top-[53px] left-0 bottom-0 z-40 md:z-30 flex flex-col border-r transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16'
        } ${
          isLight 
            ? 'bg-white border-slate-300 text-slate-900 shadow-md' 
            : 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-lg'
        }`}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between p-3.5 border-b ${
          isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-900/60'
        }`}>
          {(isOpen || window.innerWidth < 768) && (
            <span className="text-xs font-black uppercase tracking-wider text-[#0c2340] dark:text-blue-400 pl-1 truncate">
              {sidebarTitle}
            </span>
          )}
          <button
            onClick={onToggle}
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isOpen ? 'ml-auto' : 'mx-auto'
            } ${
              isLight 
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800' 
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-none">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onNavigate) onNavigate(item.id);
                  // Close drawer on mobile click
                  if (window.innerWidth < 768 && isOpen) onToggle();
                }}
                title={!isOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'bg-[#0c2340] text-white shadow-sm font-extrabold ring-1 ring-[#0c2340]'
                      : 'bg-blue-600 text-white shadow-sm font-extrabold ring-1 ring-blue-500'
                    : isLight
                    ? 'text-slate-800 hover:text-[#0c2340] hover:bg-slate-100'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800/90'
                } ${!isOpen ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                {isOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Footer User Profile Section */}
        <div className={`p-3.5 border-t ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900'
        }`}>
          <div className={`flex items-center gap-2.5 ${!isOpen ? 'justify-center' : ''}`}>
            <div 
              onClick={() => {
                if (onNavigate) onNavigate('profile');
                if (window.innerWidth < 768 && isOpen) onToggle();
              }}
              className="w-8 h-8 rounded-full bg-[#0c2340] text-amber-300 font-extrabold flex items-center justify-center text-xs shrink-0 cursor-pointer shadow-sm border border-slate-400"
            >
              {profile.name.charAt(0)}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile.name}
                </p>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                  {userRole === 'Admin' ? 'Administrator' : userRole === 'Trainer' ? 'Trainer' : profile.designation}
                </p>
              </div>
            )}
            {isOpen && onLogoutClick && (
              <button
                onClick={onLogoutClick}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-100 dark:text-slate-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
