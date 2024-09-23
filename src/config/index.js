// src/config/formatController.js

const {
    imageMagicHandler
} = require('../controllers/formatHandlers');

const formatController = {
    jpg: {
      pdf: {
        handler: imageMagicHandler,
        validate: {
          pdf_standrend: {
            required: ['pdf-standard'],
            rules: {
                'pdf-standard': { required: true, methods: [['string', []]] }
            }
          },
        },
      },
    },
    png: {
      pdf: {
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
      },
      jpg: {
        handler: imageMagicHandler,
        validate: {},
      },
      webp: {
        handler: imageMagicHandler,
        validate: {},
      },
    },
  };
  
  module.exports = formatController;
  