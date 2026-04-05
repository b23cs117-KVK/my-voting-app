const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  isOpen: { type: Boolean, default: false }
});

module.exports = mongoose.model('Election', electionSchema);
