import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import axios from 'axios';
import { AlertTriangle, User, Home, Phone, MapPin, Clock, X, CheckCircle } from 'lucide-react';

// --- Configuration ---
const MAP_ID = 'tourist-safety-map-dashboard';
const DEFAULT_CENTER = { lat: 17.0005, lng: 81.8040 };
const MOBILE_BACKEND_URL = 'http://localhost:5001';
const BLOCKCHAIN_BACKEND_URL = 'http://localhost:5000';

export default function Alerts() {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [activeAlerts, setActiveAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [touristDetails, setTouristDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [error, setError] = useState(null);
  
// Helper function to safely get coordinates from alert
const getAlertCoordinates = (alert) => {
  if (!alert || !alert.currentLocation) {
    console.warn('Alert or currentLocation is missing:', alert);
    return DEFAULT_CENTER;
  }

  // Handle different possible structures
  const lat = alert.currentLocation.lat || alert.currentLocation.latitude;
  const lng = alert.currentLocation.lng || alert.currentLocation.lon || alert.currentLocation.longitude;
  
  if (lat && lng) {
    return { 
      lat: parseFloat(lat), 
      lng: parseFloat(lng) 
    };
  }
  
  console.warn('Invalid coordinates in alert:', alert.currentLocation);
  return DEFAULT_CENTER;
};

  const fetchActiveAlerts = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(`${MOBILE_BACKEND_URL}/api/alerts/active`);
      console.log('📡 Alerts API Response:', response.data);
      
      if (response.data.success) {
        const alertsWithCoords = response.data.alerts.map(alert => ({
          ...alert,
          coordinates: getAlertCoordinates(alert)
        }));
        setActiveAlerts(alertsWithCoords);
      }
    } catch (error) {
      console.error("❌ Failed to fetch active alerts:", error);
      setError(`Failed to fetch alerts: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    fetchActiveAlerts();
    const interval = setInterval(fetchActiveAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchActiveAlerts]);

  const handleMarkerClick = async (alert) => {
    setSelectedAlert(alert);
    setLoadingDetails(true);
    setTouristDetails(null);
    setError(null);
    
    try {
      console.log('🔍 Fetching details for tourist:', alert.touristId);
      
      // Fetch tourist details from blockchain backend
      const response = await axios.get(`${BLOCKCHAIN_BACKEND_URL}/api/tourist/${alert.touristId}`);
      console.log('📋 Tourist details response:', response.data);
      
      if (response.data.success) {
        setTouristDetails(response.data.tourist);
      } else {
        setTouristDetails({ 
          name: "Details not found",
          itinerary: "Not available",
          emergencyContact: "Not available",
          validUntil: "Not available"
        });
      }
    } catch (error) {
      console.error("❌ Failed to fetch tourist details:", error);
      setError(`Failed to fetch tourist details: ${error.message}`);
      setTouristDetails({ 
        name: "Error fetching details",
        itinerary: "Not available",
        emergencyContact: "Not available",
        validUntil: "Not available"
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleResolveAlert = async (alertId, touristId) => {
    setResolvingAlert(alertId);
    setError(null);
    
    try {
      // Update alert status in mobile backend
      const alertResponse = await axios.put(`${MOBILE_BACKEND_URL}/api/alerts/${alertId}/resolve`);
      
      // Update panic status in blockchain backend (if endpoint exists)
      try {
        await axios.put(`${BLOCKCHAIN_BACKEND_URL}/api/tourist/${touristId}/panic`, {
          panicActive: false
        });
      } catch (panicError) {
        console.warn('Panic update endpoint might not exist:', panicError);
        // Continue even if panic update fails
      }

      if (alertResponse.data.success) {
        // Remove alert from local state
        setActiveAlerts(prev => prev.filter(alert => alert._id !== alertId));
        
        if (selectedAlert && selectedAlert._id === alertId) {
          setSelectedAlert(null);
          setTouristDetails(null);
        }
        
        alert('✅ Alert resolved successfully!');
      }
    } catch (error) {
      console.error("❌ Failed to resolve alert:", error);
      setError(`Failed to resolve alert: ${error.message}`);
      alert('❌ Failed to resolve alert. Please try again.');
    } finally {
      setResolvingAlert(null);
    }
  };

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getLocationAddress = (alert) => {
    if (alert.currentLocation?.address) {
      return alert.currentLocation.address;
    }
    
    const coords = getAlertCoordinates(alert);
    return `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`;
  };

  if (!API_KEY) {
    return (
      <div className="error-container">
        <h1>❌ Error: Please ensure VITE_GOOGLE_MAPS_API_KEY is set in your .env file.</h1>
      </div>
    );
  }

  return (
    <div className="alerts-container">
      <header className="alerts-header">
        <h1>Live Alerts Map</h1>
        <p>Monitoring active panic alerts from tourists in real-time</p>
        {error && (
          <div className="error-banner">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}
      </header>
      
      <div className="alerts-content">
        {/* Alerts List Sidebar */}
        <div className="alerts-sidebar">
          <div className="sidebar-header">
            <h2>Active Alerts ({activeAlerts.length})</h2>
            <div className="alert-badge">{activeAlerts.length}</div>
          </div>
          <div className="alerts-list">
            {activeAlerts.length === 0 ? (
              <div className="no-alerts">
                <AlertTriangle size={32} />
                <p>No active alerts</p>
                <span>Alerts will appear here in real-time</span>
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div 
                  key={alert._id} 
                  className={`alert-item ${selectedAlert?._id === alert._id ? 'selected' : ''}`}
                  onClick={() => handleMarkerClick(alert)}
                >
                  <div className="alert-header">
                    <div className="alert-type">
                      <AlertTriangle size={16} />
                      <span>PANIC ALERT</span>
                    </div>
                    <div className="alert-time">
                      <Clock size={12} />
                      {formatDate(alert.timestamp)}
                    </div>
                  </div>
                  <div className="alert-location">
                    <MapPin size={12} />
                    {getLocationAddress(alert)}
                  </div>
                  <div className="alert-id">Tourist ID: {alert.touristId?.slice(-8)}</div>
                  <div className="alert-actions">
                    <button 
                      className="resolve-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolveAlert(alert._id, alert.touristId);
                      }}
                      disabled={resolvingAlert === alert._id}
                    >
                      <CheckCircle size={14} />
                      {resolvingAlert === alert._id ? 'Resolving...' : 'Problem Solved'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Map and Details Section */}
        <div className="map-section">
          <div className="map-container">
            <APIProvider apiKey={API_KEY}>
              <Map 
                defaultCenter={DEFAULT_CENTER} 
                defaultZoom={12} 
                mapId={MAP_ID} 
                gestureHandling={'greedy'}
                style={{ height: '100%', width: '100%' }}
              >
                {activeAlerts.map(alert => {
                  const coordinates = getAlertCoordinates(alert);
                  return (
                    <Marker 
                      key={alert._id} 
                      position={coordinates} 
                      onClick={() => handleMarkerClick(alert)}
                    />
                  );
                })}
                
                {selectedAlert && (
                  <InfoWindow 
                    position={getAlertCoordinates(selectedAlert)} 
                    onCloseClick={() => setSelectedAlert(null)}
                  >
                    <div className="info-window">
                      <h4>🚨 Tourist in Distress</h4>
                      <p>Alert Time: {formatDate(selectedAlert.timestamp)}</p>
                      <p>Tourist ID: {selectedAlert.touristId?.slice(-8)}</p>
                      <p>Location: {getLocationAddress(selectedAlert)}</p>
                      <button 
                        className="resolve-btn-small"
                        onClick={() => handleResolveAlert(selectedAlert._id, selectedAlert.touristId)}
                        disabled={resolvingAlert === selectedAlert._id}
                      >
                        <CheckCircle size={12} />
                        {resolvingAlert === selectedAlert._id ? 'Resolving...' : 'Mark as Solved'}
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </div>
          
          {/* Tourist Details Panel */}
          {selectedAlert && (
            <div className="details-panel">
              <div className="panel-header">
                <h2>Tourist Details</h2>
                <div>
                  <button 
                    className="resolve-btn"
                    onClick={() => handleResolveAlert(selectedAlert._id, selectedAlert.touristId)}
                    disabled={resolvingAlert === selectedAlert._id}
                  >
                    <CheckCircle size={16} />
                    {resolvingAlert === selectedAlert._id ? 'Resolving...' : 'Problem Solved'}
                  </button>
                  <button 
                    className="close-btn"
                    onClick={() => setSelectedAlert(null)}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {loadingDetails ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading details...</p>
                </div>
              ) : (
                touristDetails && (
                  <div className="details-content">
                    <div className="detail-item">
                      <User size={18} />
                      <div>
                        <label>Name</label>
                        <span>{touristDetails.name || 'Not available'}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <Home size={18} />
                      <div>
                        <label>Passport/Aadhaar</label>
                        <span>{touristDetails.passportOrAadhaar || 'Not available'}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <Phone size={18} />
                      <div>
                        <label>Emergency Contact</label>
                        <span>{touristDetails.emergencyContact || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <Clock size={18} />
                      <div>
                        <label>Valid Until</label>
                        <span>{touristDetails.validUntil ? formatDate(touristDetails.validUntil) : 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <MapPin size={18} />
                      <div>
                        <label>Alert Location</label>
                        <span>{getLocationAddress(selectedAlert)}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <Clock size={18} />
                      <div>
                        <label>Alert Time</label>
                        <span>{formatDate(selectedAlert.timestamp)}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <AlertTriangle size={18} />
                      <div>
                        <label>Alert Status</label>
                        <span className="status-active">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
           .alerts-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 1.5rem;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .alerts-header {
          flex-shrink: 0;
          margin-bottom: 2rem;
        }

        .alerts-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 0.5rem 0;
        }

        .alerts-header p {
          color: #718096;
          margin: 0;
          font-size: 1.1rem;
        }

        .alerts-content {
          flex-grow: 1;
          display: flex;
          gap: 1.5rem;
          overflow: hidden;
          min-height: 0;
        }

        /* Sidebar Styles */
        .alerts-sidebar {
          width: 380px;
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          min-height: 0;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-shrink: 0;
        }

        .sidebar-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .alert-badge {
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .alerts-list {
          flex-grow: 1;
          overflow-y: auto;
          min-height: 0;
        }

        .no-alerts {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #a0aec0;
          text-align: center;
          padding: 2rem;
        }

        .no-alerts p {
          margin: 1rem 0 0.5rem 0;
          font-weight: 600;
        }

        .no-alerts span {
          font-size: 0.875rem;
        }

        .alert-item {
          background: #fef2f2;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
          margin-bottom: 0.75rem;
          transition: all 0.2s ease;
        }

        .alert-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .alert-item.selected {
          border-color: #ef4444;
          background: #fee2e2;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .alert-type {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .alert-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
          font-size: 0.75rem;
        }

        .alert-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4b5563;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .alert-id {
          color: #9ca3af;
          font-size: 0.75rem;
          font-family: monospace;
          margin-bottom: 0.5rem;
        }

        .alert-actions {
          margin-top: 0.5rem;
        }

        .resolve-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #10b981;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .resolve-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        .resolve-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .resolve-btn-small {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #10b981;
          color: white;
          border: none;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.5rem;
          width: 100%;
          justify-content: center;
        }

        .resolve-btn-small:hover:not(:disabled) {
          background: #059669;
        }

        /* Map Section Styles */
        .map-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          min-width: 0;
          min-height: 0;
        }

        .map-container {
          flex: 2;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          background: white;
          min-height: 0;
        }

        .info-window {
          padding: 0.5rem;
          min-width: 200px;
        }

        .info-window h4 {
          margin: 0 0 0.5rem 0;
          color: #dc2626;
          font-size: 1.1rem;
        }

        .info-window p {
          margin: 0.25rem 0;
          color: #4b5563;
          font-size: 0.875rem;
        }

        /* Details Panel Styles */
        .details-panel {
          flex: 1;
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          min-height: 200px;
          max-height: 350px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-shrink: 0;
        }

        .panel-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .panel-header > div {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #718096;
          padding: 0.5rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: #f7fafc;
          color: #2d3748;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #718096;
          flex-grow: 1;
        }
        .status-resolved {
        color: #10b981;
        font-weight: 600;
        background: #d1fae5;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        display: inline-block;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #ef4444;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .details-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
          flex-grow: 1;
          padding-right: 0.5rem;
          max-height: calc(100% - 60px);
        }

        .details-content::-webkit-scrollbar {
          width: 6px;
        }

        .details-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .details-content::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }

        .details-content::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .detail-item > div {
          flex: 1;
        }

        .detail-item label {
          display: block;
          font-size: 0.75rem;
          color: #718096;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .detail-item span {
          display: block;
          color: #2d3748;
          font-weight: 500;
          word-break: break-word;
        }

        .status-active {
          color: #dc2626;
          font-weight: 600;
          background: #fee2e2;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: inline-block;
        }

        .id-text {
          font-family: monospace;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .error-container {
          padding: 2rem;
          text-align: center;
          color: #dc2626;
        }

        .alerts-list::-webkit-scrollbar {
          width: 6px;
        }

        .alerts-list::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .alerts-list::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }

        .alerts-list::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        
        .error-banner {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 6px;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}