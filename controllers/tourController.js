const Tour = require('../models/Tour');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTours = catchAsync(async (req, res) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {

  if (!req.params.id.isMongoId) {
    return next(new AppError('No tour found with that ID', 404));
  }

  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({ _id: req.params.id })

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res) => {
  // const newTour = new Tour({})
  // newTour.save()

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  if (!req.params.id.isMongoId) {
    return next(new AppError('No tour found with that ID', 404));
  }

  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res) => {
  if (!req.params.id.isMongoId) {
    return next(new AppError('No tour found with that ID', 404));
  }
  
  await Tour.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([{
      $match: { // Get the records that have avg greater than 4.5
        ratingsAverage: {
          $gte: 4.5
        }
      }
    },
    {
      $group: { // Group the records by below constraints
        _id: {
          $toUpper: '$difficulty' // Uppercase the difficulty obj and send it in _id obj
        },
        numTours: {
          $sum: 1 // Send sum of the tours as numTours
        },
        numRatings: {
          $sum: '$ratingsQuantity' // Send sum of the ratingsQuantity as numRatings
        },
        avgRating: {
          $avg: '$ratingsAverage' // Send avg of the ratingsAverage as avgRating
        },
        avgPrice: {
          $avg: '$price'
        },
        minPrice: {
          $min: '$price'
        },
        maxPrice: {
          $max: '$price'
        }
      }
    },
    {
      $sort: {
        avgPrice: 1 // Sort by avg price
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([{
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: { // Gets the records that matches in the requested year
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        // Group the records by extracting the month from startDates field
        _id: {
          $month: '$startDates'
        },
        numTourStarts: {
          $sum: 1
        },
        tours: {
          $push: '$name' // Push the name field to the tours array in response
        }
      }
    },
    {
      $addFields: {
        month: '$_id' // Adds the new field in response with month value
      }
    },
    {
      $project: {
        _id: 0 // 0 - wont show id in response, 1 will show
      }
    },
    {
      $sort: {
        numTourStarts: -1 // Sort the tour by desc
      }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});