const express = require('express');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const Election = require('../models/Election');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all candidates
router.get('/candidates', async (req, res) => {
  try {
    const list = await Candidate.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cast a vote
router.post('/', auth, async (req, res) => {
  try {
    const { candidateId } = req.body;
    const userId = req.user.userId;

    const election = await Election.findOne();
    if (!election || !election.isOpen) {
      return res.status(400).json({ error: 'Election is not open.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.hasVoted) {
      return res.status(400).json({ error: 'Already voted. Vote blocked.' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    // Process vote
    candidate.voteCount += 1;
    await candidate.save();

    user.hasVoted = true;
    await user.save();

    res.json({ message: 'Vote recorded securely.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get results
router.get('/results', async (req, res) => {
  try {
    const election = await Election.findOne();
    if (election && election.isOpen) {
       return res.status(400).json({ error: 'Results will be published after the election is closed.' });
    }
    let candidates = await Candidate.find();
    candidates = candidates.sort((a, b) => b.voteCount - a.voteCount);
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
