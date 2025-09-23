// Load environment variables
require("dotenv").config();

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load compiled contract
const compiledContractPath = path.resolve(__dirname, "../build", "TouristID.json");
const compiledContract = JSON.parse(fs.readFileSync(compiledContractPath, "utf8"));

// Get ABI + Bytecode
const abi = compiledContract.abi;
const bytecode = compiledContract.evm.bytecode.object;

if (!abi || !bytecode) {
    throw new Error("ABI or Bytecode not found in compiled contract.");
}

// Load private key
const privateKey = process.env.GANACHE_PRIVATE_KEY;
if (!privateKey) {
    throw new Error("Please set your GANACHE_PRIVATE_KEY in a .env file");
}

// Provider
const providerUrl = "http://127.0.0.1:7545";

async function main() {
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Using wallet: ${wallet.address}`);

    // Deploy
    const TouristIDFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log("Deploying TouristID contract...");

    const touristIDContract = await TouristIDFactory.deploy({ gasLimit: 3000000 });

    console.log("Transaction hash:", touristIDContract.deploymentTransaction().hash);

    await touristIDContract.waitForDeployment();

    const deployedAddress = await touristIDContract.getAddress();
    console.log(`✅ TouristID contract deployed to: ${deployedAddress}`);

    // Save deployed address
    fs.writeFileSync(
        path.resolve(__dirname, "../build", "contract-address.json"),
        JSON.stringify({ address: deployedAddress }, null, 2)
    );
    console.log("📁 Saved contract address to build/contract-address.json");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
