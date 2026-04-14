'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Upload from '@/components/Upload';
import FileList from '@/components/FileList';
import ToastNotification from '@/components/Toast';
import { Toast } from '@/lib/types';
import { useUser } from '@/lib/hooks';
import { getBalance, getFileCount } from '@/lib/contract';

export default function Home() {
  const { isConnected, chainId, signer } = useUser();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [balance, setBalance] = useState('0');
  const [fileCount, setFileCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const addToast = (toast: Toast) => {
    const id = toast.id || `toast-${Date.now()}-${Math.random()}`;
    const newToast = { ...toast, id };
    setToasts((prev) => {
      // Replace existing toast with same ID, or add new one
      const filtered = prev.filter((t) => t.id !== id);
      return [...filtered, newToast];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch wallet stats
  useEffect(() => {
    if (isConnected && signer) {
      setIsLoadingStats(true);
      Promise.all([getBalance(signer), getFileCount(signer)])
        .then(([bal, count]) => {
          setBalance(bal);
          setFileCount(count);
        })
        .finally(() => setIsLoadingStats(false));
    }
  }, [isConnected, signer, refreshTrigger]);

  // Show network warning
  const isWrongNetwork = isConnected && chainId && chainId !== parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '97');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          {!isConnected ? (
            <div className="bg-white rounded-lg p-8 mb-8 text-center border border-gray-200 shadow-sm">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Conect your wallet and Start Managing Files</h1>
              <p className="text-lg text-gray-700">
                Securely upload and manage your files on the blockchain using IPFS and BSC
              </p>
              <p className="text-sm mt-4 text-gray-600">
                Connect your MetaMask wallet to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <p className="text-gray-600 text-sm">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{isLoadingStats ? '-' : balance} BNB</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <p className="text-gray-600 text-sm">Files Uploaded</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{isLoadingStats ? '-' : fileCount}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <p className="text-gray-600 text-sm">Network Status</p>
                <p className="text-sm font-semibold text-green-600 mt-2">BSC Mainnet Active</p>
              </div>
            </div>
          )}

          {/* Network Warning */}
          {isWrongNetwork && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded">
              <p className="font-semibold">⚠️ Wrong Network</p>
              <p className="text-sm mt-1">
                Please switch to the correct network (BSC {process.env.NEXT_PUBLIC_CHAIN_ID === '97' ? 'Testnet' : 'Mainnet'}) in MetaMask.
              </p>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <Upload onSuccess={handleUploadSuccess} onToast={addToast} />
            </div>

            {/* File List Section */}
            <div className="lg:col-span-2">
              <FileList refreshTrigger={refreshTrigger} onToast={addToast} />
            </div>
          </div>

          {/* Upload Activity Terminal */}
          {isConnected && (
            <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 space-y-1">
                <div>Network: BSC Mainnet (Chain ID: 56)</div>
                <div>Storage: IPFS with BSC metadata</div>
                <div>Status: Connected and Ready</div>
                <div>Upload files in the left panel to get started</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-4 mt-8">
        <p className="text-sm">
          ...
        </p>
      </footer>
    </div>
  );
}
