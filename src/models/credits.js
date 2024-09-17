const mongoose = require('mongoose');

// Define the Credit schema
const creditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  credits: { type: Number, required: true, default: 0 },
  lastTransaction: { type: Date, default: Date.now },
});

// Create the Credit model
const Credit = mongoose.model('Credit', creditSchema);

module.exports = Credit;
