'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/hooks';
import { getMyFiles, formatDate } from '@/lib/contract';
import { getIPFSUrl } from '@/lib/ipfs';
import { FileMetadata, Toast } from '@/lib/types';
import FileViewer from './FileViewer';
import FileAnimation from './FileAnimation';

interface FileListProps {
  refreshTrigger: number;
  onToast: (toast: Toast) => void;
}

interface ViewerState {
  isOpen: boolean;
  cid: string;
  fileName: string;
  fileType: string;
}

interface DownloadAnimation {
  isActive: boolean;
  fileName: string;
}

export default function FileList({ refreshTrigger, onToast }: FileListProps) {
  const { signer, isConnected } = useUser();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCID, setCopiedCID] = useState<string | null>(null);
  const [downloadingCID, setDownloadingCID] = useState<string | null>(null);
  const [downloadAnimation, setDownloadAnimation] = useState<DownloadAnimation>({
    isActive: false,
    fileName: '',
  });
  const [viewer, setViewer] = useState<ViewerState>({
    isOpen: false,
    cid: '',
    fileName: '',
    fileType: '',
  });

  const fetchFiles = async () => {
    if (!signer || !isConnected) return;

    setIsLoading(true);
    try {
      const userFiles = await getMyFiles(signer);
      setFiles(userFiles);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      onToast({
        id: 'fetch-error',
        message: error.message,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger, isConnected]);

  const handleCopyCID = (cid: string) => {
    navigator.clipboard.writeText(cid);
    setCopiedCID(cid);
    onToast({
      id: `copy-${cid}`,
      message: 'CID copied to clipboard!',
      type: 'success',
      duration: 2000,
    });
    setTimeout(() => setCopiedCID(null), 2000);
  };

  const handleOpenFile = (file: FileMetadata) => {
    if (!file.cid || file.cid.length === 0) {
      onToast({
        id: `view-error-${Date.now()}`,
        message: 'File CID not available',
        type: 'error',
        duration: 3000,
      });
      return;
    }
    setViewer({
      isOpen: true,
      cid: file.cid,
      fileName: file.name || 'Unnamed File',
      fileType: file.fileType || 'application/octet-stream',
    });
  };

  const handleDownloadFile = async (file: FileMetadata) => {
    if (!file.cid || file.cid.length === 0) {
      onToast({
        id: `download-error-${Date.now()}`,
        message: 'File CID not available',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setDownloadingCID(file.cid);
    try {
      const url = getIPFSUrl(file.cid);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Show animation instead of toast
      setDownloadAnimation({
        isActive: true,
        fileName: file.name || 'File',
      });
    } catch (error: any) {
      console.error('Download error:', error);
      onToast({
        id: `download-error-${file.cid}`,
        message: 'Download failed: ' + error.message,
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDownloadingCID(null);
    }
  };


  if (!isConnected) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200">
        <p className="text-gray-600 text-sm">Connect wallet to view files</p>
      </div>
    );
  }

  if (isLoading && files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm mt-4">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
        <p className="text-gray-600 font-medium">No files yet</p>
        <p className="text-gray-500 text-sm mt-1">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm">{file.name || 'Unnamed File'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {file.timestamp ? formatDate(file.timestamp) : 'Unknown date'}
              </p>
            </div>
            <div className="flex gap-2 ml-2">
              <button
                onClick={() => handleOpenFile(file)}
                disabled={!file.cid}
                className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View
              </button>
              <button
                onClick={() => handleCopyCID(file.cid)}
                disabled={!file.cid}
                className={`px-3 py-1 rounded-lg font-medium text-xs transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  copiedCID === file.cid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copiedCID === file.cid ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => handleDownloadFile(file)}
                disabled={!file.cid || downloadingCID === file.cid}
                className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {downloadingCID === file.cid ? (
                  <>
                    <div className="w-3 h-3 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>Downloading</span>
                  </>
                ) : (
                  'Download'
                )}
              </button>
            </div>
          </div>
          <p className="text-xs font-mono text-gray-600 truncate bg-gray-50 px-2 py-1 rounded">
            {file.cid ? `${file.cid.slice(0, 12)}...${file.cid.slice(-8)}` : 'No CID available'}
          </p>
        </div>
      ))}
      <button
        onClick={fetchFiles}
        disabled={isLoading}
        className="w-full py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
      >
        {isLoading ? 'Refreshing...' : 'Refresh List'}
      </button>

      {viewer.isOpen && (
        <FileViewer
          cid={viewer.cid}
          fileName={viewer.fileName}
          fileType={viewer.fileType}
          onClose={() => setViewer({ ...viewer, isOpen: false })}
        />
      )}

      {downloadAnimation.isActive && (
        <FileAnimation
          fileName={downloadAnimation.fileName}
          type="download"
          onComplete={() => setDownloadAnimation({ isActive: false, fileName: '' })}
        />
      )}
    </div>
  );
}
