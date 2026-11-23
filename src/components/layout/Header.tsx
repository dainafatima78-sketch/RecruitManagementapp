import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Plus, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onQuickCreateJob?: () => void;
  onQuickUploadResume?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onQuickCreateJob,
  onQuickUploadResume
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Recruitment Dashboard',
          subtitle: 'Pipeline overview, metrics, and recent recruitment activity'
        };
      case '/jobs':
        return {
          title: 'Job Requisitions',
          subtitle: 'Create, monitor, and publish open positions'
        };
      case '/candidates':
        return {
          title: 'Candidate Management',
          subtitle: 'Review candidate pipeline, resumes, and evaluation states'
        };
      case '/interview-generator':
        return {
          title: 'AI Interview Generator',
          subtitle: 'Generate tailored technical and behavioral interview questions'
        };
      case '/how-to-use':
        return {
          title: 'How To Use RecruitAI',
          subtitle: 'Step-by-step workflow guide and ATS best practices'
        };
      default:
        return {
          title: 'Recruitment Workspace',
          subtitle: 'RecruitAI enterprise ATS platform'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="h-16 bg-white border-b border-[#E3E8F0] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-[#697386] hover:text-[#202638] hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-[#202638] truncate tracking-tight">
            {pageInfo.title}
          </h1>
          <p className="hidden sm:block text-[11px] text-[#697386] truncate">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick Contextual Actions & User Menu */}
      <div className="flex items-center gap-2.5 shrink-0">
        {location.pathname === '/jobs' && (
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => onQuickCreateJob?.()}
          >
            Create Job
          </Button>
        )}

        {location.pathname === '/candidates' && (
          <Button
            size="sm"
            variant="primary"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => onQuickUploadResume?.()}
          >
            Upload Resume
          </Button>
        )}

        {location.pathname === '/' && (
          <div className="hidden sm:flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => navigate('/candidates?upload=true')}
            >
              Upload
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => navigate('/jobs?create=true')}
            >
              New Job
            </Button>
          </div>
        )}

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-[#EAF1FF] border border-[#3978F6]/20 flex items-center justify-center text-[#3978F6] text-xs font-bold shrink-0">
              {user?.name ? user.name.slice(0, 1).toUpperCase() : 'M'}
            </div>
            <span className="hidden md:block text-xs font-medium text-[#202638]">
              {user?.name?.split(' ')[0] || 'Member'}
            </span>
          </button>

          {isProfileMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E3E8F0] shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <div className="px-3.5 py-2 border-b border-[#E3E8F0]">
                <p className="text-xs font-semibold text-[#202638] truncate">{user?.name || 'Member'}</p>
                <p className="text-[11px] text-[#697386] truncate">{user?.email || 'user@recruitai.com'}</p>
                <p className="text-[10px] text-[#3978F6] font-medium mt-1">{user?.role || 'Recruiter Workspace'}</p>
              </div>

              <Link
                to="/how-to-use"
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#202638] hover:bg-[#F8FAFD] transition-colors"
              >
                <span>Workflow Guide</span>
              </Link>

              <button
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#C94353] hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
