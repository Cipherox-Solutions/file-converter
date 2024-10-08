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
      body: {
        type: 'object',
        properties: {
          file: { type: 'object' }, 
          pdfStandard: { type: 'string', enum: ['PDF/A', 'PDF/X'], description: 'Specify the PDF standard (e.g., PDF/A, PDF/X)' }
        },
        required: ['file', 'pdfStandard']
      },
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string' },
          toFormat: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
    
  },
  {
    fromFormat: 'jpg',
    toFormat: 'gif',
    handler: imageMagicHandler,
    validate: {},
    schema:{
      body: {
        type: 'object',
        properties: {
          file: { type: 'object' }, 
        },
        required: ['file']
      },
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string' },
          toFormat: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
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
    schema:{
      body: {
        type: 'object',
        properties: {
          file: { type: 'object' }, 
        },
        required: ['file',]
      },
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string' },
          toFormat: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' }
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
    schema:{
      body: {
        type: 'object',
        properties: {
          file: { type: 'object' }, 
        },
        required: ['file',]
      },
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string' },
          toFormat: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
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
    schema:{
      body: {
        type: 'object',
        properties: {
          file: { type: 'object' }, 
        },
        required: ['file',]
      },
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string' },
          toFormat: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  },
  {
    fromFormat: 'jpg',
    toFormat: 'tiff',
    handler: imageMagicHandler,
    validate: {},
    schema:{
      body: {
        type: 'object',
        properties: {
          file: { type: 'object' }, 
        },
        required: ['file',]
      },
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string' },
          toFormat: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  },
  {
    fromFormat: 'tiff',
    toFormat: 'jpg',
    handler: imageMagicHandler,
    validate: {},
    schema:{
      body: {
        type: 'object',
        properties: {
          file: { type: 'object' }, 
        },
        required: ['file',]
      },
      params: {
        type: 'object',
        properties: {
          fromFormat: { type: 'string' },
          toFormat: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  },
];

module.exports = formatController;
