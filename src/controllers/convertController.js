const formatController = require('../config/index');
const fs = require('fs');
const path = require('path');
const os = require('os');  // For determining user's desktop path
const CxValidator = require('../config/validator');

// Helper function to check if the conversion format is supported
const isSupportedFormat = (fromFormat, toFormat) => {
  return formatController.find((conversion) =>
    conversion.fromFormat === fromFormat && conversion.toFormat === toFormat
  );
};

// Helper function to validate user input
const validateInput = (conversionObj, userDataset) => {
  if (conversionObj.validate) {
    const validationRules = conversionObj.validate;
    const validator = new CxValidator(validationRules, userDataset);
    return validator.validateDataset(validationRules, userDataset);
  }
  return null; // No validation required
};

// Main function to handle image conversion
exports.indexContainer = async (req, reply, options) => {
  try {
    const { fromFormat, toFormat } = options;
    const { resize, crop, "pdf-standard": pdfStandard, rotate, flip } = req; 

    // Check if the conversion format is supported
    const conversionObj = isSupportedFormat(fromFormat, toFormat);
    if (!conversionObj) {
      return reply.status(404).send({
        error: `Conversion from ${fromFormat} to ${toFormat} is not supported.`,
      });
    }

    const userDataset = { 'pdf-standard': "A4" };

    // Validate input if necessary
    const validationErrors = validateInput(conversionObj, userDataset);
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      return reply.status(400).send({
        error: validationErrors,
      });
    }

    const { file } = req.body;

    // Get file details
    const fileName = file.filename;
    const fileBuffer = await file.toBuffer();
    const savePath = path.join(__dirname, 'temp', fileName);

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }

    // Save the file to the temp directory
    fs.writeFileSync(savePath, fileBuffer);

    // Process conversion
    const outputFile = await new Promise((resolve, reject) => {
      conversionObj.handler(
        savePath,
        toFormat,
        {
          rotate,
          resize: { width: 10000, height: 30000 },
          crop,
          pdfStandard,
          flip: flip == undefined || flip == 0 ? false : true,
        },
        (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });

    // Ensure the output file path is correct
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const outputFilePath = path.join(desktopPath, `converted_${fileName}`);

    // Write the result to the output file path
    fs.writeFileSync(outputFilePath, outputFile);

    // Stream the file back to the client
    const fileStream = fs.createReadStream(outputFilePath);

    // Set the headers for file download
    reply.header('Content-Disposition', `attachment; filename="${path.basename(outputFilePath)}"`);
    reply.header('Content-Type', 'application/octet-stream');

    // Send the file stream in the response
    return reply.send(fileStream);
  } catch (error) {
    console.error('Error during conversion:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
    });
  }
};
