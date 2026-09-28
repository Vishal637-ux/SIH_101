import React, { useState } from 'react';
import { OfficialProfile } from '../types';
import { 
  Award, 
  Flame, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  KeyRound, 
  ChevronDown,
  Bell,
  PanelLeft,
  Target,
  Globe,
  FileText
} from 'lucide-react';

interface HeaderProps {
  profile: OfficialProfile;
  isLoggedIn: boolean;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  activeNav?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNavigateToDashboard?: () => void;
  onOpenProfile: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onNavigateToSkillGaps?: () => void;
  onNavigateToIntegrations?: () => void;
  onNavigateToContent?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  isLoggedIn,
  theme,
  setTheme,
  isSidebarOpen,
  onToggleSidebar,
  onNavigateToDashboard,
  onOpenProfile,
  onLoginClick,
  onLogoutClick,
  onNavigateToSkillGaps,
  onNavigateToIntegrations,
  onNavigateToContent,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isLight = theme === 'light';

  return (
    <header className={`border-b sticky top-0 z-40 transition-colors ${
      isLight
        ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
        : 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-md'
    }`}>
      {/* Top Government Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* LEFT: Sidebar Toggle & PradnyaSetu Branding */}
        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title={isSidebarOpen ? 'Collapse Menu' : 'Expand Menu'}
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={onNavigateToDashboard}
            className="flex items-center cursor-pointer group py-0.5"
            title="PradnyaSetu Dashboard"
          >
            <div className={`px-2 py-1 rounded-lg transition-transform group-hover:scale-[1.02] ${isLight ? 'bg-transparent' : 'bg-white/95 shadow-sm'}`}>
              <img 
                src="/logo.png" 
                alt="PradnyaSetu Logo" 
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Notifications, Theme & Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notifications Bell */}
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className={`p-2 rounded-full border relative transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border p-4 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Notifications
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        2 New
                      </span>
                    </div>

                    <div className="space-y-3 pt-3">
                      <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                          <span>New Recommendation</span>
                          <span className="text-[10px] text-slate-400">Just now</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          GeM 4.0 Procurement Framework is recommended for your target role.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                          <span>Skill Gap Assessment</span>
                          <span className="text-[10px] text-slate-400">1d ago</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Your profile has 2 high urgency competency gaps identified.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Profile Menu or Login */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700/80'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#0c2340] text-amber-300 font-bold flex items-center justify-center text-xs shadow-inner">
                  {profile.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-bold leading-tight max-w-[130px] truncate">
                    {profile.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                    {profile.designation || profile.cadre}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-xl border py-2 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}>
                    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-bold">{profile.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {profile.cadre}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onOpenProfile();
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                          isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <User className="w-4 h-4 text-blue-500" />
                        <span>View Official Profile</span>
                      </button>

                      {onNavigateToSkillGaps && (
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onNavigateToSkillGaps();
                          }}
                          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                            isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                          }`}
                        >
                          <Target className="w-4 h-4 text-rose-500" />
                          <span>My Skills & Gaps</span>
                        </button>
                      )}

                      {onNavigateToIntegrations && (
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onNavigateToIntegrations();
                          }}
                          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                            isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                          }`}
                        >
                          <Globe className="w-4 h-4 text-teal-500" />
                          <span>External Ecosystem</span>
                        </button>
                      )}

                      {onNavigateToContent && (
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onNavigateToContent();
                          }}
                          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                            isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                          }`}
                        >
                          <FileText className="w-4 h-4 text-purple-500" />
                          <span>Content Library</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onLogoutClick();
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors text-rose-600 dark:text-rose-400 ${
                          isLight ? 'hover:bg-rose-50' : 'hover:bg-rose-950/30'
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0c2340] hover:bg-slate-800 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Official Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
