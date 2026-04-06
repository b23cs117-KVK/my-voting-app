const express = require('express');

const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/vote', require('./routes/voteRoutes'));

// Health Check / Debugging Route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const statusMap = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  res.json({ 
    server: "Live", 
    database: statusMap[dbStatus],
    mongooseVersion: mongoose.version 
  });
});

// Start Server immediately for better observability on Render
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Connect to Database
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_app')
    .then(() => console.log('Connected to Real Cloud MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));
});
