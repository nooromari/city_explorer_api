'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

const app=express();
const PORT = process.env.PORT || 3001;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

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
  // const locationsData = require('./data/location.json');
  const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${searchQuery}&format=json`;
  superagent.get(url).then(data =>{
    // try{
    const location = new Location(searchQuery,data[0]);
    // console.log(location);
    res.send(location);
    // res.status(200).send(location);
    // }catch(error){
    //   res.status(500).send(`something ${error}`);
    // }

  });

}

function handleReqWthr(req,res) {
  const searchQWeather = req.query.city;
  // const weatherData = require('./data/weather.json');
  const url = `https://api.weatherbit.io/v2.0/current?lat=35.7796&lon=-78.6382&key=${WEATHER_API_KEY}&include=minutely`;

  const arrWeather = [];
  superagent.get(url).then(data =>{
  // weatherData.data.forEach(location =>{
    let newWeather = new Weather (searchQWeather,data[0]);
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
