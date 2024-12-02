import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

// Import your CSS styles
// import './SignIn.css';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/signin', { email, password });
      localStorage.setItem('authToken', response.data.token);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid email or password.');
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <h2 className="signin-heading">Sign In</h2>
        <form className="signin-form" onSubmit={handleLogin}>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password:</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="signin-button">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;