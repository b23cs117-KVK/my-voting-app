import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BarChart3, Trophy, ArrowLeft, Calendar } from 'lucide-react';

export default function Results() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [elections, setElections] = useState([]);
  const [electionInfo, setElectionInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (electionId) {
      fetchResults(electionId);
      fetchElectionInfo(electionId);
    } else {
      fetchCompletedElections();
    }
  }, [electionId]);

  const fetchCompletedElections = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/elections`);
      // Only show elections that are completed or whose endTime has passed
      const completed = res.data.filter(el => el.status === 'completed' || new Date(el.endTime) < new Date());
      setElections(completed);
    } catch (err) {
      setError('Could not fetch elections');
    }
  };

  const fetchElectionInfo = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/elections`);
      const info = res.data.find(el => el._id === id);
      setElectionInfo(info);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResults = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/vote/results/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch results');
    }
  };

  const totalVotes = results.reduce((acc, curr) => acc + curr.voteCount, 0);

  if (!electionId) {
    return (
      <div className="container animate-fade-in">
        <h2 className="mb-4">Election Archive</h2>
        <p className="mb-8">Select a concluded election to view its final results and statistics.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {elections.map(el => (
            <Link 
              key={el._id} 
              to={`/results/${el._id}`}
              className="glass-panel" 
              style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{el.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Concluded on {new Date(el.endTime).toLocaleDateString()}
                </p>
              </div>
              <BarChart3 size={20} style={{ color: 'var(--primary-color)' }} />
            </Link>
          ))}
          {elections.length === 0 && (
            <div className="glass-panel text-center" style={{ padding: '3rem' }}>
              <Calendar size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
              <p>No concluded elections found.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container animate-fade-in center-wrapper">
        <div className="glass-panel status-card">
          <BarChart3 size={48} className="status-icon" style={{ color: 'var(--text-secondary)' }} />
          <h2>Results Unavailable</h2>
          <p>{error}</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/results')}>Back to Archive</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <button className="btn mb-4" onClick={() => navigate('/results')} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={18} /> Back to Archive
      </button>

      <div className="text-center mb-8">
        <h2>{electionInfo?.title || 'Election Results'}</h2>
        <p>Total Votes Cast: {totalVotes}</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {results.map((c, index) => {
          const percentage = totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0;
          const isWinner = index === 0 && c.voteCount > 0;
          
          return (
            <div key={c._id} className={`glass-panel mb-4 ${isWinner ? 'winner-card' : ''}`} style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              {isWinner && (
                <div style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: '#fbbf24' }}>
                  <Trophy size={32} />
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{c.name} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({c.party})</span></h3>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{c.voteCount} votes</span>
              </div>
              
              <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', height: '12px', borderRadius: '6px', overflow: 'hidden', marginTop: '1rem' }}>
                <div 
                  style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    backgroundColor: isWinner ? '#fbbf24' : 'var(--primary-color)',
                    transition: 'width 1s ease-in-out'
                  }}
                />
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
