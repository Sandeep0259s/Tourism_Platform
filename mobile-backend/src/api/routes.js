const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getDb } = require("../config/db");
const { ObjectId } = require("mongodb");

const BLOCKCHAIN_BACKEND_URL = process.env.BLOCKCHAIN_BACKEND_URL;

// --- Tourist Data Sync ---
router.post('/tourist/sync', async (req, res) => {
    const { touristAddress } = req.body;
    if (!touristAddress) return res.status(400).json({ message: "touristAddress is required." });
    try {
        const response = await axios.get(`${BLOCKCHAIN_BACKEND_URL}/api/tourist/${touristAddress}`);
        const blockchainData = response.data.tourist;
        
        const db = getDb();
        const touristDoc = {
            _id: touristAddress,
            name: blockchainData.name,
            emergencyContact: blockchainData.emergencyContact,
            validUntil: new Date(parseInt(blockchainData.validUntil) * 1000),
            safetyScore: 95,
            locationHistory: [],
            panicActive: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('tourists').updateOne(
            { _id: touristAddress }, 
            { $set: touristDoc }, 
            { upsert: true }
        );
        console.log(`✅ Synced data for ${touristAddress}`);
        res.json({ success: true, data: touristDoc });
    } catch (err) {
        console.error("Error syncing tourist data:", err);
        res.status(500).json({ success: false, message: "Failed to sync tourist data." });
    }
});

// --- Panic Alert Routes ---
router.post('/alert/panic', async (req, res) => {
    const { touristAddress, location } = req.body;
    try {
        const db = getDb();
        await db.collection('tourists').updateOne(
            { _id: touristAddress },
            { 
                $set: { 
                    panicActive: true, 
                    currentLocation: { ...location, timestamp: new Date() },
                    updatedAt: new Date()
                } 
            }
        );
        console.log(`🚨 PANIC ALERT triggered for ${touristAddress}`);
        res.json({ success: true, message: "Panic alert logged." });
    } catch (err) { 
        console.error("Error logging panic alert:", err);
        res.status(500).json({ success: false, message: "Failed to log panic alert." }); 
    }
});

// --- Resolve Alert ---
router.put('/alerts/:alertId/resolve', async (req, res) => {
    const { alertId } = req.params;
    
    try {
        const db = getDb();
        
        const result = await db.collection('tourists').updateOne(
            { _id: alertId },
            { 
                $set: { 
                    panicActive: false,
                    updatedAt: new Date()
                } 
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Tourist/Alert not found." 
            });
        }
        
        console.log(`✅ Alert resolved for tourist: ${alertId}`);
        res.json({ 
            success: true, 
            message: "Alert resolved successfully." 
        });
        
    } catch (err) {
        console.error("Error resolving alert:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to resolve alert." 
        });
    }
});

// --- Trigger Panic Alert ---
router.put('/tourist/:touristId/panic', async (req, res) => {
    const { touristId } = req.params;
    const { location } = req.body;
    
    try {
        const db = getDb();
        
        const updateData = {
            panicActive: true,
            updatedAt: new Date()
        };
        
        if (location) {
            updateData.currentLocation = {
                ...location,
                timestamp: new Date()
            };
        }
        
        const result = await db.collection('tourists').updateOne(
            { _id: touristId },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Tourist not found." 
            });
        }
        
        console.log(`🚨 PANIC ALERT triggered for tourist: ${touristId}`);
        res.json({ 
            success: true, 
            message: "Panic alert triggered successfully." 
        });
        
    } catch (err) {
        console.error("Error triggering panic alert:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to trigger panic alert." 
        });
    }
});

router.get('/alerts/active', async (req, res) => {
    try {
        const db = getDb();
        const activeAlerts = await db.collection('tourists').find({ panicActive: true }).toArray();
        res.json({ success: true, alerts: activeAlerts });
    } catch (err) { 
        console.error("Error fetching active alerts:", err);
        res.status(500).json({ success: false, message: "Failed to fetch active alerts." }); 
    }
});

// === ENHANCED DANGER ZONE ROUTES ===

