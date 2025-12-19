// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract EvidenceVault {
    struct Evidence {
        string fileHash;
        uint256 timestamp;
        address uploader;
    }

    mapping(string => Evidence) private evidences;
    string[] public allHashes;

    event EvidenceStored(string indexed fileHash, address indexed uploader);

    function storeEvidence(string memory _fileHash) public {
        require(evidences[_fileHash].timestamp == 0, "Evidence already exists");
        
        evidences[_fileHash] = Evidence({
            fileHash: _fileHash,
            timestamp: block.timestamp,
            uploader: msg.sender
        });
        
        allHashes.push(_fileHash);
        emit EvidenceStored(_fileHash, msg.sender);
    }

    function getEvidence(string memory _fileHash) public view returns (string memory, uint256, address) {
        Evidence memory e = evidences[_fileHash];
        require(e.timestamp != 0, "Evidence not found");
        return (e.fileHash, e.timestamp, e.uploader);
    }

    function getAllHashes() public view returns (string[] memory) {
        return allHashes;
    }
}