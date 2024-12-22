import React, { useState, useEffect } from 'react';
import ChatInterface from './Component/ChatInterface'
// Login Component
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        // Store user details for personalization
        localStorage.setItem('userDetails', JSON.stringify({
          email: formData.email
        }));
        onLogin('chat');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
        <p className="text-center mt-4">
          Don't have an account? 
          <button 
            type="button" 
            onClick={() => onLogin('register')} 
            className="ml-2 text-blue-500 hover:underline"
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
};

// Register Component
const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        // Store user details for personalization
        localStorage.setItem('userDetails', JSON.stringify({
          name: formData.name,
          email: formData.email
        }));
        onLogin('chat');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Register
        </button>
        <p className="text-center mt-4">
          Already have an account? 
          <button 
            type="button" 
            onClick={() => onLogin('login')} 
            className="ml-2 text-blue-500 hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

// Navbar Component
const Navbar = ({ onLogout }) => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="ml-2 text-xl font-bold text-gray-800">DIya AI Chat</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onLogout}
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    if (token) {
      setCurrentScreen('chat');
    }
  }, []);

  // Handle login/register/navigation
  const handleLogin = (screen) => {
    setCurrentScreen(screen);
    setIsAuthenticated(screen === 'chat');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  // Render appropriate screen based on current state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'register':
        return <Register onLogin={handleLogin} />;
      case 'chat':
        return (
          <>
            <Navbar onLogout={handleLogout} />
            <ChatInterface />
          </>
        );
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderScreen()}
    </div>
  );
};

export default App;