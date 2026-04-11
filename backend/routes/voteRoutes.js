const express = require('express');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const Election = require('../models/Election');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all candidates for an election
router.get('/candidates/:electionId', async (req, res) => {
  try {
    const list = await Candidate.find({ electionId: req.params.electionId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cast a vote
router.post('/:electionId', auth, async (req, res) => {
  try {
    const { candidateId } = req.body;
    const { electionId } = req.params;
    const userId = req.user.userId;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found.' });
    }

    const now = new Date();
    if (now < election.startTime) {
      return res.status(400).json({ error: 'Election has not started yet.' });
    }
    if (now > election.endTime || election.status === 'completed') {
      return res.status(400).json({ error: 'Election is closed.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.votedElections.includes(electionId)) {
      return res.status(400).json({ error: 'Already voted in this election.' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate || candidate.electionId.toString() !== electionId) {
      return res.status(404).json({ error: 'Candidate not found in this election.' });
    }

    // Process vote
    candidate.voteCount += 1;
    await candidate.save();

    user.votedElections.push(electionId);
    await user.save();

    res.json({ message: 'Vote recorded securely.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get results for an election
router.get('/results/:electionId', async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) return res.status(404).json({ error: 'Election not found' });

    const now = new Date();
    if (election.status !== 'completed' && now < election.endTime) {
       return res.status(400).json({ error: 'Results will be published after the election is closed.' });
    }

    let candidates = await Candidate.find({ electionId: req.params.electionId });
    candidates = candidates.sort((a, b) => b.voteCount - a.voteCount);
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
