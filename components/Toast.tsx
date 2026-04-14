'use client';

import React, { useEffect } from 'react';
import { Toast } from '@/lib/types';

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export default function ToastNotification({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration !== undefined && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    loading: 'bg-gray-500',
  }[toast.type];

  const icon = {
    success: '',
    error: '',
    info: '',
    loading: '',
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in duration-300`}
    >
      <span className={`text-lg font-bold ${toast.type === 'loading' ? 'animate-spin' : ''}`}>
        {icon}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
