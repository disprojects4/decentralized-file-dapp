'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Upload from '@/components/Upload';
import FileList from '@/components/FileList';
import ToastNotification from '@/components/Toast';
import { Toast } from '@/lib/types';
import { useUser } from '@/lib/hooks';

export default function Home() {
  const { isConnected, chainId } = useUser();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Show network warning
  const isWrongNetwork = isConnected && chainId && chainId !== parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '97');

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar refreshTrigger={refreshTrigger} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {isWrongNetwork && (
          <div className="mx-4 mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-semibold">Wrong Network</p>
            <p className="text-sm mt-1">Please switch to BSC {process.env.NEXT_PUBLIC_CHAIN_ID === '97' ? 'Testnet' : 'Mainnet'}</p>
          </div>
        )}

        {!isConnected ? (
          <div className="h-full flex items-center justify-center px-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">W3</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">File Manager</h1>
              <p className="text-gray-600 mb-8">Secure, decentralized storage on IPFS & blockchain</p>
              <p className="text-sm text-gray-500">Connect your wallet to begin</p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4">
            {/* File List */}
            <FileList refreshTrigger={refreshTrigger} onToast={addToast} />
          </div>
        )}
      </main>

      {/* Upload Button (Floating Action Button style) */}
      {isConnected && (
        <div className="fixed bottom-4 right-4 left-4 max-w-md mx-auto z-40">
          <Upload onSuccess={handleUploadSuccess} onToast={addToast} />
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNotification toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}
