'use client';

import React from 'react';
import { useUser } from '@/lib/hooks';
import { formatAddress } from '@/lib/contract';

export default function Navbar() {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useUser();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo / Title */}
        <h1 className="text-2xl font-bold">
          File Manager Using Blockchain
        </h1>

        {/* Wallet Button */}
        <button
          onClick={isConnected ? disconnectWallet : connectWallet}
          disabled={isConnecting}
          className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
            isConnecting
              ? 'bg-gray-400 cursor-not-allowed'
              : isConnected
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-400 hover:bg-blue-500'
          } text-white`}
        >
          {isConnecting && 'Connecting...'}
          {!isConnecting && isConnected && `${formatAddress(account || '')}`}
          {!isConnecting && !isConnected && 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}
