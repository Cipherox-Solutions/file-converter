const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');
const sharp = require('sharp');
const os = require('os');

// Define the temp directory relative to the project directory
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Helper to download an image from a URL
const downloadImage = async (inputFile) => {
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

    if (options.width || options.height) {
        const resizeOptions = [];
        if (options.width) resizeOptions.push(`${options.width}`);
        if (options.height) resizeOptions.push(`${options.height}`);
        command += ` -resize ${resizeOptions.join('x')}`;
    }

    if (options.rotate) {
        command += ` -rotate ${options.rotate}`;
    }

    if (options.flip) command += ' -flip';
    if (options.flop) command += ' -flop';

    command += ` "${outputFile}"`;

    exec(command, (err, stdout, stderr) => {
        if (err) return callback(new Error(`Conversion error: ${stderr || stdout}`));
        const fileStream = fs.createReadStream(outputFile);
        callback(null, outputFile, fileStream);
    });
};

// Main handler for ImageMagick operations
const imageMagicHandler = async (inputFile, outputFormat, options = {}, callback) => {
    let localInputFile = inputFile;

    if (inputFile.startsWith('http://') || inputFile.startsWith('https://')) {
        try {
            localInputFile = await downloadImage(inputFile);
        } catch (error) {
            return callback(error);
        }
    } else if (!fs.existsSync(inputFile)) {
        return callback(new Error(`Local file not found: ${inputFile}`));
    }

    const outputFile = path.join(tempDir, `convertedImage.${outputFormat}`);
    runImageMagickCommand(localInputFile, outputFile, options, (error, outputFilePath) => {
        if (error) return callback(error);

        const fileStream = fs.createReadStream(outputFilePath);
        callback(null, outputFilePath, fileStream);
    });
};

// Sharp image handler
const sharpImageHandler = async (inputFile, outputFormat, options = {}, callback) => {
    const outputFile = path.join(tempDir, path.basename(inputFile, path.extname(inputFile)) + `.${outputFormat}`);
    try {
        let image = sharp(inputFile);

        if (options.resize) {
            image = image.resize(options.resize.width, options.resize.height);
        }
        if (options.crop) {
            image = image.extract({
                left: options.crop.left,
                top: options.crop.top,
                width: options.crop.width,
                height: options.crop.height,
            });
        }
        if (options.rotate) {
            image = image.rotate(options.rotate);
        }
        if (options.flip) {
            image = image.flip();
        }
        if (options.flop) {
            image = image.flop();
        }

        await image.toFormat(outputFormat).toFile(outputFile);

        const readStream = fs.createReadStream(outputFile);
        callback(null, outputFile, readStream);
    } catch (error) {
        callback(error);
    }
};

module.exports = {
    imageMagicHandler,
    sharpImageHandler,
};
