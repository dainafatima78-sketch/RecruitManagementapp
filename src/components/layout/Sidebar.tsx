import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquareText,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BrandSymbol } from '../common/BrandSymbol';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('info', 'Signed Out', 'You have been successfully signed out.');
      navigate('/login');
    } catch {
      addToast('error', 'Sign out failed', 'Please try again.');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Candidates', path: '/candidates', icon: Users },
    { label: 'Interview Generator', path: '/interview-generator', icon: MessageSquareText },
    { label: 'How To Use', path: '/how-to-use', icon: HelpCircle }
  ];

  return (
    <aside
      className={`h-screen bg-[#151B2B] text-slate-300 flex flex-col transition-all duration-200 select-none z-30 shrink-0 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          <BrandSymbol className="w-8 h-8" />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-white tracking-tight leading-tight">
                Recruit<span className="text-[#3978F6]">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Enterprise ATS
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Close button (mobile drawer only) */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close navigation"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-2">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Recruitment Workspace
            </span>
          )}
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-[#3978F6] text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section: Member Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 space-y-1 shrink-0 bg-[#121724]">
        {/* Member Profile */}
        <div
          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60 mt-2 ${
            isCollapsed ? 'justify-center p-2' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#3978F6]/20 border border-[#3978F6]/30 flex items-center justify-center text-[#3978F6] text-xs font-bold shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'Member'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'user@recruitai.com'}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
