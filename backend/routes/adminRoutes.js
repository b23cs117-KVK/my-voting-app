const express = require('express');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const User = require('../models/User');
const axios = require('axios');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all elections
router.get('/elections', async (req, res) => {
  try {
    const list = await Election.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new election
router.post('/elections', adminAuth, async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const election = new Election({ title, description, startTime, endTime });
    await election.save();
    res.status(201).json(election);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update election
router.put('/elections/:id', adminAuth, async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(election);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual Stop Election & Notify Users
router.post('/elections/:id/stop', adminAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });

    election.status = 'completed';
    await election.save();

    // Notify all users via email bridge
    const users = await User.find({}, 'email name');
    const userEmails = users.map(u => u.email);

    // In a real app, we might send this in batches or using a mailing list.
    // Here we'll iterate or send a group email if the bridge supports it.
    // For simplicity, we'll try to notify them that results are ready.
    
    for (const user of users) {
      try {
        await axios.post(process.env.GOOGLE_BRIDGE_URL, {
          password: process.env.BRIDGE_PASSWORD,
          to: user.email,
          subject: `Important: Results for ${election.title} are now available`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
              <h2 style="color: #3b82f6;">Election Results Out!</h2>
              <p>Hi ${user.name},</p>
              <p>The election "<strong>${election.title}</strong>" has been concluded. You can now view the final results on the dashboard.</p>
              <a href="${process.env.FRONTEND_URL}/results/${election._id}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Results</a>
            </div>
          `
        });
      } catch (emailErr) {
        console.error(`Failed to send email to ${user.email}:`, emailErr.message);
      }
    }

    res.json({ message: 'Election stopped and users notified.', election });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a candidate to specific election
router.post('/candidates', adminAuth, async (req, res) => {
  try {
    const { name, party, description, imageUrl, electionId } = req.body;
    const candidate = new Candidate({ name, party, description, imageUrl, electionId });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a candidate
router.put('/candidates/:id', adminAuth, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
