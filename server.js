'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
// const { get } = require('superagent');

const app=express();
const PORT = process.env.PORT || 3005;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;
// const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL};
// const client = new pg.Client(options);

app.use(cors());


app.get('/location',handleReqLoc);
app.get('/weather',handleReqWthr);
app.get('/parks',handleReqPar);


function errorHandler(err, request, response, next) {
  response.status(500).send('something is wrong in server');}
app.use(errorHandler);

app.use('*', handleError); // 404 not found url

function handleError(req, res) {
  res.status(404).send('Sorry, this page Does not exist');
}


function handleReqLoc(req,res) {

  const search_query = req.query.city; // localhost:3000/location?city=amman
  const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${search_query}&format=json`;
  superagent.get(url).then(loc =>{
    let arr =  new Location(search_query,loc.body[0]);
    res.status(200).send(arr);

  }).catch((error)=>{
    res.status(500).send(`something ${error}`);
  });

}

function handleReqWthr(req,res) {
  const searchQWeather = req.query.city;
  // const lat = req.query.latitude;
  // const lon = req.query.longitude;
  // const url = `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}&include=minutely`;
  const url =`https://api.weatherbit.io/v2.0/forecast/daily?city=${searchQWeather},NC&key=${WEATHER_API_KEY}&limit=10`;
  // const url =`http://api.weatherbit.io/v2.0/forecast/daily?KEY=${WEATHER_API_KEY}&city=${searchQWeather}&country=US`;
  superagent.get(url).then(wthrData =>{
    // res.send(wthrData.text);
    let arr = JSON.parse(wthrData.text).data.map(wthr => new Weather (searchQWeather,wthr));
    res.status(200).send(arr);
  }).catch((error)=>{
    res.status(500).send(`something ${error}`);
  });
}
function handleReqPar(req,res) {
  const city = req.query.city;
  const url = `https://developer.nps.gov/api/v1/parks?q=${city}&api_key=${PARKS_API_KEY}`;
  superagent.get(url).then(par =>{

    res.send(par);
  }).catch((error)=>{

    res.status(500).send(`something ${error}`);
  });


}

function Location(city, cityData) {
  this.search_query = city;
  this.formatted_query = cityData.display_name;
  this.latitude = cityData.lat;
  this.longitude = cityData.lon;
}

function Weather(city,weathObj) {
  this.search_qury = city;
  this.forecast = weathObj.weather.description;
  this.time = weathObj.datetime;
}

app.listen(PORT, () => console.log(`App is listening on ${PORT}`));

// const client = new pg.Client({
// 	connectionString: process.env.DATABASE_URL,
// 	ssl: { rejectUnauthorized: false },
// });
