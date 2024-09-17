const express = require('express');
const multer = require('multer');
const FormatToFormat = require('../models/');
const { convertImageFormat } = require('../services/formatToFormatConversion');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Use multer to handle file uploads

// API to upload an image and specify conversion formats
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Create a new format-to-format conversion entry in MongoDB
    const newImage = new FormatToFormat({
      originalFilename: req.file.filename,
      originalFormat: req.file.mimetype.split('/')[1],
      originalSize: req.file.size,
      convertedFormats: [
        { format: 'jpeg', quality: 80 },
        { format: 'png' },
        { format: 'webp', quality: 90 }
      ]
    });

    const savedImage = await newImage.save();

    // Start the image format conversion
    convertImageFormat(savedImage._id, req.file.path);

    res.status(201).json({
      message: 'Image uploaded and format conversion started',
      imageId: savedImage._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// API to get the status of the conversion
router.get('/status/:id', async (req, res) => {
  try {
    const imageDoc = await FormatToFormat.findById(req.params.id);
    if (!imageDoc) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json(imageDoc);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching image status', error: error.message });
  }
});

module.exports = router;
