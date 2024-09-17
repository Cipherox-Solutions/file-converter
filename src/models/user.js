const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  credits: { type: Number, default: 10 },  // Initial credits
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
