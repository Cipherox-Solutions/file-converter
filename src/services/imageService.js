const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);

exports.convertImage = async (inputFilePath, toFormat) => {
  try {
    // Determine the output file path
    const outputFilePath = path.join(os.tmpdir(), `${path.basename(inputFilePath, path.extname(inputFilePath))}.${toFormat}`);

    // Perform the image conversion
    await sharp(inputFilePath)
      .toFormat(toFormat)
      .toFile(outputFilePath);

    // Optionally, remove the original file
    await unlinkAsync(inputFilePath);

    return outputFilePath;
  } catch (error) {
    throw new Error(`Image conversion failed: ${error.message}`);
  }
};
