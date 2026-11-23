import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { BrandSymbol } from '../common/BrandSymbol';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex flex-col items-center justify-center gap-3">
        <BrandSymbol className="w-12 h-12" />
        <div className="flex items-center gap-2 text-xs font-semibold text-[#697386]">
          <Loader2 className="w-4 h-4 animate-spin text-[#3978F6]" />
          <span>Loading RecruitAI Workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex flex-col items-center justify-center gap-3">
        <BrandSymbol className="w-12 h-12" />
        <div className="flex items-center gap-2 text-xs font-semibold text-[#697386]">
          <Loader2 className="w-4 h-4 animate-spin text-[#3978F6]" />
          <span>Loading RecruitAI Workspace...</span>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : <>{children}</>;
};
