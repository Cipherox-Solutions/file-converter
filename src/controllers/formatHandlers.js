const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');
const im = require('imagemagick');

// Helper to download an image from a URL
const downloadImage = async (inputFile, tempDir) => {
    const fileExtension = path.extname(inputFile) || '.jpg';
    const localInputFile = path.join(tempDir, `tempImage${fileExtension}`);

    const response = await axios.get(inputFile, { responseType: 'stream' });
    const writer = fs.createWriteStream(localInputFile);

    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    return localInputFile;
};

// Helper to run ImageMagick commands
const runImageMagickCommand = (inputFile, outputFile, options, callback) => {
    let command = `magick "${inputFile}"`;

    // Add resize options if provided
    if (options.width || options.height) {
        const resizeOptions = [];
        if (options.width) resizeOptions.push(`${options.width}`);
        if (options.height) resizeOptions.push(`${options.height}`);
        command += ` -resize ${resizeOptions.join('x')}`;
    }

    // Add crop options if provided
    if (options.crop) {
        const { width, height, x, y } = options.crop;
        command += ` -crop ${width}x${height}+${x}+${y}`;
    }

    // Add other options if provided
    if (options.rotate) {
        command += ` -rotate ${options.rotate}`;
    }

    // Add flip or flop options
    if (options.flip) command += ' -flip';  // Vertical flip
    if (options.flop) command += ' -flop';  // Horizontal flip

    // Specify the output file
    command += ` "${outputFile}"`;

    // Execute the command
    exec(command, (err, stdout, stderr) => {
        if (err) return callback(new Error(`Conversion error: ${stderr || stdout}`));
        callback(null, outputFile);
    });
};

// Main handler for ImageMagick operations
const imageMagicHandler = async (inputFile, outputFormat, options = {}, callback) => {
    console.log('inputFile:', inputFile);

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Check if the input is a URL and download it if necessary
    let localInputFile = inputFile;
    if (inputFile.startsWith('http://') || inputFile.startsWith('https://')) {
        try {
            localInputFile = await downloadImage(inputFile, tempDir);
        } catch (error) {
            return callback(error);
        }
    } else {
        // Ensure the local file exists before proceeding
        if (!fs.existsSync(inputFile)) {
            return callback(new Error(`Local file not found: ${inputFile}`));
        }
    }

    // Define the output file path (saving to the desktop as per your requirement)
    const outputFile = path.join('/Users/apple/Desktop', `convertedImage.${outputFormat}`);
    console.log('outputFile', outputFile);

    // Run ImageMagick to convert the image
    runImageMagickCommand(localInputFile, outputFile, options, callback);
};

// Specific format handlers
const jpgToBmpHandler = (file, options, callback) => imageMagicHandler(file, 'bmp', options, callback);
const jpgToPngHandler = (file, options, callback) => imageMagicHandler(file, 'png', options, callback);
const jpgToPdfHandler = (file, options, callback) => imageMagicHandler(file, 'pdf', options, callback);
const pngToSvgHandler = (file, options, callback) => imageMagicHandler(file, 'svg', options, callback);

module.exports = {
    jpgToBmpHandler,
    jpgToPngHandler,
    jpgToPdfHandler,
    pngToSvgHandler,
    imageMagicHandler
};
