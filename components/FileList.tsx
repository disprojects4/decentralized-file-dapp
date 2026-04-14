'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/hooks';
import { getMyFiles, formatDate, formatAddress } from '@/lib/contract';
import { getIPFSUrl } from '@/lib/ipfs';
import { FileMetadata, Toast } from '@/lib/types';

interface FileListProps {
  refreshTrigger: number;
  onToast: (toast: Toast) => void;
}

export default function FileList({ refreshTrigger, onToast }: FileListProps) {
  const { signer, isConnected } = useUser();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCID, setCopiedCID] = useState<string | null>(null);

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

  const handleOpenFile = (cid: string) => {
    const url = getIPFSUrl(cid);
    window.open(url, '_blank');
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">Connect your wallet to view your files.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">📂</span>
          My Files {files.length > 0 && <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">({files.length})</span>}
        </h2>
        <button
          onClick={fetchFiles}
          disabled={isLoading}
          className="text-sm px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {isLoading && files.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin text-3xl mb-2">+</div>
          <p className="text-gray-600">Loading your files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No files uploaded yet.</p>
          <p className="text-sm text-gray-500">Upload a file above to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold">File Name</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">CID</th>
                <th className="text-left py-3 px-4 font-semibold">Uploaded</th>
                <th className="text-center py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-blue-50 transition"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {file.fileType?.includes('image')
                          ? '🖼️'
                          : file.fileType?.includes('pdf')
                            ? '📄'
                            : file.fileType?.includes('text')
                              ? '📝'
                              : '📎'}
                      </span>
                      <span className="font-medium text-gray-800 truncate max-w-xs" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">
                    {file.fileType.split('/')[1] || 'unknown'}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono">
                    <code className="bg-gray-100 px-2 py-1 rounded" title={file.cid || 'N/A'}>
                      {(file.cid || 'N/A').slice(0, 8)}...
                    </code>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">
                    {formatDate(file.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleCopyCID(file.cid)}
                        title="Copy CID"
                        className={`px-3 py-1 rounded text-xs font-semibold transition ${
                          copiedCID === file.cid
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {copiedCID === file.cid ? '✓ Copied' : '📋 Copy'}
                      </button>
                      <button
                        onClick={() => handleOpenFile(file.cid)}
                        title="Open in IPFS gateway"
                        className="px-3 py-1 rounded text-xs font-semibold bg-blue-500 text-white hover:bg-blue-600 transition"
                      >
                        👁️ View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
