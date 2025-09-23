import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Globe, 
  CheckCircle, 
  ArrowRight, 
  Menu, 
  X, 
  Lock, 
  Zap, 
  Database, 
  UserCheck,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Star,
  Award,
  TrendingUp,
  Eye
} from 'lucide-react';

export const TouristKYCHomepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigate to registration page
  const handleGenerateId = () => {
    // Replace with your actual routing logic
    window.location.href = '/register'; // or use React Router: navigate('/register')
    console.log('Navigate to Register.jsx');
  };

  const styles = {
    // Global Styles
    container: {
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      lineHeight: '1.6',
      color: '#333'
    },

    // Navigation Styles
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: scrollY > 50 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderBottom: scrollY > 50 ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.2)',
      transition: 'all 0.3s ease',
      padding: '1rem 0'
    },
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1.5rem',
      fontWeight: '700',
      color: scrollY > 50 ? '#1f2937' : '#ffffff',
      textDecoration: 'none'
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center'
    },
    navLink: {
      color: scrollY > 50 ? '#4b5563' : '#ffffff',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      padding: '0.5rem 1rem',
      borderRadius: '8px'
    },

    // Hero Section
    hero: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    heroPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.3
    },
    heroContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4rem',
      alignItems: 'center',
      position: 'relative',
      zIndex: 1
    },
    heroContent: {
      color: 'white'
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: '800',
      lineHeight: '1.1',
      marginBottom: '1.5rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      lineHeight: '1.6',
      marginBottom: '2rem',
      opacity: 0.9
    },
    ctaButtonContainer: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    ctaButton: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      padding: '1.25rem 2.5rem',
      borderRadius: '50px',
      border: 'none',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
      textDecoration: 'none'
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: '1.25rem 2.5rem',
      borderRadius: '50px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'all 0.3s ease',
      textDecoration: 'none'
    },
    heroImage: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    heroCard: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '3rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },

    // Stats Section
    stats: {
      padding: '4rem 0',
      background: 'white'
    },
    statsContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem'
    },
    statCard: {
      textAlign: 'center',
      padding: '2rem'
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: '800',
      color: '#4f46e5',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '1.1rem',
      color: '#6b7280',
      fontWeight: '500'
    },

    // Features Section
    features: {
      padding: '6rem 0',
      background: 'linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%)'
    },
    featuresContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem'
    },
    sectionTitle: {
      textAlign: 'center',
      marginBottom: '4rem'
    },
    sectionTitleText: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '1rem'
    },
    sectionSubtitle: {
      fontSize: '1.2rem',
      color: '#6b7280',
      maxWidth: '600px',
      margin: '0 auto'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem'
    },
    featureCard: {
      background: 'white',
      padding: '2.5rem',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    },
    featureIcon: {
      width: '60px',
      height: '60px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    },
    featureTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '1rem'
    },
    featureDescription: {
      color: '#6b7280',
      lineHeight: '1.6'
    },

    // How It Works Section
    howItWorks: {
      padding: '6rem 0',
      background: 'white'
    },
    stepsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginTop: '4rem'
    },
    stepCard: {
      textAlign: 'center',
      padding: '2rem'
    },
    stepNumber: {
      width: '60px',
      height: '60px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: '700',
      margin: '0 auto 1.5rem auto'
    },
    stepTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '1rem'
    },
    stepDescription: {
      color: '#6b7280'
    },

    // Footer
    footer: {
      background: '#1f2937',
      color: 'white',
      padding: '3rem 0 1rem 0'
    },
    footerContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem'
    },
    footerSection: {
      marginBottom: '2rem'
    },
    footerTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem'
    },
    footerLink: {
      color: '#d1d5db',
      textDecoration: 'none',
      display: 'block',
      padding: '0.25rem 0',
      transition: 'color 0.3s ease'
    },
    footerBottom: {
      borderTop: '1px solid #374151',
      marginTop: '2rem',
      paddingTop: '2rem',
      textAlign: 'center',
      color: '#9ca3af'
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <a href="/" style={styles.logo}>
            <Shield size={32} />
            Tourist KYC
          </a>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#how-it-works" style={styles.navLink}>How It Works</a>
            <a href="#contact" style={styles.navLink}>Contact</a>
            <button 
              onClick={handleGenerateId}
              style={{
                ...styles.navLink,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer'
              }}
            >
              Generate ID
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroPattern}></div>
        <div style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Secure Tourist<br />
              Registration<br />
              <span style={{ color: '#10b981' }}>Made Simple</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Government-grade blockchain-powered KYC system for tourist registration. 
              Immutable records, instant verification, and complete transparency for 
              safer tourism management.
            </p>
            <div style={styles.ctaButtonContainer}>
              <button onClick={handleGenerateId} style={styles.ctaButton}>
                <UserCheck size={24} />
                Generate Tourist ID
                <ArrowRight size={20} />
              </button>
              <button style={styles.secondaryButton}>
                <Eye size={24} />
                View Demo
              </button>
            </div>
          </div>
          <div style={styles.heroImage}>
            <div style={styles.heroCard}>
              <Shield size={80} color="white" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>
                Blockchain Secured
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
                Every tourist registration is permanently stored on the blockchain
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <Lock size={24} color="#10b981" />
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Secure</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Zap size={24} color="#10b981" />
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Fast</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Database size={24} color="#10b981" />
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Immutable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.stats}>
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>10K+</div>
            <div style={styles.statLabel}>Tourists Registered</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>99.9%</div>
            <div style={styles.statLabel}>System Uptime</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>24/7</div>
            <div style={styles.statLabel}>Support Available</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>100%</div>
            <div style={styles.statLabel}>Secure & Encrypted</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.features}>
        <div style={styles.featuresContainer}>
          <div style={styles.sectionTitle}>
            <h2 style={styles.sectionTitleText}>Why Choose Our Platform?</h2>
            <p style={styles.sectionSubtitle}>
              Advanced blockchain technology meets user-friendly design for the ultimate 
              tourist registration experience.
            </p>
          </div>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <Shield size={32} color="white" />
              </div>
              <h3 style={styles.featureTitle}>Blockchain Security</h3>
              <p style={styles.featureDescription}>
                All tourist data is stored on an immutable blockchain, ensuring permanent 
                records that cannot be altered or lost.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <Zap size={32} color="white" />
              </div>
              <h3 style={styles.featureTitle}>Instant Verification</h3>
              <p style={styles.featureDescription}>
                Generate QR codes instantly for quick verification by authorities. 
                No waiting periods, immediate digital ID generation.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <Users size={32} color="white" />
              </div>
              <h3 style={styles.featureTitle}>Government Grade</h3>
              <p style={styles.featureDescription}>
                Built for government operations with enterprise-level security, 
                compliance standards, and audit trails.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <Globe size={32} color="white" />
              </div>
              <h3 style={styles.featureTitle}>Global Accessibility</h3>
              <p style={styles.featureDescription}>
                Access from anywhere in the world. Multi-language support and 
                international document compatibility.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <Lock size={32} color="white" />
              </div>
              <h3 style={styles.featureTitle}>Privacy Protected</h3>
              <p style={styles.featureDescription}>
                Advanced encryption ensures tourist data privacy while maintaining 
                transparency for authorized personnel.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <TrendingUp size={32} color="white" />
              </div>
              <h3 style={styles.featureTitle}>Smart Analytics</h3>
              <p style={styles.featureDescription}>
                Real-time analytics and reporting for tourism departments to track 
                visitor patterns and generate insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={styles.howItWorks}>
        <div style={styles.featuresContainer}>
          <div style={styles.sectionTitle}>
            <h2 style={styles.sectionTitleText}>How It Works</h2>
            <p style={styles.sectionSubtitle}>
              Simple 4-step process to register tourists and generate secure digital IDs
            </p>
          </div>
          <div style={styles.stepsContainer}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.stepTitle}>Connect Wallet</h3>
              <p style={styles.stepDescription}>
                Tourist connects their MetaMask wallet to establish their unique blockchain identity
              </p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.stepTitle}>Fill KYC Form</h3>
              <p style={styles.stepDescription}>
                Government official fills out tourist information including passport, itinerary, and emergency contacts
              </p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.stepTitle}>Blockchain Registration</h3>
              <p style={styles.stepDescription}>
                System securely stores tourist data on blockchain with government admin signature
              </p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>4</div>
              <h3 style={styles.stepTitle}>Generate QR ID</h3>
              <p style={styles.stepDescription}>
                Instant digital ID with QR code generated for easy verification by authorities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>
              <Shield size={24} style={{ marginRight: '0.5rem' }} />
              Tourist KYC Platform
            </h3>
            <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
              Secure, transparent, and efficient tourist registration powered by blockchain technology.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#374151', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div style={{ width: '40px', height: '40px', background: '#374151', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <div style={{ width: '40px', height: '40px', background: '#374151', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} />
              </div>
            </div>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Quick Links</h4>
            <a href="#features" style={styles.footerLink}>Features</a>
            <a href="#how-it-works" style={styles.footerLink}>How It Works</a>
            <button onClick={handleGenerateId} style={{ ...styles.footerLink, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              Generate Tourist ID
            </button>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Support</h4>
            <a href="#" style={styles.footerLink}>Documentation</a>
            <a href="#" style={styles.footerLink}>API Reference</a>
            <a href="#" style={styles.footerLink}>Help Center</a>
            <a href="#" style={styles.footerLink}>Contact Support</a>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Legal</h4>
            <a href="#" style={styles.footerLink}>Privacy Policy</a>
            <a href="#" style={styles.footerLink}>Terms of Service</a>
            <a href="#" style={styles.footerLink}>Security</a>
            <a href="#" style={styles.footerLink}>Compliance</a>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2024 Tourist KYC Platform. All rights reserved. | Powered by Blockchain Technology</p>
        </div>
      </footer>
    </div>
  );
};

export default TouristKYCHomepage;