'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app=express();
const PORT = process.env.PORT || 3001;

app.use(cors());


app.get('/location',handleReqLoc);
app.get('/weather',handleReqWthr);


function errorHandler(err, request, response, next) {
  response.status(500).send('something is wrong in server');}
app.use(errorHandler);

app.use('*', notFoundHandler); // 404 not found url
function notFoundHandler(request, response) {
  response.status(404).send('requested API is Not Found!');}
// app.use('*',handleError);

// function handleError(req, res) {
//   res.status(404).send({ status: 500, responseText: 'Sorry, this page Does not exist'});
// }

// (req, res) => {
//   res.send('wrong path, nothing to see here!');
// });

// function handleError(params) {
//   function handleErrors (req, res) {
//     res.status(404).send({ status: 500, responseText: 'Sorry, this page Does not exist'});
// }
//}

function handleReqLoc(req,res) {

  const searchQuery = req.query.city; // localhost:3000/location?city=amman
  const locationsData = require('./data/location.json');

  // try{
  const location = new Location(searchQuery,locationsData[0]);
  // console.log(location);
  res.send(location);
  // res.status(200).send(location);
  // }catch(error){
  //   res.status(500).send(`something ${error}`);
  // }

}

function handleReqWthr(req,res) {
  const searchQWeather = req.query.city;
  const weatherData = require('./data/weather.json');

  const arrWeather = [];

  weatherData.data.forEach(location =>{
    let newWeather = new Weather (searchQWeather,location);
    arrWeather.push(newWeather);
  });
  res.send(arrWeather);
}

function Location(city, cityData) {
  this.search_query = city;
  this.formatted_query = cityData.display_name;
  this.latitude = cityData.lat;
  this.longitude = cityData.lon;
}

function Weather(city,weathObj) {
  this.search_qury = city;
  this.forecast = weathObj.weather['description'];
  this.time = weathObj.datetime;
}

app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
