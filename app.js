const express = require('express');
const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// When none of the routes match,
app.all('*', (req, res, next) => {
  res.status(404).send({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
})

module.exports = app;