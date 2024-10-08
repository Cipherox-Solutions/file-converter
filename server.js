require('dotenv').config();
const fastify = require('fastify')({
  logger: true
});
const fs = require('fs');
const path = require('path');
const pool = require('./src/config/database');

const multipart = require('@fastify/multipart');
const formbody = require('@fastify/formbody');
const cors = require('@fastify/cors');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const convertRoutes = require('./src/routes/convertRoutes');
const {
  generateKeyPairSync
} = require('crypto');

const corsOptions = {
  credentials: true,
  origin: ['*'],
};

fastify.register(multipart, {
  attachFieldsToBody: true
});
fastify.register(formbody);
fastify.register(cors, corsOptions);

const {
  publicKey,
  privateKey
} = generateKeyPairSync('rsa', {
  modulusLength: 2048
});
const publicKeyPem = publicKey.export({
  type: 'spki',
  format: 'pem'
});
const privateKeyPem = privateKey.export({
  type: 'pkcs8',
  format: 'pem'
});
console.log('Private Key:', privateKeyPem, 'Public Key:', publicKeyPem);

fastify.register(swagger, {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Image Conversion API',
      description: 'API documentation for image format conversion',
      version: '1.0.0',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
  exposeRoute: true,
});

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  swagger: {
    url: '/documentation/json'
  },
  exposeRoute: true,
});

async function queryDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ${process.env.DB_PREFIX}temp_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_hash VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        is_public BOOLEAN DEFAULT FALSE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ${process.env.DB_PREFIX}user_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        public_key TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ${process.env.DB_PREFIX}user_storages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL,
        storage_type ENUM('FTP', 'S3') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
		CREATE TABLE IF NOT EXISTS ${process.env.DB_PREFIX}user_activity (
       id INT AUTO_INCREMENT PRIMARY KEY,
       api VARCHAR(255) NOT NULL,
       temp_link_id INT NOT NULL,
       parameters JSON,
       time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       credit INT DEFAULT 433
);`)
    console.log('Database tables have been set up.');

  } catch (err) {
    console.error('Error querying the database:', err);
  } finally {
    if (connection) connection.release();
  }
}

fastify.get('/download/:hash', (request, reply) => {
  const {
    hash
  } = request.params;
  const tempDir = path.join(__dirname, 'temp');
  const files = fs.readdirSync(tempDir);

  const matchedFile = files.find(file => file.startsWith(hash));

  if (!matchedFile) {
    return reply.status(404).send({
      error: 'File not found or expired.'
    });
  }

  const filePath = path.join(tempDir, matchedFile);
  const fileName = path.basename(filePath).split('-').slice(1).join('-');

  const stream = fs.createReadStream(filePath);
  reply
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .type('application/octet-stream')
    .code(200)
    .send(stream);
});

fastify.register(convertRoutes, {
  prefix: '/convert'
});

const start = async () => {
  try {
    await queryDatabase();
    await fastify.listen({
      port: process.env.PORT || 3000
    });
    fastify.log.info(`Server listening on port ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();