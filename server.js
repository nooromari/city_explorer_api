'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app=express();
const PORT = process.env.PORT || 3000;

app.use(cors());


app.get('/location',handleReqLoc);
app.get('/weather',handleReqWthr);

app.use('*', (req, res) => {
  res.send('wrong path, nothing to see here!');
});

function handleReqLoc(req,res) {

  const searchQuery = req.query.city;  // localhost:3000/location?city=amman
  const locationsData = require('./data/location.json');

  const location = new Location(searchQuery,locationsData[0]);
  // console.log(location);
  res.send(location);
}

function handleReqWthr(req,res) {
  
}

function Location(city, cityData) {
  this.search = city;
  this.displayAame = cityData.display_name;
  this.latitude = cityData.lat;
  this.longitude = cityData.lon;
  this.type=cityData.type;
  this.icon=cityData.icon;
  this.importance=cityData.importance;
  this.class=cityData.class;
  
}


app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
