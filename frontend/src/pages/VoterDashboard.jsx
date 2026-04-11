import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, AlertTriangle, Calendar, ArrowLeft, Trophy } from 'lucide-react';

export default function VoterDashboard() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState('');
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/elections`);
      setElections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidates = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/vote/candidates/${id}`);
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectElection = (el) => {
    setSelectedElection(el);
    fetchCandidates(el._id);
    setMessage('');
  };

  const handleVote = async (candidateId) => {
    if (user.votedElections.includes(selectedElection._id)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/vote/${selectedElection._id}`, { candidateId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedVotedElections = [...user.votedElections, selectedElection._id];
      setUser({ ...user, votedElections: updatedVotedElections });
      setMessage('Vote recorded securely! Thank you for participating.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error recording vote.');
    }
  };

  if (selectedElection) {
    const now = new Date();
    const isStarted = now >= new Date(selectedElection.startTime);
    const isEnded = now > new Date(selectedElection.endTime) || selectedElection.status === 'completed';
    const hasVoted = user.votedElections.includes(selectedElection._id);

    return (
      <div className="container animate-fade-in">
        <button className="btn mb-4" onClick={() => setSelectedElection(null)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back to Elections
        </button>
        
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2>{selectedElection.title}</h2>
          <p>{selectedElection.description}</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <span className={`status-badge ${isEnded ? 'danger' : isStarted ? 'success' : 'warning'}`}>
              {isEnded ? 'Closed' : isStarted ? 'Ongoing' : 'Upcoming'}
            </span>
            {hasVoted && (
              <span className="status-badge success" style={{ background: 'var(--success-color)', color: 'white' }}>
                <CheckCircle size={14} /> Voted
              </span>
            )}
          </div>
        </div>

        {message && (
          <div className="glass-panel text-center mb-4 mt-4" style={{ padding: '1rem', borderLeft: '4px solid var(--success-color)' }}>
            {message}
          </div>
        )}

        {!isStarted ? (
          <div className="glass-panel text-center" style={{ padding: '3rem' }}>
            <Calendar size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <h3>Voting hasn't started yet</h3>
            <p>This election is scheduled to start on {new Date(selectedElection.startTime).toLocaleString()}.</p>
          </div>
        ) : isEnded ? (
          <div className="glass-panel text-center" style={{ padding: '3rem' }}>
            <Trophy size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <h3>Election Concluded</h3>
            <p>The voting period for this election has ended. Results are now available.</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate(`/results/${selectedElection._id}`)}>
              View Results
            </button>
          </div>
        ) : hasVoted ? (
          <div className="glass-panel text-center" style={{ padding: '3rem' }}>
            <CheckCircle size={48} style={{ color: 'var(--success-color)', marginBottom: '1rem' }} />
            <h3>Vote Recorded</h3>
            <p>You have already participated in this election. Results will be available once the election is closed.</p>
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h2>Active & Upcoming Elections</h2>
      <p>Browse the list of elections below and participate in those that are currently ongoing.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {elections.map(el => {
          const now = new Date();
          const isStarted = now >= new Date(el.startTime);
          const isEnded = now > new Date(el.endTime) || el.status === 'completed';
          const hasVoted = user.votedElections.includes(el._id);

          return (
            <div key={el._id} className="glass-panel election-list-item" onClick={() => handleSelectElection(el)} style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s' }}>
              <div>
                <h3 style={{ margin: 0 }}>{el.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                  {new Date(el.startTime).toLocaleString()} - {new Date(el.endTime).toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className={`status-badge ${isEnded ? 'danger' : isStarted ? 'success' : 'warning'}`} style={{ fontSize: '0.7rem' }}>
                    {isEnded ? 'Closed' : isStarted ? 'Ongoing' : 'Upcoming'}
                  </span>
                  {hasVoted && (
                    <span className="status-badge" style={{ fontSize: '0.7rem', background: 'var(--success-color)', color: 'white' }}>
                      Voted
                    </span>
                  )}
                </div>
              </div>
              <button className="btn btn-secondary">Enter</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
