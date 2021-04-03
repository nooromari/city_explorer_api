'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

const app = express();
const PORT = process.env.PORT || 3005;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;

const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;

const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL };
const client = new pg.Client(options);

client.on('error', err => {
  console.log('unable to connect database');
});

app.use(cors());

app.get('/location', handleReqLoc);
app.get('/weather', handleReqWthr);
app.get('/parks', handleReqPar);
app.get('/movies',handleMovies);
app.get('/yelp', handleYelp);

app.use('*', handleError); // 404 not found url

client.connect().then(() => app.listen(PORT, () => console.log(`App is listening on ${PORT}`)));


function errorHandler(err, request, response, next) {
  response.status(500).send('something is wrong in server');
}
app.use(errorHandler);

function handleError(req, res) {
  res.status(404).send('Sorry, this page Does not exist');
}

function handleReqLoc(req, res) {

  const search_query = req.query.city; // localhost:3000/location?city=amman
  const city = [search_query];
  const sqlTable = 'SELECT * FROM locations WHERE search_query=$1;';

  client.query(sqlTable,city).then(locData =>{
    if (locData.rows.length===0) {

      const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${search_query}&format=json`;

      superagent.get(url).then(loc => {
        let arr = new Location(search_query, loc.body[0]);
        const sql = 'INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4) ';
        const values = [arr.search_query, arr.formatted_query, arr.latitude, arr.longitude];
        client.query(sql, values).then(result =>{
          console.log(result);
        });
        res.status(200).send(arr);

      }).catch((error) => {
        res.status(500).send(`something ${error}`);
      });
    } else {
      const loc = locData.rows[0];
      res.status(200).send(loc);
    }
  });
}

function handleReqWthr(req, res) {
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${WEATHER_API_KEY}`;
  superagent.get(url).then(wthrData => {
    let arr = wthrData.body.data.map(wthr => new Weather(wthr));
    res.status(200).send(arr);
  }).catch((error) => {
    res.status(500).send(`something ${error}`);
  });
}

function handleReqPar(req, res) {
  const city = req.query.search_query;
  const url = `https://developer.nps.gov/api/v1/parks?city=${city}&api_key=${PARKS_API_KEY}&limit=10`;
  superagent.get(url).then(par => {
    let arr = par.body.data.map(parkData => new Park(parkData));
    res.status(200).send(arr);
  }).catch((error) => {
    res.status(500).send(`something ${error}`);
  });
}

function handleMovies(req,res) {
  const search_query = req.query.search_query;
  const url = `https://api.themoviedb.org/3/movie/550?api_key=${MOVIE_API_KEY}&query=${search_query}`;
  superagent.get(url).then(mov => {
    let arr = mov.body.results.map(movData => new Movie(movData));
    res.status(200).send(arr);
  }).catch((error) => {
    res.status(500).send(`something ${error}`);
  });
}

function handleYelp(req,res) {
  const search_query = req.query.search_query;
  const url = `https://api.yelp.com/v3/businesses/search?location=${search_query}&limit=50&api_key=${YELP_API_KEY}`;
  superagent.get(url).then(res => {
    let arr = res.body.businesses.map(reskData => new Resturant(reskData));
    res.status(200).send(arr);
  }).catch((error) => {
    res.status(500).send(`something ${error}`);
  });
}
// .set('Authorization', `Bearer ${YELP_API_KEY}`)

function Location(city, cityData) {
  this.search_query = city;
  this.formatted_query = cityData.display_name;
  this.latitude = cityData.lat;
  this.longitude = cityData.lon;
}

function Weather(weathObj) {
  this.forecast = weathObj.weather.description;
  this.time = weathObj.datetime;
}

function Park(parkData) {
  this.name = parkData.fullName;
  this.address = Object.values(parkData.addresses[0]).join(',');
  this.fee = '0.00';
  this.description = parkData.description;
  this.url = parkData.url;
}

function Movie (data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  this.image_url= `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  this.popularity= data.popularity;
  this.released_on= data.released_on;
}

function Resturant(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}


