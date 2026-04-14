// File type returned from smart contract
export interface FileMetadata {
  name: string;
  fileType: string;
  cid: string; // IPFS CID
  timestamp: number;
}

// User context type
export interface UserContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  provider: any | null;
  signer: any | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
}

// Toast notification type
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'loading';
  duration?: number;
}
