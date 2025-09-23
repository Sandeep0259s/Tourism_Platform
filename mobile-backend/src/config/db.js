require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;
if (!uri) {
    throw new Error("MONGO_URI is not defined in your .env file.");
}

// Includes the fix for the SSL/TLS connection error
const client = new MongoClient(uri, {
  tlsAllowInvalidCertificates: true, // This is the fix
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
    if (db) return db;
    try {
        await client.connect();
        db = client.db("mobile_app_data"); // The name of our database
        console.log("✅ Successfully connected to MongoDB Atlas!");
        return db;
    } catch (err) {
        console.error("❌ Could not connect to MongoDB Atlas", err);
        process.exit(1);
    }
}

// A helper function to get the database instance from other files
const getDb = () => {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB first.");
    }
    return db;
};

module.exports = { connectDB, getDb };