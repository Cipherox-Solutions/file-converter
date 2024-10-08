const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); 
const formatController = require('../config/index');
const CxValidator = require('../config/validator');
const axios = require('axios');
const generateUniqueHash = require('../utils/uniqueHash');
const pool = require('../config/database')

// Function to generate a unique hash based on the output file path
const generatePathHash = (filePath) => {
  return crypto.createHash('sha256').update(filePath).digest('hex');
};

const isSupportedFormat = (fromFormat, toFormat) => {
  return formatController.find(conversion =>
    conversion.fromFormat === fromFormat && conversion.toFormat === toFormat
  );
};

const validateInput = (conversionObj, userDataset) => {
  if (conversionObj.validate) {
    const validationRules = conversionObj.validate;
    const validator = new CxValidator(validationRules, userDataset);
    return validator.validateDataset(validationRules, userDataset);
  }
  return null;
};

// Function to download a file (used in your route)
const downloadFile = async () => {
  try {
    const response = await axios.get('http://localhost:3000/download', {
      responseType: 'blob',
    });
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error downloading the file:', error);
  }
};

// Function to save the hash into the database
const saveHashToDB = async (fileHash, filePath, expiresAt = null, isPublic = false) => {
  try {
    const connection = await pool.getConnection();
    const query = `
      INSERT INTO hOqil_temp_links (file_hash, file_path, expires_at)
      VALUES (?, ?, ?)
    `;
    await connection.query(query, [fileHash, filePath, expiresAt]);
    connection.release();
    console.log('File hash saved successfully!');
  } catch (error) {
    console.error('Error saving file hash to the database:', error);
  }
};

exports.indexContainer = async (req, reply, options) => {
  try {
    const { fromFormat, toFormat } = options;
    const { resize, "pdf-standard": pdfStandard, rotate, flip } = req.body;

    if (!req.body?.file) {
      return reply.status(400).send({ error: 'No file provided. Please upload a file for conversion.' });
    }

    const conversionObj = isSupportedFormat(fromFormat, toFormat);
    if (!conversionObj) {
      return reply.status(404).send({ error: `Conversion from ${fromFormat} to ${toFormat} is not supported.` });
    }

    const userDataset = { 'pdf-standard': pdfStandard || "A4" };
    const validationErrors = validateInput(conversionObj, userDataset);

    if (validationErrors && Object.keys(validationErrors).length > 0) {
      return reply.status(400).send({ error: validationErrors });
    }

    const { file } = req.body;
    const fileName = file.filename;
    const savePath = path.join(__dirname, 'temp', fileName);

    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await fs.promises.writeFile(savePath, await file.toBuffer());

    const outputFile = await new Promise((resolve, reject) => {
      conversionObj.handler(savePath, toFormat, { rotate, resize, pdfStandard, flip: !!flip }, (err, resultFilePath) => {
        if (err) {
          return reject(err);
        }
        resolve(resultFilePath);
      });
    });

    if (!outputFile || !fs.existsSync(outputFile)) {
      return reply.status(404).send({ error: 'File not found after conversion.' });
    }

    const filePath = path.resolve(outputFile);
    const fileNames = path.basename(filePath);
    const stream = fs.createReadStream(outputFile);

    // Generate a unique hash of the output file path
    const uniqueHash = generatePathHash(filePath);
    console.log('Unique hash for the output file:', uniqueHash);

    // Save the unique hash and file details into the database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expiration to 24 hours from now
    await saveHashToDB(uniqueHash, filePath, expiresAt); // Save with default `is_public` as false

    reply
      .header('Content-Disposition', `attachment; filename=${fileNames}`)
      .type('application/octet-stream')
      .code(200);
    downloadFile(); // Optional call to download function
    return reply.status(200).send(stream);
  } catch (error) {
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
};
