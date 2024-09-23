class Validator {
    constructor() {
        this.errors = [];
    }

    validate(rules, data) {
        this.clearErrors(); // Clear previous errors

        // Validate required fields
        if (rules.required) {
            for (const field of rules.required) {
                const fieldValue = data[field];

                if (fieldValue === undefined || fieldValue === null) {
                    this.errors.push(`${field} is required`);
                }
            }
        }

        // Validate field rules
        if (rules.rules) {
            for (const field in rules.rules) {
                const ruleSet = rules.rules[field];
                const fieldValue = data[field];

                if (fieldValue !== undefined && fieldValue !== null) {
                    for (const method of ruleSet.methods) {
                        const [rule, params] = method;

                        switch (rule) {
                            case 'string':
                                if (typeof fieldValue !== 'string') {
                                    this.errors.push(`${field} must be a string`);
                                }
                                break;
                            case 'in_array':
                                if (!params.includes(fieldValue)) {
                                    this.errors.push(`${field} must be one of ${params.join(', ')}`);
                                }
                                break;
                            // Add more validation methods as needed
                            default:
                                break;
                        }
                    }
                }
            }
        }

        return this.errors.length > 0 ? this.errors : null;
    }

    clearErrors() {
        this.errors = [];
    }
}

module.exports = Validator;
