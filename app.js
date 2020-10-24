const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

const globalErrorHandler = require('./controllers/errorController');

const AppError = require('./utils/appError');

const app = express();

// Global Middleware
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
// Accept only the payload with less than 10KB
app.use(express.json({
  limit: '10kb'
}));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// When none of the routes match, throw 404
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Use the global error handler
app.use(globalErrorHandler);

module.exports = app;