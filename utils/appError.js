class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;

        // Saying if the status code starts with 4XX - fail. Else - error
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // Is operational error
        // If this prop is true in response then we will know its a caught error
        // Not some random bug(not programming error)
        this.isOperational = true; 

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;