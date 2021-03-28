'use strict';

const express = repuire('express');

const app=express();

app.get('/location',handleReq);









app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
