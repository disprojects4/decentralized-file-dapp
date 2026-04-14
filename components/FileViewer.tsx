'use client';

import React, { useState } from 'react';
import { getIPFSUrl } from '@/lib/ipfs';

interface FileViewerProps {
  cid: string;
  fileName: string;
  fileType: string;
  onClose: () => void;
}

export default function FileViewer({
  cid,
  fileName,
  fileType,
  onClose,
}: FileViewerProps) {
  const url = getIPFSUrl(cid);
  const [isLoading, setIsLoading] = useState(true);
  
  // Determine if it's an image
  const isImage = fileType.startsWith('image/');
  
  // Determine if it's a PDF
  const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
  
  // Determine if it's audio
  const isAudio = fileType.startsWith('audio/');
  
  // Determine if it's video
  const isVideo = fileType.startsWith('video/');
  
  // Determine if it's text
  const isText = fileType.startsWith('text/') || 
                 fileName.endsWith('.txt') || 
                 fileName.endsWith('.md') ||
                 fileName.endsWith('.json');

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{fileName}</h2>
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-gray-700 transition text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-sm font-medium">Loading file...</p>
              </div>
            </div>
          )}

          {isImage && (
            <img
              src={url}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
              onLoad={() => setIsLoading(false)}
              onError={(e) => {
                setIsLoading(false);
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-size=%2214%22 fill=%22%236b7280%22%3EImage failed to load%3C/text%3E%3C/svg%3E';
              }}
            />
          )}

          {isPDF && (
            <iframe
              src={url}
              className="w-full h-full"
              title={fileName}
              onLoad={() => setIsLoading(false)}
            />
          )}

          {isAudio && (
            <div className="flex flex-col items-center gap-6">
              <div className="text-gray-400 text-8xl">🎵</div>
              <audio
                src={url}
                controls
                className="w-full max-w-md"
                onLoadedData={() => setIsLoading(false)}
                onCanPlay={() => setIsLoading(false)}
              />
            </div>
          )}

          {isVideo && (
            <video
              src={url}
              controls
              className="max-w-full max-h-full"
              onLoadedData={() => setIsLoading(false)}
              onCanPlay={() => setIsLoading(false)}
            />
          )}

          {isText && (
            <iframe
              src={url}
              className="w-full h-full"
              title={fileName}
              onLoad={() => setIsLoading(false)}
            />
          )}

          {!isImage && !isPDF && !isAudio && !isVideo && !isText && (
            <div className="flex flex-col items-center gap-4 p-8">
              <div className="text-gray-400 text-6xl">📄</div>
              <p className="text-gray-600 text-center">
                File type not supported for preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
