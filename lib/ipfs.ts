import axios from 'axios';

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload file to IPFS using Pinata API
 * @param file - File to upload
 * @returns IPFS CID (hash)
 */
export async function uploadToIPFS(file: File): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT is not configured');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<PinataUploadResponse>(
      PINATA_API_URL,
      formData,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.IpfsHash) {
      throw new Error('Failed to get IPFS hash from Pinata');
    }

    return response.data.IpfsHash;
  } catch (error: any) {
    console.error('IPFS upload error:', error);
    const message = error.response?.data?.error?.details || error.message;
    throw new Error(`IPFS upload failed: ${message}`);
  }
}

/**
 * Get IPFS gateway URL for a CID
 * @param cid - IPFS content ID (hash)
 * @returns Full URL to access the file via gateway
 */
export function getIPFSUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Get alternative IPFS gateway URLs (for redundancy)
 * @param cid - IPFS content ID (hash)
 * @returns Array of gateway URLs
 */
export function getIPFSGatewayUrls(cid: string): string[] {
  return [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
  ];
}
