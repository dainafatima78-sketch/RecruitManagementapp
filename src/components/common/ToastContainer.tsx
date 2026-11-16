import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-[#17845D] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#C94353] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#B7791F] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#3978F6] shrink-0" />
  };

  const borderMap = {
    success: 'border-[#17845D]/30',
    error: 'border-[#C94353]/30',
    warning: 'border-[#B7791F]/30',
    info: 'border-[#3978F6]/30'
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-white rounded-xl border ${borderMap[toast.type]} shadow-lg p-3.5 flex items-start gap-3 animate-in slide-in-from-top-2 duration-150`}
          role="status"
        >
          {iconMap[toast.type]}
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-xs font-bold text-[#202638] tracking-tight">{toast.message}</p>
            {toast.description && (
              <p className="text-xs text-[#697386] mt-0.5 leading-relaxed">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#697386] hover:text-[#202638] p-0.5 rounded cursor-pointer transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
