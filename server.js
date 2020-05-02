const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/dev-data/data/tours-simple.json'))
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    path.join(__dirname, '/dev-data/data/tours-simple.json'),
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
