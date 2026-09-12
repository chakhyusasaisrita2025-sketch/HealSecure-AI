// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HealSecureAudit {
    struct AuditRecord {
        string eventId;
        string eventType;
        string eventHash;
        string previousHash;
        uint256 timestamp;
    }

    AuditRecord[] private auditRecords;

    event AuditRecorded(
        string eventId,
        string eventType,
        string eventHash,
        string previousHash,
        uint256 timestamp
    );

    function recordAudit(
        string memory eventId,
        string memory eventType,
        string memory eventHash,
        string memory previousHash
    ) public {
        AuditRecord memory newRecord = AuditRecord({
            eventId: eventId,
            eventType: eventType,
            eventHash: eventHash,
            previousHash: previousHash,
            timestamp: block.timestamp
        });

        auditRecords.push(newRecord);

        emit AuditRecorded(
            eventId,
            eventType,
            eventHash,
            previousHash,
            block.timestamp
        );
    }

    function getAuditCount() public view returns (uint256) {
        return auditRecords.length;
    }

    function getAuditRecord(
        uint256 index
    )
        public
        view
        returns (
            string memory eventId,
            string memory eventType,
            string memory eventHash,
            string memory previousHash,
            uint256 timestamp
        )
    {
        AuditRecord memory record = auditRecords[index];

        return (
            record.eventId,
            record.eventType,
            record.eventHash,
            record.previousHash,
            record.timestamp
        );
    }
}