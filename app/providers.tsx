'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { UserContextType } from '@/lib/types';

const BSC_TESTNET_CHAIN_ID = 97;
const BSC_MAINNET_CHAIN_ID = 56;
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '97');

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    try {
      // Get connected accounts
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        const connectedAccount = accounts[0];
        const newProvider = new BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        const network = await newProvider.getNetwork();

        setAccount(connectedAccount);
        setProvider(newProvider);
        setSigner(newSigner);
        setChainId(Number(network.chainId));
        setIsConnected(true);

        // Set up listeners
        setupListeners(newProvider);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }, []);

  const setupListeners = useCallback((provider: BrowserProvider) => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('disconnect', handleDisconnect);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to use this app');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const newProvider = new BrowserProvider(window.ethereum);
      const network = await newProvider.getNetwork();
      const newSigner = await newProvider.getSigner();

      setAccount(accounts[0]);
      setProvider(newProvider);
      setSigner(newSigner);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      // Set up listeners
      setupListeners(newProvider);

      // Check if on correct network
      if (Number(network.chainId) !== TARGET_CHAIN_ID) {
        await switchNetwork();
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code !== 4001) {
        // 4001 = user rejected
        alert(`Error connecting wallet: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [setupListeners]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setProvider(null);
    setSigner(null);
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${TARGET_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Network doesn't exist in wallet, try to add it
        try {
          const rpcUrl =
            TARGET_CHAIN_ID === BSC_TESTNET_CHAIN_ID
              ? process.env.NEXT_PUBLIC_BSC_TESTNET_RPC
              : process.env.NEXT_PUBLIC_BSC_MAINNET_RPC;

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${TARGET_CHAIN_ID.toString(16)}`,
                chainName: TARGET_CHAIN_ID === BSC_TESTNET_CHAIN_ID ? 'BSC Testnet' : 'BSC Mainnet',
                rpcUrls: [rpcUrl || ''],
                blockExplorerUrls:
                  TARGET_CHAIN_ID === BSC_TESTNET_CHAIN_ID
                    ? ['https://testnet.bscscan.com']
                    : ['https://bscscan.com'],
                nativeCurrency: {
                  name: 'Binance Coin',
                  symbol: 'BNB',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    }
  }, []);

  const value: UserContextType = {
    account,
    isConnected,
    isConnecting,
    chainId,
    provider,
    signer: signer as any,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
