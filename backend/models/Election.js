const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed'], 
    default: 'upcoming' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Election', electionSchema);
