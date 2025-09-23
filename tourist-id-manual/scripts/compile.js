const path = require("path");
const fs = require("fs");
const solc = require("solc");

// Path to your contract
const contractPath = path.resolve(__dirname, "../contracts", "TouristID.sol");
const source = fs.readFileSync(contractPath, "utf8");

// Compiler input
const input = {
  language: "Solidity",
  sources: {
    "TouristID.sol": {
      content: source,
    },
  },
  settings: {
    evmVersion: "london", // more stable
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

console.log("Compiling contract...");

// Compile the contract
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Error handling
if (output.errors) {
  output.errors.forEach((err) => {
    if (err.severity === "error") {
      console.error("❌ Error:", err.formattedMessage);
      process.exit(1);
    } else {
      console.warn("⚠️ Warning:", err.formattedMessage);
    }
  });
}

console.log("✅ Compilation successful!");

// Get the compiled contract data
const compiledContract = output.contracts["TouristID.sol"]["TouristID"];

// Create a build directory if it doesn't exist
const buildPath = path.resolve(__dirname, "../build");
if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath);
}

// Save the compiled contract ABI + Bytecode
fs.writeFileSync(
  path.resolve(buildPath, "TouristID.json"),
  JSON.stringify(compiledContract, null, 2)
);

console.log("📁 Compiled contract saved to build/TouristID.json");
