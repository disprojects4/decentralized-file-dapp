'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/hooks';
import { formatAddress, getBalance, getFileCount } from '@/lib/contract';

interface NavbarProps {
  refreshTrigger?: number;
}

export default function Navbar({ refreshTrigger = 0 }: NavbarProps) {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet, signer } = useUser();
  const [balance, setBalance] = useState('0');
  const [fileCount, setFileCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch wallet stats
  useEffect(() => {
    if (isConnected && signer) {
      setIsLoadingStats(true);
      Promise.all([getBalance(signer), getFileCount(signer)])
        .then(([bal, count]) => {
          setBalance(bal);
          setFileCount(count);
        })
        .catch(() => {
          setBalance('0');
          setFileCount(0);
        })
        .finally(() => setIsLoadingStats(false));
    }
  }, [isConnected, signer, refreshTrigger]);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center h-auto">
        {/* Center: Stats (only show when connected) */}
        {isConnected && (
          <div className="flex items-center gap-3">
            {/* Balance */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-500 font-medium">Balance</p>
              <p className="text-sm font-bold text-gray-900">
                {isLoadingStats ? '-' : balance}
              </p>
              <p className="text-xs text-gray-400">BNB</p>
            </div>
            
            {/* Divider */}
            <div className="w-px h-12 bg-gray-200"></div>
            
            {/* Files Count */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-500 font-medium">Files</p>
              <p className="text-sm font-bold text-gray-900">
                {isLoadingStats ? '-' : fileCount}
              </p>
              <p className="text-xs text-gray-400">Uploaded</p>
            </div>
          </div>
        )}

        {/* Right: Wallet Button */}
        <button
          onClick={isConnected ? disconnectWallet : connectWallet}
          disabled={isConnecting}
          className={`px-3 py-2 rounded-full font-medium text-xs transition-all flex-shrink-0 whitespace-nowrap ml-auto ${
            isConnecting
              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
              : isConnected
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isConnecting && 'Connecting...'}
          {!isConnecting && isConnected && formatAddress(account || '')}
          {!isConnecting && !isConnected && 'Connect'}
        </button>
      </div>
    </nav>
  );
}
