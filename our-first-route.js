/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {
  
    fastify.get('/', async (request, reply) => {
      return { hello: 'world' }
    })
  }
  
  module.exports = routes