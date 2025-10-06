// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract IncidentManager {

    // Struct to store incident data
    struct Incident {
        uint id;
        string description;
        address reportedBy;
        uint256 timestamp;
    }

    // Mapping from incident ID to Incident
    mapping(uint => Incident) public incidents;
    // Counter for generating unique incident IDs
    uint public incidentCounter;

    // Event to log new incidents
    event IncidentReported(uint id, string description, address reportedBy, uint256 timestamp);

    // Function to report a new incident
    function reportIncident(string memory _description) public {
        incidentCounter++;
        incidents[incidentCounter] = Incident({
            id: incidentCounter,
            description: _description,
            reportedBy: msg.sender,
            timestamp: block.timestamp
        });

        emit IncidentReported(incidentCounter, _description, msg.sender, block.timestamp);
    }

    // Function to fetch incident data by ID
    function getIncident(uint _id) public view returns (uint, string memory, address, uint256) {
        Incident memory incident = incidents[_id];
        return (incident.id, incident.description, incident.reportedBy, incident.timestamp);
    }
}