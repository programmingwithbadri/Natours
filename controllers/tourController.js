const Tour = require('./../models/Tour');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../utils/handlerFactory');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        // Get the records that have avg greater than 4.5
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        // Group the records by below constraints
        _id: {
          $toUpper: '$difficulty', // Uppercase the difficulty obj and send it in _id obj
        },
        numTours: {
          $sum: 1, // Send sum of the tours as numTours
        },
        numRatings: {
          $sum: '$ratingsQuantity', // Send sum of the ratingsQuantity as numRatings
        },
        avgRating: {
          $avg: '$ratingsAverage', // Send avg of the ratingsAverage as avgRating
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: {
        avgPrice: 1, // Sort by avg price
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          // Gets the records that matches in the requested year
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        // Group the records by extracting the month from startDates field
        _id: {
          $month: '$startDates',
        },
        numTourStarts: {
          $sum: 1,
        },
        tours: {
          $push: '$name', // Push the name field to the tours array in response
        },
      },
    },
    {
      $addFields: {
        month: '$_id', // Adds the new field in response with month value
      },
    },
    {
      $project: {
        _id: 0, // 0 - wont show id in response, 1 will show
      },
    },
    {
      $sort: {
        numTourStarts: -1, // Sort the tour by desc
      },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Finding radius by dividing distance/earth's radius
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
