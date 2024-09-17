const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Store uploaded files temporarily

// Endpoint for processing image
router.post('/process', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const { path: filePath, originalname } = req.file;
  const outputPath = path.join('uploads', 'output.jpg');

  sharp(filePath)
    .resize(300, 200)
    .toFile(outputPath, (err, info) => {
      if (err) {
        return res.status(500).send('Error processing image.');
      }

      // Remove the original uploaded file
      fs.unlinkSync(filePath);

      // Send the processed image file
      res.sendFile(outputPath, { root: '.' }, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Optionally, remove the processed image after sending
        fs.unlinkSync(outputPath);
      });
    });
});

module.exports = router;
