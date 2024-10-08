const crypto = require('crypto');
exports.generateUniqueHash = () => {
    return crypto.randomBytes(16).toString('hex');
  };