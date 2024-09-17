const sharp = require('sharp');
const StaticImage = require('./models/StaticImage');
const path = require('path');

// Example function to convert an image to webp
async function convertToWebp(inputPath, outputFilename) {
  try {
    const outputPath = `uploads/${outputFilename}`;

    // Convert image to webp using Sharp and maintain aspect ratio
    const info = await sharp(inputPath)
      .resize({
        width: 300,           // Adjust width as needed
        height: 200,          // Adjust height as needed
        fit: sharp.fit.inside, // Maintain aspect ratio and fit within the specified dimensions
        withoutEnlargement: true // Prevent enlarging if the original image is smaller
      })
      .webp({ quality: 90 })  // Convert to webp with quality setting
      .toFile(outputPath);

    // Save conversion details to the database
    const newImage = new StaticImage({
      originalFilename: path.basename(inputPath),
      originalFormat: 'jpg',  // Example original format
      originalSize: info.size,
      conversions: [{
        format: 'webp',
        filename: outputFilename,
        width: info.width,
        height: info.height,
        size: info.size,
        quality: 90,  // Optional quality value
      }]
    });

    await newImage.save();
    console.log('Image successfully converted and saved to DB', newImage);
  } catch (err) {
    console.error('Error converting image:', err);
  }
}

// Example usage
convertToWebp('uploads/example.jpg', 'example-converted.webp');
