// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Tourist Digital ID Contract
/// @notice Issues and manages temporary digital IDs for tourists
contract TouristID {
    struct Tourist {
        string name;
        string passportOrAadhaar;
        string itinerary;
        string emergencyContact;
        uint256 validUntil; // Expiry timestamp
        bool exists;
    }

    mapping(address => Tourist) private tourists;
    address public admin;

    /// @notice Emitted when a new tourist ID is created
    event TouristRegistered(address indexed tourist, string name, uint256 validUntil);

    /// @notice Emitted when a tourist ID is updated
    event TouristUpdated(address indexed tourist, string itinerary, string emergencyContact);

    /// @notice Emitted when a tourist ID expires
    event TouristExpired(address indexed tourist);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier touristExists(address _tourist) {
        require(tourists[_tourist].exists, "Tourist not found");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Register a new tourist and issue a digital ID
    function registerTourist(
        address _tourist,
        string memory _name,
        string memory _passportOrAadhaar,
        string memory _itinerary,
        string memory _emergencyContact,
        uint256 _validUntil
    ) external onlyAdmin {
        require(!tourists[_tourist].exists, "Tourist already registered");
        require(_validUntil > block.timestamp, "Expiry must be in the future");

        tourists[_tourist] = Tourist({
            name: _name,
            passportOrAadhaar: _passportOrAadhaar,
            itinerary: _itinerary,
            emergencyContact: _emergencyContact,
            validUntil: _validUntil,
            exists: true
        });

        emit TouristRegistered(_tourist, _name, _validUntil);
    }

    /// @notice Update tourist itinerary or emergency contact
    function updateTourist(
        address _tourist,
        string memory _itinerary,
        string memory _emergencyContact
    ) external onlyAdmin touristExists(_tourist) {
        tourists[_tourist].itinerary = _itinerary;
        tourists[_tourist].emergencyContact = _emergencyContact;

        emit TouristUpdated(_tourist, _itinerary, _emergencyContact);
    }

    /// @notice Get details of a tourist
    function getTourist(address _tourist)
        external
        view
        touristExists(_tourist)
        returns (Tourist memory)
    {
        return tourists[_tourist];
    }

    /// @notice Check if a tourist ID is valid
    function isTouristValid(address _tourist)
        external
        view
        touristExists(_tourist)
        returns (bool)
    {
        return tourists[_tourist].validUntil > block.timestamp;
    }

    /// @notice Expire a tourist ID manually
    function expireTourist(address _tourist) external onlyAdmin touristExists(_tourist) {
        tourists[_tourist].validUntil = block.timestamp;
        emit TouristExpired(_tourist);
    }
}
