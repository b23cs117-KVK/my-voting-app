import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { BarChart3, Trophy } from 'lucide-react';

export default function Results() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/vote/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch results');
    }
  };

  const totalVotes = results.reduce((acc, curr) => acc + curr.voteCount, 0);

  if (error) {
    return (
      <div className="container animate-fade-in center-wrapper">
        <div className="glass-panel status-card">
          <BarChart3 size={48} className="status-icon" style={{ color: 'var(--text-secondary)' }} />
          <h2>Results Unavailable</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="text-center mb-8">
        <h2>Election Results</h2>
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
