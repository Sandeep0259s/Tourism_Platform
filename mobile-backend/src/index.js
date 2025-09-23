require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db'); // Imports our DB connector
const apiRoutes = require('./api/routes.js');   // Imports our routes

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
// This tells the server to use all the routes from our api/routes.js file
// and prefix them with /api
app.use('/api', apiRoutes);

// --- Start the Server ---
const PORT = process.env.PORT || 5001;

// We connect to the database first, and only then do we start the web server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Mobile Backend server running on http://localhost:${PORT}`);
    });
});