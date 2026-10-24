import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-stone-900 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />,
    info: <Info className="w-4 h-4 text-stone-700 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-stone-300 bg-white/95 text-stone-900 shadow-xl shadow-stone-900/5',
    warning: 'border-amber-200 bg-amber-50/95 text-amber-950 shadow-xl shadow-amber-900/5',
    error: 'border-rose-200 bg-rose-50/95 text-rose-950 shadow-xl shadow-rose-900/5',
    info: 'border-stone-200 bg-white/95 text-stone-900 shadow-xl shadow-stone-900/5',
  };

  return (
    <div className="fixed top-3 inset-x-3 z-50 flex justify-center pointer-events-none">
      <div
        className={`pointer-events-auto max-w-sm w-full px-4 py-3 rounded-2xl border backdrop-blur-md flex items-center gap-2.5 transition-all duration-300 ${
          borderStyles[toast.type]
        }`}
      >
        {icons[toast.type]}
        <div className="flex-1 text-xs font-medium leading-snug">
          {toast.text}
        </div>
      </div>
    </div>
  );
};
