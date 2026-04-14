'use client';

import React, { useState } from 'react';
import { useUser } from '@/lib/hooks';
import { uploadToIPFS, getIPFSUrl } from '@/lib/ipfs';
import { uploadFileToBlockchain } from '@/lib/contract';
import { Toast as ToastType } from '@/lib/types';
import FileAnimation from './FileAnimation';

interface UploadProps {
  onSuccess: () => void;
  onToast: (toast: ToastType) => void;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'progress';
}

interface UploadAnimation {
  isActive: boolean;
  fileName: string;
}

export default function Upload({ onSuccess, onToast }: UploadProps) {
  const { signer, isConnected } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [uploadAnimation, setUploadAnimation] = useState<UploadAnimation>({
    isActive: false,
    fileName: '',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setCustomName('');
      setLogs([]);
    }
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'progress' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !signer) return;

    setIsUploading(true);
    setLogs([]);
    const toastId = `upload-${Date.now()}`;

    try {
      addLog('Starting upload...', 'info');
      const fileName = customName || selectedFile.name;
      addLog(`File: ${fileName}`, 'info');
      addLog(`Size: ${(selectedFile.size / 1024).toFixed(2)} KB`, 'info');
      
      onToast({
        id: toastId,
        message: 'Uploading to IPFS...',
        type: 'loading',
      });

      addLog('Connecting to IPFS...', 'progress');

      const cid = await uploadToIPFS(selectedFile);
      addLog(`IPFS saved: ${cid.slice(0, 12)}...`, 'success');

      onToast({
        id: toastId,
        message: 'Saving to blockchain...',
        type: 'loading',
      });

      addLog('Submitting to BSC...', 'progress');

      const receipt = await uploadFileToBlockchain(
        signer,
        customName || selectedFile.name,
        selectedFile.type || 'application/octet-stream',
        cid
      );

      console.log('File saved with name:', customName || selectedFile.name);
      addLog(`File name saved: ${customName || selectedFile.name}`, 'info');
      addLog(`Confirmed: ${receipt?.hash?.slice(0, 10)}...`, 'success');

      // Show animation instead of toast
      setUploadAnimation({
        isActive: true,
        fileName: fileName,
      });

      setSelectedFile(null);
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';
      setTimeout(() => setLogs([]), 3000);

      onSuccess();
    } catch (error: any) {
      addLog(`Error: ${error.message}`, 'error');
      onToast({
        id: toastId,
        message: error.message || 'Upload failed',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
      <div className="space-y-3">
        {/* File Input */}
        <div className="relative">
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <label htmlFor="file-input" className="cursor-pointer block">
            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
              selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400'
            }`}>
              <p className="text-2xl mb-1">+</p>
              <p className="text-sm font-medium text-gray-900">
                {selectedFile ? selectedFile.name : 'Add File'}
              </p>
              {selectedFile && (
                <p className="text-xs text-gray-600 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </label>
        </div>

        {/* File Name Input */}
        {selectedFile && (
          <input
            type="text"
            placeholder="Enter custom name (optional)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            disabled={isUploading}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none text-sm placeholder-gray-400 disabled:bg-gray-100"
          />
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
            !selectedFile || isUploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>

        {/* Terminal Log */}
        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs max-h-40 overflow-y-auto border border-gray-700">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`mb-1 ${
                  log.type === 'success'
                    ? 'text-green-400'
                    : log.type === 'error'
                      ? 'text-red-400'
                      : log.type === 'progress'
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                }`}
              >
                <span className="text-gray-600">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {uploadAnimation.isActive && (
        <FileAnimation
          fileName={uploadAnimation.fileName}
          type="upload"
          onComplete={() => setUploadAnimation({ isActive: false, fileName: '' })}
        />
      )}
    </div>
  );
}
