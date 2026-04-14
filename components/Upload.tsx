'use client';

import React, { useState } from 'react';
import { useUser } from '@/lib/hooks';
import { uploadToIPFS, getIPFSUrl } from '@/lib/ipfs';
import { uploadFileToBlockchain } from '@/lib/contract';
import { Toast as ToastType } from '@/lib/types';

interface UploadProps {
  onSuccess: () => void;
  onToast: (toast: ToastType) => void;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'progress';
}

export default function Upload({ onSuccess, onToast }: UploadProps) {
  const { signer, isConnected } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
      addLog('Initializing upload process...', 'info');
      addLog(`File: ${selectedFile.name}`, 'info');
      addLog(`Size: ${(selectedFile.size / 1024).toFixed(2)} KB`, 'info');
      
      // Step 1: Show loading toast
      onToast({
        id: toastId,
        message: 'Uploading file to IPFS...',
        type: 'loading',
      });

      addLog('Connecting to IPFS network...', 'progress');

      // Step 2: Upload to IPFS
      const cid = await uploadToIPFS(selectedFile);
      console.log('File uploaded to IPFS:', cid);
      addLog(`IPFS upload successful: ${cid.slice(0, 12)}...`, 'success');

      // Step 3: Update toast
      onToast({
        id: toastId,
        message: 'Saving metadata to blockchain...',
        type: 'loading',
      });

      addLog('Submitting transaction to BSC...', 'progress');

      // Step 4: Upload to blockchain
      const receipt = await uploadFileToBlockchain(
        signer,
        selectedFile.name,
        selectedFile.type || 'application/octet-stream',
        cid
      );

      addLog(`Transaction confirmed: ${receipt?.hash?.slice(0, 10)}...`, 'success');

      // Step 5: Success toast
      onToast({
        id: toastId,
        message: `File uploaded successfully! (TX: ${receipt?.hash?.slice(0, 10)}...)`,
        type: 'success',
        duration: 5000,
      });

      addLog('Upload process completed successfully', 'success');

      // Reset form
      setSelectedFile(null);
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';

      // Trigger refresh
      onSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
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
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
        Connect your wallet to upload files.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Upload File</h2>

      <div className="space-y-4">
        {/* File Input */}
        <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center hover:bg-blue-50 transition">
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <label htmlFor="file-input" className="cursor-pointer block">
            <p className="text-gray-700 font-semibold">
              {selectedFile ? selectedFile.name : 'Click to select a file'}
            </p>
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-2">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </label>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            !selectedFile || isUploading
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload & Save to Blockchain'}
        </button>

        {/* Terminal Log */}
        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs max-h-56 overflow-y-auto border border-gray-700">
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
    </div>
  );
}
