import React from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

// Import your CSS styles (adjust the path as necessary)
// import styles from './Layout.module.css';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally display an error notification
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <nav className="navbar">
          <ul className="nav-list">
            {/* Replace with your actual navigation links */}
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            {/* Add additional navigation items as needed */}
            {isAuthenticated && (
              <li className="nav-item">
                <button className="logout-button" onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        {/* Your footer content */}
        <p>© {new Date().getFullYear()} Your Company</p>
      </footer>
    </div>
  );
};

export default Layout;
