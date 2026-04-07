const express = require('express');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get election status
router.get('/election', async (req, res) => {
  try {
    let election = await Election.findOne();
    if (!election) {
      election = new Election();
      await election.save();
    }
    res.json(election);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle election status
router.post('/election/toggle', adminAuth, async (req, res) => {
  try {
    let election = await Election.findOne();
    if (!election) {
      election = new Election();
    }
    election.isOpen = !election.isOpen;
    await election.save();
    res.json(election);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a candidate
router.post('/candidates', adminAuth, async (req, res) => {
  try {
    const { name, party, description, imageUrl } = req.body;
    const candidate = new Candidate({ name, party, description, imageUrl });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a candidate
router.put('/candidates/:id', adminAuth, async (req, res) => {
  try {
    const { name, party, description, imageUrl } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { name, party, description, imageUrl },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a candidate
router.delete('/candidates/:id', adminAuth, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
