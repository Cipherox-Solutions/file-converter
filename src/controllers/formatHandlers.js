const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');
const im = require('imagemagick');
const sharp = require('sharp');
const os = require('os')
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
    // Define a temporary directory based on the OS
    const tempDir = path.join(os.tmpdir(), 'imageMagickTemp'); 
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
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

    // Define the output file path based on the OS
    let outputDir;
    if (os.platform() === 'win32') {
        // For Windows, use 'Downloads' folder as an example (you can customize this)
        outputDir = path.join(os.homedir(), 'Downloads'); 
    } else {
        // For macOS/Linux, use 'Desktop' as per the previous requirement
        outputDir = path.join(os.homedir(), 'Desktop');
    }
    console.log('os.platform()',os.platform())
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputFile = path.join(outputDir, `convertedImage.${outputFormat}`);

    // Run the image conversion using ImageMagick
    runImageMagickCommand(localInputFile, outputFile, options, callback);
};



//sharp image handler 

const sharpImageHandler = async (inputFile, outputFormat, options = {}) => {
    const outputFile = path.basename(inputFile, path.extname(inputFile)) + `.${outputFormat}`;
    try {
        let image = sharp(inputFile)
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
        console.log(`Conversion successful: ${outputFile}`);
    }
    catch (error) {
        console.log(error)
    }
}

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
    imageMagicHandler,
    sharpImageHandler
};
