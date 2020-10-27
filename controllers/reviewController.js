const Review = require('./../models/Review');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  // If tourId specified, then get reviews only for that Id
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const doc = await Review.find(filter);

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Allows nested routes
  // If tour info not specified, get it from the params
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // If User info not specified, get it from the CurrentUser value
  if (!req.body.user) req.body.user = req.user.id;

  const doc = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
