require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const convertRoutes = require('./src/routes/convertRoutes');

fastify.register(require('@fastify/multipart'));  // For handling file uploads

// Register routes with the prefix /convert
fastify.register(convertRoutes, { prefix: '/convert' });

console.log('Database Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

fastify.register(require('fastify-mariadb'), {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 5,
  cachingRsaPublicKey: '/Users/apple/Desktop/keys/public-key.pem',
  allowPublicKeyRetrieval: true

}).after((err) => {
  if (err) {
    console.log(err)
    fastify.log.error('Error starting fastify-mariadb:', err);
    return;  // Exit if there's an error
  }
  fastify.log.info('fastify-mariadb started successfully');
});

fastify.get('/mariadb/time', (req, reply) => {
  // `pool.query`
  fastify.mariadb.query('SELECT now()', (err, result) => {
    reply.send(err || result)
  })
})

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000 });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);  
    process.exit(1);
  }
};

start();
