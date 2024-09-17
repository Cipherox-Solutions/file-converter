// const express = require('express');
// const multer = require('multer');
// const sharp = require('sharp');
// const path = require('path');
// const fs = require('fs');
// const app = express();
// const port = 1337;

// // Ensure the uploads folder exists
// const uploadsDir = 'uploads/';
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// // Configure multer for file uploads
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, uploadsDir);
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
//   }),
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|gif/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error('File upload only supports the following filetypes - ' + filetypes));
//   }
// });

// // Route to test the server running
// app.get('/', (req, res) => {
//   res.send('Server is running!');
// });

// app.post('/images/process', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   const inputPath = req.file.path;
//   const outputFilename = `converted-${Date.now()}.webp`; 
//   const outputPath = path.join(uploadsDir, outputFilename);

//   sharp(inputPath)
//     .resize(300, 200, {
//       fit: 'contain', 
//       background: { r: 255, g: 255, b: 255, alpha: 1 },
//     })
//     .webp({ quality: 90 })  
//     .toFile(outputPath, (err, info) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error processing image', error: err.message });
//       }
//       res.json({
//         message: 'Image resized and converted to WebP successfully',
//         info,
//         originalImage: `/${inputPath}`,
//         webpImage: `/${outputPath}` 
//       });
//     });
// });

// // Start server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
// CommonJs
/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = require('fastify')({
  logger: true
})

fastify.register(require('./our-db-connector'))
fastify.register(require('./our-first-route'))

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
