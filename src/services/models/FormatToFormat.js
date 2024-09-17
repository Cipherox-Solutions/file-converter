const mongoose = require('mongoose');

// Define the schema for pre-converted images
const staticImageSchema = new mongoose.Schema({
  originalFilename: { type: String, required: true },
  originalFormat: { type: String, required: true }, 
  originalSize: { type: Number, required: true }, 
  conversions: [{
    format: { type: String, enum: ['jpeg', 'png', 'webp', 'tiff'], required: true },
    filename: { type: String, required: true },
    width: { type: Number, required: false }, 
    height: { type: Number, required: false }, 
    size: { type: Number, required: true }, 
    quality: { type: Number }, 
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const StaticImage = mongoose.model('StaticImage', staticImageSchema);

module.exports = StaticImage;