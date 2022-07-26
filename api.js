const express = require("express");
const addresses = require("./addresses.json");
const calcDist = require("./calcdist.js")

const app = express();
app.use(express.json());

const protocol = 'http';
const host = '127.0.0.1';
const port = '8080';
const server = `${protocol}://${host}:${port}`;

app.use(function(req, res, next) {
  if (req.headers.authorization != "bearer dGhlc2VjcmV0dG9rZW4=") {
    return res.status(401).json({ error: 'Wrong credentials!' });
  }
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' });
  }
  next();
});

app.listen(port, () => console.log(`Listening on port ${port}...`))

// Get cities by tag
app.get("/cities-by-tag", (req, res) => {
  const tag = req.query.tag;
  const isActive = req.query.isActive;

  const cities = addresses.filter(a => a.tags.includes(tag) && a.isActive === (isActive === 'true'));

  if (cities.length == 0) res.status(404).send("The city with given tag was not found");
  res.status(200).send(JSON.stringify({cities: cities}));
});

// Calculate distance from one city to the other
app.get("/distance", (req, res) => {
  const from = req.query.from;
  const to = req.query.to;

  const fromCity = addresses.find(a => a.guid == from);
  const toCity = addresses.find(a => a.guid == to);

  if (!fromCity || !toCity) res.status(404).send("One of the cities with given guid was not found");

  const responseBody = 
  {
    from: fromCity,
    to: toCity,
    unit: "km",
    distance: calcDist(fromCity.latitude, fromCity.longitude, toCity.latitude, toCity.longitude)
  }

  res.status(200).send(JSON.stringify(responseBody));
});


// Find all cities in certain area of city given distance in km
app.get("/area", (req, res) => {
  const from = req.query.from;
  const distance = req.query.distance;

  const fromCity = addresses.find(a => a.guid == from);

  if (!fromCity) res.status(404).send("The city with given guid was not found");

  const cities = [];

  res.status(202).send(JSON.stringify({resultsUrl: `${server}/area-result/2152f96f-50c7-4d76-9e18-f7033bd14428`}));

  addresses.forEach(toCity => {
    const dist = calcDist(fromCity.latitude, fromCity.longitude, toCity.latitude, toCity.longitude);
    if (dist <= distance && fromCity.guid != toCity.guid) {
      cities.push(toCity);
    }
  });

  app.get("/area-result/2152f96f-50c7-4d76-9e18-f7033bd14428", (req, res) => {
    res.status(200).send(JSON.stringify({cities: cities}));
  });
});

// Find all cities in certain area of city given distance in km
app.get("/area", (req, res) => {
  const from = req.query.from;
  const distance = req.query.distance;

  const fromCity = addresses.find(a => a.guid == from);

  if (!fromCity) res.status(404).send("The city with given guid was not found");

  const cities = [];

  res.status(202).send(JSON.stringify({resultsUrl: `${server}/area-result/2152f96f-50c7-4d76-9e18-f7033bd14428`}));

  addresses.forEach(toCity => {
    const dist = calcDist(fromCity.latitude, fromCity.longitude, toCity.latitude, toCity.longitude);
    if (dist <= distance && fromCity.guid != toCity.guid) {
      cities.push(toCity);
    }
  });

  app.get("/area-result/2152f96f-50c7-4d76-9e18-f7033bd14428", (req, res) => {
    res.status(200).send(JSON.stringify({cities: cities}));
  });
});

// Send all cities
app.get("/all-cities", (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(addresses));
  res.end();
});