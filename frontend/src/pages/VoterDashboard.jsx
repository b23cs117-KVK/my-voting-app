import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function VoterDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [election, setElection] = useState({ isOpen: false });
  const [message, setMessage] = useState('');
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchElectionStatus();
    fetchCandidates();
  }, []);

  const fetchElectionStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/election`);
      setElection(res.data);
      if (!res.data.isOpen && user.hasVoted) {
        navigate('/results');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/vote/candidates`);
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (candidateId) => {
    if (user.hasVoted) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/vote`, { candidateId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, hasVoted: true });
      setMessage('Vote recorded securely! Thank you for participating.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error recording vote.');
    }
  };

  if (!election.isOpen) {
    return (
      <div className="container animate-fade-in">
        <div className="glass-panel status-card">
          <AlertTriangle size={48} className="status-icon danger" />
          <h2>Election is Closed</h2>
          <p>The election is currently not open for voting. Please check back later or view the results if available.</p>
          {user.hasVoted && (
            <button className="btn btn-primary mt-8" onClick={() => navigate('/results')}>
              View Results
            </button>
          )}
        </div>
      </div>
    );
  }

  if (user.hasVoted) {
    return (
      <div className="container animate-fade-in">
         <div className="glass-panel status-card">
          <CheckCircle size={48} className="status-icon success" />
          <h2>Vote Blocked</h2>
          <p>You have already cast your vote securely. Multiple votes are not permitted.</p>
          <p className="mt-4">Please wait until the election is closed to view the results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h2>Voter Dashboard</h2>
      <p>Select a candidate below to cast your vote securely. This action cannot be undone.</p>
      
      {message && (
        <div className="glass-panel text-center mb-4 mt-4" style={{ padding: '1rem', borderLeft: '4px solid var(--success-color)' }}>
          {message}
        </div>
      )}

      <div className="candidate-grid">
        {candidates.map(c => (
          <div key={c._id} className="candidate-card glass-panel">
            {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="candidate-image" />}
            <div>
              <span className="candidate-party">{c.party}</span>
              <h3>{c.name}</h3>
              <p className="mb-4 text-sm" style={{flexGrow: 1}}>{c.description}</p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => handleVote(c._id)}
              >
                Vote for {c.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
