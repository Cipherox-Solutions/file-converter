const path = require('path');
const fs = require('fs');
const util = require('util');
const pipeline = util.promisify(require('stream').pipeline);

exports.upload = async (req) => {
  const file = await req.file();
  if (!file) return null;

  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const filePath = path.join(uploadDir, file.filename);
  await pipeline(file.file, fs.createWriteStream(filePath));
console.log('filePath',filePath)
  return { path: filePath, filename: file.filename };
};
