class CxValidator {
    /**
     * Holds the schema for validation
     */
    constructor(schema, dataset) {
        this.schema = schema;
        this.dataset = dataset;
    }

    /**
     * Validates the dataset against the schema
     * @param {Object} [schema=null] - Optional schema to override the default
     * @param {Object} [dataset=null] - Optional dataset to override the default
     * @returns {Object} - An object containing validation errors, if any
     */
    validateDataset(schema = null, dataset = null) {
        console.log(schema,dataset)
        schema = schema || this.schema;
        dataset = dataset || this.dataset;

        let errors = {};

        for (let key in schema) {
            let opt = schema[key];
            let currVal = null;

            let keySet = key.split(".").map(k => k.trim());

            // Merge formdata if present
            let currentCollection = { ...dataset };
            if (dataset?.formdata) {
                currentCollection = { ...dataset, ...dataset.formdata };
            }

            // Traverse the dataset based on the key path
            currVal = keySet.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : null, currentCollection);

            let validation = true;

            const isRequired = opt.required !== undefined && opt.required;
            const isSet = currVal !== null && currVal !== undefined && currVal !== '';
            const hasCallback = opt.validate_callback && typeof opt.validate_callback === 'function';
            const hasValidationMethods = Array.isArray(opt.validation_methods) && opt.validation_methods.length > 0;

            if (isRequired) {
                if (!isSet) {
                    validation = { required: `${key} cannot be empty or null.` };
                } else {
                    if (!hasCallback && !hasValidationMethods) {
                        if (opt.type && typeof this[opt.type] === 'function') {
                            validation = this.validate(currVal, [opt.type]);

                            if (Array.isArray(validation)) {
                                validation = validation.join("\n");
                            }
                        } else {
                            if (
                                currVal === null ||
                                (typeof currVal === 'string' && currVal.trim().length === 0) ||
                                (Array.isArray(currVal) && currVal.length === 0)
                            ) {
                                validation = { required: `${key} cannot be empty or null.` };
                            }
                        }
                    } else {
                        if (hasValidationMethods) {
                            validation = this.validate(currVal, opt.validation_methods);
                        } else if (hasCallback) {
                            validation = opt.validate_callback(currVal, dataset);
                        }
                    }
                }
            } else if (isSet) {
                if (hasValidationMethods) {
                    validation = this.validate(currVal, opt.validation_methods);
                } else if (hasCallback) {
                    validation = opt.validate_callback(currVal, dataset);
                }
            }

            if (typeof validation === 'string') {
                errors[key] = `${key}: ${validation}`;
            } else if (typeof validation === 'object') {
                errors[key] = validation;
            }
        }
        return errors;
    }

    /**
     * Validates a single field value against a set of validation rules
     * @param {*} fieldValue - The value to validate
     * @param {Array} validationSet - An array of validation methods and their parameters
     * @param {boolean} [all=true] - Whether all validations must pass
     * @returns {true|Object} - True if valid, or an object containing error messages
     */
    validate(fieldValue, validationSet = [], all = true) {
        let errors = {};
        let isValid = true;

        for (let rule of validationSet) {
            if (!Array.isArray(rule)) {
                throw new Error("Each validation rule must be an array.");
            }

            let [method, ...params] = rule;
            let validationResult;

            if (typeof this[method] === 'function') {
                validationResult = this[method](fieldValue, ...params);
            } else {
                validationResult = `Validation method '${method}' does not exist.`;
            }

            if (validationResult !== true) {
                errors[method] = validationResult;
                if (all) {
                    isValid = false;
                } else {
                    // If not requiring all validations to pass, return immediately
                    return { [method]: validationResult };
                }
            }
        }

        return isValid ? true : errors;
    }

    /**
     * Retrieves the dataset
     * @returns {Object} - The current dataset
     */
    getDataSet() {
        return this.dataset;
    }

    // Validation Methods

    /**
     * Checks if two values are equal
     * @param {*} value - The value to check
     * @param {*} compareValue - The value to compare against
     * @param {string} [errorMsg='Invalid value'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    equal(value, compareValue, errorMsg = 'Invalid value') {
        return value == compareValue ? true : errorMsg;
    }

    /**
     * Validates that the value is a string within optional length constraints
     * @param {string} value - The string to validate
     * @param {number|null} [min=null] - Minimum length
     * @param {number|null} [max=null] - Maximum length
     * @param {string} [errorMsg='Invalid value'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    string(value, min = null, max = null, errorMsg = 'Invalid value') {
        if (typeof value !== "string") return errorMsg;
        if (min !== null && value.length < min) return errorMsg;
        if (max !== null && value.length > max) return errorMsg;
        return true;
    }

    /**
     * Validates that the value is a number within optional range constraints
     * @param {number} value - The number to validate
     * @param {number|null} [min=null] - Minimum value
     * @param {number|null} [max=null] - Maximum value
     * @param {string} [errorMsg='Invalid value'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    number(value, min = null, max = null, errorMsg = 'Invalid value') {
        if (typeof value !== "number" || isNaN(value)) return errorMsg;
        if (min !== null && value < min) return errorMsg;
        if (max !== null && value > max) return errorMsg;
        return true;
    }

    /**
     * Checks if the value is numeric and optionally within a range
     * @param {*} value - The value to check
     * @param {number|null} [min=null] - Minimum value
     * @param {number|null} [max=null] - Maximum value
     * @param {string} [errorMsg='Invalid value'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    isNumeric(value, min = null, max = null, errorMsg = 'Invalid value') {
        let num = Number(value);
        if (isNaN(num)) return errorMsg;
        return this.number(num, min, max, errorMsg);
    }

    /**
     * Checks if the value is an array
     * @param {*} value - The value to check
     * @param {string} [errorMsg='Not a valid array'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    isArray(value, errorMsg = 'Not a valid array') {
        return Array.isArray(value) ? true : errorMsg;
    }

    

    /**
     * Checks if the value is an object
     * @param {*} value - The value to check
     * @param {string} [errorMsg='Not a valid object'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    isObject(value, errorMsg = 'Not a valid object') {
        return (typeof value === 'object' && value !== null && !Array.isArray(value)) ? true : errorMsg;
    }

    /**
     * Validates the dataset against a provided schema
     * @param {Object} value - The dataset to validate
     * @param {Object} schema - The schema to validate against
     * @returns {Object} - An object containing validation errors, if any
     */
    haveSchema(value, schema) {
        return this.validateDataset(schema, value);
    }

    /**
     * Checks if the value is scalar
     * @param {*} value - The value to check
     * @param {string} [error='Value is not scalar'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    isScalar(value, error = 'Value is not scalar') {
        return (['number', 'string', 'boolean'].includes(typeof value)) ? true : error;
    }

    /**
     * Validates that the value is a boolean
     * @param {*} value - The value to validate
     * @param {boolean} [strict=false] - Whether to enforce strict type checking
     * @param {string} [error='Invalid boolean value'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    boolean(value, strict = false, error = 'Invalid boolean value') {
        if (strict) {
            return (value === true || value === false) ? true : error;
        } else {
            return ([1, 0, '1', '0', true, false, 'true', 'false', 'TRUE', 'FALSE'].includes(value)) ? true : error;
        }
    }

    /**
     * Validates that the value is an array of strings
     * @param {Array} value - The array to validate
     * @param {string} [errorMsg='Need to be a valid array of strings'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    stringArray(value, errorMsg = 'Need to be a valid array of strings') {
        if (!Array.isArray(value)) return errorMsg;
        const allStrings = value.every(item => typeof item === 'string');
        return allStrings ? true : errorMsg;
    }

    /**
     * Checks if an object is associative
     * @param {Object} value - The object to check
     * @param {string} [errorMsg='Need to be a valid associative array'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    isAssoc(value, errorMsg = 'Need to be a valid associative array') {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) return errorMsg;
        return (Object.keys(value).some(key => isNaN(Number(key)))) ? true : errorMsg;
    }

    /**
     * Validates that the value matches a given regular expression
     * @param {string} value - The string to validate
     * @param {string|RegExp} expression - The regular expression to test against
     * @param {string} [errorMsg='Invalid value'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    matchExpression(value, expression, errorMsg = 'Invalid value') {
        const regex = (expression instanceof RegExp) ? expression : new RegExp(expression);
        return regex.test(value) ? true : errorMsg;
    }

    /**
     * Validates that the URL is properly formatted
     * @param {string} url - The URL to validate
     * @param {string} [errorMsg='Not a valid URL'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    validUrl(url, errorMsg = 'Not a valid URL') {
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return urlRegex.test(url) ? true : errorMsg;
    }

    /**
     * Validates that the domain is properly formatted
     * @param {string} domain - The domain to validate
     * @param {string} [errorMsg='Not a valid domain'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    validDomain(domain, errorMsg = 'Not a valid domain') {
        const domainRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return domainRegex.test(domain) && domain.startsWith('https://') && domain.endsWith('/') ? true : errorMsg;
    }

    /**
     * Checks if the provided method is callable
     * @param {*} method - The method to check
     * @param {string} [errorMsg='Not a valid callable'] - The error message if validation fails
     * @returns {true|string} - True if callable, or error message
     */
    isCallable(method, errorMsg = 'Not a valid callable') {
        return (typeof method === 'function') ? true : errorMsg;
    }

    /**
     * Checks if the provided method is a callable within the context of CxValidator
     * @param {Array} method - The method array to check
     * @param {string} [errorMsg='Not a valid callable'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    isCxCallable(method, errorMsg = 'Not a valid callable') {   
        if (!Array.isArray(method)) return errorMsg;
        if (!method.hasOwnProperty('class')) return errorMsg;
        if (!method.hasOwnProperty('method')) return errorMsg;
        return (typeof this[method.method] === 'function') ? true : errorMsg;
    }

    /**
     * Checks if a method exists within a given object
     * @param {string} method - The method name to check
     * @param {Object} object - The object to check within
     * @param {string} [errorMsg='Not a valid method'] - The error message if validation fails
     * @returns {true|string} - True if method exists, or error message
     */
    methodExists(method, object, errorMsg = 'Not a valid method') {
        return (typeof object[method] === 'function') ? true : errorMsg;
    }

    /**
     * Validates that a string is valid JSON
     * @param {string} value - The JSON string to validate
     * @param {string} [error='Not a valid JSON'] - The error message if validation fails
     * @returns {true|string} - True if valid JSON, or error message
     */
    jsonString(value, error = 'Not a valid JSON') {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            return error;
        }
    }

    /**
     * Validates that the phone number meets length requirements
     * @param {string} value - The phone number to validate
     * @param {string} [errorMsg='Invalid phone'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    validPhone(value, errorMsg = 'Invalid phone') {
        return (typeof value === 'string' && value.length >= 8) ? true : errorMsg;
    }

    /**
     * Validates that the email is properly formatted
     * @param {string} value - The email to validate
     * @param {string} [errorMsg='Invalid Email'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    validEmail(value, errorMsg = 'Invalid Email') {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/;
        return emailRegex.test(value) ? true : errorMsg;
    }

    /**
     * Validates that the date is properly formatted and within optional range
     * @param {string} value - The date string to validate
     * @param {string|null} [min=null] - Minimum date in YYYY-MM-DD format
     * @param {string|null} [max=null] - Maximum date in YYYY-MM-DD format
     * @param {string|RegExp} [format=/\d{4}-\d{2}-\d{2}/] - The date format regex
     * @returns {true|string} - True if valid, or error message
     */
    validDate(value, min = null, max = null, format = /\d{4}-\d{2}-\d{2}/) {
        const validFormat = (format instanceof RegExp) ? format.test(value) : false;
        if (!validFormat) {
            return 'Invalid date format';
        }

        const valueTime = Date.parse(value);
        if (isNaN(valueTime)) {
            return 'Invalid date value';
        }

        if (min) {
            const minTime = Date.parse(min);
            if (isNaN(minTime) || valueTime < minTime) {
                return 'Date is earlier than the minimum allowed.';
            }
        }

        if (max) {
            const maxTime = Date.parse(max);
            if (isNaN(maxTime) || valueTime > maxTime) {
                return 'Date is later than the maximum allowed.';
            }
        }

        return true;
    }

    /**
     * Validates that the password is strong
     * @param {string} password - The password to validate
     * @returns {true|string} - True if strong, or error message
     */
    strongPassword(password) {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isValidLength = password.length >= 8;

        if (hasUppercase && hasLowercase && hasNumber && hasSpecialChar && isValidLength) {
            return true;
        } else {
            return 'Password should be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
        }
    }

    /**
     * Validates that a string contains only numbers separated by a specific separator
     * @param {string} value - The string to validate
     * @param {string} [separator=','] - The separator used in the string
     * @returns {true|string} - True if valid, or error message
     */
    numberString(value, separator = ',') {
        const numbers = value.split(separator);
        for (let num of numbers) {
            if (isNaN(num.trim())) {
                return `${num.trim()} is not a valid number in the given value '${value}'.`;
            }
        }
        return true;
    }

    /**
     * Validates that the string is alphanumeric
     * @param {string} value - The string to validate
     * @param {string} [errorMsg='String is not alphanumeric'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    alphanumericString(value, errorMsg = 'String is not alphanumeric') {
        const alphanumRegex = /^[A-Za-z0-9]+$/;
        return alphanumRegex.test(value) ? true : errorMsg;
    }

    /**
     * Validates that the array contains only numeric values
     * @param {Array} value - The array to validate
     * @param {string} [errorMsg='Need to be a valid array of numbers'] - The error message if validation fails
     * @returns {true|string} - True if valid, or error message
     */
    isNumericArray(value, errorMsg = 'Need to be a valid array of numbers') {
        if (!Array.isArray(value)) return errorMsg;
        const allNumbers = value.every(item => typeof item === 'number' && !isNaN(item));
        return allNumbers ? true : errorMsg;
    }

    /**
     * Validates that the email host is not in the list of excluded hosts
     * @param {string} value - The email to validate
     * @param {Array} excludedHosts - Array of excluded host strings
     * @returns {true|string} - True if valid, or error message
     */
    validEmailHost(value, excludedHosts) {
        const emailHost = value.split('@')[1]?.toLowerCase();
        if (!emailHost) return 'Invalid email format.';

        for (const host of excludedHosts) {
            if (emailHost.includes(host.toLowerCase())) {
                return `Emails from '${host}' are not allowed.`;
            }
        }

        return true;
    }

    /**
     * Checks if two fields in the dataset have identical values
     * @param {*} value - The value to compare
     * @param {string} fieldName - The name of the field to compare against
     * @param {string} [errorMsg='Field value mismatch'] - The error message if validation fails
     * @returns {true|string} - True if values match, or error message
     */
    identicalFieldValue(value, fieldName, errorMsg = "Field value mismatch") {
        const data = this.getDataSet();
        return (data[fieldName] === value) ? true : errorMsg;
    }
}

module.exports =CxValidator