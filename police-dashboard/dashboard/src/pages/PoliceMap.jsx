import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  Polygon,
  InfoWindow,
  StandaloneSearchBox,
  useLoadScript,
} from "@react-google-maps/api";
import axios from "axios";

const mapContainerStyle = { 
  width: "100%", 
  height: "600px",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
};
const defaultCenter = { lat: 26.8467, lng: 80.9462 };
const defaultZoom = 12;

// Backend configuration
const BACKEND_URL = 'http://localhost:5001';

export default function PoliceMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [tourists, setTourists] = useState([]);
  const [dangerZones, setDangerZones] = useState([]);
  const [currentZonePoints, setCurrentZonePoints] = useState([]);
  const [zoneForm, setZoneForm] = useState({
    name: "",
    safetyScore: 50,
    riskLevel: "medium",
    description: ""
  });
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);
  const [hoveredTourist, setHoveredTourist] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const searchBoxRef = useRef(null);
  const mapRef = useRef(null);

  // Custom marker icons
  const touristIcon = {
    url: "data:image/svg+xml;base64," + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="#3B82F6" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="12" r="4" fill="white"/>
        <path d="M16 16 C12 16 8 20 8 24 L24 24 C24 20 20 16 16 16 Z" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 16 }
  };

  const panicIcon = {
    url: "data:image/svg+xml;base64," + btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="white" stroke-width="3"/>
        <circle cx="20" cy="20" r="8" fill="white"/>
        <path d="M20 12 L20 28" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <path d="M12 20 L28 20" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <circle cx="20" cy="20" r="3" fill="#EF4444"/>
      </svg>
    `),
    scaledSize: { width: 40, height: 40 },
    anchor: { x: 20, y: 20 }
  };

  // 🔄 FETCH DATA FROM BACKEND
  const fetchTourists = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/alerts/active`);
      if (response.data.success) {
        // Transform backend data to match frontend format
        const transformedTourists = response.data.alerts.map(alert => ({
          id: alert._id,
          name: alert.name || `Tourist ${alert._id.slice(-4)}`,
          lat: alert.currentLocation?.lat || defaultCenter.lat,
          lng: alert.currentLocation?.lng || defaultCenter.lng,
          panic: alert.panicActive || false,
          lastUpdate: new Date(alert.updatedAt || alert.createdAt),
          emergencyContact: alert.emergencyContact || "Not provided"
        }));
        setTourists(transformedTourists);
      }
    } catch (error) {
      console.error("Error fetching tourists:", error);
      setMessage({ type: 'error', text: 'Failed to load tourists data' });
    }
  };

  const fetchDangerZones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/zones`);
      if (response.data.success) {
        // Transform backend zones to match frontend format
        const transformedZones = response.data.zones.map(zone => ({
          id: zone._id,
          name: zone.name,
          path: zone.coordinates || [],
          safetyScore: zone.safetyScore || 50,
          riskLevel: zone.riskLevel || "medium",
          description: zone.description || "",
          center: zone.center || calculateCenter(zone.coordinates),
          currentTourists: zone.currentTourists || 0,
          touristsInPanic: zone.touristsInPanic || 0,
          createdAt: new Date(zone.createdAt).toLocaleString()
        }));
        setDangerZones(transformedZones);
      }
    } catch (error) {
      console.error("Error fetching danger zones:", error);
      setMessage({ type: 'error', text: 'Failed to load danger zones' });
    } finally {
      setLoading(false);
    }
  };

  // 🎯 SAVE DANGER ZONE TO BACKEND
  const saveDangerZone = async (zoneData) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/zones`, {
        name: zoneData.name,
        coordinates: zoneData.path,
        safetyScore: zoneData.safetyScore,
        riskLevel: zoneData.riskLevel,
        description: zoneData.description,
        createdBy: "police_dashboard"
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Danger zone saved successfully!' });
        return response.data.zone;
      }
    } catch (error) {
      console.error("Error saving danger zone:", error);
      setMessage({ type: 'error', text: 'Failed to save danger zone' });
      throw error;
    }
  };

  // 🗑️ DELETE DANGER ZONE FROM BACKEND
  const deleteDangerZone = async (zoneId) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/zones/${zoneId}`);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Danger zone deleted successfully!' });
        return true;
      }
    } catch (error) {
      console.error("Error deleting danger zone:", error);
      setMessage({ type: 'error', text: 'Failed to delete danger zone' });
      return false;
    }
  };

  // 📊 UPDATE SAFETY SCORE IN BACKEND
  const updateZoneSafetyScore = async (zoneId, score) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/zones/${zoneId}/score`, {
        score: score
      });
      return response.data.success;
    } catch (error) {
      console.error("Error updating safety score:", error);
      return false;
    }
  };

  // 🔄 REAL-TIME DATA SYNC
  useEffect(() => {
    fetchTourists();
    fetchDangerZones();

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchTourists();
      fetchDangerZones();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // 🎯 CALCULATE CENTER OF POLYGON
  const calculateCenter = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return defaultCenter;
    
    const avgLat = coordinates.reduce((sum, p) => sum + p.lat, 0) / coordinates.length;
    const avgLng = coordinates.reduce((sum, p) => sum + p.lng, 0) / coordinates.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((event) => {
    setCurrentZonePoints(prev => [
      ...prev,
      { lat: event.latLng.lat(), lng: event.latLng.lng() }
    ]);
  }, []);

  const undoLastPoint = () => setCurrentZonePoints(prev => prev.slice(0, -1));
  
  const cancelDrawing = () => {
    setCurrentZonePoints([]);
    setZoneForm({ name: "", safetyScore: 50, riskLevel: "medium", description: "" });
  };

  // 🎯 ENHANCED FINISH ZONE WITH BACKEND INTEGRATION
  const finishZone = async () => {
    if (currentZonePoints.length < 3) {
      setMessage({ type: 'error', text: 'A danger zone requires at least 3 points.' });
      return;
    }
    if (!zoneForm.name.trim()) {
      setMessage({ type: 'error', text: 'Please provide a name for the danger zone.' });
      return;
    }

    try {
      const touristsInZone = tourists.filter(t => pointInPolygon(t, currentZonePoints));
      const touristsInPanic = touristsInZone.filter(t => t.panic).length;

      const newZone = {
        name: zoneForm.name,
        path: [...currentZonePoints],
        safetyScore: zoneForm.safetyScore,
        riskLevel: zoneForm.riskLevel,
        description: zoneForm.description,
        currentTourists: touristsInZone.length,
        touristsInPanic: touristsInPanic
      };

      // Save to backend
      const savedZone = await saveDangerZone(newZone);
      
      if (savedZone) {
        // Add to local state with backend ID
        setDangerZones(prev => [...prev, {
          ...newZone,
          id: savedZone._id,
          center: calculateCenter(newZone.path),
          createdAt: new Date().toLocaleString()
        }]);
        
        cancelDrawing();
        
        // Zoom to the new zone
        const center = calculateCenter(newZone.path);
        setCenter(center);
        setZoom(15);
      }
    } catch (error) {
      console.error("Error creating zone:", error);
    }
  };

  // 🎯 ENHANCED DELETE ZONE WITH BACKEND INTEGRATION
  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this danger zone?')) return;

    const success = await deleteDangerZone(zoneId);
    if (success) {
      setDangerZones(prev => prev.filter(z => z.id !== zoneId));
      setSelectedZone(null);
    }
  };

  // 🎯 ENHANCED SAFETY SCORE UPDATE WITH BACKEND INTEGRATION
  const handleUpdateSafetyScore = async (zoneId, score) => {
    const success = await updateZoneSafetyScore(zoneId, score);
    if (success) {
      setDangerZones(prev => prev.map(z => 
        z.id === zoneId ? { ...z, safetyScore: Math.max(0, Math.min(100, score)) } : z
      ));
    }
  };

  // Point in Polygon algorithm
  const pointInPolygon = (point, polygon) => {
    if (!polygon || polygon.length < 3) return false;
    
    const x = point.lng;
    const y = point.lat;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng;
      const yi = polygon[i].lat;
      const xj = polygon[j].lng;
      const yj = polygon[j].lat;

      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const getColorForScore = (score) => {
    if (score >= 80) return "#EF4444";
    if (score >= 60) return "#F59E0B";
    if (score >= 40) return "#FBBF24";
    if (score >= 20) return "#10B981";
    return "#059669";
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return '#DC2626';
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const onPlacesChanged = () => {
    if (!searchBoxRef.current) return;
    
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        const newCenter = { lat: location.lat(), lng: location.lng() };
        
        setCenter(newCenter);
        setZoom(16);
      }
    }
  };

  const zoomToZone = (zone) => {
    setCenter(zone.center);
    setZoom(15);
    setSelectedZone(zone);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loadError) return <div style={{ padding: '20px', color: 'red' }}>Error loading Google Maps</div>;
  if (!isLoaded) return <div style={{ padding: '20px' }}>Loading map...</div>;

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e293b', fontSize: '2.5rem', marginBottom: '10px' }}>🚓 Police Safety Dashboard</h1>
        <p>Monitor tourist safety and manage danger zones in real-time</p>
        
        {/* Status Message */}
        {message.text && (
          <div style={{ 
            padding: '12px', 
            margin: '10px 0', 
            borderRadius: '6px',
            backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#dc2626'
          }}>
            {message.text}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading danger zones...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Panel */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div>
              <h3>Create Danger Zone</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Zone Name"
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm(prev => ({...prev, name: e.target.value}))}
                  style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                />
                <div>
                  <label>Safety Score: {zoneForm.safetyScore}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={zoneForm.safetyScore}
                    onChange={(e) => setZoneForm(prev => ({...prev, safetyScore: parseInt(e.target.value)}))}
                    style={{ width: '100%' }}
                  />
                </div>
                <select 
                  value={zoneForm.riskLevel}
                  onChange={(e) => setZoneForm(prev => ({...prev, riskLevel: e.target.value}))}
                  style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>
              
              {currentZonePoints.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ padding: '8px 16px', background: '#dbeafe', color: '#1e40af', borderRadius: '4px' }}>
                    Points: {currentZonePoints.length}
                  </div>
                  <button 
                    onClick={undoLastPoint}
                    style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Undo Last
                  </button>
                  <button 
                    onClick={cancelDrawing}
                    style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={finishZone}
                    style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Save Zone
                  </button>
                </div>
              )}
            </div>

            {/* Search Box */}
            <div style={{ marginTop: '16px' }}>
              <StandaloneSearchBox 
                onLoad={(ref) => (searchBoxRef.current = ref)} 
                onPlacesChanged={onPlacesChanged}
              >
                <input
                  type="text"
                  placeholder="🔍 Search for exact location, address, or landmark..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                />
              </StandaloneSearchBox>
            </div>
          </div>

          {/* Map Container */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <GoogleMap 
              mapContainerStyle={mapContainerStyle} 
              center={center} 
              zoom={zoom}
              onClick={onMapClick}
              onLoad={onMapLoad}
            >
              {/* Tourist Markers */}
              {tourists.map((tourist) => (
                <Marker
                  key={tourist.id}
                  position={{ lat: tourist.lat, lng: tourist.lng }}
                  icon={tourist.panic ? panicIcon : touristIcon}
                  onMouseOver={() => setHoveredTourist(tourist)}
                  onMouseOut={() => setHoveredTourist(null)}
                />
              ))}

              {/* Danger Zones */}
              {dangerZones.map((zone) => (
                <Polygon
                  key={zone.id}
                  paths={zone.path}
                  options={{
                    fillColor: getColorForScore(zone.safetyScore),
                    fillOpacity: 0.3,
                    strokeColor: getColorForScore(zone.safetyScore),
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                  }}
                  onClick={() => setSelectedZone(zone)}
                />
              ))}

              {/* Current Drawing Polygon */}
              {currentZonePoints.length > 0 && (
                <Polygon
                  paths={currentZonePoints}
                  options={{
                    fillColor: "#F59E0B",
                    fillOpacity: 0.2,
                    strokeColor: "#F59E0B",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                  }}
                />
              )}

              {/* Tourist Info Window */}
              {hoveredTourist && (
                <InfoWindow
                  position={{ lat: hoveredTourist.lat, lng: hoveredTourist.lng }}
                  onCloseClick={() => setHoveredTourist(null)}
                >
                  <div style={{ padding: '8px', minWidth: '200px' }}>
                    <div style={{ color: hoveredTourist.panic ? '#ef4444' : '#10b981', fontWeight: 'bold', marginBottom: '8px' }}>
                      {hoveredTourist.panic ? '🚨 PANIC MODE' : '✅ SAFE'}
                    </div>
                    <h4 style={{ margin: '0 0 8px 0' }}>{hoveredTourist.name}</h4>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>Contact: {hoveredTourist.emergencyContact}</p>
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                      Last update: {hoveredTourist.lastUpdate.toLocaleTimeString()}
                    </p>
                  </div>
                </InfoWindow>
              )}

              {/* Zone Info Window */}
              {selectedZone && (
                <InfoWindow
                  position={selectedZone.center}
                  onCloseClick={() => setSelectedZone(null)}
                >
                  <div style={{ padding: '8px', minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>{selectedZone.name}</h4>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: getRiskLevelColor(selectedZone.riskLevel), 
                        color: 'white', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {selectedZone.riskLevel.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '14px' }}>Score: {selectedZone.safetyScore}</span>
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>Tourists: {selectedZone.currentTourists}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>
                      In Panic: <strong>{selectedZone.touristsInPanic}</strong>
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>

          {/* Danger Zones Table */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Danger Zones Management</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ padding: '6px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '20px', fontSize: '14px' }}>
                  Zones: {dangerZones.length}
                </span>
                <span style={{ padding: '6px 12px', background: '#d1fae5', color: '#065f46', borderRadius: '20px', fontSize: '14px' }}>
                  Tourists: {tourists.length}
                </span>
                <span style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', borderRadius: '20px', fontSize: '14px' }}>
                  Panic Alerts: {tourists.filter(t => t.panic).length}
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7fafc' }}>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Zone Details</th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Safety Metrics</th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Tourists</th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dangerZones.map((zone) => (
                    <tr key={zone.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{zone.name}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{zone.description}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={zone.safetyScore}
                            onChange={(e) => handleUpdateSafetyScore(zone.id, parseInt(e.target.value))}
                            style={{ width: '100px' }}
                          />
                          <span style={{ 
                            padding: '4px 8px', 
                            background: getColorForScore(zone.safetyScore), 
                            color: 'white', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {zone.safetyScore}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{zone.currentTourists}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>tourists in zone</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => zoomToZone(zone)}
                            style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                          >
                            Zoom
                          </button>
                          <button 
                            onClick={() => handleDeleteZone(zone.id)}
                            style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}