import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [election, setElection] = useState({ isOpen: false });
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', description: '', imageUrl: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchElectionStatus();
    fetchCandidates();
  }, []);

  const fetchElectionStatus = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/election`);
    setElection(res.data);
  };

  const fetchCandidates = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/vote/candidates`);
    setCandidates(res.data);
  };

  const toggleElection = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/admin/election/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setElection(res.data);
      setMessage(res.data.isOpen ? 'Election Started' : 'Election Closed');
    } catch (err) {
      setMessage('Error toggling election');
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/candidates`, newCandidate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Candidate added successfully!');
      setNewCandidate({ name: '', party: '', description: '', imageUrl: '' });
      fetchCandidates();
    } catch (err) {
      setMessage('Error adding candidate');
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <button 
          className={`btn ${election.isOpen ? 'btn-danger' : 'btn-primary'}`}
          onClick={toggleElection}
        >
          <Power size={18} />
          {election.isOpen ? 'Stop Election' : 'Start Election'}
        </button>
      </div>

      {message && (
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', alignSelf: 'start' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} /> Add Candidate
          </h3>
          <form onSubmit={addCandidate} className="mt-4">
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-input" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Party</label>
              <input type="text" className="form-input" value={newCandidate.party} onChange={e => setNewCandidate({...newCandidate, party: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Image URL (Optional)</label>
              <input type="text" className="form-input" value={newCandidate.imageUrl} onChange={e => setNewCandidate({...newCandidate, imageUrl: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-input" rows="3" value={newCandidate.description} onChange={e => setNewCandidate({...newCandidate, description: e.target.value})} required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Add Candidate</button>
          </form>
        </div>

        <div>
          <h3>Current Candidates</h3>
          <div className="candidate-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', marginTop: '1rem' }}>
            {candidates.map(c => (
              <div key={c._id} className="candidate-card glass-panel flex-row">
                <div style={{ padding: '1rem' }}>
                  <span className="candidate-party">{c.party}</span>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{c.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
