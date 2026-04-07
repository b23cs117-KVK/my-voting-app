import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { Power, PlusCircle, Edit2, Trash2, X } from 'lucide-react';

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [election, setElection] = useState({ isOpen: false });
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', description: '', imageUrl: '' });
  const [editingId, setEditingId] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/admin/candidates/${editingId}`, newCandidate, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Candidate updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/candidates`, newCandidate, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Candidate added successfully!');
      }
      setNewCandidate({ name: '', party: '', description: '', imageUrl: '' });
      setEditingId(null);
      fetchCandidates();
    } catch (err) {
      setMessage(editingId ? 'Error updating candidate' : 'Error adding candidate');
    }
  };

  const handleEdit = (candidate) => {
    setEditingId(candidate._id);
    setNewCandidate({
      name: candidate.name,
      party: candidate.party,
      description: candidate.description,
      imageUrl: candidate.imageUrl || ''
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/admin/candidates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Candidate deleted successfully!');
      fetchCandidates();
    } catch (err) {
      setMessage('Error deleting candidate');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for safety
        setMessage('Error: File is too large (Max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCandidate({ ...newCandidate, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewCandidate({ name: '', party: '', description: '', imageUrl: '' });
    setMessage('');
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
            {editingId ? <Edit2 size={20} /> : <PlusCircle size={20} />} 
            {editingId ? 'Edit Candidate' : 'Add Candidate'}
          </h3>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-input" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Party</label>
              <input type="text" className="form-input" value={newCandidate.party} onChange={e => setNewCandidate({...newCandidate, party: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Candidate Image</label>
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                {newCandidate.imageUrl && (
                  <img 
                    src={newCandidate.imageUrl} 
                    alt="Preview" 
                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} 
                  />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>...or paste a URL below</p>
                <input type="text" className="form-input" placeholder="Image URL (Optional)" value={newCandidate.imageUrl} onChange={e => setNewCandidate({...newCandidate, imageUrl: e.target.value})} />
              </div>
            </div>
            <div className="form-group mt-4">
              <label>Description</label>
              <textarea className="form-input" rows="3" value={newCandidate.description} onChange={e => setNewCandidate({...newCandidate, description: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} type="submit">
                {editingId ? 'Update Candidate' : 'Add Candidate'}
              </button>
              {editingId && (
                <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={cancelEdit}>
                  <X size={18} /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h3>Current Candidates</h3>
          <div className="candidate-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', marginTop: '1rem' }}>
            {candidates.map(c => (
              <div key={c._id} className="candidate-card glass-panel flex-row" style={{ alignItems: 'center' }}>
                {c.imageUrl && (
                  <img src={c.imageUrl} alt={c.name} className="admin-candidate-img" />
                )}
                <div style={{ flex: 1, padding: '1rem' }}>
                  <span className="candidate-party">{c.party}</span>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{c.name}</h4>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '1rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem' }} 
                    onClick={() => handleEdit(c)}
                    title="Edit Candidate"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '0.5rem' }} 
                    onClick={() => handleDelete(c._id)}
                    title="Delete Candidate"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
