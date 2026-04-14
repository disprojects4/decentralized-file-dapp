import { ethers, Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { FileMetadata } from './types';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '97');

// ABI for the FileManagement contract
// Import from a JSON file if you have one, or define it here
let CONTRACT_ABI: any[] = [];

// Try to parse ABI from environment variable
try {
  if (process.env.NEXT_PUBLIC_CONTRACT_ABI) {
    CONTRACT_ABI = JSON.parse(process.env.NEXT_PUBLIC_CONTRACT_ABI);
  }
} catch (e) {
  console.warn('Failed to parse CONTRACT_ABI from environment. Using default ABI.');
  // Default ABI - Update this with your contract's actual ABI
  CONTRACT_ABI = [
    {
      inputs: [
        { name: 'fileName', type: 'string' },
        { name: 'fileType', type: 'string' },
        { name: 'fileHash', type: 'string' },
      ],
      name: 'uploadFile',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getMyFiles',
      outputs: [
        {
          components: [
            { name: 'fileName', type: 'string' },
            { name: 'fileType', type: 'string' },
            { name: 'fileHash', type: 'string' },
            { name: 'timestamp', type: 'uint256' },
            { name: 'owner', type: 'address' },
          ],
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];
}

/**
 * Get contract instance with signer
 */
export function getContract(signer: JsonRpcSigner): Contract {
  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS is not configured in environment variables');
  }

  if (CONTRACT_ABI.length === 0) {
    throw new Error('CONTRACT_ABI is not configured. Please check your .env.local file');
  }

  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

/**
 * Upload file to the blockchain
 * @param signer - Ethers signer
 * @param fileName - Name of the file
 * @param fileType - MIME type of the file
 * @param fileHash - IPFS CID
 * @returns Transaction receipt
 */
export async function uploadFileToBlockchain(
  signer: JsonRpcSigner,
  fileName: string,
  fileType: string,
  fileHash: string
) {
  try {
    const contract = getContract(signer);

    const tx = await contract.uploadFile(fileName, fileType, fileHash);
    console.log('Transaction sent:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait(1);
    console.log('Transaction confirmed:', receipt?.hash);

    return receipt;
  } catch (error: any) {
    console.error('Upload to blockchain error:', error);
    throw new Error(`Blockchain upload failed: ${error.message}`);
  }
}

/**
 * Fetch all files for the current user
 * @param signer - Ethers signer
 * @returns Array of file metadata
 */
export async function getMyFiles(signer: JsonRpcSigner): Promise<FileMetadata[]> {
  try {
    const contract = getContract(signer);
    const files = await contract.getMyFiles();

    // Convert contract response to FileMetadata array
    return files.map((file: any) => {
      // Contract uses 'fileName' and 'fileHash', map to our interface
      const name = (file.fileName && typeof file.fileName === 'string' && file.fileName.trim()) ? file.fileName : '';
      const cid = file.fileHash || file.cid || '';
      
      return {
        name: name,
        fileType: file.fileType || file.type || 'application/octet-stream',
        cid: cid,
        timestamp: Number(file.timestamp) || 0,
      };
    });
  } catch (error: any) {
    console.error('Fetch files error:', error);
    throw new Error(`Failed to fetch files: ${error.message}`);
  }
}

/**
 * Check if connected to correct network
 * @param chainId - Current chain ID
 * @returns True if on correct network
 */
export function isCorrectNetwork(chainId: number | null): boolean {
  return chainId === CHAIN_ID;
}

/**
 * Get network name from chain ID
 */
export function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    56: 'BSC Mainnet',
    97: 'BSC Testnet',
  };
  return networks[chainId] || 'Unknown Network';
}

/**
 * Format address for display
 * @param address - Ethereum address
 * @returns Shortened address (0x...1234)
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get BNB balance for the current user
 * @param signer - Ethers signer
 * @returns Balance in BNB
 */
export async function getBalance(signer: JsonRpcSigner): Promise<string> {
  try {
    const address = await signer.getAddress();
    const provider = signer.provider as BrowserProvider;
    const balanceWei = await provider.getBalance(address);
    const balanceBNB = ethers.formatEther(balanceWei);
    return parseFloat(balanceBNB).toFixed(4);
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    return '0';
  }
}

/**
 * Get file count for the current user
 * @param signer - Ethers signer
 * @returns Total number of files uploaded
 */
export async function getFileCount(signer: JsonRpcSigner): Promise<number> {
  try {
    const files = await getMyFiles(signer);
    return files.length;
  } catch (error: any) {
    console.error('Error fetching file count:', error);
    return 0;
  }
}

/**
 * Delete a file from blockchain
 * @param signer - Ethers signer
 * @param index - File index to delete
 * @returns Transaction receipt
 */

