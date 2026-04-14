# 🔐 Decentralized File Management System DApp

A complete, production-ready full-stack decentralized application (DApp) for uploading, storing, and managing files on the blockchain using IPFS (Pinata), Ethereum/BSC, and MetaMask.

## 🌟 Highlights

- ✅ **Connect MetaMask wallet** - Full Web3 integration with ethers.js v6
- ✅ **Upload to IPFS** - Decentralized file storage via Pinata API
- ✅ **Store on Blockchain** - File metadata stored on BSC smart contract
- ✅ **View & Manage Files** - Rich dashboard with file list and operations
- ✅ **Production Ready** - Clean code, error handling, security best practices
- ✅ **Fully Responsive** - Beautiful UI with Tailwind CSS
- ✅ **TypeScript** - Type-safe development experience
- ✅ **Real-time Notifications** - Toast system for all operations

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **MetaMask** browser extension installed
- **Pinata account** with JWT token (get free at [pinata.cloud](https://pinata.cloud))
- **Smart contract deployed** on BSC Testnet or Mainnet

### Installation (1 minute setup)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Edit .env.local with your config
# - Add CONTRACT_ADDRESS from BscScan
# - Add CONTRACT_ABI from your contract
# - Add PINATA_JWT token
# - Set CHAIN_ID (97 for testnet, 56 for mainnet)

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and connect your MetaMask wallet!

---

## 📖 Setup Guide

### Step 1: Deploy Smart Contract

Option A: Deploy using Remix

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create `FileManagement.sol` with code from `contracts/FileManagement.sol`
3. Compile with Solidity 0.8.0+
4. Deploy to BSC Testnet via Injected Web3 (MetaMask)
5. Copy the deployed contract address

Option B: Deploy using Hardhat/Truffle

```bash
npm install -g hardhat
hardhat deploy --network bsc-testnet
```

### Step 2: Get Pinata JWT Token

1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Go to **API Keys** section
3. Click **Generate API Key** or **New Key**
4. Set permissions for "Pinning" 
5. Copy the JWT token

### Step 3: Configure Environment

Create `.env.local`:

```env
# From your deployed contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Copy ABI from BscScan or Remix, then stringify it
NEXT_PUBLIC_CONTRACT_ABI=[]

# From Pinata dashboard
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Network configuration
NEXT_PUBLIC_CHAIN_ID=97  # 97=Testnet, 56=Mainnet
```

### Step 4: Get Test BNB (for Testnet)

Go to [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart):
- Paste your MetaMask address
- Request 0.5 BNB (enough for many transactions)

### Step 5: Run the App

```bash
npm run dev
# App is live at http://localhost:3000
```

---

## 📁 Project Structure

```
decentralized-file-dapp/
├── app/
│   ├── layout.tsx              # Root layout with UserProvider
│   ├── page.tsx                # Main dashboard page
│   ├── providers.tsx           # Web3 context & wallet logic
│   └── globals.css             # Tailwind global styles
├── components/
│   ├── Navbar.tsx              # Wallet connect button & address display
│   ├── Upload.tsx              # File upload & IPFS integration
│   ├── FileList.tsx            # Display user's files from contract
│   └── Toast.tsx               # Toast notification component
├── lib/
│   ├── contract.ts             # Smart contract interactions
│   ├── ipfs.ts                 # IPFS/Pinata upload logic
│   ├── types.ts                # TypeScript interfaces
│   ├── abi.ts                  # Smart contract ABI export
│   └── hooks.ts                # Custom React hooks (useUser)
├── contracts/
│   └── FileManagement.sol       # Example Solidity smart contract
├── public/                      # Static assets
├── .env.local.example           # Environment variables template
├── .env.local                   # Your configuration (git-ignored)
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind CSS configuration
├── SETUP.md                     # Detailed setup guide
└── README.md                    # This file
```

---

## 🧪 Testing Locally

### 1. Test Wallet Connection
- Open app and click "Connect Wallet"
- MetaMask popup appears
- Confirm connection
- Address appears in navbar

### 2. Test File Upload
- Select a small file (e.g., 1 MB text file)
- Click "Upload & Save to Blockchain"
- Watch toast notifications:
  - "Uploading file to IPFS..." (1-2 sec)
  - "Saving metadata to blockchain..." (5-30 sec)
  - "File uploaded successfully!" (success)
- Check [BscScan Testnet](https://testnet.bscscan.com) for TX

### 3. Test File Retrieval
- Refresh page
- FileList automatically fetches your files
- Click "View" to open in IPFS gateway
- Click "Copy" to get CID

### 4. Test Network Switching
- Try switching Networks in MetaMask
- App should alert you to switch to correct network
- MetaMask shows popup to add/switch network

---

## 🔑 Key Features

### Wallet Connection

The `UserProvider` manages:
- ✅ MetaMask wallet connection
- ✅ Network switching (auto-detects wrong network)
- ✅ Account changes (multi-sig wallets)
- ✅ Auto-reconnect on page load
- ✅ Disconnect functionality

### File Upload Flow

1. User selects file
2. Component uploads to IPFS via Pinata API
3. Receives IPFS CID (content hash)
4. Sends transaction to smart contract
5. User confirms in MetaMask
6. Transaction recorded on BSC
7. FileList refreshes automatically

### Smart Contract Interaction

```typescript
// Upload file
await uploadFileToBlockchain(signer, name, type, cid);

// Fetch user's files
const files = await getMyFiles(signer);
```

---

## 🌐 Network Configuration

### BSC Testnet (Development)
```
Chain ID:     97
RPC:          https://data-seed-prebsc-1-b.binance.org:8545
Explorer:     https://testnet.bscscan.com
Faucet:       https://testnet.binance.org/faucet-smart
```

### BSC Mainnet (Production)
```
Chain ID:     56
RPC:          https://bsc-dataseed.binance.org:8545
Explorer:     https://bscscan.com
```

---

## 🔒 Security Features

✅ Environment variables for secrets  
✅ No private keys stored  
✅ Input validation  
✅ Error handling  
✅ HTTPS only (production)  
✅ TypeScript for type safety  

---

## 📱 Available Commands

```bash
npm run dev       # Start development server
npm run build     # Build production bundle
npm start        # Start production server  
npm run lint     # Run ESLint checks
```

---

## 🐛 Troubleshooting

### MetaMask not found
Install MetaMask from https://metamask.io

### Wrong Network
MetaMask will auto-prompt to switch networks

### PINATA_JWT error
Add your token to `.env.local` from pinata.cloud

### CONTRACT_ADDRESS error
Deploy the contract and add address to `.env.local`

### Insufficient gas
Get test BNB from [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)

### IPFS upload failed
Check Pinata JWT is valid and has Pinning permissions

---

## 📚 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Ethers.js v6](https://docs.ethers.org/v6)  
- [Pinata Docs](https://docs.pinata.cloud)
- [IPFS](https://ipfs.io)
- [BSC Docs](https://docs.bnbchain.org)
- [Solidity](https://docs.soliditylang.org)

---

## 🚀 Deployment

### Deploy to Vercel

```bash
git add .
git commit -m "Deploy DApp"
git push origin main
```

Then set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CONTRACT_ABI`
- `NEXT_PUBLIC_PINATA_JWT`
- `NEXT_PUBLIC_CHAIN_ID`

---

## 💡 Next Steps

1. Customize UI with your branding
2. Add delete/share file features
3. Add file search and filtering
4. Add file permissions system
5. Add storage limits per user
6. Add payment system
7. Add analytics

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

---

## 📄 License

MIT License

---

## 🎓 Educational Focus

This project demonstrates:
- Web3 wallet integration (MetaMask)
- Smart contract interaction (ethers.js)
- IPFS integration (decentralized storage)
- Next.js app directory patterns
- React Context API
- TypeScript best practices
- Error handling and user feedback
- Responsive UI with Tailwind CSS

**Perfect for learning or as a production-ready starting point!**

---

**Built with ❤️ for Web3 developers | Production Ready | Open Source**
