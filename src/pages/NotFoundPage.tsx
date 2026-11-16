import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#EAF1FF] border border-[#3978F6]/20 flex items-center justify-center text-[#3978F6] mb-4 shadow-sm">
        <Briefcase className="w-7 h-7" />
      </div>
      <h1 className="text-3xl font-bold text-[#202638] tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-xs text-[#697386] max-w-md mb-6 leading-relaxed">
        The page or recruitment workspace resource you requested could not be found. Please verify the URL or return to your dashboard.
      </p>
      <Button
        variant="primary"
        size="md"
        icon={<ArrowLeft className="w-4 h-4" />}
        onClick={() => navigate('/')}
      >
        Back to Dashboard
      </Button>
    </div>
  );
};
