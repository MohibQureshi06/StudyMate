import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function Toast({ message, type = 'success' }) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />;
      default:
        return <CheckCircle size={20} className="text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 ${getBgColor()} border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-fadeIn z-50 max-w-sm`}>
      {getIcon()}
      <span className="text-sm font-medium text-slate-900">{message}</span>
    </div>
  );
}
