'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app=express();
const PORT = process.evn.PORT;

// app.get('/location',handleReq);

app.use(cors());

app.use('*', (req, res) => {
  res.send('all good nothing to see here!');
});






app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
