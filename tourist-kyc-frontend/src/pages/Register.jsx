import React, { useState, useEffect } from 'react';
import { Wallet, User, Shield, CheckCircle, AlertCircle, Loader2, MapPin, Phone, Mail, Calendar, Eye } from 'lucide-react';
import { QRCodeCanvas } from "qrcode.react";

// Simple QR Code component (no external dependency needed)
const QRCodeSVG = ({ value, size = 200 }) => {
  // This is a simple placeholder. In production, you'd want to use a proper QR library
  // For now, we'll create a visual representation
  const qrData = `data:image/svg+xml;base64,${btoa(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>
      <rect x="20" y="20" width="20" height="20" fill="black"/>
      <rect x="60" y="20" width="20" height="20" fill="black"/>
      <rect x="100" y="20" width="20" height="20" fill="black"/>
      <rect x="140" y="20" width="20" height="20" fill="black"/>
      <rect x="20" y="60" width="20" height="20" fill="black"/>
      <rect x="100" y="60" width="20" height="20" fill="black"/>
      <rect x="140" y="60" width="20" height="20" fill="black"/>
      <rect x="60" y="100" width="20" height="20" fill="black"/>
      <rect x="100" y="100" width="20" height="20" fill="black"/>
      <rect x="20" y="140" width="20" height="20" fill="black"/>
      <rect x="60" y="140" width="20" height="20" fill="black"/>
      <rect x="140" y="140" width="20" height="20" fill="black"/>
      <text x="${size/2}" y="${size-10}" text-anchor="middle" font-size="8" fill="black">${value.slice(0,10)}...</text>
    </svg>
  `)}`;
  
  return <img src={qrData} alt="QR Code" style={{ width: size, height: size }} />;
};

const TouristKYCPortal = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState('form'); // 'form', 'success', 'lookup'
  
  const [issuedData, setIssuedData] = useState(null);
  const [lookupData, setLookupData] = useState(null);
  const [lookupAddress, setLookupAddress] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    passportOrAadhaar: '',
    itinerary: '',
    emergencyContact: '',
    validUntil: ''
  });

  // Styles object for better organization
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    },
    innerContainer: {
      maxWidth: '1000px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem',
      color: 'white'
    },
    headerIcon: {
      margin: '0 auto',
      marginBottom: '1rem',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
    },
    title: {
      fontSize: '3rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    subtitle: {
      fontSize: '1.2rem',
      opacity: '0.9',
      fontWeight: '300'
    },
    card: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      overflow: 'hidden'
    },
    cardHeader: {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      padding: '2rem',
      color: 'white'
    },
    cardContent: {
      padding: '2rem'
    },
    navTabs: {
      display: 'flex',
      marginBottom: '2rem',
      background: 'rgba(79, 70, 229, 0.1)',
      borderRadius: '15px',
      padding: '4px'
    },
    navTab: {
      flex: 1,
      padding: '1rem 2rem',
      background: 'transparent',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      color: '#6b7280'
    },
    navTabActive: {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
    },
    walletSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1))',
      borderRadius: '15px',
      marginBottom: '2rem'
    },
    walletInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    walletDetails: {
      color: '#374151'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 2rem',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
    },
    secondaryButton: {
      background: 'linear-gradient(135deg, #6b7280, #9ca3af)',
      color: 'white'
    },
    connectedBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      fontWeight: '600'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '0.95rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    input: {
      padding: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: 'white'
    },
    textarea: {
      padding: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: 'white',
      minHeight: '120px',
      resize: 'vertical'
    },
    successCard: {
      textAlign: 'center',
      padding: '3rem 2rem'
    },
    qrContainer: {
      background: 'white',
      padding: '2rem',
      borderRadius: '20px',
      display: 'inline-block',
      margin: '2rem 0',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
    },
    detailsGrid: {
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
      padding: '2rem',
      borderRadius: '15px',
      margin: '2rem 0'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(0,0,0,0.1)'
    },
    detailLabel: {
      fontWeight: '600',
      color: '#374151'
    },
    detailValue: {
      color: '#6b7280',
      wordBreak: 'break-all',
      maxWidth: '60%'
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      return alert('Please install MetaMask to continue');
    }
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Register tourist function
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) return alert('Please connect the tourist\'s wallet first');
    
    setIsRegistering(true);

    try {
      const registrationData = {
        tourist: walletAddress,
        ...formData,
         validUntil: Math.floor(new Date(formData.validUntil).getTime() / 1000)
      };

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });
      console.log(response)
      const result = await response.json();

      if (response.ok && result.success) {
        setIssuedData({
          touristAddress: walletAddress,
          txHash: result.txHash,
          ...formData
        });
        setCurrentView('success');
        setFormData({
          name: '',
          passportOrAadhaar: '',
          itinerary: '',
          emergencyContact: '',
          validUntil: ''
        });
      } else {
        throw new Error(result.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  // Lookup tourist function
  const handleLookup = async () => {
    if (!lookupAddress.trim()) {
      alert('Please enter a wallet address to lookup');
      return;
    }

    setIsLookingUp(true);
    try {
      const response = await fetch(`http://localhost:5000/api/tourist/${lookupAddress}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setLookupData(result.tourist);
      } else {
        alert(result.message || 'Tourist not found');
        setLookupData(null);
      }
    } catch (error) {
      console.error('Lookup error:', error);
      alert('Error looking up tourist data');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Check wallet connection on load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Could not check for connected wallet:', error);
        }
      }
    };
    checkWalletConnection();
  }, []);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const formatAddress = (address) => address ? `${address.slice(0, 8)}...${address.slice(-6)}` : '';

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <header style={styles.header}>
          <Shield size={80} color="white" style={styles.headerIcon} />
          <h1 style={styles.title}>Tourist KYC Portal</h1>
          <p style={styles.subtitle}>Secure blockchain-based registration system</p>
        </header>

        <main style={styles.card}>
          {/* Navigation Tabs */}
          <div style={styles.cardHeader}>
            <div style={styles.navTabs}>
              <button
                style={{
                  ...styles.navTab,
                  ...(currentView === 'form' ? styles.navTabActive : {})
                }}
                onClick={() => setCurrentView('form')}
              >
                <User size={20} style={{ marginRight: '0.5rem' }} />
                Register Tourist
              </button>
              <button
                style={{
                  ...styles.navTab,
                  ...(currentView === 'lookup' ? styles.navTabActive : {})
                }}
                onClick={() => setCurrentView('lookup')}
              >
                <Eye size={20} style={{ marginRight: '0.5rem' }} />
                Lookup Tourist
              </button>
            </div>
          </div>

          <div style={styles.cardContent}>
            {currentView === 'form' && (
              <>
                {/* Wallet Connection Section */}
                <div style={styles.walletSection}>
                  <div style={styles.walletInfo}>
                    <Wallet size={32} color="#4f46e5" />
                    <div style={styles.walletDetails}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
                        Tourist Wallet Connection
                      </h3>
                      <p style={{ margin: 0, color: '#6b7280' }}>
                        Connect the tourist's MetaMask wallet to proceed
                      </p>
                    </div>
                  </div>
                  {!isConnected ? (
                    <button
                      onClick={connectWallet}
                      disabled={isConnecting}
                      style={{
                        ...styles.button,
                        ...styles.primaryButton,
                        opacity: isConnecting ? 0.7 : 1
                      }}
                    >
                      {isConnecting ? <Loader2 size={20} /> : <Wallet size={20} />}
                      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  ) : (
                    <div style={styles.connectedBadge}>
                      <CheckCircle size={20} />
                      {formatAddress(walletAddress)}
                    </div>
                  )}
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600', color: '#374151' }}>
                    Tourist Information
                  </h3>
                  
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        placeholder="Enter full legal name"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Passport or Aadhaar Number *</label>
                      <input
                        type="text"
                        name="passportOrAadhaar"
                        value={formData.passportOrAadhaar}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        placeholder="Enter passport or Aadhaar number"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Emergency Contact *</label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        placeholder="Emergency contact details"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Valid Until *</label>
                      <input
                        type="date"
                        name="validUntil"
                        value={formData.validUntil}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Travel Itinerary *</label>
                    <textarea
                      name="itinerary"
                      value={formData.itinerary}
                      onChange={handleInputChange}
                      required
                      style={styles.textarea}
                      onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      placeholder="Enter detailed travel itinerary, places to visit, accommodation details..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isConnected || isRegistering}
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      width: '100%',
                      justifyContent: 'center',
                      marginTop: '2rem',
                      opacity: (!isConnected || isRegistering) ? 0.7 : 1
                    }}
                  >
                    {isRegistering ? <Loader2 size={20} /> : <Shield size={20} />}
                    {isRegistering ? 'Registering Tourist...' : 'Register Tourist'}
                  </button>
                </form>
              </>
            )}

            {currentView === 'lookup' && (
              <div>
                <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600', color: '#374151' }}>
                  Tourist Lookup
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  <input
                    type="text"
                    value={lookupAddress}
                    onChange={(e) => setLookupAddress(e.target.value)}
                    placeholder="Enter tourist wallet address"
                    style={{ ...styles.input, flex: 1 }}
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    onClick={handleLookup}
                    disabled={isLookingUp}
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      opacity: isLookingUp ? 0.7 : 1
                    }}
                  >
                    {isLookingUp ? <Loader2 size={20} /> : <Eye size={20} />}
                    {isLookingUp ? 'Looking up...' : 'Lookup'}
                  </button>
                </div>

                {lookupData && (
                  <div style={styles.detailsGrid}>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
                      Tourist Details
                    </h4>
                    
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Name:</span>
                      <span style={styles.detailValue}>{lookupData.name}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Passport/Aadhaar:</span>
                      <span style={styles.detailValue}>{lookupData.passportOrAadhaar}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Emergency Contact:</span>
                      <span style={styles.detailValue}>{lookupData.emergencyContact}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Valid Until:</span>
                      <span style={styles.detailValue}>
                        {new Date(lookupData.validUntil * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Itinerary:</span>
                      <span style={styles.detailValue}>{lookupData.itinerary}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView === 'success' && issuedData && (
              <div style={styles.successCard}>
                <CheckCircle size={60} color="#10b981" style={{ marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#374151', marginBottom: '1rem' }}>
                  Registration Successful!
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem' }}>
                  Digital ID for <strong>{issuedData.name}</strong> has been created on the blockchain.
                </p>

                <div style={styles.qrContainer}>
                  <QRCodeCanvas
                  value={walletAddress}
                  size={256}               // QR size in pixels
                  bgColor={"#ffffff"}      // Background color
                  fgColor={"#000000"}      // QR color
                  level={"H"}              // High error correction (denser)
                />
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                    Scan QR code for quick verification
                  </p>
                </div>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Tourist ID (Wallet):</span>
                    <span style={styles.detailValue}>{issuedData.touristAddress}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Transaction Hash:</span>
                    <span style={styles.detailValue}>{issuedData.txHash}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Name:</span>
                    <span style={styles.detailValue}>{issuedData.name}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Document:</span>
                    <span style={styles.detailValue}>{issuedData.passportOrAadhaar}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Valid Until:</span>
                    <span style={styles.detailValue}>{issuedData.validUntil}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentView('form');
                    setIssuedData(null);
                  }}
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '2rem'
                  }}
                >
                  Register Another Tourist
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TouristKYCPortal;