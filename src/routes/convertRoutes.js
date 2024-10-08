const convertController = require('../controllers/convertController');
const formatController = require('../config/index'); 

async function routes(fastify, options) {
  formatController.forEach((conversion) => {
    const { fromFormat, toFormat, schema, } = conversion; // Destructure the conversion object
    fastify.post(`/${fromFormat}/to/${toFormat}`, { schema }, async function (request, reply) {
      await convertController.indexContainer(request, reply, { fromFormat: fromFormat, toFormat: toFormat, conversion });
    });
  });
}
module.exports = routes;

