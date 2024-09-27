const {
  imageMagicHandler,
  sharpImageHandler
} = require('../controllers/formatHandlers');

const formatController = [
  {
    fromFormat: 'jpg',
    toFormat: 'pdf',
    handler: imageMagicHandler,
    validate: {
      "pdf-standard": {
        required: true,
      },
    },
    schema: {
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string', enum: ['jpg'] },
          toFormat: { type: 'string', enum: ['pdf'] }
        }
      },
      body: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  {
    fromFormat: ' v',
    toFormat: 'gif',
    handler: imageMagicHandler,
    validate: {},
    schema: {
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string', enum: ['jpg'] },
          toFormat: { type: 'string', enum: ['gif'] }
        }
      },
      body: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  {
    fromFormat: 'jpg',
    toFormat: 'png',
    handler: sharpImageHandler,
    validate: {},
    schema: {
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string', enum: ['jpg'] },
          toFormat: { type: 'string', enum: ['png'] }
        }
      },
      body: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          }
        }
      }
    }
  },
  {
    fromFormat: 'png',
    toFormat: 'pdf',
    handler: imageMagicHandler,
    validate: {
      pdf_quality: {
        required: true,
        methods: [
          ['in_array', ['high', 'medium', 'low']],
          ['string'],
        ],
      },
    },
    schema: {
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string', enum: ['png'] },
          toFormat: { type: 'string', enum: ['pdf'] }
        }
      },
      body: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  {
    fromFormat: 'png',
    toFormat: 'jpg',
    handler: imageMagicHandler,
    validate: {},
    schema: {
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string', enum: ['png'] },
          toFormat: { type: 'string', enum: ['jpg'] }
        }
      },
      body: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }
];

module.exports = formatController;