// ✅ Get all danger zones with real-time tourist counts
router.get('/zones', async (req, res) => {
    try {
        const db = getDb();
        const zones = await db.collection('dangerZones').find({ isActive: true }).toArray();
        
        // Enhance zones with real-time tourist data
        const zonesWithTourists = await Promise.all(
            zones.map(async (zone) => {
                const touristsInZone = await db.collection('tourists').find({
                    'currentLocation.lat': { $exists: true },
                    'currentLocation.lng': { $exists: true },
                    panicActive: false // Only count non-panicking tourists
                }).toArray();
                
                const touristsCount = touristsInZone.filter(tourist => 
                    pointInPolygon(
                        { lat: tourist.currentLocation.lat, lng: tourist.currentLocation.lng },
                        zone.coordinates
                    )
                ).length;
                
                return {
                    ...zone,
                    currentTourists: touristsCount,
                    alertLevel: calculateAlertLevel(zone.safetyScore, touristsCount)
                };
            })
        );
        
        res.json({ success: true, zones: zonesWithTourists });
    } catch (err) { 
        console.error("Error fetching zones:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// ✅ Create new danger zone
router.post('/zones', async (req, res) => {
    try {
        const { name, description, coordinates, safetyScore, riskLevel, zoneType, createdBy } = req.body;
        
        if (!name || !coordinates || coordinates.length < 3) {
            return res.status(400).json({ 
                success: false, 
                message: "Name and at least 3 coordinates are required." 
            });
        }
        
        const db = getDb();
        const newZone = {
            name,
            description: description || "",
            coordinates: coordinates.map((coord, index) => ({
                lat: parseFloat(coord.lat),
                lng: parseFloat(coord.lng),
                order: index
            })),
            safetyScore: safetyScore || 50,
            riskLevel: riskLevel || "medium",
            zoneType: zoneType || "general",
            createdBy: createdBy || "system",
            isActive: true,
            historicalIncidents: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection('dangerZones').insertOne(newZone);
        res.json({ 
            success: true, 
            zone: { _id: result.insertedId, ...newZone },
            message: "Danger zone created successfully."
        });
    } catch (err) { 
        console.error("Error creating zone:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// ✅ Update zone safety score
router.put('/zones/:id/score', async (req, res) => {
    try {
        const { score } = req.body;
        const db = getDb();
        
        await db.collection('dangerZones').updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $set: { 
                    safetyScore: Math.min(100, Math.max(0, score)),
                    updatedAt: new Date()
                } 
            }
        );
        
        res.json({ success: true, message: "Safety score updated." });
    } catch (err) {
        console.error("Error updating zone score:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Delete zone (soft delete)
router.delete('/zones/:id', async (req, res) => {
    try {
        const db = getDb();
        const result = await db.collection('dangerZones').updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $set: { 
                    isActive: false,
                    updatedAt: new Date()
                } 
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Zone not found" });
        }
        
        res.json({ success: true, message: "Zone deactivated successfully." });
    } catch (err) { 
        console.error("Error deleting zone:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// ✅ Get tourists currently in a specific danger zone
router.get('/zones/:zoneId/tourists', async (req, res) => {
    try {
        const db = getDb();
        const zone = await db.collection('dangerZones').findOne({ 
            _id: new ObjectId(req.params.zoneId) 
        });
        
        if (!zone) {
            return res.status(404).json({ success: false, message: "Zone not found." });
        }
        
        const allTourists = await db.collection('tourists').find({
            'currentLocation.lat': { $exists: true },
            'currentLocation.lng': { $exists: true }
        }).toArray();
        
        const touristsInZone = allTourists.filter(tourist => 
            pointInPolygon(
                { lat: tourist.currentLocation.lat, lng: tourist.currentLocation.lng },
                zone.coordinates
            )
        );
        
        res.json({ 
            success: true, 
            tourists: touristsInZone,
            zone: zone.name,
            count: touristsInZone.length
        });
    } catch (err) {
        console.error("Error fetching zone tourists:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Check if a specific location is in any danger zone
router.post('/zones/check-location', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const db = getDb();
        
        const dangerZones = await db.collection('dangerZones').find({ 
            isActive: true 
        }).toArray();
        
        const zonesContainingPoint = dangerZones.filter(zone => 
            pointInPolygon({ lat: parseFloat(lat), lng: parseFloat(lng) }, zone.coordinates)
        );
        
        res.json({ 
            success: true, 
            inDangerZone: zonesContainingPoint.length > 0,
            zones: zonesContainingPoint,
            message: zonesContainingPoint.length > 0 ? 
                `Location is in ${zonesContainingPoint.length} danger zone(s)` :
                "Location is safe"
        });
    } catch (err) {
        console.error("Error checking location:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// === HELPER FUNCTIONS ===

// Point in Polygon algorithm
function pointInPolygon(point, polygon) {
    const x = point.lng, y = point.lat;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng, yi = polygon[i].lat;
        const xj = polygon[j].lng, yj = polygon[j].lat;
        
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        
        if (intersect) inside = !inside;
    }
    
    return inside;
}

// Calculate alert level based on safety score and tourist count
function calculateAlertLevel(safetyScore, touristCount) {
    const riskFactor = (100 - safetyScore) * 0.01;
    const densityFactor = Math.min(touristCount * 0.1, 1);
    const overallRisk = riskFactor * densityFactor;
    
    if (overallRisk > 0.7) return "critical";
    if (overallRisk > 0.5) return "high";
    if (overallRisk > 0.3) return "medium";
    return "low";
}

module.exports = router;