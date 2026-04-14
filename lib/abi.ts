// ABI for FileStorage Smart Contract
// Updated for the new contract structure

export const FILE_MANAGEMENT_ABI = [
  {
    type: "function",
    name: "uploadFile",
    inputs: [
      { name: "_name", type: "string", internalType: "string" },
      { name: "_type", type: "string", internalType: "string" },
      { name: "_cid", type: "string", internalType: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getMyFiles",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "name", type: "string", internalType: "string" },
          { name: "fileType", type: "string", internalType: "string" },
          { name: "cid", type: "string", internalType: "string" },
          { name: "timestamp", type: "uint256", internalType: "uint256" }
        ],
        internalType: "struct FileStorage.File[]"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getFile",
    inputs: [
      { name: "index", type: "uint256", internalType: "uint256" }
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "name", type: "string", internalType: "string" },
          { name: "fileType", type: "string", internalType: "string" },
          { name: "cid", type: "string", internalType: "string" },
          { name: "timestamp", type: "uint256", internalType: "uint256" }
        ],
        internalType: "struct FileStorage.File"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "deleteFile",
    inputs: [
      { name: "index", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getFileCount",
    inputs: [],
    outputs: [
      { name: "", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "FileUploaded",
    inputs: [
      { name: "user", type: "address", indexed: true, internalType: "address" },
      { name: "name", type: "string", indexed: false, internalType: "string" },
      { name: "cid", type: "string", indexed: false, internalType: "string" },
      { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" }
    ]
  },
  {
    type: "event",
    name: "FileDeleted",
    inputs: [
      { name: "user", type: "address", indexed: true, internalType: "address" },
      { name: "index", type: "uint256", indexed: false, internalType: "uint256" }
    ]
  }
] as const;
