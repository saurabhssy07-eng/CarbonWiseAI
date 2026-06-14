import React, { useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  error:   <AlertCircle className="w-4 h-4 text-red-400" />,
  info:    <Info        className="w-4 h-4 text-blue-400" />,
};

export default function Toast({ message, type = 'success' }) {
  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
      <div className="glass-card flex items-center gap-3 px-4 py-3 min-w-[240px] max-w-[340px]">
        {ICONS[type] ?? ICONS.info}
        <p className="text-sm text-gray-200 flex-1">{message}</p>
      </div>
    </div>
  );
}
