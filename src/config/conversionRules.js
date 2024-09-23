// src/config/conversionRules.js
const conversionRules = {
    jpg: {
        pdf: {
            required: ['pdf-standard'],
            rules: {
                'pdf-standard': { required: true, methods: [['string', []]] }
            }
        },
        png: {
            required: [],
            rules: {}
        },
    },
   
};

module.exports = conversionRules;
