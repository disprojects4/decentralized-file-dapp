'use client';

import React, { useEffect, useState } from 'react';

interface FileAnimationProps {
  fileName: string;
  type: 'upload' | 'download';
  onComplete: () => void;
}

export default function FileAnimation({ fileName, type, onComplete }: FileAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Animation duration: 2000ms
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation to complete
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {/* Background overlay with blur */}
      {isVisible && (
        <div 
          className="fixed inset-0 z-40 pointer-events-none bg-black/30 backdrop-blur-sm"
          style={{
            animation: 'fadeInOverlay 0.3s ease-in forwards'
          }}
        />
      )}

      {/* File animation container */}
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        {isVisible && (
          <div
            className={`transform transition-all duration-[2000ms] ease-in-out ${
              type === 'upload'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-0 opacity-100'
            }`}
            style={{
              animation: type === 'upload'
                ? 'slideDownFade 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                : 'slideDownFade 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            }}
          >
            {/* File Icon Container */}
            <div className="flex flex-col items-center gap-4 bg-white rounded-3xl p-8 shadow-2xl">
              {/* File Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition">
                <div className="text-4xl">
                  {type === 'upload' ? '📤' : '📥'}
                </div>
              </div>

              {/* File Name */}
              <div className="text-center">
                <p className="text-gray-900 font-semibold text-sm max-w-xs truncate px-4">
                  {fileName}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {type === 'upload' ? 'Uploaded successfully' : 'Downloaded successfully'}
                </p>
              </div>

              {/* Checkmark */}
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce">
                ✓
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideDownFade {
          0% {
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          80% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(80px) scale(0.9);
          }
        }
        
        @keyframes fadeInOverlay {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
