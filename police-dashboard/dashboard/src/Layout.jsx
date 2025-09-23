import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar Navigation */}
      <nav style={{ width: '250px', backgroundColor: '#111827', color: 'white', padding: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Police Dashboard</h1>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li><Link to="/" style={linkStyle}>Overview</Link></li>
          <li><Link to="/alerts" style={linkStyle}>Live Alerts</Link></li>
          <li><Link to="/tourists" style={linkStyle}>Danger Zones Map</Link></li> {/* Updated text */}
          <li><Link to="/reports" style={linkStyle}>Generate Reports</Link></li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#f9fafb' }}>
        <Outlet />
      </main>
    </div>
  );
}

const linkStyle = {
    color: '#d1d5db',
    textDecoration: 'none',
    display: 'block',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    transition: 'background-color 0.2s'
};