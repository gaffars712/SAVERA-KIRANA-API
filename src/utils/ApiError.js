// api-error.js

// Custom error class for handling API-related errors
class ApiError extends Error {
  /**
   * Constructor for the ApiError class
   * @param {number} statusCode - HTTP status code associated with the error
   * @param {string} message - Error message
   * @param {boolean} isOperational - Indicates whether the error is operational or programming-related
   * @param {string} stack - Stack trace for the error
   */
  constructor(statusCode, message, isOperational = true, stack = '') {
    // Call the constructor of the parent class (Error) with the provided message
    super(message);

    // Set properties specific to ApiError
    this.statusCode = statusCode;

    // Determine the status based on the statusCode (e.g., statusCode > 400 indicates an error)
    this.status = statusCode > 400 ? false : false;

    // Indicates whether the error is considered operational or programming-related
    this.isOperational = isOperational;

    // Additional data associated with the error
    this.data = message;

    // If a custom stack is provided, set it; otherwise, capture the stack trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Export the ApiError class to make it available for use in other files
module.exports = ApiError;
