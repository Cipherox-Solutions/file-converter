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
  console.log('req.body:', req);
  try {
    const { fromFormat, toFormat } = options;
    const { resize, crop, "pdf-standard": pdfStandard, rotate, flip } = req; 

    // // Check if the conversion format is supported
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
        error: validationErrors
      });
    }
    // 
    const { file } = req.body;

    // Get file details
    const fileName = file.filename;
    const fileBuffer = await file.toBuffer();
    const savePath = path.join(__dirname, 'temp', fileName);

    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }

    fs.writeFileSync(savePath, fileBuffer);
    const outputFile = await new Promise((resolve, reject) => {
      conversionObj.handler(savePath, toFormat, { rotate, resize: { width: 10000, height: 30000 }, crop, pdfStandard, flip:flip == 0 ? false : true  }, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
    // Send response
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const outputFilePath = path.join(desktopPath, path.basename(outputFile));
    return reply.send(outputFilePath);
  } catch (error) {
    console.error('Error during conversion:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
    });
  }
};
