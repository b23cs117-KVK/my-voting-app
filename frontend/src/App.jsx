import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VoterDashboard from './pages/VoterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Results from './pages/Results';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="center-wrapper">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {user && (
        <nav className="navbar glass-panel">
          <div className="nav-links">
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>SecureVote</span>
            {user.role === 'admin' && <span className="nav-link">Admin View</span>}
            {user.role === 'user' && <span className="nav-link">Voter Portal</span>}
          </div>
          <div className="nav-links">
            <span className="nav-link">{user.name}</span>
            <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Logout</button>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : "/login"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute roleRequired="user">
              <VoterDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute roleRequired="admin">
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/results" 
          element={
            <PrivateRoute>
              <Results />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
