const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // First user becomes admin, else user
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      otp,
      otpExpires
    });
    await user.save();

    // Send Registration OTP via Google Apps Script Bridge
    try {
      await axios.post(process.env.GOOGLE_BRIDGE_URL, {
        password: process.env.BRIDGE_PASSWORD,
        to: user.email,
        subject: 'Verify Your Voting App Account',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
            <h2 style="color: #3b82f6;">Account Verification</h2>
            <p>Welcome, ${name}! Your One-Time Password (OTP) for registration is:</p>
            <h1 style="color: #1a1a1a; font-size: 32px; letter-spacing: 5px; background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 8px;">${otp}</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This code will expire in 5 minutes.</p>
          </div>
        `
      });
      console.log('Registration OTP Email sent to:', user.email);
    } catch (apiError) {
      console.error('OCRITICAL: Google Bridge Error (Register)!', apiError.message);
      // We still saved the user, but they can't verify yet without the email.
      // In a real app, we might rollback or allow resending.
    }

    res.status(201).json({ otpRequired: true, message: 'OTP sent for verification' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // MAGIC SWITCH: Automatically promote specific user to Admin on success
    if (user.email === 'b23cs117@kitsw.ac.in') {
      user.role = 'admin';
      await user.save();
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email via Google Apps Script Bridge (HTTP)
    try {
      const bridgeResponse = await axios.post(process.env.GOOGLE_BRIDGE_URL, {
        password: process.env.BRIDGE_PASSWORD,
        to: user.email,
        subject: 'Your Voting App Login OTP',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
            <h2 style="color: #3b82f6;">OTP Verification</h2>
            <p>Your One-Time Password (OTP) for login is:</p>
            <h1 style="color: #1a1a1a; font-size: 32px; letter-spacing: 5px; background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 8px;">${otp}</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This code will expire in 5 minutes.</p>
          </div>
        `
      });
      console.log('OTP Email Bridge Status:', bridgeResponse.data);
      console.log('OTP Email sent via Google Bridge to:', user.email);
    } catch (apiError) {
      console.error('CRITICAL: Google Bridge Error!');
      console.error(apiError.message);
      return res.status(500).json({ error: 'Failed to send OTP. Please check your Google Bridge URL.' });
    }

    res.json({ otpRequired: true, message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, votedElections: user.votedElections } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Forgot Password OTP
    try {
      await axios.post(process.env.GOOGLE_BRIDGE_URL, {
        password: process.env.BRIDGE_PASSWORD,
        to: user.email,
        subject: 'Password Reset OTP',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
            <h2 style="color: #3b82f6;">Password Reset</h2>
            <p>Your One-Time Password (OTP) for password reset is:</p>
            <h1 style="color: #1a1a1a; font-size: 32px; letter-spacing: 5px; background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 8px;">${otp}</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This code will expire in 5 minutes.</p>
          </div>
        `
      });
      console.log('Forgot Password OTP sent to:', user.email);
    } catch (apiError) {
      console.error('CRITICAL: Google Bridge Error (Forgot Password)!', apiError.message);
      return res.status(500).json({ error: 'Failed to send OTP.' });
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEMPORARY: Promote a user to admin (Delete this after use!)
router.get('/make-me-admin/:email', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { role: 'admin' },
      { new: true }
    );
    if (!user) return res.status(404).send('User not found');
    res.send(`SUCCESS: ${user.email} is now an ADMIN!`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/me', require('../middleware/auth').auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
