const Review = require('./../models/Review');
const factory = require('./../utils/handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // Allows nested routes
  // If tour info not specified, get it from the params
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
