'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      icon: <XCircle className="h-5 w-5 text-rose-400" />
    },
    info: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      icon: <Info className="h-5 w-5 text-amber-400" />
    }
  }[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 border backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 max-w-sm border-white/10 bg-zinc-950/80">
      <div className={`p-1.5 rounded-lg border ${config.bg.split(' ')[0]} ${config.bg.split(' ')[1]}`}>
        {config.icon}
      </div>
      <div className="flex-1 text-sm font-medium text-zinc-200">
        {message}
      </div>
      <button 
        onClick={onClose}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
