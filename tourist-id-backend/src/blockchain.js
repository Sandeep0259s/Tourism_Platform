require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// --- 1. Load Environment Variables ---
const { RPC_URL, ADMIN_PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

if (!RPC_URL || !ADMIN_PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.error("❌ Fatal Error: Missing required environment variables.");
    process.exit(1);
}

// --- 2. Set up Provider and Admin Wallet ---
const provider = new ethers.JsonRpcProvider(RPC_URL);
const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

console.log(`✅ Connected to blockchain via ${RPC_URL}`);
console.log(`🔑 Admin wallet address: ${adminWallet.address}`);

// --- 3. Load Contract ABI from the LOCAL build folder ---
// This is the corrected, simpler path.
const abiPath = path.join(__dirname, 'build', 'TouristID.json');

if (!fs.existsSync(abiPath)) {
    console.error(`❌ Fatal Error: Contract ABI not found at path: ${abiPath}`);
    console.error("Please ensure you have copied the TouristID.json file into the backend's build folder.");
    process.exit(1);
}

const contractJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const contractABI = contractJson.abi;

// --- 4. Create and Export the Contract Instance ---
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, adminWallet);

console.log(`🔗 Contract instance created for address: ${CONTRACT_ADDRESS}`);

module.exports = contract;