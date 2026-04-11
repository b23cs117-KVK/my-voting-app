import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { Power, PlusCircle, Edit2, Trash2, X, Calendar, Clock, List } from 'lucide-react';

export default function AdminDashboard() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState('');
  
  // Election Form
  const [electionForm, setElectionForm] = useState({ title: '', description: '', startTime: '', endTime: '' });
  const [editingElectionId, setEditingElectionId] = useState(null);

  // Candidate Form
  const [candidateForm, setCandidateForm] = useState({ name: '', party: '', description: '', imageUrl: '' });
  const [editingCandidateId, setEditingCandidateId] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchCandidates(selectedElection._id);
    } else {
      setCandidates([]);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/elections`);
      setElections(res.data);
    } catch (err) {
      setMessage('Error fetching elections');
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/vote/candidates/${electionId}`);
      setCandidates(res.data);
    } catch (err) {
      setMessage('Error fetching candidates');
    }
  };

  const handleElectionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingElectionId) {
        await axios.put(`${API_BASE_URL}/api/admin/elections/${editingElectionId}`, electionForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Election updated!');
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/elections`, electionForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Election created!');
      }
      setElectionForm({ title: '', description: '', startTime: '', endTime: '' });
      setEditingElectionId(null);
      fetchElections();
    } catch (err) {
      setMessage('Error saving election');
    }
  };

  const handleStopElection = async (id) => {
    if (!window.confirm('Are you sure you want to STOP this election and notify all users?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/admin/elections/${id}/stop`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Election stopped and users notified!');
      fetchElections();
      if (selectedElection?._id === id) {
        setSelectedElection(res.data.election);
      }
    } catch (err) {
      setMessage('Error stopping election');
    }
  };

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedElection) return setMessage('Please select an election first');
    try {
      const token = localStorage.getItem('token');
      const data = { ...candidateForm, electionId: selectedElection._id };
      if (editingCandidateId) {
        await axios.put(`${API_BASE_URL}/api/admin/candidates/${editingCandidateId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Candidate updated!');
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/candidates`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Candidate added!');
      }
      setCandidateForm({ name: '', party: '', description: '', imageUrl: '' });
      setEditingCandidateId(null);
      fetchCandidates(selectedElection._id);
    } catch (err) {
      setMessage('Error saving candidate');
    }
  };

  const handleCandidateFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCandidateForm({ ...candidateForm, imageUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <h2>Admin Dashboard</h2>
      
      {message && (
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
          {message}
        </div>
      )}

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <List size={24} style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{elections.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Elections</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Clock size={24} style={{ marginBottom: '0.5rem', color: 'var(--success-color)' }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {elections.filter(el => {
              const now = new Date();
              return now >= new Date(el.startTime) && now <= new Date(el.endTime) && el.status !== 'completed';
            }).length}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ongoing</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Calendar size={24} style={{ marginBottom: '0.5rem', color: 'var(--warning-color)' }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {elections.filter(el => new Date(el.startTime) > new Date()).length}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upcoming</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Power size={24} style={{ marginBottom: '0.5rem', color: 'var(--danger-color)' }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {elections.filter(el => el.status === 'completed' || new Date(el.endTime) < new Date()).length}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Completed</div>
        </div>
      </div>

      {/* Election Management Section */}
      <section style={{ marginBottom: '4rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Calendar size={24} /> Election Management
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h4>{editingElectionId ? 'Edit Election' : 'Create New Election'}</h4>
            <form onSubmit={handleElectionSubmit} className="mt-4">
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-input" value={electionForm.title} onChange={e => setElectionForm({...electionForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="datetime-local" className="form-input" value={electionForm.startTime} onChange={e => setElectionForm({...electionForm, startTime: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="datetime-local" className="form-input" value={electionForm.endTime} onChange={e => setElectionForm({...electionForm, endTime: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows="2" value={electionForm.description} onChange={e => setElectionForm({...electionForm, description: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} type="submit">
                  {editingElectionId ? 'Update' : 'Create'}
                </button>
                {editingElectionId && (
                  <button className="btn btn-secondary" type="button" onClick={() => { setEditingElectionId(null); setElectionForm({ title: '', description: '', startTime: '', endTime: '' }); }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h4>All Elections</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {elections.map(el => (
                <div key={el._id} className={`glass-panel ${selectedElection?._id === el._id ? 'winner-card' : ''}`} style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{el.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                      Status: <span style={{ color: el.status === 'completed' ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: 'bold' }}>{el.status.toUpperCase()}</span>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(el.startTime).toLocaleString()} - {new Date(el.endTime).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setSelectedElection(el)}>
                      <List size={16} /> Candidates
                    </button>
                    {el.status !== 'completed' && (
                      <button className="btn btn-danger" style={{ padding: '0.5rem 1rem' }} onClick={() => handleStopElection(el._id)}>
                        <Power size={16} /> Stop
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Management Section - Only shown if an election is selected */}
      {selectedElection && (
        <section className="animate-fade-in">
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '3rem 0' }} />
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <PlusCircle size={24} /> Candidates for: {selectedElection.title}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h4>{editingCandidateId ? 'Edit Candidate' : 'Add Candidate'}</h4>
              <form onSubmit={handleCandidateSubmit} className="mt-4">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" className="form-input" value={candidateForm.name} onChange={e => setCandidateForm({...candidateForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Party</label>
                  <input type="text" className="form-input" value={candidateForm.party} onChange={e => setCandidateForm({...candidateForm, party: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <input type="file" accept="image/*" onChange={handleCandidateFileChange} className="form-input" />
                  <input type="text" className="form-input mt-2" placeholder="Or Image URL" value={candidateForm.imageUrl} onChange={e => setCandidateForm({...candidateForm, imageUrl: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-input" rows="2" value={candidateForm.description} onChange={e => setCandidateForm({...candidateForm, description: e.target.value})} required />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} type="submit">
                    {editingCandidateId ? 'Update' : 'Add'}
                  </button>
                  {editingCandidateId && (
                    <button className="btn btn-secondary" type="button" onClick={() => { setEditingCandidateId(null); setCandidateForm({ name: '', party: '', description: '', imageUrl: '' }); }}>Cancel</button>
                  )}
                </div>
              </form>
            </div>

            <div className="candidate-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {candidates.map(c => (
                <div key={c._id} className="candidate-card glass-panel">
                  {c.imageUrl && <img src={c.imageUrl} alt={c.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
                  <div style={{ padding: '1rem' }}>
                    <span className="candidate-party">{c.party}</span>
                    <h4 style={{ margin: '0.5rem 0' }}>{c.name}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn btn-primary" onClick={() => { setEditingCandidateId(c._id); setCandidateForm({ name: c.name, party: c.party, description: c.description, imageUrl: c.imageUrl }); }}>Edit</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
