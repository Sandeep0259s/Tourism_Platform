const express = require("express");
const router = express.Router(); // ✅ This should use Express's built-in Router
const contract = require("./blockchain");
const wallet = contract.runner;

// ✅ Register tourist
router.post("/register", async (req, res) => {
  try {
    console.log("📥 Received registration request:", req.body);
    
    const { tourist, name, passportOrAadhaar, itinerary, emergencyContact, validUntil } = req.body;

    // Validate request body
    if (!tourist || !name || !passportOrAadhaar || !itinerary || !emergencyContact || !validUntil) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Log admin wallet
    console.log("👤 Registering tourist with admin wallet:", await wallet.getAddress());

    // Call registerTourist using admin wallet
    const tx = await contract.registerTourist(
      tourist,
      name,
      passportOrAadhaar,
      itinerary,
      emergencyContact,
      validUntil
    );

    console.log("⏳ Transaction submitted. Hash:", tx.hash);

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("✅ Tourist registered. Block number:", receipt.blockNumber);

    res.json({ 
      success: true, 
      message: "Tourist registered successfully", 
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    });
    
  } catch (err) {
    console.error("❌ Error in /register:", err);

    if (err.code === "CALL_EXCEPTION") {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction reverted. Make sure the admin wallet is correct and has enough balance." 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: err.message || "Internal server error" 
    });
  }
});

// ✅ Get tourist details
router.get("/tourist/:address", async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        message: "Tourist address is required" 
      });
    }

    console.log("🔍 Fetching tourist details for:", address);
    const tourist = await contract.getTourist(address);

    if (!tourist.name || tourist.name.trim() === "") {
      return res.status(404).json({ 
        success: false, 
        message: "Tourist not found" 
      });
    }

    res.json({
      success: true,
      tourist: {
        name: tourist.name,
        passportOrAadhaar: tourist.passportOrAadhaar,
        itinerary: tourist.itinerary,
        emergencyContact: tourist.emergencyContact,
        validUntil: tourist.validUntil.toString()
      },
    });
    
  } catch (err) {
    console.error("❌ Error in /tourist/:address:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch tourist details" 
    });
  }
});

// ✅ Check tourist validity
router.get("/tourist/:address/valid", async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        message: "Tourist address is required" 
      });
    }

    console.log("✅ Checking validity for:", address);
    const isValid = await contract.isTouristValid(address);
    
    res.json({ 
      success: true, 
      isValid 
    });
    
  } catch (err) {
    console.error("❌ Error in /tourist/:address/valid:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to check tourist validity" 
    });
  }
});

// ✅ Health check endpoint
router.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running", 
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;