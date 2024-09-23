const formatController = require('../config/index');
const fs = require('fs');
const path = require('path');
const Validator = require('../utils/Validator');

exports.convertImage = async (req, reply) => {
  try {
    const { fromFormat, toFormat } = req.params;
    const { resize, crop, pdf_standard } = req;  // Assuming request body contains parameters

    if (!formatController[fromFormat] || !formatController[fromFormat][toFormat]) {
      return reply.status(404).send({
        error: `Conversion from ${fromFormat} to ${toFormat} is not supported.`,
      });
    }

    const conversionObj = formatController[fromFormat][toFormat];
    console.log('conversionObj', conversionObj.handler);

    // Validate if necessary
    if (conversionObj.validate) {
      const validator = new Validator();
      
      const validationRules = conversionObj.validate;
      
      // Check if `toFormat` is `pdf` and run the validation
      if (toFormat === 'pdf') {
        const validationErrors = validator.validate(validationRules.pdf_standrend, req);

        if (validationErrors) {
          return reply.status(400).send({
            error: validationErrors,
          });
        }
      }
    }

    const inputFile = await req.file();
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const localFilePath = path.join(tempDir, inputFile.filename);
    const fileStream = fs.createWriteStream(localFilePath);
    await inputFile.file.pipe(fileStream);

    await new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
    console.log('localFilePath', localFilePath);

    const outputFile = await new Promise((resolve, reject) => {
      conversionObj.handler(localFilePath, toFormat, { rotate: 180, resize, crop }, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    // Send the output file back
    return reply.send(outputFile);
  } catch (error) {
    console.error('Error during conversion:', error);
    reply.status(500).send({
      error: 'Internal Server Error',
    });
  }
};
