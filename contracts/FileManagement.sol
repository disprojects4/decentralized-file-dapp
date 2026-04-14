// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FileManagement
 * @dev A decentralized file management system storing file metadata on BSC
 */
contract FileManagement {
    
    // File metadata structure
    struct File {
        string fileName;
        string fileType;
        string fileHash;    // IPFS CID
        uint256 timestamp;
        address owner;
    }
    
    // Mapping to store files for each user
    mapping(address => File[]) private userFiles;
    
    // Event emitted when a file is uploaded
    event FileUploaded(
        address indexed owner,
        string fileName,
        string fileHash,
        uint256 timestamp
    );
    
    /**
     * @dev Upload a file to the blockchain
     * @param _fileName Name of the file
     * @param _fileType MIME type of the file (e.g., "image/png")
     * @param _fileHash IPFS CID (content identifier/hash)
     */
    function uploadFile(
        string memory _fileName,
        string memory _fileType,
        string memory _fileHash
    ) public {
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        require(bytes(_fileType).length > 0, "File type cannot be empty");
        require(bytes(_fileHash).length > 0, "File hash cannot be empty");
        
        File memory newFile = File({
            fileName: _fileName,
            fileType: _fileType,
            fileHash: _fileHash,
            timestamp: block.timestamp,
            owner: msg.sender
        });
        
        userFiles[msg.sender].push(newFile);
        
        emit FileUploaded(msg.sender, _fileName, _fileHash, block.timestamp);
    }
    
    /**
     * @dev Get all files uploaded by the calling user
     * @return Array of File structs for the caller
     */
    function getMyFiles() public view returns (File[] memory) {
        return userFiles[msg.sender];
    }
    
    /**
     * @dev Get total count of files uploaded by the calling user
     * @return Number of files
     */
    function getMyFilesCount() public view returns (uint256) {
        return userFiles[msg.sender].length;
    }
    
    /**
     * @dev Get a specific file by index
     * @param _index Index of the file in user's file list
     * @return File struct at the given index
     */
    function getFileByIndex(uint256 _index) public view returns (File memory) {
        require(_index < userFiles[msg.sender].length, "File index out of bounds");
        return userFiles[msg.sender][_index];
    }
    
    /**
     * @dev Delete a file from storage (optional feature)
     * @param _index Index of the file to delete
     */
    function deleteFile(uint256 _index) public {
        require(_index < userFiles[msg.sender].length, "File index out of bounds");
        
        // Remove file by swapping with last element and popping
        userFiles[msg.sender][_index] = userFiles[msg.sender][userFiles[msg.sender].length - 1];
        userFiles[msg.sender].pop();
    }
    
    /**
     * @dev Update file metadata (only fileName can be updated)
     * @param _index Index of the file to update
     * @param _newFileName New file name
     */
    function updateFileName(uint256 _index, string memory _newFileName) public {
        require(_index < userFiles[msg.sender].length, "File index out of bounds");
        require(bytes(_newFileName).length > 0, "New file name cannot be empty");
        
        userFiles[msg.sender][_index].fileName = _newFileName;
    }
}
