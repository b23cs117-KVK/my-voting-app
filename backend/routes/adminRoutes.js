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

module.exports = router;
