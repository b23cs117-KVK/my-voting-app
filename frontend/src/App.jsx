import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
// ... (omitting irrelevant imports)

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {user && (
        <nav className="navbar glass-panel">
          <div className="nav-links">
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', marginRight: '1rem' }}>SecureVote</span>
            {user.role === 'admin' ? (
              <Link to="/admin" className="nav-link">Admin Dashboard</Link>
            ) : (
              <Link to="/dashboard" className="nav-link">Voter Dashboard</Link>
            )}
            <Link to="/results" className="nav-link">Results Archive</Link>
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
          path="/results/:electionId?" 
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
