const express = require('express');
const router = express.Router();
const creditService = require('../services/creditService'); // Adjust the path as needed

// Handle POST request for creating a credit transaction
router.post('/', async (req, res) => {
  try {
    const { fileType, userId } = req.body; // Include userId in the request body
    const result = await creditService.handleTransaction(fileType, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
