// const convertController = require('../controllers/convertController');

// async function routes(fastify, options) {
//   // Route structured like /convert/jpg/to/png
//   console.log('Registering convert routes');

//   fastify.post('/convert/:fromFormat/to/:toFormat', convertController.convertImage);

// }

// module.exports = routes;

const convertController = require('../controllers/convertController');

async function routes(fastify, options) {
  fastify.log.info('Registering convert routes');
  
  // Define the route with dynamic path parameters
  fastify.post('/:fromFormat/to/:toFormat', convertController.convertImage);
}

module.exports = routes;
